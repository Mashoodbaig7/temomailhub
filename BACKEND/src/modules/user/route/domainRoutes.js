import express from 'express';
import { 
    addDomain, 
    getUserDomains, 
    getDomain,
    updateDomain, 
    deleteDomain,
    verifyDomain,
    toggleDomainStatus,
    getDomainUsageStats
} from '../controllers/domainController.js';
import { verifyToken } from '../../../middlewares/tokenVerification.js';

const router = express.Router();

// All routes require authentication
router.post('/add', verifyToken, addDomain);
router.get('/usage-stats', verifyToken, getDomainUsageStats);
router.get('/all', verifyToken, getUserDomains);
router.get('/:domainId', verifyToken, getDomain);
router.put('/:domainId', verifyToken, updateDomain);
router.delete('/:domainId', verifyToken, deleteDomain);
router.post('/:domainId/verify', verifyToken, verifyDomain);
router.post('/:domainId/toggle-status', verifyToken, toggleDomainStatus);

export default router;
