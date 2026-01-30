import mongoose from 'mongoose';

const tempEmailSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        default: null
    },
    sessionId: {
        type: String,
        required: false,
        default: null
    },
    ipAddress: {
        type: String,
        required: false,
        default: null
    },
    emailAddress: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    inbox: [{
        from: { type: String, required: true },
        subject: { type: String, default: 'No Subject' },
        body: { type: String, default: '' },
        htmlBody: { type: String },
        attachments: [{
            filename: String,
            contentType: String,
            size: Number,
            url: String
        }],
        receivedAt: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false }
    }],
    domain: {
        type: String,
        default: 'tempmail.com'
    },
    userPlan: {
        type: String,
        enum: ['Anonymous', 'Free', 'Standard', 'Premium'],
        default: 'Anonymous'
    },
    isCustomEmail: {
        type: Boolean,
        default: false // true if user specified custom email, false if randomly generated
    },
    isCustomDomain: {
        type: Boolean,
        default: false // true if this email is on a user's custom domain
    },
    customDomainId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CustomDomain',
        default: null
    },
    expiresAt: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
tempEmailSchema.index({ userId: 1, isActive: 1 });
tempEmailSchema.index({ sessionId: 1, isActive: 1 });
tempEmailSchema.index({ ipAddress: 1, isActive: 1 });
tempEmailSchema.index({ expiresAt: 1 });
tempEmailSchema.index({ emailAddress: 1 });
tempEmailSchema.index({ userPlan: 1 });

const TempEmail = mongoose.model('TempEmail', tempEmailSchema);
export default TempEmail;
