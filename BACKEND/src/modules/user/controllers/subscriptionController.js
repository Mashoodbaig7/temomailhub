import subscriptionService from '../services/subscriptionService.js';

// Get current user subscription
export const getUserSubscription = async (req, res) => {
    try {
        const userId = req.user.userId;
        const subscription = await subscriptionService.getUserSubscription(userId);

        res.status(200).json({
            success: true,
            data: subscription
        });
    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch subscription details'
        });
    }
};

// Update user subscription plan
export const updateSubscriptionPlan = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { planName, billingCycle, paymentMethod } = req.body;

        if (!planName) {
            return res.status(400).json({
                success: false,
                message: 'Plan name is required'
            });
        }

        const subscription = await subscriptionService.updateUserPlan(userId, planName, billingCycle, paymentMethod);

        res.status(200).json({
            success: true,
            message: `Successfully ${planName === 'Free' ? 'downgraded to' : 'upgraded to'} ${planName} plan`,
            data: subscription
        });
    } catch (error) {
        console.error('Update subscription error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update subscription'
        });
    }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
    try {
        const userId = req.user.userId;
        const subscription = await subscriptionService.cancelSubscription(userId);

        res.status(200).json({
            success: true,
            message: 'Subscription cancelled successfully. You are now on Free plan.',
            data: subscription
        });
    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to cancel subscription'
        });
    }
};

// Pause/Resume subscription
export const pauseSubscription = async (req, res) => {
    try {
        const userId = req.user.userId;
        const subscription = await subscriptionService.pauseSubscription(userId);

        const message = subscription.accountStatus === 'Active'
            ? 'Subscription resumed successfully'
            : 'Subscription paused successfully';

        res.status(200).json({
            success: true,
            message,
            data: subscription
        });
    } catch (error) {
        console.error('Pause subscription error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to pause/resume subscription'
        });
    }
};

// Get all available packages
export const getAllPackages = async (req, res) => {
    try {
        const packages = await subscriptionService.getAllPackages();

        res.status(200).json({
            success: true,
            data: packages
        });
    } catch (error) {
        console.error('Get packages error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch packages'
        });
    }
};
