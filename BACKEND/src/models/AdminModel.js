import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImageUrl: { type: String, required: false },
    phone: { type: String, required: false },
    location: { type: String, required: false },
    role: { type: String, enum: ['super_admin', 'admin'], default: 'admin' }, // Admin role hierarchy
    permissions: [{
        type: String,
        enum: [
            'manage_users',
            'manage_subscriptions',
            'manage_packages',
            'view_analytics',
            'manage_admins',
            'view_payments',
            'manage_domains',
            'manage_contact_submissions'
        ]
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date }, // For lockout after failed login attempts
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, // Which admin created this admin
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// IMPORTANT: Prevent accidental deletion of admin accounts
// Admins should be suspended/deactivated instead of deleted
adminSchema.pre('findByIdAndDelete', function (next) {
    throw new Error('❌ Admin accounts cannot be deleted. Use suspend or deactivate instead.');
});

adminSchema.pre('deleteOne', function (next) {
    throw new Error('❌ Admin accounts cannot be deleted. Use suspend or deactivate instead.');
});

adminSchema.pre('deleteMany', function (next) {
    throw new Error('❌ Admin accounts cannot be deleted. Use suspend or deactivate instead.');
});

// Update timestamps
adminSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const AdminModel = mongoose.model("Admin", adminSchema);
export default AdminModel;
