import { Router } from 'express';
import {
  listFinanceiro,
  getFinanceiroById,
  createFinanceiro,
  updateFinanceiro,
  updateStatusFinanceiro,
} from '../controllers/financeiroController.js';

const router = Router();

router.get('/', listFinanceiro);
router.get('/:id', getFinanceiroById);
router.post('/', createFinanceiro);
router.put('/:id', updateFinanceiro);
router.patch('/:id/status', updateStatusFinanceiro);

export default router;
