import emailService from '../services/emailService.js';
import rateLimitService from '../services/rateLimitService.js';
import subscriptionService from '../services/subscriptionService.js';

// Check rate limit before generating email
export const checkRateLimit = async (req, res) => {
    try {
        const userId = req.user?.userId || null;
        const sessionId = req.headers['x-session-id'] || req.sessionID || 'anonymous';
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        let userPlan = 'Anonymous';
        if (userId) {
            const subscription = await subscriptionService.getUserSubscription(userId);
            userPlan = subscription.currentPlan;
        }

        console.log(`Check Rate Limit - UserId: ${userId}, UserPlan: ${userPlan}, SessionId: ${sessionId}, IP: ${ipAddress}`);

        const rateLimitStatus = await rateLimitService.canGenerateEmail(userId, sessionId, userPlan, ipAddress);

        res.status(200).json({
            success: true,
            data: rateLimitStatus
        });
    } catch (error) {
        console.error('Check rate limit error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to check rate limit'
        });
    }
};

// Record email generation (for rate limiting only, doesn't create actual email)
export const recordGeneration = async (req, res) => {
    try {
        const userId = req.user?.userId || null;
        const sessionId = req.headers['x-session-id'] || req.sessionID || 'anonymous';
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const { emailAddress } = req.body;

        let userPlan = 'Anonymous';
        if (userId) {
            const subscription = await subscriptionService.getUserSubscription(userId);
            userPlan = subscription.currentPlan;
        }

        console.log(`Record Generation - UserId: ${userId}, UserPlan: ${userPlan}, Email: ${emailAddress}, IP: ${ipAddress}`);

        // Check rate limit first
        const rateLimitStatus = await rateLimitService.canGenerateEmail(userId, sessionId, userPlan, ipAddress);

        if (!rateLimitStatus.allowed) {
            return res.status(429).json({
                success: false,
                message: rateLimitStatus.requiresAuth
                    ? 'Please create an account to generate more emails'
                    : 'Rate limit exceeded',
                data: rateLimitStatus
            });
        }

        // Record the generation
        await rateLimitService.recordEmailGeneration(userId, sessionId, emailAddress, userPlan, ipAddress);

        res.status(200).json({
            success: true,
            message: 'Email generation recorded',
            data: {
                rateLimit: {
                    remaining: rateLimitStatus.remaining - 1,
                    limit: rateLimitStatus.currentLimit
                }
            }
        });
    } catch (error) {
        console.error('Record generation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to record email generation'
        });
    }
};

// Get usage stats
export const getUsageStats = async (req, res) => {
    try {
        const userId = req.user?.userId || null;
        const sessionId = req.headers['x-session-id'] || req.sessionID || 'anonymous';
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        let userPlan = 'Anonymous';
        if (userId) {
            const subscription = await subscriptionService.getUserSubscription(userId);
            userPlan = subscription.currentPlan;
        }

        const stats = await rateLimitService.getUserUsageStats(userId, sessionId, userPlan, ipAddress);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get usage stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get usage stats'
        });
    }
};

// Create new temporary email with persistence
/**
 * STRICT RATE LIMIT ENFORCEMENT
 * ==============================
 * This endpoint enforces strict hourly generation limits:
 * - Anonymous/Guest: 2 emails/hour
 * - Free: 5 emails/hour
 * - Standard: 10 emails/hour
 * - Premium: 15 emails/hour
 * 
 * CRITICAL GUARANTEES:
 * 1. Rate limit is checked BEFORE email creation (line 128)
 * 2. Generation is recorded AFTER email creation (line 145)
 * 3. Even if emails expire/delete, generation count persists for 1 hour
 * 4. Users CANNOT exceed their limit until full 1-hour window resets
 * 5. Reset time = 1 hour from FIRST email generation in current window
 * 
 * EXAMPLE (Anonymous with 2 email limit):
 * - 10:00 AM: Generate email #1 → Success
 * - 10:05 AM: Generate email #2 → Success  
 * - 10:10 AM: Try email #3 → BLOCKED (must wait until 11:00 AM)
 * - 10:10 AM: Email #1 expires → Still BLOCKED (generation record persists)
 * - 11:00 AM: 1 hour from first generation → Can generate email #3
 */
export const createTempEmail = async (req, res) => {
    try {
        const userId = req.user?.userId || null;
        const sessionId = req.headers['x-session-id'] || req.sessionID || 'anonymous';
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const { customEmail, domain } = req.body;
        console.log(ipAddress);


        // Determine user plan
        let userPlan = 'Anonymous';
        if (userId) {
            const subscription = await subscriptionService.getUserSubscription(userId);
            userPlan = subscription.currentPlan;
        }

        console.log(`Create Email - UserId: ${userId}, UserPlan: ${userPlan}, SessionId: ${sessionId}, IP: ${ipAddress}`);

        // Check rate limit first
        const rateLimitStatus = await rateLimitService.canGenerateEmail(userId, sessionId, userPlan, ipAddress);

        if (!rateLimitStatus.allowed) {
            return res.status(429).json({
                success: false,
                message: rateLimitStatus.requiresAuth
                    ? 'Please create an account to generate more emails'
                    : 'Rate limit exceeded',
                data: rateLimitStatus
            });
        }

        // Create email in database
        const email = await emailService.createTempEmailPersistent(
            userId,
            sessionId,
            customEmail,
            domain,
            userPlan,
            ipAddress
        );

        // Record generation for rate limiting
        await rateLimitService.recordEmailGeneration(userId, sessionId, email.emailAddress, userPlan, ipAddress);

        // Check rate limit status AFTER generation to see if user just hit their limit
        // This allows frontend to automatically start the 1-hour countdown timer when last email is generated
        // 
        // EXAMPLE (Anonymous user with 2 email limit):
        // - Email #1: rateLimit.allowed = true, remaining = 1 → No timer
        // - Email #2: rateLimit.allowed = false, remaining = 0 → Timer starts automatically!
        // 
        // This ensures users see the timer IMMEDIATELY after generating their last email,
        // not when they try to generate one more (which would be blocked)
        const updatedRateLimitStatus = await rateLimitService.canGenerateEmail(userId, sessionId, userPlan, ipAddress);

        res.status(201).json({
            success: true,
            message: 'Email created successfully',
            data: {
                id: email._id,
                email: email.emailAddress,
                expiresAt: email.expiresAt,
                createdAt: email.createdAt,
                userPlan: email.userPlan
            },
            rateLimit: updatedRateLimitStatus
        });
    } catch (error) {
        console.error('Create email error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create email'
        });
    }
};

// Get active emails for current user/session
export const getActiveEmails = async (req, res) => {
    try {
        const userId = req.user?.userId || null;
        const sessionId = req.headers['x-session-id'] || req.sessionID || 'anonymous';
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        console.log(`Get Active Emails - UserId: ${userId}, SessionId: ${sessionId}, IP: ${ipAddress}`);

        const emails = await emailService.getActiveEmails(userId, sessionId, ipAddress);

        res.status(200).json({
            success: true,
            data: emails
        });
    } catch (error) {
        console.error('Get active emails error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get active emails'
        });
    }
};

// Get all user emails
export const getUserEmails = async (req, res) => {
    try {
        const userId = req.user.userId;
        const emails = await emailService.getUserEmails(userId);

        res.status(200).json({
            success: true,
            data: emails
        });
    } catch (error) {
        console.error('Get emails error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch emails'
        });
    }
};

// Get single email
export const getEmail = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { emailId } = req.params;

        const email = await emailService.getEmail(userId, emailId);

        res.status(200).json({
            success: true,
            data: email
        });
    } catch (error) {
        console.error('Get email error:', error);
        res.status(404).json({
            success: false,
            message: error.message || 'Email not found'
        });
    }
};

// Delete email
export const deleteEmail = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { emailId } = req.params;

        await emailService.deleteEmail(userId, emailId);

        res.status(200).json({
            success: true,
            message: 'Email deleted successfully'
        });
    } catch (error) {
        console.error('Delete email error:', error);
        res.status(404).json({
            success: false,
            message: error.message || 'Failed to delete email'
        });
    }
};

// Refresh/Extend email
export const refreshEmail = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { emailId } = req.params;

        const email = await emailService.refreshEmail(userId, emailId);

        res.status(200).json({
            success: true,
            message: 'Email expiry extended successfully',
            data: email
        });
    } catch (error) {
        console.error('Refresh email error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to refresh email'
        });
    }
};

// Get email inbox
export const getEmailInbox = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { emailId } = req.params;

        const inbox = await emailService.getEmailInbox(userId, emailId);

        res.status(200).json({
            success: true,
            data: inbox
        });
    } catch (error) {
        console.error('Get inbox error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch inbox'
        });
    }
};

// Add message to inbox (for testing/demo)
export const addMessageToInbox = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { emailId } = req.params;
        const messageData = req.body;

        const email = await emailService.addMessageToInbox(userId, emailId, messageData);

        res.status(201).json({
            success: true,
            message: 'Message added to inbox',
            data: email
        });
    } catch (error) {
        console.error('Add message error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to add message'
        });
    }
};

// Mark message as read
export const markMessageAsRead = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { emailId, messageId } = req.params;

        const email = await emailService.markMessageAsRead(userId, emailId, messageId);

        res.status(200).json({
            success: true,
            message: 'Message marked as read',
            data: email
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to mark message as read'
        });
    }
};

// Delete message
export const deleteMessage = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { emailId, messageId } = req.params;

        const email = await emailService.deleteMessage(userId, emailId, messageId);

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully',
            data: email
        });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete message'
        });
    }
};
