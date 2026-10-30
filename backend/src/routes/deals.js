import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireModuleAccess } from '../middleware/requireModuleAccess.js';
import { registerCreditConsultancy } from '../controllers/creditRecoveryController.js';
import { getPropostaHistory } from '../controllers/propostasController.js';
const router = Router();
router.post('/:id/credit-consultancy', authMiddleware, requireModuleAccess('CREDIT_RECOVERY'), registerCreditConsultancy);
router.get('/:id/history', authMiddleware, requireModuleAccess('PROPOSALS'), getPropostaHistory);
export default router;
