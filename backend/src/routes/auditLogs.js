import { Router } from 'express';
import { listAuditLogs } from '../controllers/auditLogsController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, requireRole('ADMIN'), listAuditLogs);

export default router;
