import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireModuleAccess } from '../middleware/requireModuleAccess.js';
import {
  listPropostas,
  getPropostaById,
  getPropostaHistory,
  createProposta,
  updateStatusProposta,
  downloadPropostaPdf,
} from '../controllers/propostasController.js';

const router = Router();
router.use(authMiddleware);

router.get('/', requireModuleAccess('PROPOSALS'), listPropostas);
router.get('/:id/pdf', requireModuleAccess('PROPOSALS'), downloadPropostaPdf);
router.get('/:id/history', requireModuleAccess('PROPOSALS'), getPropostaHistory);
router.get('/:id', requireModuleAccess('PROPOSALS'), getPropostaById);
router.post('/', requireModuleAccess('SIMULATIONS'), createProposta);
router.patch('/:id/status', requireModuleAccess('PROPOSALS'), updateStatusProposta);

export default router;
