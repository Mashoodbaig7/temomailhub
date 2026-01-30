import mongoose from 'mongoose';

/**
 * Received Email Model
 * 
 * Stores emails received from Cloudflare Worker.
 * This is different from TempEmailModel which stores temp email addresses.
 * This model stores actual received email messages.
 */
const receivedEmailSchema = new mongoose.Schema({
    // The temporary email address that received this email
    tempEmailId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TempEmail',
        required: true,
        index: true
    },
    
    // Email recipient (temp email address)
    to: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    
    // Email sender
    from: {
        type: String,
        required: true,
        trim: true
    },
    
    // Email subject
    subject: {
        type: String,
        default: 'No Subject',
        trim: true
    },
    
    // Plain text body
    textBody: {
        type: String,
        default: ''
    },
    
    // HTML body
    htmlBody: {
        type: String,
        default: ''
    },
    
    // Attachments
    attachments: [{
        filename: {
            type: String,
            required: true
        },
        contentType: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        },
        // Cloudinary URL for the attachment
        url: {
            type: String,
            required: true
        },
        // Cloudinary public ID for deletion
        publicId: {
            type: String,
            required: true
        }
    }],
    
    // Email metadata
    headers: {
        messageId: String,
        inReplyTo: String,
        references: String
    },
    
    // When email was received
    receivedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    
    // Read status
    isRead: {
        type: Boolean,
        default: false
    },
    
    // Spam score (for future implementation)
    spamScore: {
        type: Number,
        default: 0
    },
    
    // User plan at time of receipt (for audit purposes)
    userPlan: {
        type: String,
        enum: ['Anonymous', 'Free', 'Standard', 'Premium'],
        required: true
    }
}, {
    timestamps: true
});

// Indexes for faster queries
receivedEmailSchema.index({ tempEmailId: 1, receivedAt: -1 });
receivedEmailSchema.index({ to: 1, receivedAt: -1 });
receivedEmailSchema.index({ isRead: 1 });

// Pre-save hook to ensure attachment sizes don't exceed plan limits
receivedEmailSchema.pre('save', function(next) {
    if (this.attachments && this.attachments.length > 0) {
        const totalSize = this.attachments.reduce((sum, att) => sum + att.size, 0);
        const maxSizes = {
            'Anonymous': 0,      // No attachments
            'Free': 0,           // No attachments
            'Standard': 1024 * 1024,      // 1 MB
            'Premium': 10 * 1024 * 1024   // 10 MB
        };
        
        const maxSize = maxSizes[this.userPlan] || 0;
        
        if (totalSize > maxSize) {
            return next(new Error(`Attachments exceed plan limit of ${maxSize / (1024 * 1024)} MB`));
        }
    }
    next();
});

const ReceivedEmail = mongoose.model('ReceivedEmail', receivedEmailSchema);
export default ReceivedEmail;
