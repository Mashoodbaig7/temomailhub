import mongoose from 'mongoose';

const userSubscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
    currentPlan: {
        type: String,
        enum: ['Free', 'Standard', 'Premium'],
        default: 'Free'
    },
    accountStatus: {
        type: String,
        enum: ['Active', 'Inactive', 'Pending', 'Suspended'],
        default: 'Active'
    },
    // Plan limits and usage
    emailsGeneratedToday: { type: Number, default: 0 },
    lastEmailResetDate: { type: Date, default: Date.now },
    totalEmailsGenerated: { type: Number, default: 0 },
    inboxStorageUsed: { type: Number, default: 0 },

    // Domain usage tracking
    domainsAddedThisMonth: { type: Number, default: 0 },
    lastDomainResetDate: { type: Date, default: Date.now },
    customEmailsCreatedThisMonth: { type: Number, default: 0 },
    lastCustomEmailResetDate: { type: Date, default: Date.now },

    // Subscription dates
    subscriptionStartDate: { type: Date, default: Date.now },
    subscriptionEndDate: { type: Date },
    autoRenew: { type: Boolean, default: false },

    // Payment info
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Pending', 'Failed', 'Cancelled', 'Free'],
        default: 'Free'
    },
    paymentMethod: {
        type: String,
        enum: ['Stripe', 'PayPal', 'N/A'],
        default: 'N/A'
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'yearly'],
        default: 'monthly'
    },

    // Plan features based on current plan
    planFeatures: {
        emailLimit: { type: Number, default: 5 }, // per hour for Free
        emailExpiry: { type: Number, default: 10 }, // in minutes
        inboxStorage: { type: Number, default: 0 }, // number of emails
        domainsPerMonth: { type: Number, default: 0 }, // Custom domains per month
        customEmailsPerMonth: { type: Number, default: 0 }, // Custom emails per month (combined across all domains)
        customEmailExpiry: { type: Number, default: 0 }, // Custom email expiry in minutes
        attachmentSupport: { type: Boolean, default: false },
        attachmentSize: { type: Number, default: 0 }, // in MB
        customDomain: { type: Boolean, default: false },
        adFree: { type: Boolean, default: false },
        prioritySupport: { type: Boolean, default: false },
        advancedSpamFilter: { type: Boolean, default: false }
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update planFeatures based on currentPlan before saving
userSubscriptionSchema.pre('save', function (next) {
    const planConfigs = {
        'Free': {
            emailLimit: 5,
            emailExpiry: 10, // 10 minutes
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
            emailLimit: 10, // Random emails per hour
            emailExpiry: 720, // 12 hours
            inboxStorage: 20,
            domainsPerMonth: 10,
            customEmailsPerMonth: 40, // Combined across all domains
            customEmailExpiry: 720, // 12 hours
            attachmentSupport: true,
            attachmentSize: 1,
            customDomain: true,
            adFree: true,
            prioritySupport: true,
            advancedSpamFilter: false
        },
        'Premium': {
            emailLimit: 15, // Random emails per hour
            emailExpiry: 1440, // 24 hours
            inboxStorage: 100,
            domainsPerMonth: 40,
            customEmailsPerMonth: 100, // Combined across all domains
            customEmailExpiry: 1440, // 24 hours
            attachmentSupport: true,
            attachmentSize: 10,
            customDomain: true,
            adFree: true,
            prioritySupport: true,
            advancedSpamFilter: true
        }
    };

    if (this.isModified('currentPlan')) {
        this.planFeatures = planConfigs[this.currentPlan] || planConfigs['Free'];
        this.updatedAt = Date.now();
    }

    next();
});

const UserSubscription = mongoose.model('UserSubscription', userSubscriptionSchema);
export default UserSubscription;
