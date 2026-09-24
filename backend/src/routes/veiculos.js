import { Router } from 'express';
import {
  listVeiculos,
  getVeiculoById,
  createVeiculo,
  updateVeiculo,
  deleteVeiculo,
} from '../controllers/veiculosController.js';

const router = Router();

router.get('/', listVeiculos);
router.get('/:id', getVeiculoById);
router.post('/', createVeiculo);
router.put('/:id', updateVeiculo);
router.delete('/:id', deleteVeiculo);

export default router;
