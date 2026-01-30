import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AdminModel from '../models/AdminModel.js';

dotenv.config();

async function checkAdminDatabase() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URL);
        console.log('✅ Connected to MongoDB\n');

        console.log('📊 Checking AdminModel collection...');
        
        // Count total admins
        const totalAdmins = await AdminModel.countDocuments();
        console.log(`📈 Total admins in database: ${totalAdmins}\n`);

        if (totalAdmins === 0) {
            console.log('⚠️  No admins found in database!');
            console.log('🔧 Run: node src/seeds/seedAdmin.js\n');
        } else {
            // List all admins
            console.log('👥 Admins in database:');
            const admins = await AdminModel.find({}, { name: 1, email: 1, role: 1, status: 1 });
            admins.forEach((admin, index) => {
                console.log(`${index + 1}. ${admin.name} (${admin.email}) - Role: ${admin.role}, Status: ${admin.status}`);
            });
            console.log();

            // Check for admin@demo.com specifically
            console.log('🔍 Looking for admin@demo.com...');
            const demoAdmin = await AdminModel.findOne({ email: 'admin@demo.com' });
            
            if (demoAdmin) {
                console.log('✅ Found admin@demo.com');
                console.log(`   Name: ${demoAdmin.name}`);
                console.log(`   Email: ${demoAdmin.email}`);
                console.log(`   Role: ${demoAdmin.role}`);
                console.log(`   Status: ${demoAdmin.status}`);
                console.log(`   Password Hash: ${demoAdmin.password ? '✅ Set' : '❌ Missing'}`);
                console.log(`   ID: ${demoAdmin._id}`);
            } else {
                console.log('❌ admin@demo.com not found');
                console.log('🔧 Run: node src/seeds/seedAdmin.js');
            }
        }

        console.log('\n🔧 Collections in database:');
        const collections = await mongoose.connection.db.listCollections().toArray();
        collections.forEach(col => {
            if (col.name.includes('admin') || col.name.includes('user')) {
                console.log(`  - ${col.name}`);
            }
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

checkAdminDatabase();
