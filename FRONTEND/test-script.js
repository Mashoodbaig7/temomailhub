// Test Script for Rate Limiting & Domain Verification
// Run this in browser console on Home page

console.log('🧪 TempMailHub Test Suite\n');

// Test 1: Check Session ID
console.log('1️⃣ Checking Session ID...');
const sessionId = localStorage.getItem('tempmail_session_id');
console.log(sessionId ? `✅ Session ID: ${sessionId}` : '❌ No session ID found');

// Test 2: Check Auth Status
console.log('\n2️⃣ Checking Authentication...');
const token = localStorage.getItem('authToken');
const user = localStorage.getItem('user');
console.log(token ? `✅ Logged in as: ${JSON.parse(user).name}` : '⚠️ Not logged in (Anonymous)');

// Test 3: Simulate Email Generations
console.log('\n3️⃣ Testing Rate Limits...');
console.log('Click the "New Email" button multiple times to test rate limiting');
console.log('Expected behavior:');
console.log('  - Anonymous: 2 emails → Create Account popup');
console.log('  - Free: 4 emails/hour → Timer or Upgrade popup');
console.log('  - Standard: 8 emails/hour → Timer or Upgrade popup');
console.log('  - Premium: Unlimited');

// Test 4: Check API Endpoints
console.log('\n4️⃣ API Endpoint Check...');
fetch('http://localhost:8080/emails/rate-limit/check', {
  headers: {
    'x-session-id': sessionId || 'test'
  }
})
.then(res => res.json())
.then(data => {
  console.log('✅ Rate Limit API Response:', data);
  console.log(`   Allowed: ${data.data.allowed}`);
  console.log(`   Remaining: ${data.data.remaining ?? 'unlimited'}`);
})
.catch(err => console.log('❌ Rate Limit API Error:', err.message));

// Test 5: Domain Access Check
console.log('\n5️⃣ Domain Access Check...');
console.log('Navigate to /domains to test access control');
console.log('Expected:');
console.log('  - Not logged in → Upgrade modal');
console.log('  - Free/Standard → Upgrade modal');
console.log('  - Premium → Full access');

// Utility Functions
window.testUtils = {
  // Clear session (simulates new anonymous user)
  clearSession: () => {
    localStorage.removeItem('tempmail_session_id');
    console.log('✅ Session cleared. Reload page to get new session.');
  },
  
  // Check rate limit
  checkLimit: async () => {
    const sid = localStorage.getItem('tempmail_session_id');
    const res = await fetch('http://localhost:8080/emails/rate-limit/check', {
      headers: { 'x-session-id': sid }
    });
    const data = await res.json();
    console.log('Rate Limit Status:', data.data);
  },
  
  // Get usage stats
  getStats: async () => {
    const sid = localStorage.getItem('tempmail_session_id');
    const res = await fetch('http://localhost:8080/emails/rate-limit/stats', {
      headers: { 'x-session-id': sid }
    });
    const data = await res.json();
    console.log('Usage Stats:', data.data);
  },

  // Test domain verification
  testDomain: async (domain) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('❌ Must be logged in to test domains');
      return;
    }
    
    try {
      const res = await fetch('http://localhost:8080/domains/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ domainName: domain })
      });
      const data = await res.json();
      console.log('Domain Add Response:', data);
    } catch (err) {
      console.log('❌ Domain Add Error:', err.message);
    }
  }
};

console.log('\n📝 Available Test Commands:');
console.log('  testUtils.clearSession() - Clear session and start fresh');
console.log('  testUtils.checkLimit() - Check current rate limit status');
console.log('  testUtils.getStats() - Get usage statistics');
console.log('  testUtils.testDomain("example.com") - Test domain addition');

console.log('\n✅ Test suite loaded! Start testing rate limits now.\n');
