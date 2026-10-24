import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { requireModuleAccess } from '../middleware/requireModuleAccess.js';
import { createTeam, deleteTeam, getTeam, listTeams, updateTeam } from '../controllers/equipesController.js';

const router = Router();
router.use(authMiddleware, requireModuleAccess('COMMISSIONS'));
router.get('/', listTeams);
router.get('/:id', getTeam);
router.post('/', requireRole('ADMIN', 'MANAGER'), createTeam);
router.put('/:id', requireRole('ADMIN', 'MANAGER'), updateTeam);
router.delete('/:id', requireRole('ADMIN'), deleteTeam);

export default router;
