import paypalService from '../../../services/paypalService.js';
import UserSubscription from '../../../models/UserSubscriptionModel.js';

// Create PayPal Order
export const createPayPalOrder = async (req, res) => {
    try {
        console.log('🔵 [PayPal] Creating order...');
        console.log('  User ID:', req.user?.userId);
        console.log('  Request Body:', req.body);
        
        const userId = req.user.userId;
        const { planName, billingCycle, amount, subtotal, tax, discount, email, name } = req.body;

        if (!planName || !amount || !email || !name) {
            console.log('❌ [PayPal] Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Plan name, amount, email, and name are required'
            });
        }

        // Create PayPal order
        console.log('📤 [PayPal] Calling paypalService.createOrder...');
        const order = await paypalService.createOrder({
            userId,
            planName,
            billingCycle: billingCycle || 'monthly',
            amount,
            subtotal,
            tax,
            discount: discount || 0,
            email,
            name
        });

        console.log('✅ [PayPal] Order created:', order.orderId);
        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('❌ [PayPal] Create PayPal Order error:', error.message);
        console.error('  Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create PayPal order',
            debug: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Capture PayPal Order & Activate Plan
export const capturePayPalOrderAndActivatePlan = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { orderId, planName, billingCycle } = req.body;

        if (!orderId || !planName) {
            return res.status(400).json({
                success: false,
                message: 'Order ID and plan name are required'
            });
        }

        // Capture the PayPal order
        const captureData = await paypalService.captureOrder(orderId);

        if (captureData.status !== 'COMPLETED') {
            return res.status(400).json({
                success: false,
                message: 'PayPal payment was not completed'
            });
        }

        // Define plan features configuration
        const planFeatureConfigs = {
            'Free': {
                emailLimit: 5,
                emailExpiry: 10,
                inboxStorage: 0,
                domainsPerMonth: 0,
                customEmailsPerMonth: 0,
                customEmailExpiry: 0,
                attachmentSupport: false,
                attachmentSize: 0,
                customDomain: false,
                adFree: false,
                prioritySupport: false,
                advancedSpamFilter: false
            },
            'Standard': {
                emailLimit: 10,
                emailExpiry: 720,
                inboxStorage: 20,
                domainsPerMonth: 10,
                customEmailsPerMonth: 40,
                customEmailExpiry: 720,
                attachmentSupport: true,
                attachmentSize: 1,
                customDomain: true,
                adFree: true,
                prioritySupport: true,
                advancedSpamFilter: false
            },
            'Premium': {
                emailLimit: 15,
                emailExpiry: 1440,
                inboxStorage: 100,
                domainsPerMonth: 40,
                customEmailsPerMonth: 100,
                customEmailExpiry: 1440,
                attachmentSupport: true,
                attachmentSize: 10,
                customDomain: true,
                adFree: true,
                prioritySupport: true,
                advancedSpamFilter: true
            }
        };

        // Update user subscription
        const subscription = await UserSubscription.findOne({ userId });
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        subscription.currentPlan = planName;
        subscription.planFeatures = planFeatureConfigs[planName] || planFeatureConfigs['Free'];
        subscription.billingCycle = billingCycle || 'monthly';
        subscription.paymentStatus = 'Paid';
        subscription.paymentMethod = 'PayPal';
        subscription.accountStatus = 'Active';
        subscription.autoRenew = true;

        const now = new Date();
        subscription.subscriptionStartDate = now;

        if (billingCycle === 'yearly') {
            const endDate = new Date(now);
            endDate.setFullYear(endDate.getFullYear() + 1);
            subscription.subscriptionEndDate = endDate;
        } else {
            const endDate = new Date(now);
            endDate.setMonth(endDate.getMonth() + 1);
            subscription.subscriptionEndDate = endDate;
        }

        subscription.emailsGeneratedToday = 0;
        subscription.lastEmailResetDate = now;
        subscription.customEmailsCreatedThisMonth = 0;
        subscription.lastCustomEmailResetDate = now;

        await subscription.save();

        res.status(200).json({
            success: true,
            message: `${planName} plan activated successfully with PayPal payment`,
            data: subscription
        });
    } catch (error) {
        console.error('Capture PayPal Order error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to capture PayPal order'
        });
    }
};

// Get PayPal Order Details
export const getPayPalOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        const orderDetails = await paypalService.getOrderDetails(orderId);

        res.status(200).json({
            success: true,
            data: orderDetails
        });
    } catch (error) {
        console.error('Get PayPal Order Details error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get order details'
        });
    }
};

// Refund PayPal Payment
export const refundPayPalPayment = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { captureId, amount } = req.body;

        if (!captureId) {
            return res.status(400).json({
                success: false,
                message: 'Capture ID is required'
            });
        }

        const refund = await paypalService.refundPayment(captureId, amount);

        // Update subscription status to reflect refund if full refund
        if (!amount) {
            const subscription = await UserSubscription.findOne({ userId });
            if (subscription) {
                subscription.paymentStatus = 'Cancelled';
                await subscription.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Refund processed successfully',
            data: refund
        });
    } catch (error) {
        console.error('Refund PayPal Payment error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to process refund'
        });
    }
};
