import { roleModuleIds, normalizeRole } from '../controllers/permissionsController.js';

export const requireModuleAccess = (moduleId) => async (req, res, next) => {
  try {
    const role = normalizeRole(req.user?.perfil || req.user?.role);
    if (role === 'ADMIN') return next();
    if (!(await roleModuleIds(role)).has(moduleId)) return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Seu perfil não tem acesso a este módulo.' });
    return next();
  } catch (error) { return next(error); }
};
