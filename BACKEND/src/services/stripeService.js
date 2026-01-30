import Stripe from 'stripe';
import { stripeConfig } from '../config/paymentConfig.js';

const stripe = new Stripe(stripeConfig.apiKey);

class StripeService {
    // Create Checkout Session
    async createCheckoutSession(sessionData) {
        try {
            const { userId, planName, billingCycle, amount, email, name } = sessionData;

            console.log('📤 [Stripe Service] Creating checkout session:', sessionData);

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: `${planName} Plan - ${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}`,
                            },
                            unit_amount: Math.round(amount * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing`,
                customer_email: email,
                metadata: {
                    userId,
                    planName,
                    billingCycle,
                    customerName: name
                }
            });

            console.log('✅ [Stripe Service] Checkout session created:', session.id);

            return session;
        } catch (error) {
            console.error('❌ [Stripe Service] Create checkout session error:', error.message);
            throw new Error(error.message || 'Failed to create checkout session');
        }
    }

    // Retrieve Checkout Session
    async retrieveCheckoutSession(sessionId) {
        try {
            console.log('📤 [Stripe Service] Retrieving checkout session:', sessionId);

            const session = await stripe.checkout.sessions.retrieve(sessionId);

            console.log('✅ [Stripe Service] Checkout session retrieved:', {
                id: session.id,
                payment_status: session.payment_status,
                metadata: session.metadata
            });

            return session;
        } catch (error) {
            console.error('❌ [Stripe Service] Retrieve checkout session error:', error.message);
            throw new Error(error.message || 'Failed to retrieve checkout session');
        }
    }

    // Create Payment Intent
    async createPaymentIntent(amount, metadata = {}) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency: 'usd',
                metadata: metadata,
                automatic_payment_methods: {
                    enabled: true,
                }
            });

            return {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount / 100,
                status: paymentIntent.status
            };
        } catch (error) {
            console.error('❌ Stripe Payment Intent Error:', error.message);
            throw new Error('Failed to create payment intent');
        }
    }

    // Confirm Payment Intent
    async confirmPaymentIntent(paymentIntentId) {
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

            return {
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount / 100,
                status: paymentIntent.status,
                currency: paymentIntent.currency,
                metadata: paymentIntent.metadata
            };
        } catch (error) {
            console.error('❌ Stripe Confirm Payment Intent Error:', error.message);
            throw new Error('Failed to confirm payment intent');
        }
    }

    // Confirm Payment with Token (safe - token created on frontend)
    async confirmPaymentWithToken(paymentIntentId, token, customerData = {}) {
        try {
            console.log('📤 [Stripe Service] Confirming payment with token:', {
                paymentIntentId,
                token,
                customerData
            });

            // Confirm the payment intent with the token
            const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
                payment_method: token,
                confirm: true,
                return_url: 'http://localhost:3000/checkout-success' // Redirect after payment
            });

            console.log('✅ [Stripe Service] Payment intent confirmed:', {
                id: paymentIntent.id,
                status: paymentIntent.status,
                amount: paymentIntent.amount / 100
            });

            return {
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount / 100,
                status: paymentIntent.status,
                currency: paymentIntent.currency
            };
        } catch (error) {
            console.error('❌ [Stripe Service] Confirm Payment with Token Error:', error.message);
            console.error('  Error type:', error.type);
            console.error('  Error code:', error.code);
            console.error('  Full error:', error);
            throw new Error(error.message || 'Failed to confirm payment with token');
        }
    }

    // Create Customer
    async createCustomer(customerData) {
        try {
            const customer = await stripe.customers.create({
                email: customerData.email,
                name: customerData.name,
                address: {
                    country: customerData.country || 'US',
                    postal_code: customerData.zipCode
                },
                metadata: {
                    userId: customerData.userId
                }
            });

            return {
                customerId: customer.id,
                email: customer.email,
                name: customer.name
            };
        } catch (error) {
            console.error('❌ Stripe Create Customer Error:', error.message);
            throw new Error('Failed to create customer');
        }
    }

    // Create Subscription
    async createSubscription(customerId, priceId, metadata = {}) {
        try {
            const subscription = await stripe.subscriptions.create({
                customer: customerId,
                items: [
                    {
                        price: priceId
                    }
                ],
                metadata: metadata,
                payment_settings: {
                    save_default_payment_method: 'on_subscription'
                }
            });

            return {
                subscriptionId: subscription.id,
                customerId: subscription.customer,
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000)
            };
        } catch (error) {
            console.error('❌ Stripe Create Subscription Error:', error.message);
            throw new Error('Failed to create subscription');
        }
    }

    // Cancel Subscription
    async cancelSubscription(subscriptionId) {
        try {
            const subscription = await stripe.subscriptions.del(subscriptionId);

            return {
                subscriptionId: subscription.id,
                status: subscription.status,
                canceledAt: new Date(subscription.canceled_at * 1000)
            };
        } catch (error) {
            console.error('❌ Stripe Cancel Subscription Error:', error.message);
            throw new Error('Failed to cancel subscription');
        }
    }

    // Get Invoice
    async getInvoice(invoiceId) {
        try {
            const invoice = await stripe.invoices.retrieve(invoiceId);

            return {
                invoiceId: invoice.id,
                amount: invoice.amount_paid / 100,
                status: invoice.status,
                url: invoice.hosted_invoice_url,
                paidAt: invoice.paid_at ? new Date(invoice.paid_at * 1000) : null
            };
        } catch (error) {
            console.error('❌ Stripe Get Invoice Error:', error.message);
            throw new Error('Failed to get invoice');
        }
    }

    // Refund Payment
    async refundPayment(paymentIntentId, amount = null) {
        try {
            const refund = await stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount: amount ? Math.round(amount * 100) : undefined
            });

            return {
                refundId: refund.id,
                amount: refund.amount / 100,
                status: refund.status,
                created: new Date(refund.created * 1000)
            };
        } catch (error) {
            console.error('❌ Stripe Refund Error:', error.message);
            throw new Error('Failed to refund payment');
        }
    }

    // Verify Webhook Signature
    verifyWebhookSignature(body, signature) {
        try {
            const event = stripe.webhooks.constructEvent(
                body,
                signature,
                stripeConfig.webhookSecret
            );
            return event;
        } catch (error) {
            console.error('❌ Webhook signature verification failed:', error.message);
            throw new Error('Invalid webhook signature');
        }
    }
}

export default new StripeService();
