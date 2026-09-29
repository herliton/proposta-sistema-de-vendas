import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireModuleAccess } from '../middleware/requireModuleAccess.js';
import {
  listClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
} from '../controllers/clientesController.js';

const router = Router();
router.use(authMiddleware, requireModuleAccess('CUSTOMERS'));

router.get('/', listClientes);
router.get('/:id', getClienteById);
router.post('/', createCliente);
router.put('/:id', updateCliente);
router.delete('/:id', deleteCliente);

export default router;
