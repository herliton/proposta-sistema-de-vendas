import { Router } from 'express';
import {
  listPropostas,
  getPropostaById,
  createProposta,
  updateStatusProposta,
} from '../controllers/propostasController.js';

const router = Router();

router.get('/', listPropostas);
router.get('/:id', getPropostaById);
router.post('/', createProposta);
router.patch('/:id/status', updateStatusProposta);

export default router;
