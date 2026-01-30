import CustomDomain from '../../../models/CustomDomainModel.js';
import cloudflareService from '../../../services/cloudflareService.js';
import subscriptionService from '../services/subscriptionService.js';
import { ENV } from '../../../constants/index.js';

// Helper function to check and reset monthly domain counter
async function checkAndResetMonthlyLimit(subscription) {
    const now = new Date();
    const lastReset = new Date(subscription.lastDomainResetDate);
    
    // Check if a month has passed
    const monthsDiff = (now.getFullYear() - lastReset.getFullYear()) * 12 + 
                      (now.getMonth() - lastReset.getMonth());
    
    if (monthsDiff >= 1) {
        subscription.domainsAddedThisMonth = 0;
        subscription.lastDomainResetDate = now;
        await subscription.save();
    }
    
    return subscription;
}

/**
 * CONTROLLER: Add Custom Domain
 * 
 * This controller handles the initial domain addition process:
 * 1. Validates the domain name
 * 2. Checks subscription limits
 * 3. Creates a new Cloudflare Zone for the domain
 * 4. Stores the Zone ID and assigned nameservers in the database
 * 5. Returns user instructions for DNS delegation
 * 
 * @route POST /api/user/custom-domains/add
 * @access Private (requires authentication)
 */
export const addDomain = async (req, res) => {
    try {
        const { domainName } = req.body;
        const userId = req.user.userId; // Get userId from tokenVerification middleware
        
        console.log('AddDomain - User ID:', userId); // Debug log
        console.log('AddDomain - Domain Name:', domainName); // Debug log
        
        // Validate input
        if (!domainName || typeof domainName !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Domain name is required and must be a valid string'
            });
        }
        
        // Normalize domain name
        const normalizedDomain = domainName.trim().toLowerCase();
        
        // Check if user has Standard or Premium plan
        let subscription = await subscriptionService.getUserSubscription(userId);

        if (subscription.currentPlan === 'Free') {
            return res.status(403).json({
                success: false,
                message: 'Custom domains are only available for Standard and Premium plan users. Please upgrade your plan.'
            });
        }

        // Check and reset monthly domain counter if needed
        subscription = await checkAndResetMonthlyLimit(subscription);

        // Check domain limit for the current month
        const domainLimit = subscription.planFeatures.domainsPerMonth;
        const domainsUsed = subscription.domainsAddedThisMonth;

        if (domainsUsed >= domainLimit) {
            return res.status(403).json({
                success: false,
                message: `Domain limit reached. Your ${subscription.currentPlan} plan allows ${domainLimit} domains per month. Current usage: ${domainsUsed}/${domainLimit}. Limit will reset next month.`,
                data: {
                    currentPlan: subscription.currentPlan,
                    limit: domainLimit,
                    used: domainsUsed,
                    remaining: Math.max(0, domainLimit - domainsUsed)
                }
            });
        }
        
        // Check if domain already exists in database
        const existingDomain = await CustomDomain.findOne({ domainName: normalizedDomain });
        if (existingDomain) {
            return res.status(409).json({
                success: false,
                message: 'This domain has already been added to our system',
                data: {
                    existingOwner: existingDomain.userId.toString() === userId.toString(),
                    status: existingDomain.status
                }
            });
        }
        
        // Step 1: Create zone in Cloudflare
        console.log(`Creating Cloudflare zone for domain: ${normalizedDomain}`);
        let zoneData;
        try {
            zoneData = await cloudflareService.createZone(normalizedDomain);
        } catch (cloudflareError) {
            console.error('Cloudflare zone creation failed:', cloudflareError);
            return res.status(500).json({
                success: false,
                message: 'Failed to create domain in Cloudflare',
                error: cloudflareError.message,
                troubleshooting: [
                    'Verify your CLOUDFLARE_API_KEY is correct',
                    'Verify your CLOUDFLARE_ACCOUNT_ID is correct',
                    'Check if the domain already exists in your Cloudflare account',
                    'Ensure the domain is not already delegated to Cloudflare'
                ]
            });
        }
        
        // Step 2: Save domain to database
        const customDomain = new CustomDomain({
            userId,
            domainName: normalizedDomain,
            status: 'Pending',
            cloudflareZoneId: zoneData.id,
            nameservers: zoneData.nameServers,
            cloudflareStatus: zoneData.status
        });
        
        await customDomain.save();
        console.log(`Domain saved to database with ID: ${customDomain._id}`);
        
        // Step 3: Prepare comprehensive user instructions
        const userInstructions = [
            '🎯 Step 1: Log in to your domain registrar',
            'Access the control panel where you purchased your domain (GoDaddy, Namecheap, Google Domains, etc.)',
            '',
            '🔧 Step 2: Find DNS/Nameserver Settings',
            'Look for sections labeled: "DNS Management", "Nameservers", "Domain Settings", or "Name Server Configuration"',
            '',
            '📝 Step 3: Switch to Custom Nameservers',
            'Change from "Default Nameservers" to "Custom Nameservers" or "Use custom name servers"',
            '',
            '✏️ Step 4: Replace Nameservers',
            'Delete all existing nameservers and replace them with the Cloudflare nameservers provided below:',
            ...zoneData.nameServers.map((ns, idx) => `   ${idx + 1}. ${ns}`),
            '',
            '💾 Step 5: Save Changes',
            'Click "Save", "Update", or "Apply Changes" button',
            '',
            '⏰ Step 6: Wait for Propagation (15 minutes - 48 hours)',
            'DNS changes typically take 15-30 minutes but can take up to 48 hours in rare cases',
            '',
            '✅ Step 7: Verify Your Domain',
            `Return to this application and click "Verify Domain" or call the verification API endpoint`,
            '',
            '📌 Important Notes:',
            '• Do NOT add any additional nameservers beyond those provided',
            '• The order of nameservers does not matter',
            '• You can check propagation status at: https://www.whatsmydns.net',
            '• Once verified, email routing will be automatically configured'
        ];
        
        // Increment domain counter AFTER successful creation
        subscription.domainsAddedThisMonth += 1;
        await subscription.save();
        
        // Return success response
        return res.status(201).json({
            success: true,
            message: 'Domain successfully added! Please update your nameservers at your domain registrar.',
            data: {
                domainId: customDomain._id,
                domainName: customDomain.domainName,
                status: customDomain.status,
                cloudflareZoneId: customDomain.cloudflareZoneId,
                nameservers: customDomain.nameservers,
                createdAt: customDomain.createdAt
            },
            instructions: userInstructions,
            nextSteps: {
                action: 'Update nameservers at your domain registrar',
                verificationEndpoint: '/api/user/custom-domains/verify',
                estimatedTime: '15-30 minutes for DNS propagation'
            },
            usage: {
                domainsUsed: subscription.domainsAddedThisMonth,
                domainsLimit: subscription.planFeatures.domainsPerMonth,
                remaining: Math.max(0, subscription.planFeatures.domainsPerMonth - subscription.domainsAddedThisMonth)
            }
        });
        
    } catch (error) {
        console.error('Error in addDomain controller:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while adding the domain',
            error: error.message
        });
    }
};

/**
 * CONTROLLER: Verify and Setup Domain
 * 
 * This is the most critical controller. It:
 * 1. Checks if the domain's nameservers are properly configured (status: 'active')
 * 2. If active, automatically configures email routing:
 *    - Enables Email Routing on Cloudflare
 *    - Creates a catch-all rule that forwards to the Worker
 * 3. Updates the database status to 'Active'
 * 
 * @route POST /api/user/domains/verify/:domainId
 * @access Private (requires authentication)
 */
export const verifyDomain = async (req, res) => {
    try {
        const { domainId } = req.params;
        const userId = req.user.userId;
        
        // Find the domain
        const domain = await CustomDomain.findById(domainId);
        
        if (!domain) {
            return res.status(404).json({
                success: false,
                message: 'Domain not found'
            });
        }
        
        // Verify ownership
        if (domain.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to verify this domain'
            });
        }
        
        // Check if already active
        if (domain.status === 'Active' && domain.emailRoutingEnabled) {
            return res.status(200).json({
                success: true,
                message: 'Domain is already verified and email routing is active',
                data: {
                    domainId: domain._id,
                    domainName: domain.domainName,
                    status: domain.status,
                    emailRoutingEnabled: domain.emailRoutingEnabled,
                    activatedAt: domain.activatedAt
                }
            });
        }
        
        // Update verification attempts
        domain.verificationAttempts += 1;
        domain.lastVerificationAttempt = new Date();
        
        // Step 1: Check zone status in Cloudflare
        console.log(`Checking Cloudflare zone status for: ${domain.domainName}`);
        let zoneStatus;
        try {
            zoneStatus = await cloudflareService.getZoneStatus(domain.cloudflareZoneId);
        } catch (cloudflareError) {
            console.error('Failed to get zone status:', cloudflareError);
            domain.lastError = cloudflareError.message;
            await domain.save();
            
            return res.status(500).json({
                success: false,
                message: 'Failed to check domain status with Cloudflare',
                error: cloudflareError.message,
                troubleshooting: [
                    'Verify the domain still exists in your Cloudflare account',
                    'Check your Cloudflare API credentials'
                ]
            });
        }
        
        // Update Cloudflare status in database
        domain.cloudflareStatus = zoneStatus.status;
        
        // Check if zone is active (nameservers properly configured)
        if (zoneStatus.status !== 'active') {
            await domain.save();
            
            return res.status(202).json({
                success: false,
                message: 'Domain is not yet active. Nameservers have not been properly configured.',
                data: {
                    domainName: domain.domainName,
                    currentStatus: zoneStatus.status,
                    expectedNameservers: domain.nameservers,
                    currentNameservers: zoneStatus.originalNameServers,
                    verificationAttempts: domain.verificationAttempts
                },
                instructions: [
                    '⏳ DNS propagation is still in progress',
                    '✓ Expected Nameservers:',
                    ...domain.nameservers.map((ns, idx) => `   ${idx + 1}. ${ns}`),
                    '',
                    '❌ Current Nameservers (detected):',
                    ...(zoneStatus.originalNameServers?.map((ns, idx) => `   ${idx + 1}. ${ns}`) || ['   Not yet updated']),
                    '',
                    '📌 What to do:',
                    '• Verify you updated nameservers at your domain registrar',
                    '• Wait 15-30 minutes and try verification again',
                    '• Check DNS propagation at: https://www.whatsmydns.net',
                    '• If issues persist after 48 hours, contact support'
                ],
                nextSteps: {
                    action: 'Wait for DNS propagation and try again',
                    retryAfter: '15-30 minutes'
                }
            });
        }
        
        // Zone is ACTIVE! Proceed with email routing setup
        console.log(`✓ Zone is active. Configuring email routing for: ${domain.domainName}`);
        
        const setupResults = {
            emailRoutingEnabled: false,
            destinationAddressConfigured: false,
            catchAllRuleCreated: false,
            errors: []
        };
        
        // Step 2: Enable Email Routing
        try {
            console.log('Enabling email routing...');
            const emailRoutingResult = await cloudflareService.enableEmailRouting(domain.cloudflareZoneId);
            setupResults.emailRoutingEnabled = emailRoutingResult.enabled || emailRoutingResult.status === 'already_enabled';
            console.log('✓ Email routing enabled');
        } catch (emailRoutingError) {
            console.error('Failed to enable email routing:', emailRoutingError);
            setupResults.errors.push({
                step: 'Enable Email Routing',
                error: emailRoutingError.message
            });
        }
        
        // Step 3: Setup Worker Routing (Automated catch-all rule creation)
        if (setupResults.emailRoutingEnabled) {
            try {
                console.log('Setting up Worker catch-all rule...');
                const ruleResult = await cloudflareService.createCatchAllRule(
                    domain.cloudflareZoneId,
                    domain.workerName
                );
                
                domain.catchAllRuleId = ruleResult.id || ruleResult.tag;
                setupResults.catchAllRuleCreated = true;
                console.log(`✓ Catch-all rule configured (ID: ${domain.catchAllRuleId})`);
            } catch (ruleError) {
                console.error('Failed to create catch-all rule:', ruleError);
                setupResults.errors.push({
                    step: 'Create Catch-All Rule',
                    error: ruleError.message
                });
                
                // Check if a rule already exists
                try {
                    const existingRules = await cloudflareService.getEmailRoutingRules(domain.cloudflareZoneId);
                    if (existingRules.length > 0) {
                        const catchAllRule = existingRules.find(rule => 
                            rule.matchers?.some(m => m.type === 'all')
                        );
                        if (catchAllRule) {
                            domain.catchAllRuleId = catchAllRule.id;
                            setupResults.catchAllRuleCreated = true;
                            console.log('✓ Found existing catch-all rule');
                        }
                    }
                } catch (checkError) {
                    console.error('Could not check existing rules:', checkError);
                }
            }
        }
        
        // Step 4: Update domain status in database
        const isFullyConfigured = setupResults.emailRoutingEnabled && setupResults.catchAllRuleCreated;
        
        if (isFullyConfigured) {
            domain.status = 'Active';
            domain.emailRoutingEnabled = true;
            domain.activatedAt = new Date();
            domain.lastError = null;
            
            await domain.save();
            
            console.log(`✓✓✓ Domain fully configured and activated: ${domain.domainName}`);
            
            return res.status(200).json({
                success: true,
                message: '🎉 Domain verified and email routing fully configured!',
                data: {
                    domainId: domain._id,
                    domainName: domain.domainName,
                    status: domain.status,
                    emailRoutingEnabled: domain.emailRoutingEnabled,
                    catchAllRuleId: domain.catchAllRuleId,
                    activatedAt: domain.activatedAt,
                    cloudflareZoneId: domain.cloudflareZoneId
                },
                configuration: {
                    emailRoutingEnabled: true,
                    catchAllRuleConfigured: true,
                    workerName: domain.workerName
                },
                nextSteps: [
                    '✅ Your domain is now fully configured!',
                    '📧 All emails sent to any address @' + domain.domainName + ' will be received',
                    '🔄 Emails are automatically routed to your Worker: ' + domain.workerName,
                    '📬 You can start using your custom domain immediately'
                ]
            });
        } else {
            // Partial configuration - save what we have but mark as failed
            domain.status = 'Failed';
            domain.emailRoutingEnabled = setupResults.emailRoutingEnabled;
            domain.lastError = setupResults.errors.map(e => `${e.step}: ${e.error}`).join('; ');
            
            await domain.save();
            
            return res.status(500).json({
                success: false,
                message: 'Domain is active but email routing configuration failed',
                data: {
                    domainName: domain.domainName,
                    status: domain.status,
                    cloudflareStatus: zoneStatus.status
                },
                partialResults: {
                    emailRoutingEnabled: setupResults.emailRoutingEnabled
                },
                errors: setupResults.errors,
                troubleshooting: [
                    'The domain nameservers are correctly configured',
                    'However, email routing could not be fully enabled',
                    'Please check your Cloudflare account permissions',
                    'Ensure Email Routing is available for your account',
                    'You can try verification again or contact support'
                ]
            });
        }
        
    } catch (error) {
        console.error('Error in verifyDomain controller:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during domain verification',
            error: error.message
        });
    }
};

/**
 * CONTROLLER: Get User's Domains
 * 
 * Retrieves all domains belonging to the authenticated user
 * 
 * @route GET /api/user/domains
 * @access Private
 */
export const getUserDomains = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const domains = await CustomDomain.find({ userId })
            .sort({ createdAt: -1 })
            .select('-__v');
        
        return res.status(200).json({
            success: true,
            count: domains.length,
            data: domains
        });
        
    } catch (error) {
        console.error('Error in getUserDomains controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve domains',
            error: error.message
        });
    }
};

/**
 * CONTROLLER: Delete Domain
 * 
 * Removes domain from both database and Cloudflare
 * 
 * @route DELETE /api/user/domains/:domainId
 * @access Private
 */
export const deleteDomain = async (req, res) => {
    try {
        const { domainId } = req.params;
        const userId = req.user.userId;
        
        const domain = await CustomDomain.findById(domainId);
        
        if (!domain) {
            return res.status(404).json({
                success: false,
                message: 'Domain not found'
            });
        }
        
        // Verify ownership
        if (domain.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this domain'
            });
        }
        
        // Delete from Cloudflare
        try {
            await cloudflareService.deleteZone(domain.cloudflareZoneId);
            console.log(`Deleted zone from Cloudflare: ${domain.cloudflareZoneId}`);
        } catch (cfError) {
            console.error('Failed to delete from Cloudflare:', cfError);
            // Continue with database deletion even if Cloudflare deletion fails
        }
        
        // Delete from database
        await CustomDomain.findByIdAndDelete(domainId);
        
        return res.status(200).json({
            success: true,
            message: 'Domain successfully deleted',
            data: {
                domainName: domain.domainName
            }
        });
        
    } catch (error) {
        console.error('Error in deleteDomain controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete domain',
            error: error.message
        });
    }
};
