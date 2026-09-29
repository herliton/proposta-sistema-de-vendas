import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { getRolePermissions, listModules, updateRolePermissions } from '../controllers/permissionsController.js';

const router = Router();
router.use(authMiddleware);
router.get('/modules', listModules);
router.get('/role/:role', getRolePermissions);
router.put('/role/:role', requireRole('ADMIN'), updateRolePermissions);
export default router;
