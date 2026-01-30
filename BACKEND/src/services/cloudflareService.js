import axios from 'axios';
import { ENV } from '../constants/index.js';

/**
 * Cloudflare API Service
 * Handles all interactions with Cloudflare API for domain and email routing management
 * 
 * Required Environment Variables:
 * - CLOUDFLARE_API_KEY: Global API Key or API Token
 * - CLOUDFLARE_EMAIL: Account email (if using Global API Key)
 * - CLOUDFLARE_ACCOUNT_ID: Your Cloudflare Account ID
 */

class CloudflareService {
    constructor() {
        this.apiKey = ENV.CLOUDFLARE_API_KEY;
        this.email = ENV.CLOUDFLARE_EMAIL;
        this.accountId = ENV.CLOUDFLARE_ACCOUNT_ID;
        this.baseURL = 'https://api.cloudflare.com/client/v4';
        
        // Configure axios instance
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: this.getHeaders(),
            timeout: 30000 // 30 seconds
        });
    }
    
    /**
     * Get authentication headers for Cloudflare API
     */
    getHeaders() {
        // Support both API Token and Global API Key authentication methods
        if (this.apiKey && this.apiKey.length > 40) {
            // API Token (recommended)
            return {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            };
        } else {
            // Global API Key (legacy)
            return {
                'X-Auth-Email': this.email,
                'X-Auth-Key': this.apiKey,
                'Content-Type': 'application/json'
            };
        }
    }
    
    /**
     * STEP 1: Create a new zone (domain) in Cloudflare
     * API Endpoint: POST /zones
     * 
     * @param {string} domainName - The domain to add (e.g., "example.com")
     * @returns {Object} { id, name, name_servers, status }
     */
    async createZone(domainName) {
        try {
            const response = await this.client.post('/zones', {
                name: domainName,
                account: {
                    id: this.accountId
                },
                jump_start: true // Auto-scan DNS records from existing setup
            });
            
            if (response.data.success) {
                const zone = response.data.result;
                return {
                    id: zone.id,
                    name: zone.name,
                    nameServers: zone.name_servers,
                    status: zone.status, // 'pending' initially
                    createdOn: zone.created_on
                };
            } else {
                throw new Error(response.data.errors?.[0]?.message || 'Failed to create zone');
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                const cfError = error.response.data.errors[0];
                
                // Handle "domain already exists" error (code 1061)
                if (cfError.code === 1061) {
                    console.log(`Domain ${domainName} already exists in Cloudflare, fetching existing zone...`);
                    try {
                        // Try to find the existing zone
                        const existingZone = await this.findZoneByName(domainName);
                        if (existingZone) {
                            console.log(`Found existing zone: ${existingZone.id}`);
                            return existingZone;
                        }
                    } catch (fetchError) {
                        console.error('Failed to fetch existing zone:', fetchError);
                    }
                }
                
                // Handle rate limit error (code 1105)
                if (cfError.code === 1105) {
                    console.log(`Domain ${domainName} hit rate limit, fetching existing zone...`);
                    try {
                        // Try to find the existing zone
                        const existingZone = await this.findZoneByName(domainName);
                        if (existingZone) {
                            console.log(`Found existing zone: ${existingZone.id}`);
                            return existingZone;
                        } else {
                            // Zone doesn't exist yet, but we can't create it due to rate limit
                            throw new Error(`Rate limit reached for adding domains. Please wait 3 hours before adding new domains. If you're trying to re-add an existing domain, please contact support.`);
                        }
                    } catch (fetchError) {
                        console.error('Failed to fetch existing zone:', fetchError);
                        throw new Error(`Rate limit reached. Please wait 3 hours before trying again.`);
                    }
                }
                
                throw new Error(`Cloudflare API Error: ${cfError.message} (Code: ${cfError.code})`);
            }
            throw error;
        }
    }
    
    /**
     * Find zone by domain name
     * API Endpoint: GET /zones?name=domain.com
     * 
     * @param {string} domainName - The domain to search for
     * @returns {Object} Zone details or null
     */
    async findZoneByName(domainName) {
        try {
            const response = await this.client.get('/zones', {
                params: {
                    name: domainName,
                    account: {
                        id: this.accountId
                    }
                }
            });
            
            if (response.data.success && response.data.result.length > 0) {
                const zone = response.data.result[0];
                return {
                    id: zone.id,
                    name: zone.name,
                    nameServers: zone.name_servers,
                    status: zone.status,
                    createdOn: zone.created_on
                };
            }
            return null;
        } catch (error) {
            console.error('Error finding zone:', error.message);
            return null;
        }
    }
    
    /**
     * STEP 2: Get zone details and status
     * API Endpoint: GET /zones/:zone_id
     * 
     * @param {string} zoneId - Cloudflare Zone ID
     * @returns {Object} Zone details including status
     */
    async getZoneStatus(zoneId) {
        try {
            const response = await this.client.get(`/zones/${zoneId}`);
            
            if (response.data.success) {
                const zone = response.data.result;
                return {
                    id: zone.id,
                    name: zone.name,
                    status: zone.status, // 'active', 'pending', 'moved', etc.
                    nameServers: zone.name_servers,
                    originalNameServers: zone.original_name_servers,
                    verificationKey: zone.verification_key
                };
            } else {
                throw new Error(response.data.errors?.[0]?.message || 'Failed to get zone status');
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                const cfError = error.response.data.errors[0];
                throw new Error(`Cloudflare API Error: ${cfError.message}`);
            }
            throw error;
        }
    }
    
    /**
     * STEP 3a: Enable Email Routing for a zone
     * API Endpoint: POST /zones/:zone_id/email/routing/enable
     * 
     * @param {string} zoneId - Cloudflare Zone ID
     * @returns {Object} Email routing configuration
     */
    async enableEmailRouting(zoneId) {
        try {
            const response = await this.client.post(`/zones/${zoneId}/email/routing/enable`);
            
            if (response.data.success) {
                return {
                    enabled: response.data.result.enabled,
                    tag: response.data.result.tag,
                    name: response.data.result.name,
                    status: response.data.result.status
                };
            } else {
                throw new Error(response.data.errors?.[0]?.message || 'Failed to enable email routing');
            }
        } catch (error) {
            // If email routing is already enabled, consider it a success
            if (error.response?.status === 400 && 
                error.response.data.errors?.[0]?.message?.includes('already enabled')) {
                return { enabled: true, status: 'already_enabled' };
            }
            
            if (error.response?.data?.errors) {
                const cfError = error.response.data.errors[0];
                throw new Error(`Email Routing Error: ${cfError.message}`);
            }
            throw error;
        }
    }
    
    /**
     * STEP 3b: Get Email Routing DNS records
     * API Endpoint: GET /zones/:zone_id/email/routing/dns
     * 
     * This endpoint returns the required MX and TXT records that Cloudflare
     * will automatically create when email routing is enabled
     * 
     * @param {string} zoneId - Cloudflare Zone ID
     * @returns {Array} DNS records
     */
    async getEmailRoutingDNS(zoneId) {
        try {
            const response = await this.client.get(`/zones/${zoneId}/email/routing/dns`);
            
            if (response.data.success) {
                return response.data.result;
            }
            return [];
        } catch (error) {
            console.warn('Could not fetch email routing DNS records:', error.message);
            return [];
        }
    }
    
    /**
     * STEP 3c: Configure catch-all email routing rule with Worker action
     * 
     * Cloudflare has TWO different catch-all configurations:
     * 1. Catch-all ADDRESS (configured via /email/routing/rules/catch_all) - This is what we need!
     * 2. Routing RULES (configured via /email/routing/rules) - This is more complex
     * 
     * We use the catch-all address endpoint which directly sets the worker action.
     * 
     * Strategy:
     * 1. Try to update the catch-all address configuration directly
     * 2. Use PUT to set worker action on the catch-all address
     * 
     * @param {string} zoneId - Cloudflare Zone ID
     * @param {string} workerName - Name of your email worker (default: 'email-handler')
     * @returns {Object} Configuration status
     */
    async createCatchAllRule(zoneId, workerName = 'email-handler') {
        try {
            console.log('========================================');
            console.log('AUTOMATIC CATCH-ALL ADDRESS CONFIGURATION');
            console.log('========================================');
            console.log(`Zone ID: ${zoneId}`);
            console.log(`Worker Name: ${workerName}`);
            
            // Use the catch-all address endpoint directly
            console.log('\n[Step 1] Configuring catch-all address with Worker action...');
            
            const catchAllPayload = {
                enabled: true,
                actions: [{
                    type: 'worker',
                    value: [workerName]
                }]
            };
            
            console.log('PUT payload:', JSON.stringify(catchAllPayload, null, 2));
            console.log(`Endpoint: PUT /zones/${zoneId}/email/routing/rules/catch_all`);
            
            // Try the catch-all address configuration endpoint
            const response = await this.client.put(
                `/zones/${zoneId}/email/routing/rules/catch_all`,
                catchAllPayload
            );
            
            if (response.data.success) {
                const result = response.data.result;
                console.log('\n✅ SUCCESS: Catch-all address configured with Worker!');
                console.log('Configuration:', JSON.stringify(result, null, 2));
                console.log('========================================\n');
                return {
                    id: result.tag || result.id || 'catch-all',
                    enabled: result.enabled,
                    actions: result.actions,
                    configured: true
                };
            } else {
                throw new Error(response.data.errors?.[0]?.message || 'Failed to configure catch-all');
            }
            
        } catch (error) {
            console.error('\n❌ CATCH-ALL CONFIGURATION FAILED');
            console.error('Error:', error.message);
            
            if (error.response?.data) {
                console.error('Cloudflare API Response:', JSON.stringify(error.response.data, null, 2));
                
                // If the catch-all address endpoint doesn't work, try the routing rules approach
                if (error.response.status === 404 || error.response.status === 405) {
                    console.log('\n⚠ Catch-all address endpoint not available');
                    console.log('Trying alternative approach with routing rules...\n');
                    
                    return await this.createCatchAllViaRoutingRules(zoneId, workerName);
                }
            }
            
            console.error('========================================\n');
            throw error;
        }
    }
    
    /**
     * FALLBACK: Create catch-all via routing rules if direct endpoint fails
     * 
     * @param {string} zoneId - Cloudflare Zone ID
     * @param {string} workerName - Worker name
     * @returns {Object} Rule details
     */
    async createCatchAllViaRoutingRules(zoneId, workerName) {
        try {
            console.log('========================================');
            console.log('FALLBACK: ROUTING RULES APPROACH');
            console.log('========================================');
            
            // STEP 1: Fetch all existing routing rules
            console.log('\n[Step 1] Fetching existing email routing rules...');
            const existingRules = await this.getEmailRoutingRules(zoneId);
            console.log(`✓ Found ${existingRules.length} existing rules`);
            
            // STEP 2: Check for existing worker catch-all rule
            const workerCatchAllRule = existingRules.find(rule => {
                const hasCatchAllMatcher = rule.matchers?.some(m => m.type === 'all');
                const hasWorkerAction = rule.actions?.some(a => a.type === 'worker');
                return hasCatchAllMatcher && hasWorkerAction;
            });
            
            if (workerCatchAllRule) {
                console.log('\n✅ Worker catch-all rule already exists!');
                console.log('========================================\n');
                return {
                    id: workerCatchAllRule.tag,
                    tag: workerCatchAllRule.tag,
                    enabled: workerCatchAllRule.enabled,
                    existing: true
                };
            }
            
            // STEP 3: Find and try to disable the default drop rule
            const defaultDropRule = existingRules.find(rule => {
                const hasCatchAllMatcher = rule.matchers?.some(m => m.type === 'all');
                const hasDropAction = rule.actions?.some(a => a.type === 'drop');
                return hasCatchAllMatcher && hasDropAction;
            });
            
            if (defaultDropRule && defaultDropRule.enabled) {
                console.log(`\n[Step 2] Disabling default drop rule (ID: ${defaultDropRule.tag})...`);
                try {
                    await this.client.patch(
                        `/zones/${zoneId}/email/routing/rules/${defaultDropRule.tag}`,
                        { enabled: false }
                    );
                    console.log('✓ Default drop rule disabled');
                } catch (disableError) {
                    console.log('⚠ Could not disable default drop rule:', disableError.message);
                }
            }
            
            // STEP 4: Create new worker-based catch-all rule
            console.log('\n[Step 3] Creating worker-based catch-all rule...');
            
            const rulePayload = {
                name: 'Worker-Catch-All',
                enabled: true,
                matchers: [{
                    type: 'all'
                }],
                actions: [{
                    type: 'worker',
                    value: [workerName]
                }]
            };
            
            console.log('POST payload:', JSON.stringify(rulePayload, null, 2));
            
            const response = await this.client.post(
                `/zones/${zoneId}/email/routing/rules`,
                rulePayload
            );
            
            if (response.data.success) {
                const rule = response.data.result;
                console.log('\n✅ SUCCESS: Worker catch-all rule created!');
                console.log('Rule details:', JSON.stringify(rule, null, 2));
                console.log('========================================\n');
                return {
                    id: rule.tag,
                    tag: rule.tag,
                    name: rule.name,
                    enabled: rule.enabled,
                    matchers: rule.matchers,
                    actions: rule.actions
                };
            } else {
                throw new Error(response.data.errors?.[0]?.message || 'Failed to create rule');
            }
            
        } catch (error) {
            console.error('\n❌ FALLBACK APPROACH FAILED');
            console.error('Error:', error.message);
            
            if (error.response?.data) {
                console.error('Cloudflare API Response:', JSON.stringify(error.response.data, null, 2));
            }
            
            console.error('========================================\n');
            throw error;
        }
    }
    
    /**
     * Get all email routing rules for a zone
     * API Endpoint: GET /zones/:zone_id}/email/routing/rules
     * 
     * @param {string} zoneId - Cloudflare Zone ID
     * @returns {Array} List of email routing rules
     */
    async getEmailRoutingRules(zoneId) {
        try {
            const response = await this.client.get(`/zones/${zoneId}/email/routing/rules`);
            
            if (response.data.success) {
                return response.data.result;
            }
            return [];
        } catch (error) {
            console.warn('Could not fetch email routing rules:', error.message);
            return [];
        }
    }
    
    /**
     * Enable/Update an email routing rule
     * API Endpoint: PUT /zones/:zone_id/email/routing/rules/:rule_id
     * 
     * @param {string} zoneId - Cloudflare Zone ID
     * @param {string} ruleId - Rule ID to enable
     * @returns {Object} Updated rule details
     */
    async enableEmailRoutingRule(zoneId, ruleId) {
        try {
            const response = await this.client.put(`/zones/${zoneId}/email/routing/rules/${ruleId}`, {
                enabled: true
            });
            
            if (response.data.success) {
                return response.data.result;
            } else {
                throw new Error(response.data.errors?.[0]?.message || 'Failed to enable rule');
            }
        } catch (error) {
            console.warn('Could not enable email routing rule:', error.message);
            throw error;
        }
    }
    
    /**
     * Delete an email routing rule
     * API Endpoint: DELETE /zones/:zone_id/email/routing/rules/:rule_id
     * 
     * @param {string} zoneId - Cloudflare Zone ID
     * @param {string} ruleId - Rule ID to delete
     * @returns {boolean} Success status
     */
    async deleteEmailRoutingRule(zoneId, ruleId) {
        try {
            const response = await this.client.delete(`/zones/${zoneId}/email/routing/rules/${ruleId}`);
            return response.data.success;
        } catch (error) {
            console.warn('Could not delete email routing rule:', error.message);
            return false;
        }
    }
    
    /**
     * Delete a zone from Cloudflare
     * API Endpoint: DELETE /zones/:zone_id
     * 
     * @param {string} zoneId - Cloudflare Zone ID
     * @returns {boolean} Success status
     */
    async deleteZone(zoneId) {
        try {
            const response = await this.client.delete(`/zones/${zoneId}`);
            return response.data.success;
        } catch (error) {
            console.warn('Could not delete zone:', error.message);
            return false;
        }
    }
    
    /**
     * Verify DNS records are properly configured
     * API Endpoint: GET /zones/:zone_id/dns_records
     * 
     * @param {string} zoneId - Cloudflare Zone ID
     * @param {string} recordType - Type of DNS record (e.g., 'MX', 'TXT')
     * @returns {Array} DNS records
     */
    async getDNSRecords(zoneId, recordType = null) {
        try {
            const params = recordType ? { type: recordType } : {};
            const response = await this.client.get(`/zones/${zoneId}/dns_records`, { params });
            
            if (response.data.success) {
                return response.data.result;
            }
            return [];
        } catch (error) {
            console.warn('Could not fetch DNS records:', error.message);
            return [];
        }
    }
}

// Export singleton instance
const cloudflareService = new CloudflareService();
export default cloudflareService;
