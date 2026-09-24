import { Router } from 'express';
import {
  listVendedores,
  getVendedorById,
  createVendedor,
  updateVendedor,
  deleteVendedor,
} from '../controllers/vendedoresController.js';

const router = Router();

router.get('/', listVendedores);
router.get('/:id', getVendedorById);
router.post('/', createVendedor);
router.put('/:id', updateVendedor);
router.delete('/:id', deleteVendedor);

export default router;
