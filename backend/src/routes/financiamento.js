import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { requireModuleAccess } from '../middleware/requireModuleAccess.js';
import { rates, benefits } from '../controllers/financiamentoController.js';

const build = (controller, moduleId, writers) => {
  const router = Router();
  router.use(authMiddleware, requireModuleAccess(moduleId));
  router.get('/', controller.list);
  router.post('/', requireRole(...writers), controller.create);
  router.put('/:id', requireRole(...writers), controller.update);
  router.delete('/:id', requireRole(...writers), controller.remove);
  return router;
};

export const ratesRoutes = build(rates, 'RATES', ['ADMIN', 'SUPPORT']);
export const benefitsRoutes = build(benefits, 'BENEFITS', ['ADMIN', 'SUPPORT']);
