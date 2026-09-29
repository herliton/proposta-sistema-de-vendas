import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireModuleAccess } from '../middleware/requireModuleAccess.js';
import {
  listPropostas,
  getPropostaById,
  createProposta,
  updateStatusProposta,
  downloadPropostaPdf,
} from '../controllers/propostasController.js';

const router = Router();
router.use(authMiddleware, requireModuleAccess('PROPOSALS'));

router.get('/', listPropostas);
router.get('/:id/pdf', downloadPropostaPdf);
router.get('/:id', getPropostaById);
router.post('/', createProposta);
router.patch('/:id/status', updateStatusProposta);

export default router;
