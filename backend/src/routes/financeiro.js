import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireModuleAccess } from '../middleware/requireModuleAccess.js';
import {
  listFinanceiro,
  getFinanceiroById,
  createFinanceiro,
  updateFinanceiro,
  updateStatusFinanceiro,
} from '../controllers/financeiroController.js';

const router = Router();
router.use(authMiddleware, requireModuleAccess('COMMISSIONS'));

router.get('/', listFinanceiro);
router.get('/:id', getFinanceiroById);
router.post('/', createFinanceiro);
router.put('/:id', updateFinanceiro);
router.patch('/:id/status', updateStatusFinanceiro);

export default router;
