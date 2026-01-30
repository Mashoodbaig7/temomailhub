import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import AdminModel from '../models/AdminModel.js';
import { findByEmail } from '../modules/admin/db/index.js';

dotenv.config();

async function testLoginFlow() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URL);
        console.log('✅ Connected\n');

        const testEmail = 'admin@demo.com';
        const testPassword = 'admin123';

        console.log(`🔐 Simulating login flow for: ${testEmail}\n`);

        // Step 1: Test findByEmail function
        console.log('📋 Step 1: Testing findByEmail()');
        const admin = await findByEmail(testEmail);
        console.log(`Result: ${admin ? '✅ Found' : '❌ null'}`);
        
        if (!admin) {
            console.log('❌ LOGIN FAILED: Admin not found\n');
            process.exit(1);
        }

        console.log(`✅ Admin found: ${admin.name} (${admin.email})\n`);

        // Step 2: Check admin status
        console.log('📋 Step 2: Checking admin status');
        console.log(`Status: ${admin.status}`);
        
        if (admin.status !== 'active') {
            console.log(`❌ LOGIN FAILED: Account is ${admin.status}\n`);
            process.exit(1);
        }

        console.log('✅ Status is active\n');

        // Step 3: Verify password
        console.log('📋 Step 3: Verifying password');
        const isPasswordValid = await bcrypt.compare(testPassword, admin.password);
        console.log(`Password valid: ${isPasswordValid ? '✅ Yes' : '❌ No'}`);

        if (!isPasswordValid) {
            console.log('❌ LOGIN FAILED: Invalid password\n');
            process.exit(1);
        }

        console.log('✅ Password is correct\n');

        // Step 4: Would generate token
        console.log('📋 Step 4: Token generation would succeed');
        console.log(`✅ Would generate JWT with userId: ${admin._id}`);
        console.log(`✅ Would return: role=${admin.role}, status=${admin.status}\n`);

        console.log('✅✅✅ LOGIN FLOW SUCCESSFUL ✅✅✅');
        console.log('\nExpected login response:');
        console.log(JSON.stringify({
            message: 'Login successful',
            user: {
                userId: admin._id.toString(),
                name: admin.name,
                email: admin.email,
                role: admin.role,
                status: admin.status,
                permissions: admin.permissions
            }
        }, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

testLoginFlow();
