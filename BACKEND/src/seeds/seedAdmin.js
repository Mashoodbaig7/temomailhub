import AdminModel from '../models/AdminModel.js';
import dbConnect from '../config/db.js';
import bcrypt from 'bcrypt';

const seedAdmin = async () => {
    try {
        await dbConnect();
        
        console.log('🔄 Seeding admin user...');

        // Check if admin already exists
        const existingAdmin = await AdminModel.findOne({ email: 'admin@demo.com' });
        
        if (existingAdmin) {
            console.log('✅ Admin user already exists. Updating password...');
            
            // Hash the password
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            // Update the admin user
            await AdminModel.findOneAndUpdate(
                { email: 'admin@demo.com' },
                {
                    password: hashedPassword,
                    role: 'super_admin',
                    name: 'Admin',
                    status: 'active'
                },
                { new: true }
            );
            
            console.log('✅ Admin password updated successfully');
            console.log('📧 Email: admin@demo.com');
            console.log('🔑 Password: admin123');
            console.log('👑 Role: super_admin');
        } else {
            console.log('➕ Creating new admin user...');
            
            // Hash the password
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            // Create new admin user
            const adminUser = new AdminModel({
                name: 'Admin',
                email: 'admin@demo.com',
                password: hashedPassword,
                role: 'super_admin',
                status: 'active',
                permissions: [
                    'manage_users',
                    'manage_subscriptions',
                    'manage_packages',
                    'view_analytics',
                    'manage_admins',
                    'view_payments',
                    'manage_domains',
                    'manage_contact_submissions'
                ]
            });
            
            await adminUser.save();
            
            console.log('✅ Admin user created successfully');
            console.log('📧 Email: admin@demo.com');
            console.log('🔑 Password: admin123');
            console.log('👑 Role: super_admin');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed Admin Error:', error.message);
        process.exit(1);
    }
};

seedAdmin();
