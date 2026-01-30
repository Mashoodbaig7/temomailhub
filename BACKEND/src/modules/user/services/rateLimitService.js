import EmailGeneration from '../../../models/EmailGenerationModel.js';
import subscriptionService from './subscriptionService.js';

/**
 * Rate Limit Service - Hourly Generation Limits
 * 
 * SYSTEM BEHAVIOR:
 * ----------------
 * Each plan has a maximum number of emails that can be GENERATED per hour:
 * - Anonymous: 2 emails/hour
 * - Free: 5 emails/hour  
 * - Standard: 10 emails/hour
 * - Premium: 15 emails/hour
 * 
 * EXAMPLE SCENARIO (Premium User with 15 email limit):
 * ----------------------------------------------------
 * 10:00 AM - User generates email #1 (Expires: 11:00 AM based on Premium 24hr expiry)
 * 10:05 AM - User generates emails #2-14
 * 10:10 AM - User generates email #15 → LIMIT REACHED
 * 10:15 AM - User tries to generate email #16 → BLOCKED (must wait until 11:00 AM)
 * 10:30 AM - Email #1 expires → User still BLOCKED (generation count remains)
 * 11:00 AM - 1 hour from first email → LIMIT RESETS → User can now generate email #16
 * 
 * KEY POINTS:
 * -----------
 * 1. Limit is based on GENERATION COUNT, not active emails
 * 2. Email expiration does NOT reset the generation count
 * 3. Reset occurs 1 hour after the OLDEST email in the current window
 * 4. Each plan has its own expiration time (10min/12hr/24hr) - this is separate from rate limit
 */

class RateLimitService {
    // Get rate limit configuration based on plan
    // These limits define the MAXIMUM number of emails a user can GENERATE per hour
    // Example: Premium user can generate UP TO 15 emails per hour
    // Once they generate 15, they must wait for the full hour window to reset
    getRateLimitConfig(userPlan) {
        const configs = {
            'Anonymous': { hourlyLimit: 2, requiresAuth: true },      // Can generate 2 emails/hour
            'Free': { hourlyLimit: 5, nextTier: 'Standard' },         // Can generate 5 emails/hour
            'Standard': { hourlyLimit: 10, nextTier: 'Premium' },     // Can generate 10 emails/hour
            'Premium': { hourlyLimit: 15, nextTier: null }            // Can generate 15 emails/hour
        };

        return configs[userPlan] || configs['Anonymous'];
    }

    // Check if user can generate email based on hourly limit
    // This checks GENERATION COUNT in the last hour, NOT active email count
    // Even if all generated emails expire/delete, the count remains for the hour window
    // For anonymous users, uses IP address to prevent localStorage bypass
    async canGenerateEmail(userId, sessionId, userPlan = 'Anonymous', ipAddress = null) {
        try {
            const config = this.getRateLimitConfig(userPlan);

            // Calculate time window (1 hour ago)
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

            // Query based on user type - ONLY COUNT EMAILS FROM CURRENT PLAN
            // For anonymous users, prioritize IP address to prevent localStorage bypass
            let query;
            if (userId) {
                query = { userId, userPlan, generatedAt: { $gte: oneHourAgo } };
            } else if (ipAddress) {
                // For anonymous users, check by IP address (cannot be bypassed by clearing localStorage)
                query = { ipAddress, userPlan: 'Anonymous', generatedAt: { $gte: oneHourAgo } };
            } else {
                // Fallback to sessionId if IP is not available
                query = { sessionId, userPlan, generatedAt: { $gte: oneHourAgo } };
            }

            const emailsGeneratedInLastHour = await EmailGeneration.countDocuments(query);

            console.log(`Rate Limit Check: userId=${userId}, sessionId=${sessionId}, ipAddress=${ipAddress}, plan=${userPlan}, count=${emailsGeneratedInLastHour}/${config.hourlyLimit}`);

            // HOURLY GENERATION LIMIT ENFORCEMENT:
            // - Premium: Can generate UP TO 15 emails, then must wait 1 hour for reset
            // - Standard: Can generate UP TO 10 emails, then must wait 1 hour for reset
            // - Free: Can generate UP TO 5 emails, then must wait 1 hour for reset
            // - Anonymous: Can generate UP TO 2 emails, then must wait 1 hour for reset (IP-based)
            // 
            // IMPORTANT: This limit is based on GENERATION COUNT, not active emails
            // Even if emails expire or are deleted, the generation count remains
            // Reset occurs 1 hour after the FIRST email in the current window was generated
            if (emailsGeneratedInLastHour >= config.hourlyLimit) {
                // Find the oldest email in this hour to calculate reset time
                const oldestEmail = await EmailGeneration.findOne(query)
                    .sort({ generatedAt: 1 });

                // Reset time is exactly 1 hour from the oldest email generation
                const resetTime = oldestEmail
                    ? new Date(oldestEmail.generatedAt.getTime() + 60 * 60 * 1000)
                    : new Date(Date.now() + 60 * 60 * 1000);

                console.log(`Rate Limit EXCEEDED: Oldest email generated at ${oldestEmail?.generatedAt}, Reset at ${resetTime}`);

                return {
                    allowed: false,
                    remaining: 0,
                    resetTime,
                    requiresUpgrade: true,
                    requiresAuth: config.requiresAuth,
                    currentLimit: config.hourlyLimit,
                    nextTier: config.nextTier,
                    message: `You have reached your limit of ${config.hourlyLimit} emails per hour. Please wait until ${resetTime.toLocaleTimeString()} or upgrade your plan.`
                };
            }

            return {
                allowed: true,
                remaining: config.hourlyLimit - emailsGeneratedInLastHour,
                resetTime: null,
                requiresUpgrade: false,
                requiresAuth: false,
                currentLimit: config.hourlyLimit
            };
        } catch (error) {
            console.error('Rate limit check error:', error);
            throw error;
        }
    }

    // Record email generation
    async recordEmailGeneration(userId, sessionId, emailAddress, userPlan, ipAddress = null) {
        try {
            await EmailGeneration.create({
                userId: userId || null,
                sessionId,
                ipAddress,
                emailAddress,
                generatedAt: new Date(),
                expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
                userPlan
            });
        } catch (error) {
            console.error('Record email generation error:', error);
            throw error;
        }
    }

    // Get user's current usage stats
    async getUserUsageStats(userId, sessionId, userPlan, ipAddress = null) {
        try {
            const config = this.getRateLimitConfig(userPlan);
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

            // Only count emails from current plan
            // For anonymous users, use IP address to prevent localStorage bypass
            let query;
            if (userId) {
                query = { userId, userPlan, generatedAt: { $gte: oneHourAgo } };
            } else if (ipAddress) {
                query = { ipAddress, userPlan: 'Anonymous', generatedAt: { $gte: oneHourAgo } };
            } else {
                query = { sessionId, userPlan, generatedAt: { $gte: oneHourAgo } };
            }

            const emailsGeneratedInLastHour = await EmailGeneration.countDocuments(query);

            // Get total count for current plan (all time)
            const totalQueryBase = userId ? { userId, userPlan } : ipAddress ? { ipAddress, userPlan: 'Anonymous' } : { sessionId, userPlan };
            const totalGenerated = await EmailGeneration.countDocuments(totalQueryBase);

            return {
                hourlyUsed: emailsGeneratedInLastHour,
                hourlyLimit: config.hourlyLimit,
                remaining: config.hourlyLimit ? config.hourlyLimit - emailsGeneratedInLastHour : null,
                totalGenerated,
                userPlan
            };
        } catch (error) {
            console.error('Get usage stats error:', error);
            throw error;
        }
    }

    // Clean up old records (can be run as a cron job)
    async cleanupOldRecords() {
        try {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const result = await EmailGeneration.deleteMany({
                generatedAt: { $lt: oneDayAgo }
            });
            return result;
        } catch (error) {
            console.error('Cleanup error:', error);
            throw error;
        }
    }
}

export default new RateLimitService();
