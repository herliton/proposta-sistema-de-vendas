import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { requireModuleAccess } from '../middleware/requireModuleAccess.js';
import { processVehicleUpload } from '../middleware/vehicleUpload.js';
import {
  listVeiculos,
  lookupFipe,
  fipeBrands,
  fipeModels,
  fipeYears,
  fipePrice,
  uploadVehicleMedia,
  getVeiculoById,
  createVeiculo,
  updateVeiculo,
  deleteVeiculo,
} from '../controllers/veiculosController.js';

const router = Router();
router.use(authMiddleware, requireModuleAccess('VEHICLES'));

router.get('/', listVeiculos);
router.get('/fipe/brands', fipeBrands);
router.get('/fipe/brands/:brandId/models', fipeModels);
router.get('/fipe/brands/:brandId/models/:modelId/years', fipeYears);
router.get('/fipe/brands/:brandId/models/:modelId/years/:yearId', fipePrice);
router.get('/fipe/:fipeCode', lookupFipe);
router.post('/media/:kind', requireRole('ADMIN', 'MANAGER', 'SUPPORT'), (req, res, next) => {
  if (!['photo', 'video'].includes(req.params.kind)) return res.status(400).json({ success: false, error: 'BAD_MEDIA_KIND', message: 'Tipo de arquivo inválido.' });
  return next();
}, processVehicleUpload, uploadVehicleMedia);
router.get('/:id', getVeiculoById);
router.post('/', requireRole('ADMIN', 'MANAGER', 'SUPPORT'), createVeiculo);
router.put('/:id', requireRole('ADMIN', 'MANAGER', 'SUPPORT'), updateVeiculo);
router.delete('/:id', requireRole('ADMIN', 'MANAGER', 'SUPPORT'), deleteVeiculo);

export default router;
