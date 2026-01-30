import axios from 'axios';

async function testLoginEndpoint() {
    try {
        console.log('🌐 Testing admin login endpoint...\n');

        const response = await axios.post('http://localhost:8080/admin/login', {
            email: 'admin@demo.com',
            password: 'admin123'
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            validateStatus: () => true // Don't throw on any status
        });

        console.log('📊 Response Status:', response.status);
        console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));

        if (response.status === 200) {
            console.log('\n✅✅✅ LOGIN SUCCESSFUL ✅✅✅');
            if (response.data.token) {
                console.log(`✅ Token received: ${response.data.token.substring(0, 20)}...`);
            }
            if (response.data.user) {
                console.log(`✅ User: ${response.data.user.name} (${response.data.user.email})`);
                console.log(`✅ Role: ${response.data.user.role}`);
            }
        } else {
            console.log(`\n❌ Login failed with status: ${response.status}`);
            console.log('Response:', response.data);
        }

    } catch (error) {
        console.error('❌ Request error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('⚠️  Server is not running on http://localhost:8080');
            console.error('Run: npm start');
        }
    }
}

testLoginEndpoint();
