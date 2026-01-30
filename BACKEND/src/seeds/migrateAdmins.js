import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AuthModel from '../models/AuthModel.js';
import AdminModel from '../models/AdminModel.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

async function migrateAdmins() {
    try {
        console.log('\n🔄 Starting admin migration...\n');

        // Find all users with admin role
        const adminUsers = await AuthModel.find({ role: 'admin' });
        
        if (adminUsers.length === 0) {
            console.log('ℹ️  No admin users found to migrate');
            return;
        }

        console.log(`📋 Found ${adminUsers.length} admin user(s) to migrate\n`);

        let migratedCount = 0;

        for (const adminUser of adminUsers) {
            try {
                // Check if admin already exists in AdminModel
                const existingAdmin = await AdminModel.findOne({ email: adminUser.email });
                
                if (existingAdmin) {
                    console.log(`⏭️  Admin already exists: ${adminUser.email}`);
                    continue;
                }

                // Create admin in AdminModel
                const newAdmin = await AdminModel.create({
                    name: adminUser.name,
                    email: adminUser.email,
                    password: adminUser.password,
                    profileImageUrl: adminUser.profileImageUrl,
                    phone: adminUser.phone,
                    location: adminUser.location,
                    role: 'super_admin', // Make migrated admins super admins
                    permissions: [
                        'manage_users',
                        'manage_subscriptions',
                        'manage_packages',
                        'view_analytics',
                        'manage_admins',
                        'view_payments',
                        'manage_domains',
                        'manage_contact_submissions'
                    ],
                    status: 'active',
                    createdAt: adminUser.createdAt
                });

                console.log(`✅ Migrated: ${adminUser.email} → Admin ID: ${newAdmin._id}`);
                migratedCount++;

                // Update the original user to remove admin role
                await AuthModel.findByIdAndUpdate(adminUser._id, { role: 'user' });
                console.log(`   Updated original user role to 'user'\n`);

            } catch (error) {
                console.error(`❌ Error migrating ${adminUser.email}:`, error.message);
            }
        }

        console.log(`\n✅ Migration completed!`);
        console.log(`   Total migrated: ${migratedCount}/${adminUsers.length}\n`);

    } catch (error) {
        console.error('❌ Migration error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 MongoDB connection closed');
        process.exit(0);
    }
}

// Run migration
migrateAdmins();
