import mongoose from 'mongoose';

const emailGenerationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // null for anonymous users
    },
    sessionId: {
        type: String, // For tracking anonymous users
        required: true
    },
    ipAddress: {
        type: String, // For tracking anonymous users by IP to prevent localStorage bypass
        default: null
    },
    emailAddress: {
        type: String,
        required: true
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    },
    userPlan: {
        type: String,
        enum: ['Anonymous', 'Free', 'Standard', 'Premium'],
        default: 'Anonymous'
    }
});

// Index for efficient queries
emailGenerationSchema.index({ userId: 1, generatedAt: -1 });
emailGenerationSchema.index({ sessionId: 1, generatedAt: -1 });
emailGenerationSchema.index({ ipAddress: 1, generatedAt: -1 });
emailGenerationSchema.index({ userPlan: 1 });

// ==================================================================================
// TTL INDEX - CRITICAL FOR RATE LIMIT ENFORCEMENT
// ==================================================================================
// Records MUST persist for exactly 1 hour from generation to enforce hourly limits.
// 
// EXAMPLE SCENARIO (Anonymous user with 2 email limit):
// - 10:00 AM: User generates email #1 (expires at 10:10 AM due to 10min validity)
// - 10:05 AM: User generates email #2 (expires at 10:15 AM)
// - 10:12 AM: Email #1 expires and is deleted from TempEmail
// - 10:15 AM: User tries to generate email #3 → BLOCKED (generation record still exists)
// - 11:00 AM: Generation record #1 auto-deleted → User can now generate email #3
// 
// This ensures users CANNOT bypass rate limits by waiting for emails to expire.
// ==================================================================================
emailGenerationSchema.index({ generatedAt: 1 }, { expireAfterSeconds: 3600 }); // Auto-delete 1 hour after generation

const EmailGeneration = mongoose.model('EmailGeneration', emailGenerationSchema);
export default EmailGeneration;
