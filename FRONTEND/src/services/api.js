import axios from 'axios';

// const API_BASE_URL = 'https://unwitnessed-accordingly-trey.ngrok-free.dev';
const API_BASE_URL = 'http://localhost:8080';
// 
// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // For cookies
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Don't redirect on 401 for login/register endpoints - let them handle it
        const isAuthEndpoint = error.config?.url?.includes('/login') || 
                              error.config?.url?.includes('/register') ||
                              error.config?.url?.includes('/google-auth');
        
        if (error.response?.status === 401 && !isAuthEndpoint) {
            localStorage.removeItem('authToken');
            window.location.href = '/sign';
        }
        return Promise.reject(error);
    }
);

// ==================== AUTH APIs ====================

export const authAPI = {
    register: async (formData) => {
        const response = await api.post('/register', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Auto-save token if provided (for auto-login after registration)
        if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
        }

        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/login', credentials);
        if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
        }
        return response.data;
    },

    googleAuth: async (googleData) => {
        const response = await api.post('/google-auth', googleData);
        if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
        }
        return response.data;
    },

    logout: async () => {
        try {
            // Call backend to clear cookies
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear all localStorage
            localStorage.clear();
        }
    }
};

// ==================== PACKAGE APIs ====================

export const packageAPI = {
    // Get all packages with optional status filter
    getAll: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);

        const response = await api.get(`/admin/packages${params.toString() ? '?' + params.toString() : ''}`);
        return response.data;
    },

    // Create new package
    create: async (packageData) => {
        const response = await api.post('/admin/packages', packageData);
        return response.data;
    },

    // Update existing package
    update: async (id, packageData) => {
        const response = await api.put(`/admin/packages/${id}`, packageData);
        return response.data;
    },

    // Delete package
    delete: async (id) => {
        const response = await api.delete(`/admin/packages/${id}`);
        return response.data;
    }
};

// ==================== USER MANAGEMENT APIs ====================

export const userAPI = {
    // Get all users with optional filters
    getAll: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.status) params.append('status', filters.status);
        if (filters.plan) params.append('plan', filters.plan);

        const response = await api.get(`/admin/users${params.toString() ? '?' + params.toString() : ''}`);
        return response.data;
    },

    // Update user (plan and status)
    update: async (id, updateData) => {
        const response = await api.put(`/admin/users/${id}`, updateData);
        return response.data;
    },

    // Delete user
    delete: async (id) => {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    }
};

// ==================== PROFILE APIs ====================

export const profileAPI = {
    // Get current user profile
    get: async () => {
        const response = await api.get('/user');
        return response.data;
    },

    // Update user profile (with optional profile image)
    update: async (userId, profileData) => {
        const formData = new FormData();

        // Add text fields
        if (profileData.name) formData.append('name', profileData.name);
        if (profileData.email) formData.append('email', profileData.email);
        if (profileData.phone) formData.append('phone', profileData.phone);
        if (profileData.location) formData.append('location', profileData.location);
        if (profileData.password) formData.append('password', profileData.password);

        // Add profile image if provided
        if (profileData.profileImage instanceof File) {
            formData.append('profileImage', profileData.profileImage);
        }

        const response = await api.put(`/user/${userId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Remove profile image
    removeProfileImage: async (userId) => {
        const response = await api.put(`/user/${userId}`, {
            removeProfileImage: true
        });
        return response.data;
    }
};

// ==================== DASHBOARD APIs ====================

export const dashboardAPI = {
    // Get dashboard statistics
    getStats: async () => {
        const response = await api.get('/admin/dashboard/stats');
        return response.data;
    }
};

// ==================== ANALYTICS APIs ====================

export const analyticsAPI = {
    // Get email analytics
    getEmailAnalytics: async () => {
        const response = await api.get('/admin/analytics/emails');
        return response.data;
    }
};

// ==================== CONTACT APIs ====================

export const contactAPI = {
    // Submit contact form (User)
    submit: async (contactData) => {
        const response = await api.post('/contact', contactData);
        return response.data;
    },

    // Get all contact submissions (Admin)
    getAll: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.search) params.append('search', filters.search);

        const response = await api.get(`/admin/contacts${params.toString() ? '?' + params.toString() : ''}`);
        return response.data;
    },

    // Update contact status (Admin)
    updateStatus: async (id, status) => {
        const response = await api.put(`/admin/contacts/${id}`, { status });
        return response.data;
    }
};

// ==================== SUBSCRIPTION APIs ====================

export const subscriptionAPI = {
    // Get all available packages
    getAllPackages: async () => {
        const response = await api.get('/subscription/packages');
        return response.data;
    },

    // Get current user subscription
    getMySubscription: async () => {
        const response = await api.get('/subscription/my-subscription');
        return response.data;
    },

    // Update subscription plan
    updatePlan: async (planName, billingCycle = 'monthly', paymentMethod = 'N/A') => {
        const response = await api.put('/subscription/update-plan', { planName, billingCycle, paymentMethod });
        return response.data;
    },

    // Cancel subscription
    cancel: async () => {
        const response = await api.post('/subscription/cancel');
        return response.data;
    },

    // Pause/Resume subscription
    pause: async () => {
        const response = await api.post('/subscription/pause');
        return response.data;
    },

    // ==================== STRIPE PAYMENT APIs ====================
    stripe: {
        createCheckoutSession: async (planName, billingCycle, amount, email, name) => {
            const response = await api.post('/subscription/stripe/checkout-session', {
                planName,
                billingCycle,
                amount,
                email,
                name
            });
            return response.data;
        },

        retrieveCheckoutSession: async (sessionId) => {
            const response = await api.get(`/subscription/stripe/checkout-session/${sessionId}`);
            return response.data;
        },

        createPaymentIntent: async (planName, billingCycle, amount, subtotal, tax, discount) => {
            const response = await api.post('/subscription/stripe/create-intent', {
                planName,
                billingCycle,
                amount,
                subtotal,
                tax,
                discount
            });
            return response.data;
        },

        confirmPaymentWithToken: async (paymentIntentId, token, email, name, country, zipCode) => {
            const response = await api.post('/subscription/stripe/confirm-with-token', {
                paymentIntentId,
                token,
                email,
                name,
                country,
                zipCode
            });
            return response.data;
        },

        confirmPaymentAndActivatePlan: async (paymentIntentId, planName, billingCycle) => {
            const response = await api.post('/subscription/stripe/confirm-payment', {
                paymentIntentId,
                planName,
                billingCycle
            });
            return response.data;
        },

        refundPayment: async (paymentIntentId, amount = null) => {
            const response = await api.post('/subscription/stripe/refund', {
                paymentIntentId,
                amount
            });
            return response.data;
        }
    },

    // ==================== PAYPAL PAYMENT APIs ====================
    paypal: {
        createOrder: async (planName, billingCycle, amount, subtotal, tax, discount, email, name) => {
            const response = await api.post('/subscription/paypal/create-order', {
                planName,
                billingCycle,
                amount,
                subtotal,
                tax,
                discount,
                email,
                name
            });
            return response.data;
        },

        captureOrder: async (orderId, planName, billingCycle) => {
            const response = await api.post('/subscription/paypal/capture-order', {
                orderId,
                planName,
                billingCycle
            });
            return response.data;
        },

        getOrderDetails: async (orderId) => {
            const response = await api.get(`/subscription/paypal/order/${orderId}`);
            return response.data;
        },

        refundPayment: async (captureId, amount = null) => {
            const response = await api.post('/subscription/paypal/refund', {
                captureId,
                amount
            });
            return response.data;
        }
    }
};

// ==================== DOMAIN APIs ====================

export const domainAPI = {
    // Add new domain
    add: async (domainName) => {
        const response = await api.post('/domains/add', { domainName });
        return response.data;
    },

    // Get all user domains
    getAll: async () => {
        const response = await api.get('/domains/all');
        return response.data;
    },

    // Get single domain
    get: async (domainId) => {
        const response = await api.get(`/domains/${domainId}`);
        return response.data;
    },

    // Update domain
    update: async (domainId, updateData) => {
        const response = await api.put(`/domains/${domainId}`, updateData);
        return response.data;
    },

    // Delete domain
    delete: async (domainId) => {
        const response = await api.delete(`/domains/${domainId}`);
        return response.data;
    },

    // Verify domain
    verify: async (domainId) => {
        const response = await api.post(`/domains/${domainId}/verify`);
        return response.data;
    },

    // Toggle domain status
    toggleStatus: async (domainId) => {
        const response = await api.post(`/domains/${domainId}/toggle-status`);
        return response.data;
    },

    // Get domain usage statistics
    getUsageStats: async () => {
        const response = await api.get('/domains/usage-stats');
        return response.data;
    }
};

// ==================== EMAIL APIs ====================

export const emailAPI = {
    // Check rate limit
    checkRateLimit: async (sessionId = null) => {
        const headers = sessionId ? { 'x-session-id': sessionId } : {};
        const response = await api.get('/emails/rate-limit/check', { headers });
        return response.data;
    },

    // Get usage stats
    getUsageStats: async (sessionId = null) => {
        const headers = sessionId ? { 'x-session-id': sessionId } : {};
        const response = await api.get('/emails/rate-limit/stats', { headers });
        return response.data;
    },

    // Record email generation (for rate limiting)
    recordGeneration: async (emailAddress, sessionId = null) => {
        const headers = sessionId ? { 'x-session-id': sessionId } : {};
        const response = await api.post('/emails/rate-limit/record', { emailAddress }, { headers });
        return response.data;
    },

    // Create new temporary email
    create: async (customEmail = null, domain = null, sessionId = null) => {
        const headers = sessionId ? { 'x-session-id': sessionId } : {};
        const response = await api.post('/emails/create', { customEmail, domain }, { headers });
        return response.data;
    },

    // Get active emails (persistent emails from database)
    getActiveEmails: async (sessionId = null) => {
        const headers = sessionId ? { 'x-session-id': sessionId } : {};
        const response = await api.get('/emails/active', { headers });
        return response.data;
    },

    // Get all user emails
    getAll: async () => {
        const response = await api.get('/emails/all');
        return response.data;
    },

    // Get single email
    get: async (emailId) => {
        const response = await api.get(`/emails/${emailId}`);
        return response.data;
    },

    // Delete email
    delete: async (emailId) => {
        const response = await api.delete(`/emails/${emailId}`);
        return response.data;
    },

    // Refresh/Extend email expiry
    refresh: async (emailId) => {
        const response = await api.post(`/emails/${emailId}/refresh`);
        return response.data;
    },

    // Get email inbox
    getInbox: async (emailId) => {
        const response = await api.get(`/emails/${emailId}/inbox`);
        return response.data;
    },

    // Add message to inbox (for testing)
    addMessage: async (emailId, messageData) => {
        const response = await api.post(`/emails/${emailId}/inbox/add`, messageData);
        return response.data;
    },

    // Mark message as read
    markAsRead: async (emailId, messageId) => {
        const response = await api.put(`/emails/${emailId}/inbox/${messageId}/read`);
        return response.data;
    },

    // Delete message
    deleteMessage: async (emailId, messageId) => {
        const response = await api.delete(`/emails/${emailId}/inbox/${messageId}`);
        return response.data;
    }
};

// ==================== CUSTOM DOMAIN APIs ====================

export const customDomainAPI = {
    // Add new custom domain
    add: async (domainName) => {
        const response = await api.post('/custom-domains/add', { domainName });
        return response.data;
    },

    // Verify domain (check DNS and setup email routing)
    verify: async (domainId) => {
        const response = await api.post(`/custom-domains/verify/${domainId}`);
        return response.data;
    },

    // Get all user's custom domains
    getAll: async () => {
        const response = await api.get('/custom-domains');
        return response.data;
    },

    // Delete custom domain
    delete: async (domainId) => {
        const response = await api.delete(`/custom-domains/${domainId}`);
        return response.data;
    }
};

export default api;
