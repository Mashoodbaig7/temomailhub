import dotenv from 'dotenv';

dotenv.config();

// Stripe Configuration
export const stripeConfig = {
    apiKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
};

// PayPal Configuration
export const paypalConfig = {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    mode: process.env.PAYPAL_MODE || 'sandbox', // 'sandbox' or 'live'
    apiBase: process.env.PAYPAL_MODE === 'live' 
        ? 'https://api.paypal.com'
        : 'https://api.sandbox.paypal.com'
};

export default {
    stripe: stripeConfig,
    paypal: paypalConfig
};
