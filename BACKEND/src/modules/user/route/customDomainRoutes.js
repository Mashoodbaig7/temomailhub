import express from 'express';
import {
    addDomain,
    verifyDomain,
    getUserDomains,
    deleteDomain
} from '../controllers/customDomainController.js';

const router = express.Router();

/**
 * Custom Domain Routes
 * All routes require authentication (tokenVerification middleware should be applied in main router)
 */

/**
 * @route   POST /api/user/domains/add
 * @desc    Add a new custom domain
 * @access  Private
 * @body    { domainName: string }
 */
router.post('/add', addDomain);

/**
 * @route   POST /api/user/domains/verify/:domainId
 * @desc    Verify domain and setup email routing
 * @access  Private
 * @params  domainId (MongoDB ObjectId)
 */
router.post('/verify/:domainId', verifyDomain);

/**
 * @route   GET /api/user/domains
 * @desc    Get all domains for authenticated user
 * @access  Private
 */
router.get('/', getUserDomains);

/**
 * @route   DELETE /api/user/domains/:domainId
 * @desc    Delete a custom domain
 * @access  Private
 * @params  domainId (MongoDB ObjectId)
 */
router.delete('/:domainId', deleteDomain);

export default router;
