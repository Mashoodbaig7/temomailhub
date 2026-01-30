import domainService from '../services/domainService.js';

// Add new domain
export const addDomain = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { domainName } = req.body;

        if (!domainName) {
            return res.status(400).json({
                success: false,
                message: 'Domain name is required'
            });
        }

        // Basic domain validation
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
        if (!domainRegex.test(domainName)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid domain name format'
            });
        }

        const domain = await domainService.addDomain(userId, domainName.toLowerCase());
        
        res.status(201).json({
            success: true,
            message: 'Domain added successfully. Please verify your domain.',
            data: domain
        });
    } catch (error) {
        console.error('Add domain error:', error);
        res.status(error.message.includes('Premium') ? 403 : 500).json({
            success: false,
            message: error.message || 'Failed to add domain'
        });
    }
};

// Get all user domains
export const getUserDomains = async (req, res) => {
    try {
        const userId = req.user.userId;
        const domains = await domainService.getUserDomains(userId);
        
        res.status(200).json({
            success: true,
            data: domains
        });
    } catch (error) {
        console.error('Get domains error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch domains'
        });
    }
};

// Get single domain
export const getDomain = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { domainId } = req.params;

        const domain = await domainService.getDomain(userId, domainId);
        
        res.status(200).json({
            success: true,
            data: domain
        });
    } catch (error) {
        console.error('Get domain error:', error);
        res.status(404).json({
            success: false,
            message: error.message || 'Domain not found'
        });
    }
};

// Update domain
export const updateDomain = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { domainId } = req.params;
        const updateData = req.body;

        const domain = await domainService.updateDomain(userId, domainId, updateData);
        
        res.status(200).json({
            success: true,
            message: 'Domain updated successfully',
            data: domain
        });
    } catch (error) {
        console.error('Update domain error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update domain'
        });
    }
};

// Delete domain
export const deleteDomain = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { domainId } = req.params;

        await domainService.deleteDomain(userId, domainId);
        
        res.status(200).json({
            success: true,
            message: 'Domain deleted successfully'
        });
    } catch (error) {
        console.error('Delete domain error:', error);
        res.status(404).json({
            success: false,
            message: error.message || 'Failed to delete domain'
        });
    }
};

// Verify domain
export const verifyDomain = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { domainId } = req.params;

        const domain = await domainService.verifyDomain(userId, domainId);
        
        res.status(200).json({
            success: true,
            message: domain.mxVerificationStatus === 'verified' 
                ? 'Domain verified successfully via MX record!' 
                : 'Domain verified successfully via TXT record!',
            data: domain
        });
    } catch (error) {
        console.error('Verify domain error:', error);
        
        // Provide more specific error messages
        let statusCode = 400;
        let userMessage = error.message;
        
        if (error.message.includes('not found')) {
            statusCode = 404;
        } else if (error.message.includes('timeout')) {
            statusCode = 408;
            userMessage = 'DNS lookup timed out. Please try again after a few moments.';
        } else if (error.message.includes('DNS propagation')) {
            statusCode = 425;
            userMessage = 'DNS records may still be propagating. Please wait 5-10 minutes and try again.';
        }
        
        res.status(statusCode).json({
            success: false,
            message: userMessage || 'Failed to verify domain. Please ensure DNS records are properly configured.'
        });
    }
};

// Toggle domain status
export const toggleDomainStatus = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { domainId } = req.params;

        const domain = await domainService.toggleDomainStatus(userId, domainId);
        
        res.status(200).json({
            success: true,
            message: `Domain ${domain.status === 'Active' ? 'activated' : 'deactivated'} successfully`,
            data: domain
        });
    } catch (error) {
        console.error('Toggle domain status error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to toggle domain status'
        });
    }
};

// Get domain usage statistics
export const getDomainUsageStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        const stats = await domainService.getDomainUsageStats(userId);
        
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get domain usage stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch domain usage statistics'
        });
    }
};
