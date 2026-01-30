import TempEmail from '../../../models/TempEmailModel.js';
import subscriptionService from './subscriptionService.js';
import crypto from 'crypto';

class EmailService {
    // Default domains for random email generation
    defaultDomains = ["temp-mailhub.com", "d-techstudios.com", "creditsiq.com", "noobtobull.com", "talkified.com", "cryptomux.com"];

    // Get random domain from default list
    getRandomDomain() {
        return this.defaultDomains[Math.floor(Math.random() * this.defaultDomains.length)];
    }

    // Get expiry duration based on plan
    getExpiryDuration(userPlan) {
        const durations = {
            'Anonymous': 10 * 60 * 1000, // 10 minutes
            'Free': 10 * 60 * 1000, // 10 minutes
            'Standard': 12 * 60 * 60 * 1000, // 12 hours
            'Premium': 24 * 60 * 60 * 1000 // 24 hours
        };
        return durations[userPlan] || durations['Anonymous'];
    }

    // Generate random email address
    generateRandomEmail(domain = null) {
        const randomString = crypto.randomBytes(8).toString('hex');
        const selectedDomain = domain || this.getRandomDomain();
        return `${randomString}@${selectedDomain}`;
    }

    // Create temporary email with persistence (supports both authenticated and anonymous users)
    async createTempEmailPersistent(userId, sessionId, customEmail = null, domain = null, userPlan = 'Anonymous', ipAddress = null) {
        try {
            // Determine if this is a custom email
            const isCustomEmail = customEmail !== null && customEmail !== undefined && customEmail.trim() !== '';

            // Generate email address
            let emailAddress;
            if (customEmail && domain) {
                emailAddress = `${customEmail}@${domain}`;
            } else if (customEmail) {
                // If custom email without domain, use random domain
                emailAddress = `${customEmail}@${this.getRandomDomain()}`;
            } else {
                // Random email generation - use provided domain or random from defaults
                emailAddress = this.generateRandomEmail(domain);
            }

            // Check if email already exists
            const existingEmail = await TempEmail.findOne({ emailAddress });
            if (existingEmail) {
                if (customEmail) {
                    throw new Error('This email address is already taken');
                }
                // If random, try again with different domain
                emailAddress = this.generateRandomEmail(null); // null = use random domain
            }

            // If this is a custom email and user is authenticated, check and update custom email counter
            if (isCustomEmail && userId) {
                const subscription = await subscriptionService.getUserSubscription(userId);

                // Check and reset monthly counter if needed
                const now = new Date();
                const lastReset = new Date(subscription.lastCustomEmailResetDate);
                const monthsDiff = (now.getFullYear() - lastReset.getFullYear()) * 12 +
                    (now.getMonth() - lastReset.getMonth());

                if (monthsDiff >= 1) {
                    subscription.customEmailsCreatedThisMonth = 0;
                    subscription.lastCustomEmailResetDate = now;
                }

                // Check custom email limit
                const customEmailLimit = subscription.planFeatures.customEmailsPerMonth;
                const customEmailsUsed = subscription.customEmailsCreatedThisMonth;

                if (customEmailsUsed >= customEmailLimit) {
                    throw new Error(`Custom email limit reached. Your ${subscription.currentPlan} plan allows ${customEmailLimit} custom emails per month. Current usage: ${customEmailsUsed}/${customEmailLimit}. Random emails are still available.`);
                }

                // Increment custom email counter
                subscription.customEmailsCreatedThisMonth += 1;
                await subscription.save();
            }

            // Calculate expiry time based on plan
            const expiryDuration = this.getExpiryDuration(userPlan);
            const expiresAt = new Date(Date.now() + expiryDuration);

            // Create email
            const tempEmail = await TempEmail.create({
                userId: userId || null,
                sessionId: sessionId || null,
                ipAddress: ipAddress || null,
                emailAddress,
                domain: domain || 'tempmail.com',
                userPlan,
                isCustomEmail, // Track if this is a custom email
                expiresAt,
                inbox: []
            });

            return tempEmail;
        } catch (error) {
            throw error;
        }
    }

    // Get active emails for user or session
    async getActiveEmails(userId, sessionId, ipAddress = null) {
        try {
            const now = new Date();

            // Query based on user type
            let query;
            if (userId) {
                // For logged-in users, get emails by userId
                query = { userId, isActive: true, expiresAt: { $gt: now } };
            } else if (ipAddress) {
                // For anonymous users, get emails by IP address OR sessionId
                // This ensures emails persist even when localStorage is cleared
                query = {
                    $or: [
                        { ipAddress, userId: null, isActive: true, expiresAt: { $gt: now } },
                        { sessionId, userId: null, isActive: true, expiresAt: { $gt: now } }
                    ]
                };
            } else {
                // Fallback to sessionId only
                query = { sessionId, userId: null, isActive: true, expiresAt: { $gt: now } };
            }

            const emails = await TempEmail.find(query).sort({ createdAt: -1 });
            return emails;
        } catch (error) {
            throw error;
        }
    }

    // Delete all emails for a user (used when plan changes)
    async deleteUserEmails(userId) {
        try {
            const result = await TempEmail.deleteMany({ userId });
            console.log(`Deleted ${result.deletedCount} emails for user ${userId}`);
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Clean up expired emails (cron job)
    async cleanupExpiredEmails() {
        try {
            const now = new Date();
            const result = await TempEmail.deleteMany({
                expiresAt: { $lt: now },
                isActive: true
            });
            console.log(`Cleaned up ${result.deletedCount} expired emails`);
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Create new temporary email
    async createTempEmail(userId, customEmail = null, domain = null) {
        try {
            // Check if user can generate email
            const { canGenerate, reason, subscription, resetTime } = await subscriptionService.canGenerateEmail(userId);

            if (!canGenerate) {
                throw new Error(reason || 'Cannot generate email at this time');
            }

            // Generate email address
            let emailAddress;
            if (customEmail && domain) {
                emailAddress = `${customEmail}@${domain}`;
            } else if (customEmail) {
                emailAddress = `${customEmail}@tempmail.com`;
            } else {
                emailAddress = this.generateRandomEmail(domain || 'tempmail.com');
            }

            // Check if email already exists
            const existingEmail = await TempEmail.findOne({ emailAddress });
            if (existingEmail) {
                if (customEmail) {
                    throw new Error('This email address is already taken');
                }
                // If random, try again
                emailAddress = this.generateRandomEmail(domain || 'tempmail.com');
            }

            // Calculate expiry time based on plan
            const expiryMinutes = subscription.planFeatures.emailExpiry;
            const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

            // Create email
            const tempEmail = await TempEmail.create({
                userId,
                emailAddress,
                domain: domain || 'tempmail.com',
                expiresAt,
                inbox: []
            });

            // Increment email count
            await subscriptionService.incrementEmailCount(userId);

            return tempEmail;
        } catch (error) {
            throw error;
        }
    }

    // Get all user emails
    async getUserEmails(userId) {
        try {
            const emails = await TempEmail.find({ userId, isActive: true }).sort({ createdAt: -1 });
            return emails;
        } catch (error) {
            throw error;
        }
    }

    // Get single email
    async getEmail(userId, emailId) {
        try {
            const email = await TempEmail.findOne({ _id: emailId, userId });

            if (!email) {
                throw new Error('Email not found');
            }

            return email;
        } catch (error) {
            throw error;
        }
    }

    // Delete email
    async deleteEmail(userId, emailId) {
        try {
            const email = await TempEmail.findOneAndDelete({ _id: emailId, userId });

            if (!email) {
                throw new Error('Email not found');
            }

            return email;
        } catch (error) {
            throw error;
        }
    }

    // Refresh/Extend email expiry
    async refreshEmail(userId, emailId) {
        try {
            const email = await TempEmail.findOne({ _id: emailId, userId });

            if (!email) {
                throw new Error('Email not found');
            }

            const subscription = await subscriptionService.getUserSubscription(userId);
            const expiryMinutes = subscription.planFeatures.emailExpiry;

            // Extend expiry time
            email.expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
            await email.save();

            return email;
        } catch (error) {
            throw error;
        }
    }

    // Get email inbox/messages
    async getEmailInbox(userId, emailId) {
        try {
            const email = await TempEmail.findOne({ _id: emailId, userId });

            if (!email) {
                throw new Error('Email not found');
            }

            return email.inbox;
        } catch (error) {
            throw error;
        }
    }

    // Add message to inbox (simulated for demo)
    async addMessageToInbox(userId, emailId, messageData) {
        try {
            const email = await TempEmail.findOne({ _id: emailId, userId });

            if (!email) {
                throw new Error('Email not found');
            }

            const subscription = await subscriptionService.getUserSubscription(userId);
            const maxStorage = subscription.planFeatures.inboxStorage;

            // Check storage limit
            if (maxStorage > 0 && email.inbox.length >= maxStorage) {
                // Remove oldest message if limit reached
                email.inbox.shift();
            }

            // Add new message
            email.inbox.push({
                from: messageData.from,
                subject: messageData.subject || 'No Subject',
                body: messageData.body || '',
                htmlBody: messageData.htmlBody,
                attachments: messageData.attachments || [],
                receivedAt: new Date(),
                isRead: false
            });

            await email.save();

            return email;
        } catch (error) {
            throw error;
        }
    }

    // Mark message as read
    async markMessageAsRead(userId, emailId, messageId) {
        try {
            const email = await TempEmail.findOne({ _id: emailId, userId });

            if (!email) {
                throw new Error('Email not found');
            }

            const message = email.inbox.id(messageId);
            if (message) {
                message.isRead = true;
                await email.save();
            }

            return email;
        } catch (error) {
            throw error;
        }
    }

    // Delete message from inbox
    async deleteMessage(userId, emailId, messageId) {
        try {
            const email = await TempEmail.findOne({ _id: emailId, userId });

            if (!email) {
                throw new Error('Email not found');
            }

            email.inbox.pull(messageId);
            await email.save();

            return email;
        } catch (error) {
            throw error;
        }
    }

    // Clean up expired emails (cron job)
    async cleanupExpiredEmails() {
        try {
            const now = new Date();
            const result = await TempEmail.deleteMany({
                expiresAt: { $lt: now },
                isActive: true
            });

            return result;
        } catch (error) {
            throw error;
        }
    }
}

export default new EmailService();
