import express from 'express';
import {
    createTempEmail,
    getUserEmails,
    getActiveEmails,
    getEmail,
    deleteEmail,
    refreshEmail,
    getEmailInbox,
    addMessageToInbox,
    markMessageAsRead,
    deleteMessage,
    checkRateLimit,
    getUsageStats,
    recordGeneration
} from '../controllers/emailController.js';
import { verifyToken, optionalVerifyToken } from '../../../middlewares/tokenVerification.js';

const router = express.Router();

// Rate limit routes (optionally authenticated - will use token if present)
router.get('/rate-limit/check', optionalVerifyToken, checkRateLimit);
router.get('/rate-limit/stats', optionalVerifyToken, getUsageStats);
router.post('/rate-limit/record', optionalVerifyToken, recordGeneration);

// Email generation and retrieval
router.post('/create', optionalVerifyToken, createTempEmail); // Supports both auth and non-auth
router.get('/active', optionalVerifyToken, getActiveEmails); // Get active emails for current user/session
router.get('/all', verifyToken, getUserEmails);
router.get('/:emailId', verifyToken, getEmail);
router.delete('/:emailId', verifyToken, deleteEmail);
router.post('/:emailId/refresh', verifyToken, refreshEmail);

// Inbox management
router.get('/:emailId/inbox', verifyToken, getEmailInbox);
router.post('/:emailId/inbox/add', verifyToken, addMessageToInbox); // For testing
router.put('/:emailId/inbox/:messageId/read', verifyToken, markMessageAsRead);
router.delete('/:emailId/inbox/:messageId', verifyToken, deleteMessage);

export default router;
