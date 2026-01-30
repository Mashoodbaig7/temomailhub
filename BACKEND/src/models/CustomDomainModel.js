import mongoose from 'mongoose';

/**
 * CustomDomain Schema
 * Stores user's custom domains configured for email routing via Cloudflare
 */
const customDomainSchema = new mongoose.Schema({
    // Reference to the user who owns this domain
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Domain name (e.g., "mycustomdomain.com")
    domainName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                // Basic domain validation regex
                return /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/.test(v);
            },
            message: props => `${props.value} is not a valid domain name!`
        }
    },
    
    // Domain status (Pending: awaiting DNS update, Active: fully configured)
    status: {
        type: String,
        enum: ['Pending', 'Active', 'Failed', 'Suspended'],
        default: 'Pending',
        index: true
    },
    
    // Cloudflare Zone ID (critical for all API operations)
    cloudflareZoneId: {
        type: String,
        required: true,
        index: true
    },
    
    // Nameservers assigned by Cloudflare for DNS delegation
    nameservers: [{
        type: String,
        trim: true
    }],
    
    // Additional metadata
    cloudflareStatus: {
        type: String, // 'pending', 'active', 'moved', 'deleted'
        default: 'pending'
    },
    
    // Email routing configuration status
    emailRoutingEnabled: {
        type: Boolean,
        default: false
    },
    
    // Catch-all rule ID (for managing/updating the rule later)
    catchAllRuleId: {
        type: String,
        default: null
    },
    
    // Worker name associated with this domain's email routing
    workerName: {
        type: String,
        default: 'email-handler'
    },
    
    // Verification attempts tracking
    verificationAttempts: {
        type: Number,
        default: 0
    },
    
    lastVerificationAttempt: {
        type: Date,
        default: null
    },
    
    // When the domain was verified/activated
    activatedAt: {
        type: Date,
        default: null
    },
    
    // Error logs for debugging
    lastError: {
        type: String,
        default: null
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Indexes for performance
customDomainSchema.index({ userId: 1, status: 1 });
customDomainSchema.index({ domainName: 1 }, { unique: true });

// Instance method to check if domain is ready for email routing
customDomainSchema.methods.isActive = function() {
    return this.status === 'Active' && this.emailRoutingEnabled === true;
};

// Static method to find domains by user
customDomainSchema.statics.findByUserId = function(userId) {
    return this.find({ userId }).sort({ createdAt: -1 });
};

// Static method to find active domains
customDomainSchema.statics.findActiveDomains = function() {
    return this.find({ status: 'Active', emailRoutingEnabled: true });
};

const CustomDomain = mongoose.model('CustomDomain', customDomainSchema);

export default CustomDomain;
