import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireModuleAccess } from '../middleware/requireModuleAccess.js';
import {
  listContratos,
  getContratoById,
  createContrato,
  updateStatusContrato,
} from '../controllers/contratosController.js';

const router = Router();
router.use(authMiddleware, requireModuleAccess('CONTRACTS'));

router.get('/', listContratos);
router.get('/:id', getContratoById);
router.post('/', createContrato);
router.patch('/:id/status', updateStatusContrato);

export default router;
