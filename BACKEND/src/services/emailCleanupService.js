import cron from 'node-cron';
import mongoose from 'mongoose';
import TempEmail from '../models/TempEmailModel.js';

/**
 * Email Cleanup Service
 * 
 * IMPORTANT: This service ONLY cleans up expired TempEmail records (the actual emails).
 * It does NOT touch EmailGeneration records, which are used for rate limiting.
 * 
 * EmailGeneration records persist for 1 hour via MongoDB TTL index to enforce
 * strict hourly rate limits, regardless of when the actual emails expire.
 */
class EmailCleanupService {
    constructor() {
        this.isRunning = false;
    }

    // Clean up expired emails from TempEmail collection and associated ReceivedEmail records
    async cleanupExpiredEmails() {
        try {
            // Check if database is connected
            if (mongoose.connection.readyState !== 1) {
                console.log('⚠️  Database not connected, skipping email cleanup');
                return { deletedCount: 0, receivedEmailsDeleted: 0 };
            }

            const now = new Date();
            
            // Find expired temp emails first to get their IDs
            const expiredTempEmails = await TempEmail.find({
                expiresAt: { $lt: now }
            }).select('_id');
            
            const expiredTempEmailIds = expiredTempEmails.map(e => e._id);
            
            // Delete received emails associated with expired temp emails
            let receivedEmailsDeleted = 0;
            if (expiredTempEmailIds.length > 0) {
                // Import ReceivedEmail model
                const ReceivedEmail = (await import('../models/ReceivedEmailModel.js')).default;
                
                // Delete attachments from Cloudinary before deleting received emails
                const receivedEmailsToDelete = await ReceivedEmail.find({
                    tempEmailId: { $in: expiredTempEmailIds }
                });
                
                // Delete attachments from Cloudinary
                const { deleteFileFromCloudinary } = await import('../config/cloudinary.js');
                for (const email of receivedEmailsToDelete) {
                    if (email.attachments && email.attachments.length > 0) {
                        for (const att of email.attachments) {
                            try {
                                await deleteFileFromCloudinary(att.publicId);
                            } catch (delError) {
                                console.error(`Failed to delete attachment: ${att.publicId}`, delError);
                            }
                        }
                    }
                }
                
                // Delete received emails
                const receivedResult = await ReceivedEmail.deleteMany({
                    tempEmailId: { $in: expiredTempEmailIds }
                });
                receivedEmailsDeleted = receivedResult.deletedCount;
            }
            
            // Delete expired temp emails
            const result = await TempEmail.deleteMany({
                expiresAt: { $lt: now }
            });

            if (result.deletedCount > 0 || receivedEmailsDeleted > 0) {
                console.log(`✅ Email Cleanup: Deleted ${result.deletedCount} expired temp emails and ${receivedEmailsDeleted} received emails`);
            }

            return { deletedCount: result.deletedCount, receivedEmailsDeleted };
        } catch (error) {
            console.error('❌ Email cleanup error:', error.message);
            // Don't throw - just log the error to prevent cron from crashing
            return { deletedCount: 0, receivedEmailsDeleted: 0, error: error.message };
        }
    }

    // Start cron job - runs every hour
    startCleanupCron() {
        if (this.isRunning) {
            console.log('⚠️  Email cleanup cron is already running');
            return;
        }

        // Run every hour at minute 0
        cron.schedule('0 * * * *', async () => {
            console.log('🔄 Running scheduled email cleanup...');
            await this.cleanupExpiredEmails();
        });

        // Run initial cleanup after a short delay to ensure DB is ready
        setTimeout(async () => {
            console.log('🔄 Running initial email cleanup...');
            await this.cleanupExpiredEmails();
        }, 2000);

        this.isRunning = true;
        console.log('✅ Email cleanup cron job started - runs every hour');
    }

    // Manual cleanup trigger
    async runManualCleanup() {
        console.log('🔄 Running manual email cleanup...');
        return await this.cleanupExpiredEmails();
    }
}

export default new EmailCleanupService();
