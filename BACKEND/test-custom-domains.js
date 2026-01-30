// ============================================
// CUSTOM DOMAIN FEATURE - TEST SCRIPT
// ============================================
// Run this script to test the custom domain functionality

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
const TEST_DOMAIN = 'mytestdomain123.com'; // Change this to a domain you own for real testing

// Replace with your actual JWT token from login
const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    log(title, 'blue');
    console.log('='.repeat(60) + '\n');
}

// Test 1: Add Domain
async function testAddDomain() {
    logSection('TEST 1: Add Custom Domain');
    
    try {
        const response = await api.post('/custom-domains/add', {
            domainName: TEST_DOMAIN
        });
        
        log('✓ Domain added successfully!', 'green');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        // Extract domain ID for next tests
        const domainId = response.data.data.domainId;
        const nameservers = response.data.data.nameservers;
        
        log('\n📋 Next Steps:', 'yellow');
        log('1. Go to your domain registrar (GoDaddy, Namecheap, etc.)');
        log('2. Update nameservers to:');
        nameservers.forEach((ns, idx) => {
            log(`   ${idx + 1}. ${ns}`, 'yellow');
        });
        log('3. Wait 15-30 minutes for DNS propagation');
        log(`4. Run: node test-custom-domains.js verify ${domainId}`);
        
        return domainId;
        
    } catch (error) {
        log('✗ Failed to add domain', 'red');
        console.error('Error:', error.response?.data || error.message);
        return null;
    }
}

// Test 2: Verify Domain
async function testVerifyDomain(domainId) {
    logSection('TEST 2: Verify Domain');
    
    if (!domainId) {
        log('Error: Domain ID is required', 'red');
        log('Usage: node test-custom-domains.js verify <domainId>', 'yellow');
        return;
    }
    
    try {
        const response = await api.post(`/custom-domains/verify/${domainId}`);
        
        if (response.data.success) {
            log('✓ Domain verified and configured successfully!', 'green');
            console.log('Response:', JSON.stringify(response.data, null, 2));
        } else {
            log('⏳ Domain verification pending...', 'yellow');
            console.log('Message:', response.data.message);
            console.log('Details:', JSON.stringify(response.data.data, null, 2));
            
            if (response.data.instructions) {
                log('\nInstructions:', 'blue');
                response.data.instructions.forEach(instruction => {
                    console.log(instruction);
                });
            }
        }
        
    } catch (error) {
        log('✗ Domain verification failed', 'red');
        console.error('Error:', error.response?.data || error.message);
    }
}

// Test 3: List Domains
async function testListDomains() {
    logSection('TEST 3: List All Domains');
    
    try {
        const response = await api.get('/custom-domains');
        
        log(`✓ Found ${response.data.count} domain(s)`, 'green');
        
        if (response.data.count > 0) {
            response.data.data.forEach((domain, idx) => {
                console.log(`\nDomain ${idx + 1}:`);
                console.log(`  Name: ${domain.domainName}`);
                console.log(`  Status: ${domain.status}`);
                console.log(`  Email Routing: ${domain.emailRoutingEnabled ? 'Enabled' : 'Disabled'}`);
                console.log(`  Created: ${new Date(domain.createdAt).toLocaleString()}`);
                if (domain.activatedAt) {
                    console.log(`  Activated: ${new Date(domain.activatedAt).toLocaleString()}`);
                }
            });
        } else {
            log('No domains found. Add one using: node test-custom-domains.js add', 'yellow');
        }
        
    } catch (error) {
        log('✗ Failed to list domains', 'red');
        console.error('Error:', error.response?.data || error.message);
    }
}

// Test 4: Delete Domain
async function testDeleteDomain(domainId) {
    logSection('TEST 4: Delete Domain');
    
    if (!domainId) {
        log('Error: Domain ID is required', 'red');
        log('Usage: node test-custom-domains.js delete <domainId>', 'yellow');
        return;
    }
    
    try {
        const response = await api.delete(`/custom-domains/${domainId}`);
        
        log('✓ Domain deleted successfully!', 'green');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        log('✗ Failed to delete domain', 'red');
        console.error('Error:', error.response?.data || error.message);
    }
}

// Test 5: Check Cloudflare Connection
async function testCloudflareConnection() {
    logSection('TEST 5: Verify Cloudflare Configuration');
    
    // Check if environment variables are set
    log('Checking environment variables...', 'blue');
    
    const requiredVars = [
        'CLOUDFLARE_API_KEY',
        'CLOUDFLARE_ACCOUNT_ID'
    ];
    
    const missing = [];
    
    // Note: This is a client-side test, so we can't actually check env vars
    // In production, you'd have a server endpoint to verify this
    log('⚠️  Make sure these are set in your .env file:', 'yellow');
    requiredVars.forEach(varName => {
        log(`  - ${varName}`, 'yellow');
    });
    
    log('\nTo verify your Cloudflare connection:', 'blue');
    log('1. Check your .env file has the required variables');
    log('2. Try adding a test domain');
    log('3. Check server logs for any Cloudflare API errors');
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const param = args[1];
    
    // Check JWT token
    if (JWT_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
        log('⚠️  ERROR: Please update JWT_TOKEN in this script', 'red');
        log('1. Login to your application', 'yellow');
        log('2. Copy your JWT token', 'yellow');
        log('3. Replace JWT_TOKEN variable in this script', 'yellow');
        return;
    }
    
    log('Custom Domain Feature - Test Suite', 'blue');
    log('Make sure your server is running on http://localhost:5000\n');
    
    switch (command) {
        case 'add':
            await testAddDomain();
            break;
            
        case 'verify':
            await testVerifyDomain(param);
            break;
            
        case 'list':
            await testListDomains();
            break;
            
        case 'delete':
            await testDeleteDomain(param);
            break;
            
        case 'cloudflare':
            await testCloudflareConnection();
            break;
            
        case 'all':
            await testCloudflareConnection();
            const domainId = await testAddDomain();
            await new Promise(resolve => setTimeout(resolve, 2000));
            await testListDomains();
            if (domainId) {
                log('\n⏳ Waiting for DNS propagation before verification test...', 'yellow');
                log('You should manually update nameservers and run: node test-custom-domains.js verify ' + domainId, 'yellow');
            }
            break;
            
        default:
            log('Usage:', 'blue');
            log('  node test-custom-domains.js <command> [params]\n');
            log('Commands:');
            log('  add              - Add a new custom domain');
            log('  verify <id>      - Verify domain and setup email routing');
            log('  list             - List all your domains');
            log('  delete <id>      - Delete a domain');
            log('  cloudflare       - Check Cloudflare configuration');
            log('  all              - Run all tests\n');
            log('Examples:');
            log('  node test-custom-domains.js add', 'yellow');
            log('  node test-custom-domains.js verify 67abc123...', 'yellow');
            log('  node test-custom-domains.js list', 'yellow');
    }
}

main().catch(error => {
    log('Unexpected error:', 'red');
    console.error(error);
});
