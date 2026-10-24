import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireModuleAccess } from '../middleware/requireModuleAccess.js';
import {
  listVendedores,
  getVendedorById,
  createVendedor,
  updateVendedor,
  deleteVendedor,
} from '../controllers/vendedoresController.js';

const router = Router();
router.use(authMiddleware, requireModuleAccess('TEAM'));

router.get('/', listVendedores);
router.get('/:id', getVendedorById);
router.post('/', createVendedor);
router.put('/:id', updateVendedor);
router.delete('/:id', deleteVendedor);

export default router;
