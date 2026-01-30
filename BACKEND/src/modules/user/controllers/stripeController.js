import stripeService from '../../../services/stripeService.js';
import UserSubscription from '../../../models/UserSubscriptionModel.js';

// Create Stripe Checkout Session
export const createCheckoutSession = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { planName, billingCycle, amount, email, name } = req.body;

        if (!planName || !amount || !email || !name) {
            return res.status(400).json({
                success: false,
                message: 'Plan name, amount, email, and name are required'
            });
        }

        console.log('📤 [Stripe] Creating checkout session:', {
            userId,
            planName,
            billingCycle,
            amount,
            email,
            name
        });

        // Create checkout session
        const session = await stripeService.createCheckoutSession({
            userId,
            planName,
            billingCycle: billingCycle || 'monthly',
            amount,
            email,
            name
        });

        console.log('✅ [Stripe] Checkout session created:', session.id);

        res.status(200).json({
            success: true,
            data: {
                sessionId: session.id,
                sessionUrl: session.url
            }
        });
    } catch (error) {
        console.error('❌ [Stripe] Create checkout session error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create checkout session'
        });
    }
};

// Retrieve Stripe Checkout Session and Activate Subscription
export const retrieveCheckoutSession = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required'
            });
        }

        console.log('📤 [Stripe] Retrieving checkout session:', {
            userId,
            sessionId
        });

        // Retrieve session from Stripe
        const session = await stripeService.retrieveCheckoutSession(sessionId);

        console.log('✅ [Stripe] Session retrieved:', {
            id: session.id,
            payment_status: session.payment_status,
            customer_email: session.customer_email
        });

        // Check if payment was successful
        if (session.payment_status !== 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Payment not completed'
            });
        }

        // Extract metadata from session
        const { planName, billingCycle } = session.metadata || {};

        if (!planName) {
            return res.status(400).json({
                success: false,
                message: 'Plan information not found in session'
            });
        }

        console.log('📤 [Stripe] Activating subscription:', {
            userId,
            planName,
            billingCycle
        });

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

        // Activate the subscription
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + (billingCycle === 'yearly' ? 12 : 1));

        let subscription = await UserSubscription.findOne({ userId });
        if (!subscription) {
            subscription = new UserSubscription({ userId });
        }

        subscription.currentPlan = planName;
        subscription.planFeatures = planFeatureConfigs[planName] || planFeatureConfigs['Free'];
        subscription.billingCycle = billingCycle || 'monthly';
        subscription.paymentMethod = 'Stripe';
        subscription.paymentStatus = 'Paid';
        subscription.accountStatus = 'Active';
        subscription.autoRenew = true;
        subscription.subscriptionStartDate = now;
        subscription.subscriptionEndDate = endDate;
        subscription.emailsGeneratedToday = 0;
        subscription.lastEmailResetDate = now;
        subscription.customEmailsCreatedThisMonth = 0;
        subscription.lastCustomEmailResetDate = now;
        
        await subscription.save();

        console.log('✅ [Stripe] Subscription activated:', subscription);

        res.status(200).json({
            success: true,
            data: {
                sessionId: session.id,
                planName,
                billingCycle,
                message: 'Payment successful! Subscription activated.'
            }
        });
    } catch (error) {
        console.error('❌ [Stripe] Retrieve checkout session error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve checkout session'
        });
    }
};

// Create Stripe Payment Intent
export const createStripePaymentIntent = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { planName, billingCycle, amount, subtotal, tax, discount } = req.body;

        if (!planName || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Plan name and amount are required'
            });
        }

        // Create payment intent
        const paymentIntent = await stripeService.createPaymentIntent(amount, {
            userId,
            planName,
            billingCycle: billingCycle || 'monthly'
        });

        res.status(200).json({
            success: true,
            data: paymentIntent
        });
    } catch (error) {
        console.error('Create Stripe Payment Intent error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create payment intent'
        });
    }
};

// Confirm Stripe Payment with Token
export const confirmStripePaymentWithToken = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { paymentIntentId, token, email, name, country, zipCode } = req.body;

        console.log('📤 [Backend] confirmStripePaymentWithToken received:', {
            userId,
            paymentIntentId,
            token,
            email,
            name,
            country,
            zipCode
        });

        if (!paymentIntentId || !token) {
            console.error('❌ [Backend] Missing required fields:', { paymentIntentId, token });
            return res.status(400).json({
                success: false,
                message: 'Payment intent ID and token are required'
            });
        }

        // Validate token format (should start with pm_ for payment method)
        if (!token.startsWith('pm_')) {
            console.error('❌ [Backend] Invalid token format:', token);
            return res.status(400).json({
                success: false,
                message: 'Invalid payment method token format'
            });
        }

        // Confirm payment with token
        const result = await stripeService.confirmPaymentWithToken(paymentIntentId, token, {
            email,
            name,
            country,
            zipCode,
            userId
        });

        console.log('✅ [Backend] Payment confirmed:', result);

        res.status(200).json({
            success: true,
            message: 'Payment confirmed successfully',
            data: result
        });
    } catch (error) {
        console.error('❌ [Backend] Confirm Stripe Payment with Token error:', error);
        console.error('  Error message:', error.message);
        console.error('  Error details:', error);
        
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to confirm payment'
        });
    }
};

// Confirm Stripe Payment & Activate Plan
export const confirmStripePaymentAndActivatePlan = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { paymentIntentId, planName, billingCycle } = req.body;

        if (!paymentIntentId || !planName) {
            return res.status(400).json({
                success: false,
                message: 'Payment intent ID and plan name are required'
            });
        }

        // Verify payment intent status
        const paymentIntent = await stripeService.confirmPaymentIntent(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({
                success: false,
                message: 'Payment was not successful'
            });
        }

        // Update user subscription
        const subscription = await UserSubscription.findOne({ userId });
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
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

        subscription.currentPlan = planName;
        subscription.planFeatures = planFeatureConfigs[planName] || planFeatureConfigs['Free'];
        subscription.billingCycle = billingCycle || 'monthly';
        subscription.paymentStatus = 'Paid';
        subscription.paymentMethod = 'Stripe';
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
            message: `${planName} plan activated successfully with Stripe payment`,
            data: subscription
        });
    } catch (error) {
        console.error('Confirm Stripe Payment error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to confirm payment'
        });
    }
};

// Handle Stripe Webhook
export const handleStripeWebhook = async (req, res) => {
    try {
        const signature = req.headers['stripe-signature'];
        const event = stripeService.verifyWebhookSignature(req.body, signature);

        switch (event.type) {
            case 'payment_intent.succeeded':
                console.log('✅ Stripe Payment Intent Succeeded:', event.data.object.id);
                break;

            case 'payment_intent.payment_failed':
                console.log('❌ Stripe Payment Intent Failed:', event.data.object.id);
                break;

            case 'invoice.payment_succeeded':
                console.log('✅ Stripe Invoice Payment Succeeded:', event.data.object.id);
                break;

            case 'invoice.payment_failed':
                console.log('❌ Stripe Invoice Payment Failed:', event.data.object.id);
                break;

            case 'customer.subscription.deleted':
                console.log('Stripe Subscription Deleted:', event.data.object.id);
                break;

            default:
                console.log('Unhandled Stripe event type:', event.type);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Stripe webhook error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Webhook handler failed'
        });
    }
};

// Refund Stripe Payment
export const refundStripePayment = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { paymentIntentId, amount } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment intent ID is required'
            });
        }

        const refund = await stripeService.refundPayment(paymentIntentId, amount);

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
        console.error('Refund Stripe Payment error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to process refund'
        });
    }
};
