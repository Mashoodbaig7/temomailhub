import UserDomain from '../../../models/UserDomainModel.js';
import subscriptionService from './subscriptionService.js';
import crypto from 'crypto';
import dns from 'dns/promises';

// Configure DNS resolver with no caching
const resolver = new dns.Resolver();
resolver.setServers([
    '8.8.8.8',      // Google DNS
    '8.8.4.4',      // Google DNS Secondary
    '1.1.1.1',      // Cloudflare DNS
]);

// Disable DNS caching for fresh lookups
dns.setDefaultResultOrder('ipv4first');

class DomainService {
    // Helper function to check and reset monthly domain counter
    async checkAndResetMonthlyDomainLimit(subscription) {
        const now = new Date();
        const lastReset = new Date(subscription.lastDomainResetDate);
        
        // Check if a month has passed
        const monthsDiff = (now.getFullYear() - lastReset.getFullYear()) * 12 + 
                          (now.getMonth() - lastReset.getMonth());
        
        if (monthsDiff >= 1) {
            subscription.domainsAddedThisMonth = 0;
            subscription.lastDomainResetDate = now;
            await subscription.save();
        }
        
        return subscription;
    }

    // Add new domain for user
    async addDomain(userId, domainName) {
        try {
            // Check if user has Standard or Premium plan
            let subscription = await subscriptionService.getUserSubscription(userId);

            if (subscription.currentPlan === 'Free') {
                throw new Error('Custom domains are only available for Standard and Premium plan users. Please upgrade your plan.');
            }

            // Check and reset monthly domain counter if needed
            subscription = await this.checkAndResetMonthlyDomainLimit(subscription);

            // Check domain limit for the current month
            const domainLimit = subscription.planFeatures.domainsPerMonth;
            const domainsUsed = subscription.domainsAddedThisMonth;

            if (domainsUsed >= domainLimit) {
                throw new Error(`Domain limit reached. Your ${subscription.currentPlan} plan allows ${domainLimit} domains per month. Current usage: ${domainsUsed}/${domainLimit}. Limit will reset next month.`);
            }

            // Check if domain already exists for this user
            const existingDomain = await UserDomain.findOne({ userId, domainName });
            if (existingDomain) {
                throw new Error('This domain is already added to your account');
            }

            // Generate verification token
            const verificationToken = crypto.randomBytes(32).toString('hex');

            const domain = await UserDomain.create({
                userId,
                domainName,
                verificationToken,
                status: 'Pending',
                mxVerificationStatus: 'pending',
                txtVerificationStatus: 'pending'
            });

            // Increment domain counter
            subscription.domainsAddedThisMonth += 1;
            await subscription.save();

            return domain;
        } catch (error) {
            throw error;
        }
    }

    // Verify both MX and TXT Records
    async verifyDomain(userId, domainId) {
        try {
            const domain = await UserDomain.findOne({ _id: domainId, userId });

            if (!domain) {
                throw new Error('Domain not found');
            }

            domain.verificationAttempts += 1;
            domain.lastVerificationAttempt = Date.now();

            let mxVerified = false;
            let txtVerified = false;
            let errorMessages = [];
            let detailedErrors = [];

            // Add delay to ensure DNS propagation
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Try MX Record Verification with fresh DNS lookup
            try {
                // Use dns.resolveMx for fresh lookup
                const mxRecords = await dns.resolveMx(domain.domainName);

                if (mxRecords && mxRecords.length > 0) {
                    // Store MX records
                    domain.mxRecords = mxRecords.map(record => ({
                        exchange: record.exchange,
                        priority: record.priority
                    }));

                    // Check for mx3. mx1.temp-mailhub.com.com with priority 10
                    const hasRequiredMx = mxRecords.some(record =>
                        record.exchange.toLowerCase() === 'mx1.temp-mailhub.com' && record.priority === 10
                    );

                    if (hasRequiredMx) {
                        mxVerified = true;
                        domain.mxVerificationStatus = 'verified';
                    } else {
                        domain.mxVerificationStatus = 'failed';
                        detailedErrors.push(`Found MX records but not the required one. Expected: mx1.temp-mailhub.com with priority 10. Found: ${mxRecords.map(r => `${r.exchange} (priority ${r.priority})`).join(', ')}`);
                        errorMessages.push('MX record not found or incorrect. Please ensure you have added: mx1.temp-mailhub.com with priority 10');
                    }
                } else {
                    domain.mxVerificationStatus = 'failed';
                    detailedErrors.push('No MX records found for this domain');
                    errorMessages.push('No MX records found. Please add the MX record and wait a few minutes for DNS propagation');
                }
            } catch (dnsError) {
                domain.mxVerificationStatus = 'failed';
                const errorCode = dnsError.code;

                if (errorCode === 'ENODATA' || errorCode === 'ENOTFOUND') {
                    detailedErrors.push(`DNS lookup failed: Domain not found or no MX records configured (${errorCode})`);
                    errorMessages.push('Domain not found or no MX records configured. Please check if the domain is correct and MX records are added');
                } else if (errorCode === 'ETIMEOUT') {
                    detailedErrors.push(`DNS lookup timeout: ${dnsError.message}`);
                    errorMessages.push('DNS lookup timeout. Please try again in a few moments');
                } else {
                    detailedErrors.push(`MX lookup failed: ${dnsError.message}`);
                    errorMessages.push(`MX verification failed: ${dnsError.message}. Please try again`);
                }
            }

            // Try TXT Record Verification (Backup) with fresh DNS lookup
            try {
                const txtRecords = await dns.resolveTxt(domain.domainName);

                if (txtRecords && txtRecords.length > 0) {
                    // Flatten TXT records (they come as arrays of arrays)
                    const flatRecords = txtRecords.flat();

                    // Check for verification token
                    const hasRequiredTxt = flatRecords.some(record =>
                        record.includes(`tempmail-verification=${domain.verificationToken}`)
                    );

                    if (hasRequiredTxt) {
                        txtVerified = true;
                        domain.txtVerificationStatus = 'verified';
                    } else {
                        domain.txtVerificationStatus = 'pending';
                        detailedErrors.push(`TXT records found but verification token not matched. Expected: tempmail-verification=${domain.verificationToken}`);
                    }
                } else {
                    domain.txtVerificationStatus = 'pending';
                    detailedErrors.push('No TXT records found');
                }
            } catch (dnsError) {
                const errorCode = dnsError.code;

                if (errorCode === 'ENODATA' || errorCode === 'ENOTFOUND') {
                    domain.txtVerificationStatus = 'pending';
                    detailedErrors.push('No TXT records found (this is optional)');
                } else {
                    domain.txtVerificationStatus = 'failed';
                    detailedErrors.push(`TXT lookup error: ${dnsError.message}`);
                }
            }

            // Domain is verified if either MX or TXT is verified
            if (mxVerified || txtVerified) {
                domain.isVerified = true;
                domain.status = 'Active';
                domain.verifiedAt = new Date();
            } else {
                domain.isVerified = false;
                domain.status = 'Pending';
            }

            // Store detailed errors for debugging
            domain.lastVerificationError = detailedErrors.join(' | ');
            domain.updatedAt = Date.now();
            await domain.save();

            if (!domain.isVerified && errorMessages.length > 0) {
                const mainError = errorMessages[0];
                throw new Error(mainError);
            }

            return domain;
        } catch (error) {
            throw error;
        }
    }

    // Get all user domains
    async getUserDomains(userId) {
        try {
            const domains = await UserDomain.find({ userId }).sort({ createdAt: -1 });
            return domains;
        } catch (error) {
            throw error;
        }
    }

    // Update domain
    async updateDomain(userId, domainId, updateData) {
        try {
            const domain = await UserDomain.findOne({ _id: domainId, userId });

            if (!domain) {
                throw new Error('Domain not found');
            }

            // Only allow updating certain fields
            if (updateData.domainName) {
                domain.domainName = updateData.domainName;
                domain.isVerified = false; // Reset verification if domain name changes
                domain.verificationToken = crypto.randomBytes(32).toString('hex');
                domain.status = 'Pending';
            }

            domain.updatedAt = Date.now();
            await domain.save();

            return domain;
        } catch (error) {
            throw error;
        }
    }

    // Delete domain
    async deleteDomain(userId, domainId) {
        try {
            const domain = await UserDomain.findOneAndDelete({ _id: domainId, userId });

            if (!domain) {
                throw new Error('Domain not found');
            }

            return domain;
        } catch (error) {
            throw error;
        }
    }

    // Toggle domain status
    async toggleDomainStatus(userId, domainId) {
        try {
            const domain = await UserDomain.findOne({ _id: domainId, userId });

            if (!domain) {
                throw new Error('Domain not found');
            }

            domain.status = domain.status === 'Active' ? 'Inactive' : 'Active';
            domain.updatedAt = Date.now();

            await domain.save();

            return domain;
        } catch (error) {
            throw error;
        }
    }

    // Get domain usage statistics
    async getDomainUsageStats(userId) {
        try {
            let subscription = await subscriptionService.getUserSubscription(userId);
            
            // Check and reset monthly counter if needed
            subscription = await this.checkAndResetMonthlyDomainLimit(subscription);

            const totalDomains = await UserDomain.countDocuments({ userId });
            const activeDomains = await UserDomain.countDocuments({ userId, status: 'Active', isVerified: true });
            const pendingDomains = await UserDomain.countDocuments({ userId, status: 'Pending' });

            return {
                currentPlan: subscription.currentPlan,
                limits: {
                    domainsPerMonth: subscription.planFeatures.domainsPerMonth,
                    customEmailsPerMonth: subscription.planFeatures.customEmailsPerMonth,
                    customEmailExpiry: subscription.planFeatures.customEmailExpiry
                },
                usage: {
                    domainsAddedThisMonth: subscription.domainsAddedThisMonth,
                    customEmailsCreatedThisMonth: subscription.customEmailsCreatedThisMonth,
                    totalDomains,
                    activeDomains,
                    pendingDomains
                },
                remaining: {
                    domains: Math.max(0, subscription.planFeatures.domainsPerMonth - subscription.domainsAddedThisMonth),
                    customEmails: Math.max(0, subscription.planFeatures.customEmailsPerMonth - subscription.customEmailsCreatedThisMonth)
                },
                resetDate: {
                    domainResetDate: subscription.lastDomainResetDate,
                    customEmailResetDate: subscription.lastCustomEmailResetDate
                }
            };
        } catch (error) {
            throw error;
        }
    }
}

export default new DomainService();
