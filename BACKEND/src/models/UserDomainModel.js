import mongoose from 'mongoose';

const userDomainSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    domainName: { 
        type: String, 
        required: true,
        trim: true,
        lowercase: true
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    verificationToken: { 
        type: String 
    },
    // MX Record Verification
    mxRecords: [{
        exchange: String,
        priority: Number
    }],
    requiredMxRecord: {
        type: String,
        default: function() {
            return `mx${Math.floor(Math.random() * 10) + 1}.tempmailhub.com`;
        }
    },
    mxVerificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'failed'],
        default: 'pending'
    },
    // TXT Record Verification (Backup option)
    txtVerificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'failed'],
        default: 'pending'
    },
    lastVerificationAttempt: {
        type: Date
    },
    verificationAttempts: {
        type: Number,
        default: 0
    },
    lastVerificationError: {
        type: String,
        default: null
    },
    verifiedAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Pending'],
        default: 'Pending'
    },
    expiresAt: {
        type: Date,
        default: function() {
            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        }
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Compound index to ensure a user can't add the same domain twice
userDomainSchema.index({ userId: 1, domainName: 1 }, { unique: true });

const UserDomain = mongoose.model('UserDomain', userDomainSchema);
export default UserDomain;
