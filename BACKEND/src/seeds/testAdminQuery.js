import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AdminModel from '../models/AdminModel.js';

dotenv.config();

async function testAdminQuery() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URL);
        console.log('✅ Connected\n');

        const testEmail = 'admin@demo.com';
        console.log(`🔍 Testing query for: "${testEmail}"`);
        
        // Test 1: Direct query
        console.log('\n📋 Test 1: Direct query without toLowerCase');
        const result1 = await AdminModel.findOne({ email: testEmail });
        console.log(`Result: ${result1 ? '✅ Found' : '❌ null'}`);
        if (result1) {
            console.log(`  Name: ${result1.name}`);
            console.log(`  Email: ${result1.email}`);
        }

        // Test 2: With toLowerCase
        console.log('\n📋 Test 2: Query with toLowerCase');
        const result2 = await AdminModel.findOne({ email: testEmail.toLowerCase() });
        console.log(`Result: ${result2 ? '✅ Found' : '❌ null'}`);
        if (result2) {
            console.log(`  Name: ${result2.name}`);
            console.log(`  Email: ${result2.email}`);
        }

        // Test 3: Case-insensitive regex
        console.log('\n📋 Test 3: Regex case-insensitive query');
        const result3 = await AdminModel.findOne({ email: new RegExp(`^${testEmail}$`, 'i') });
        console.log(`Result: ${result3 ? '✅ Found' : '❌ null'}`);
        if (result3) {
            console.log(`  Name: ${result3.name}`);
            console.log(`  Email: ${result3.email}`);
        }

        // Test 4: List all admins to see what's in DB
        console.log('\n📋 Test 4: All admins in database');
        const allAdmins = await AdminModel.find({});
        console.log(`Total: ${allAdmins.length}`);
        allAdmins.forEach(admin => {
            console.log(`  - ${admin.name} (${admin.email}) [${admin.email.toLowerCase()}]`);
        });

        // Test 5: Check collection info
        console.log('\n📋 Test 5: Collection info');
        const count = await AdminModel.countDocuments();
        console.log(`Document count: ${count}`);
        const indexes = await AdminModel.collection.getIndexes();
        console.log(`Indexes:`, indexes);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

testAdminQuery();
