/**
 * Test Script: Admin Login Flow (Final Test)
 * This script tests the complete admin login flow with proper email normalization
 */

import axios from 'axios';

const API_URL = 'http://localhost:8080/admin/login';

async function testAdminLogin() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🧪 ADMIN LOGIN TEST - Final Verification');
    console.log('═══════════════════════════════════════════════════════════\n');

    const testCases = [
        {
            name: 'Test 1: Lowercase Email',
            email: 'admin@demo.com',
            password: 'admin123',
            shouldPass: true
        },
        {
            name: 'Test 2: Uppercase Email',
            email: 'ADMIN@DEMO.COM',
            password: 'admin123',
            shouldPass: true
        },
        {
            name: 'Test 3: Mixed Case Email',
            email: 'Admin@Demo.Com',
            password: 'admin123',
            shouldPass: true
        },
        {
            name: 'Test 4: Wrong Password',
            email: 'admin@demo.com',
            password: 'wrongpassword',
            shouldPass: false
        }
    ];

    for (const testCase of testCases) {
        console.log(`\n${testCase.name}`);
        console.log('─'.repeat(50));
        
        try {
            const response = await axios.post(API_URL, {
                email: testCase.email,
                password: testCase.password
            });

            console.log('✅ Status:', response.status);
            console.log('📧 Email:', response.data.user.email);
            console.log('👤 Name:', response.data.user.name);
            console.log('🎭 Role:', response.data.user.role);
            console.log('🔑 Token:', response.data.token ? '✓ Received' : '✗ Missing');
            console.log('📋 Permissions:', response.data.user.permissions.length);

            if (!testCase.shouldPass) {
                console.log('⚠️ WARNING: Test should have failed but passed!');
            } else {
                console.log('✅ Test passed as expected');
            }
        } catch (error) {
            const status = error.response?.status;
            const message = error.response?.data?.message;

            if (testCase.shouldPass) {
                console.log('❌ Test FAILED unexpectedly!');
                console.log(`   Status: ${status}`);
                console.log(`   Message: ${message}`);
            } else {
                console.log('✅ Test failed as expected');
                console.log(`   Status: ${status}`);
                console.log(`   Message: ${message}`);
            }
        }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ Admin Login Testing Complete');
    console.log('═══════════════════════════════════════════════════════════');
}

testAdminLogin().catch(error => {
    console.error('❌ Test error:', error.message);
    process.exit(1);
});
