import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireModuleAccess } from '../middleware/requireModuleAccess.js';
import { requireRole } from '../middleware/auth.js';
import { downloadCommissionReport, getCommissionSummary, getCommissionRules, updateCommissionRules } from '../controllers/reportsController.js';

const router = Router();
router.use(authMiddleware, requireModuleAccess('COMMISSIONS'));
router.get('/commissions.pdf', downloadCommissionReport);
router.get('/commissions', getCommissionSummary);
router.get('/commission-rules', getCommissionRules);
router.put('/commission-rules', requireRole('ADMIN'), updateCommissionRules);
export default router;
