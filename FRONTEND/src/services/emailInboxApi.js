import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Create axios instance with credentials
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add session ID and auth token to all requests
apiClient.interceptors.request.use((config) => {
    // Add session ID
    const sessionId = localStorage.getItem('sessionId') || generateSessionId();
    localStorage.setItem('sessionId', sessionId);
    config.headers['x-session-id'] = sessionId;

    // Add auth token if available (for authenticated users)
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Generate unique session ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Get received emails for a temp email address
 */
export const getReceivedEmails = async (emailAddress) => {
    try {
        // Ensure email is trimmed and lowercased and URL-encoded to avoid routing issues
        const normalized = encodeURIComponent((emailAddress || '').toString().trim().toLowerCase());
        const response = await apiClient.get(`/api/webhook/emails/${normalized}`);
        return response.data;
    } catch (error) {
        // Don't log 410 errors (expired emails) to console as they're expected
        if (error.response?.status !== 410) {
            console.error('Get received emails error:', error);
        }
        
        // For 410 (Gone/Expired), throw the error so it can be caught upstream
        if (error.response?.status === 410) {
            throw error;
        }
        
        // Return the backend response if available, otherwise a normalized error object
        const payload = error.response?.data || { success: false, message: error.message || 'Failed to get emails' };
        return payload;
    }
};

/**
 * Mark email as read
 */
export const markEmailAsRead = async (emailId) => {
    try {
        const response = await apiClient.put(`/api/webhook/emails/${emailId}/read`);
        return response.data;
    } catch (error) {
        console.error('Mark as read error:', error);
        throw error.response?.data || { success: false, message: 'Failed to mark email as read' };
    }
};

/**
 * Delete received email
 */
export const deleteReceivedEmail = async (emailId) => {
    try {
        const response = await apiClient.delete(`/api/webhook/emails/${emailId}`);
        return response.data;
    } catch (error) {
        console.error('Delete email error:', error);
        throw error.response?.data || { success: false, message: 'Failed to delete email' };
    }
};

export default {
    getReceivedEmails,
    markEmailAsRead,
    deleteReceivedEmail
};
