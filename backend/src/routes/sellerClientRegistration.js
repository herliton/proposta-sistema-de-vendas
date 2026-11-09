import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireModuleAccess } from '../middleware/requireModuleAccess.js';
import {
  createSellerFicha,
  listSellerFichas,
  getSellerFicha,
  updateSellerFicha,
  downloadSellerFichaPdf,
} from '../controllers/sellerClientRegistrationController.js';

const router = Router();
const wrap = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

router.use(authMiddleware, requireModuleAccess('SELLER_CLIENT_REGISTRATION'));

router.get('/', wrap(listSellerFichas));
router.post('/', wrap(createSellerFicha));
router.get('/:id', wrap(getSellerFicha));
router.put('/:id', wrap(updateSellerFicha));
router.get('/:id/pdf', wrap(downloadSellerFichaPdf));

export default router;
