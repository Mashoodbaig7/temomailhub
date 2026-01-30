import UserSubscription from '../../../models/UserSubscriptionModel.js';
import Package from '../../../models/PackagesModel.js';
import TempEmail from '../../../models/TempEmailModel.js';

class SubscriptionService {
    // Get user subscription details
    async getUserSubscription(userId) {
        try {
            let subscription = await UserSubscription.findOne({ userId }).populate('packageId');

            // Create default free subscription if not exists
            if (!subscription) {
                subscription = await UserSubscription.create({
                    userId,
                    currentPlan: 'Free',
                    paymentStatus: 'Free',
                    accountStatus: 'Active'
                });
            }

            return subscription;
        } catch (error) {
            throw error;
        }
    }

    // Upgrade/Downgrade user subscription
    async updateUserPlan(userId, planName, billingCycle = 'monthly', paymentMethod = 'N/A') {
        try {
            // Validate plan name
            const validPlans = ['Free', 'Standard', 'Premium'];
            if (!validPlans.includes(planName)) {
                throw new Error(`Invalid plan name. Must be one of: ${validPlans.join(', ')}`);
            }

            let subscription = await UserSubscription.findOne({ userId });

            if (!subscription) {
                subscription = new UserSubscription({ userId });
            }

            // Store previous plan for upgrade logic
            const previousPlan = subscription.currentPlan;

            // Calculate subscription end date based on billing cycle
            const now = new Date();
            let endDate = new Date(now);

            if (planName !== 'Free') {
                if (billingCycle === 'yearly') {
                    endDate.setDate(endDate.getDate() + 365);
                } else {
                    endDate.setDate(endDate.getDate() + 30);
                }
            }

            // Try to find package (optional)
            const package_ = await Package.findOne({
                planName: { $regex: new RegExp(`^${planName.trim()}$`, 'i') },
                status: 'Active'
            });

            // Define plan features configuration
            const planFeatureConfigs = {
                'Free': {
                    emailLimit: 5,
                    emailExpiry: 10,
                    inboxStorage: 0,
                    domainsPerMonth: 0,
                    customEmailsPerMonth: 0,
                    customEmailExpiry: 0,
                    attachmentSupport: false,
                    attachmentSize: 0,
                    customDomain: false,
                    adFree: false,
                    prioritySupport: false,
                    advancedSpamFilter: false
                },
                'Standard': {
                    emailLimit: 10,
                    emailExpiry: 720,
                    inboxStorage: 20,
                    domainsPerMonth: 10,
                    customEmailsPerMonth: 40,
                    customEmailExpiry: 720,
                    attachmentSupport: true,
                    attachmentSize: 1,
                    customDomain: true,
                    adFree: true,
                    prioritySupport: true,
                    advancedSpamFilter: false
                },
                'Premium': {
                    emailLimit: 15,
                    emailExpiry: 1440,
                    inboxStorage: 100,
                    domainsPerMonth: 40,
                    customEmailsPerMonth: 100,
                    customEmailExpiry: 1440,
                    attachmentSupport: true,
                    attachmentSize: 10,
                    customDomain: true,
                    adFree: true,
                    prioritySupport: true,
                    advancedSpamFilter: true
                }
            };

            subscription.currentPlan = planName;
            subscription.planFeatures = planFeatureConfigs[planName] || planFeatureConfigs['Free'];
            subscription.packageId = package_?._id || null; // Optional package reference
            subscription.billingCycle = billingCycle;
            subscription.subscriptionStartDate = now;
            subscription.subscriptionEndDate = planName !== 'Free' ? endDate : null;
            subscription.paymentStatus = planName === 'Free' ? 'Free' : 'Paid';
            subscription.paymentMethod = planName === 'Free' ? 'N/A' : paymentMethod;
            subscription.accountStatus = 'Active';
            subscription.autoRenew = planName !== 'Free';

            // ==================================================================================
            // PLAN UPGRADE RULES
            // ==================================================================================
            // 1. Existing emails are PRESERVED - they remain visible with original expiry times
            // 2. Email generation limit counter is RESET to 0 on any upgrade
            // 3. Custom email limit counter is RESET to 0 on any upgrade
            // ==================================================================================

            // Reset email generation counter on upgrade
            if (planName !== 'Free' && previousPlan !== planName) {
                subscription.emailsGeneratedToday = 0;
                subscription.lastEmailResetDate = now;
                console.log(`✅ Reset email generation counter to 0 for user ${userId} (${previousPlan} → ${planName})`);
            }

            // Reset custom email counter on upgrade
            if (planName !== 'Free' && previousPlan !== planName) {
                subscription.customEmailsCreatedThisMonth = 0;
                subscription.lastCustomEmailResetDate = now;
                console.log(`✅ Reset custom email counter to 0 for user ${userId} (${previousPlan} → ${planName})`);
            }

            await subscription.save();

            // DO NOT delete existing emails - they are preserved with original expiry times
            console.log(`✅ Successfully upgraded to ${planName} plan for user ${userId}`);
            console.log(`   Existing emails preserved with original expiry times`);

            return subscription;
        } catch (error) {
            console.error('❌ Update user plan error:', error.message);
            throw error;
        }
    }

    // Cancel subscription
    async cancelSubscription(userId) {
        try {
            const subscription = await UserSubscription.findOne({ userId });

            if (!subscription) {
                throw new Error('No subscription found');
            }

            subscription.currentPlan = 'Free';
            subscription.packageId = null;
            subscription.autoRenew = false;
            subscription.paymentStatus = 'Free';
            subscription.subscriptionEndDate = null;

            await subscription.save();

            return subscription;
        } catch (error) {
            throw error;
        }
    }

    // Pause subscription
    async pauseSubscription(userId) {
        try {
            const subscription = await UserSubscription.findOne({ userId });

            if (!subscription) {
                throw new Error('No subscription found');
            }

            if (subscription.currentPlan === 'Free') {
                throw new Error('Cannot pause free plan');
            }

            subscription.accountStatus = subscription.accountStatus === 'Active' ? 'Inactive' : 'Active';
            subscription.autoRenew = subscription.accountStatus === 'Active';

            await subscription.save();

            return subscription;
        } catch (error) {
            throw error;
        }
    }

    // Check if user can generate email (rate limiting)
    async canGenerateEmail(userId) {
        try {
            const subscription = await UserSubscription.findOne({ userId });

            if (!subscription) {
                return { canGenerate: false, reason: 'No subscription found' };
            }

            if (subscription.accountStatus !== 'Active') {
                return { canGenerate: false, reason: 'Account is not active' };
            }

            const now = new Date();
            const lastReset = new Date(subscription.lastEmailResetDate);
            const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);

            // Reset counter if more than 1 hour has passed (for Free plan)
            if (subscription.currentPlan === 'Free' && hoursSinceReset >= 1) {
                subscription.emailsGeneratedToday = 0;
                subscription.lastEmailResetDate = now;
                await subscription.save();
            }

            const { emailLimit } = subscription.planFeatures;

            // Unlimited for Premium
            if (emailLimit === -1) {
                return { canGenerate: true, subscription };
            }

            // Check limit for Free and Standard
            if (subscription.emailsGeneratedToday >= emailLimit) {
                return {
                    canGenerate: false,
                    reason: `Email limit reached (${emailLimit} per hour)`,
                    resetTime: new Date(lastReset.getTime() + 60 * 60 * 1000)
                };
            }

            return { canGenerate: true, subscription };
        } catch (error) {
            throw error;
        }
    }

    // Increment email count
    async incrementEmailCount(userId) {
        try {
            const subscription = await UserSubscription.findOne({ userId });

            if (subscription) {
                subscription.emailsGeneratedToday += 1;
                subscription.totalEmailsGenerated += 1;
                await subscription.save();
            }

            return subscription;
        } catch (error) {
            throw error;
        }
    }

    // Get all available packages
    async getAllPackages() {
        try {
            const packages = await Package.find({ status: 'Active' });
            return packages;
        } catch (error) {
            throw error;
        }
    }
}

export default new SubscriptionService();
