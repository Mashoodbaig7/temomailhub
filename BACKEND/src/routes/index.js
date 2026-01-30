import { Router } from 'express';
import authRoutes from '../modules/auth/route/authRoutes.js';
import userRoutes from '../modules/user/route/userRoutes.js';
import adminRoutes from '../modules/admin/route/adminRoutes.js';
import subscriptionRoutes from '../modules/user/route/subscriptionRoutes.js';
import domainRoutes from '../modules/user/route/domainRoutes.js';
import customDomainRoutes from '../modules/user/route/customDomainRoutes.js';
import emailRoutes from '../modules/user/route/emailRoutes.js';
import webhookRoutes from '../modules/webhook/route/webhookRoutes.js';
import tokenVerification from '../middlewares/tokenVerification.js';

const router = Router();

router.use('/', authRoutes);
router.use('/', userRoutes);
router.use('/', adminRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/domains', domainRoutes);
router.use('/custom-domains', tokenVerification, customDomainRoutes); // Protected custom domain routes
router.use('/emails', emailRoutes);
router.use('/api/webhook', webhookRoutes);

export default router;