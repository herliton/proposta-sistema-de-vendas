import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireModuleAccess } from '../middleware/requireModuleAccess.js';
import { registerCreditConsultancy } from '../controllers/creditRecoveryController.js';
const router = Router();
router.use(authMiddleware, requireModuleAccess('CREDIT_RECOVERY'));
router.post('/:id/credit-consultancy', registerCreditConsultancy);
export default router;
