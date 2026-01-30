import express from 'express';
import {
    receiveEmailWebhook,
    getReceivedEmails,
    markEmailAsRead,
    deleteReceivedEmail
} from '../controllers/emailWebhookController.js';
import { optionalVerifyToken } from '../../../middlewares/tokenVerification.js';

const router = express.Router();

// Webhook endpoint (no auth - secured by webhook secret)
router.post('/email', receiveEmailWebhook);

// Email retrieval (supports both auth and session-based access)
router.get('/emails/:emailAddress', optionalVerifyToken, getReceivedEmails);
router.put('/emails/:emailId/read', optionalVerifyToken, markEmailAsRead);
router.delete('/emails/:emailId', optionalVerifyToken, deleteReceivedEmail);

export default router;
