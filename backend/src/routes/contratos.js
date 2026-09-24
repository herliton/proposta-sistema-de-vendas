import { Router } from 'express';
import {
  listContratos,
  getContratoById,
  createContrato,
  updateStatusContrato,
} from '../controllers/contratosController.js';

const router = Router();

router.get('/', listContratos);
router.get('/:id', getContratoById);
router.post('/', createContrato);
router.patch('/:id/status', updateStatusContrato);

export default router;
