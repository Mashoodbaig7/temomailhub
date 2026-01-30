import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
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
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('isAdminAuthenticated');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

// ==================== ADMIN AUTHENTICATION ====================

export const adminAuthAPI = {
    login: async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/admin/login`, {
                email,
                password
            });
            return response.data;
        } catch (error) {
            console.error('Admin login error:', error);
            throw error.response?.data || { message: 'Login failed' };
        }
    }
};

// ==================== ADMIN PROFILE APIs ====================

export const adminAPI = {
    getAdminProfile: async () => {
        try {
            const response = await api.get('/admin/profile');
            return response.data;
        } catch (error) {
            console.error('Error fetching admin profile:', error);
            throw error;
        }
    },

    updateAdminEmail: async (email) => {
        try {
            const response = await api.put('/admin/profile/email', { email });
            return response.data;
        } catch (error) {
            console.error('Error updating email:', error);
            throw error;
        }
    },

    updateAdminPassword: async (currentPassword, newPassword, confirmPassword) => {
        try {
            const response = await api.put('/admin/profile/password', {
                currentPassword,
                newPassword,
                confirmPassword
            });
            return response.data;
        } catch (error) {
            console.error('Error updating password:', error);
            throw error;
        }
    }
};

// Backward compatibility exports
export const updateEmail = async (newEmail) => {
    try {
        const response = await api.put('/admin/profile/email', { email: newEmail });
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error updating email:', error);
        return { success: false, error: error.response?.data?.message || 'Failed to update email' };
    }
};

export const updatePassword = async (currentPassword, newPassword) => {
    try {
        const response = await api.put('/admin/profile/password', {
            currentPassword,
            newPassword
        });
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error updating password:', error);
        return { success: false, error: error.response?.data?.message || 'Failed to update password' };
    }
};

// ==================== PACKAGE MANAGEMENT ====================

export const packageAPI = {
    getAll: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        
        const response = await api.get(`/admin/packages${params.toString() ? '?' + params.toString() : ''}`);
        return response.data;
    },

    create: async (packageData) => {
        const response = await api.post('/admin/packages', packageData);
        return response.data;
    },

    update: async (id, packageData) => {
        const response = await api.put(`/admin/packages/${id}`, packageData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/admin/packages/${id}`);
        return response.data;
    }
};

// ==================== USER MANAGEMENT ====================

export const userAPI = {
    getAll: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.status) params.append('status', filters.status);
        if (filters.plan) params.append('plan', filters.plan);
        
        const response = await api.get(`/admin/users${params.toString() ? '?' + params.toString() : ''}`);
        return response.data;
    },

    update: async (id, updateData) => {
        const response = await api.put(`/admin/users/${id}`, updateData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    }
};

// ==================== DASHBOARD ====================

export const dashboardAPI = {
    getStats: async () => {
        const response = await api.get('/admin/dashboard/stats');
        return response.data;
    }
};

// ==================== ANALYTICS ====================

export const analyticsAPI = {
    getEmailAnalytics: async () => {
        const response = await api.get('/admin/analytics/emails');
        return response.data;
    }
};

// ==================== CONTACT SUBMISSIONS ====================

export const contactAPI = {
    getAll: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.search) params.append('search', filters.search);
        
        const response = await api.get(`/admin/contacts${params.toString() ? '?' + params.toString() : ''}`);
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await api.put(`/admin/contacts/${id}`, { status });
        return response.data;
    }
};

export default api;