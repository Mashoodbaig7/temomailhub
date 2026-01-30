import express from 'express';
import { 
    getUserSubscription, 
    updateSubscriptionPlan, 
    cancelSubscription, 
    pauseSubscription,
    getAllPackages 
} from '../controllers/subscriptionController.js';
import {
    createStripePaymentIntent,
    createCheckoutSession,
    retrieveCheckoutSession,
    confirmStripePaymentWithToken,
    confirmStripePaymentAndActivatePlan,
    handleStripeWebhook,
    refundStripePayment
} from '../controllers/stripeController.js';
import {
    createPayPalOrder,
    capturePayPalOrderAndActivatePlan,
    getPayPalOrderDetails,
    refundPayPalPayment
} from '../controllers/paypalController.js';
import { verifyToken } from '../../../middlewares/tokenVerification.js';

const router = express.Router();

// Debug logging for all subscription routes
router.use((req, res, next) => {
    console.log(`\n📋 [SUBSCRIPTION ROUTES] ${req.method} ${req.path}`);
    console.log(`   Full URL: /subscription${req.path}`);
    console.log(`   Auth: ${req.headers.authorization ? '✅' : '❌'}`);
    next();
});

// Get all available packages (public route)
router.get('/packages', getAllPackages);

// Protected routes - require authentication
router.get('/my-subscription', verifyToken, getUserSubscription);
router.put('/update-plan', verifyToken, updateSubscriptionPlan);
router.post('/cancel', verifyToken, cancelSubscription);
router.post('/pause', verifyToken, pauseSubscription);

// ==================== STRIPE PAYMENT ROUTES ====================
router.post('/stripe/checkout-session', verifyToken, createCheckoutSession);
router.get('/stripe/checkout-session/:sessionId', verifyToken, retrieveCheckoutSession);
router.post('/stripe/create-intent', verifyToken, createStripePaymentIntent);
router.post('/stripe/confirm-with-token', verifyToken, confirmStripePaymentWithToken);
router.post('/stripe/confirm-payment', verifyToken, confirmStripePaymentAndActivatePlan);
router.post('/stripe/refund', verifyToken, refundStripePayment);
router.post('/stripe/webhook', handleStripeWebhook); // Webhook route (no auth needed)

// ==================== PAYPAL PAYMENT ROUTES ====================
router.post('/paypal/create-order', verifyToken, createPayPalOrder);
router.post('/paypal/capture-order', verifyToken, capturePayPalOrderAndActivatePlan);
router.get('/paypal/order/:orderId', verifyToken, getPayPalOrderDetails);
router.post('/paypal/refund', verifyToken, refundPayPalPayment);

export default router;
