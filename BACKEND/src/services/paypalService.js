import axios from 'axios';
import { paypalConfig } from '../config/paymentConfig.js';

class PayPalService {
    constructor() {
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    // Get PayPal Access Token
    async getAccessToken() {
        try {
            console.log('🔐 [PayPal Auth] Checking token validity...');
            // Check if token is still valid
            if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
                console.log('✅ [PayPal Auth] Using cached token');
                return this.accessToken;
            }

            console.log('🔄 [PayPal Auth] Requesting new token...');
            console.log('  Client ID:', paypalConfig.clientId?.substring(0, 10) + '...');
            console.log('  Mode:', paypalConfig.mode);
            console.log('  API Base:', paypalConfig.apiBase);

            const auth = Buffer.from(`${paypalConfig.clientId}:${paypalConfig.clientSecret}`).toString('base64');

            const response = await axios.post(`${paypalConfig.apiBase}/v1/oauth2/token`, 
                'grant_type=client_credentials',
                {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }
                }
            );

            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;

            console.log('✅ [PayPal Auth] Token obtained, expires in:', response.data.expires_in, 'seconds');
            return this.accessToken;
        } catch (error) {
            console.error('❌ [PayPal Auth] Failed:');
            console.error('  Status:', error.response?.status);
            console.error('  Data:', error.response?.data);
            console.error('  Message:', error.message);
            console.error('  Config - Mode:', paypalConfig.mode);
            console.error('  Config - API Base:', paypalConfig.apiBase);
            console.error('  Config - Client ID Valid:', !!paypalConfig.clientId);
            console.error('  Config - Client Secret Valid:', !!paypalConfig.clientSecret);
            
            throw new Error('Failed to get PayPal access token: ' + (error.response?.data?.error_description || error.response?.data?.message || error.message));
        }
    }

    // Create PayPal Order
    async createOrder(orderData) {
        try {
            const accessToken = await this.getAccessToken();

            const payload = {
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: 'USD',
                            value: orderData.amount.toFixed(2),
                            breakdown: {
                                item_total: {
                                    currency_code: 'USD',
                                    value: orderData.subtotal.toFixed(2)
                                },
                                tax_total: {
                                    currency_code: 'USD',
                                    value: orderData.tax.toFixed(2)
                                },
                                discount: orderData.discount > 0 ? {
                                    currency_code: 'USD',
                                    value: orderData.discount.toFixed(2)
                                } : undefined
                            }
                        },
                        items: [
                            {
                                name: `${orderData.planName} Plan - ${orderData.billingCycle}`,
                                description: `Temp-MailHub ${orderData.planName} subscription ${orderData.billingCycle === 'yearly' ? 'yearly' : 'monthly'} billing`,
                                unit_amount: {
                                    currency_code: 'USD',
                                    value: orderData.subtotal.toFixed(2)
                                },
                                quantity: '1'
                            }
                        ],
                        custom_id: orderData.userId
                    }
                ],
                payer: {
                    email_address: orderData.email,
                    name: {
                        given_name: orderData.name.split(' ')[0],
                        surname: orderData.name.split(' ').slice(1).join(' ')
                    }
                },
                application_context: {
                    return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/success`,
                    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/cancel`
                }
            };

            const response = await axios.post(
                `${paypalConfig.apiBase}/v2/checkout/orders`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                orderId: response.data.id,
                status: response.data.status,
                approvalLink: response.data.links.find(link => link.rel === 'approve')?.href
            };
        } catch (error) {
            console.error('❌ PayPal Create Order Error:');
            console.error('  Status:', error.response?.status);
            console.error('  Data:', error.response?.data);
            console.error('  Message:', error.message);
            
            // Log detailed error for debugging
            if (error.response?.data?.details) {
                console.error('  Details:', error.response.data.details);
            }
            
            throw new Error(`Failed to create PayPal order: ${error.response?.data?.message || error.response?.data?.details?.[0]?.issue || error.message}`);
        }
    }

    // Capture PayPal Order
    async captureOrder(orderId) {
        try {
            const accessToken = await this.getAccessToken();

            const response = await axios.post(
                `${paypalConfig.apiBase}/v2/checkout/orders/${orderId}/capture`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const captureData = response.data.purchase_units[0].payments.captures[0];

            return {
                paymentId: captureData.id,
                status: captureData.status,
                amount: parseFloat(captureData.amount.value),
                createTime: captureData.create_time,
                updateTime: captureData.update_time
            };
        } catch (error) {
            console.error('❌ PayPal Capture Order Error:', error.response?.data || error.message);
            throw new Error('Failed to capture PayPal order');
        }
    }

    // Get Order Details
    async getOrderDetails(orderId) {
        try {
            const accessToken = await this.getAccessToken();

            const response = await axios.get(
                `${paypalConfig.apiBase}/v2/checkout/orders/${orderId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('❌ PayPal Get Order Details Error:', error.response?.data || error.message);
            throw new Error('Failed to get PayPal order details');
        }
    }

    // Refund PayPal Order
    async refundPayment(captureId, amount = null) {
        try {
            const accessToken = await this.getAccessToken();

            const payload = amount ? {
                amount: {
                    currency_code: 'USD',
                    value: amount.toFixed(2)
                }
            } : {};

            const response = await axios.post(
                `${paypalConfig.apiBase}/v2/payments/captures/${captureId}/refund`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                refundId: response.data.id,
                status: response.data.status,
                amount: response.data.amount
            };
        } catch (error) {
            console.error('❌ PayPal Refund Error:', error.response?.data || error.message);
            throw new Error('Failed to refund PayPal payment');
        }
    }
}

export default new PayPalService();
