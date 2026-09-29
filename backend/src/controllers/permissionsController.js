import { prisma } from '../config/database.js';
import { ok } from '../utils/response.js';
import { roles, systemModules, defaultRoleModules } from '../data/systemModules.js';

export const normalizeRole = (value) => {
  const role = String(value || '').trim().toUpperCase();
  if (role === 'ADMINISTRADOR') return 'ADMIN';
  if (role === 'GERENTE') return 'MANAGER';
  if (role === 'VENDEDOR') return 'SELLER';
  if (role === 'SUPORTE') return 'SUPPORT';
  return role;
};

export const roleModuleIds = async (rawRole) => {
  const role = normalizeRole(rawRole);
  if (role === 'ADMIN') return new Set(systemModules.map((module) => module.id));
  const rows = await prisma.rolePermission.findMany({ where: { role }, select: { moduleId: true, canAccess: true } });
  const permissions = new Map(rows.map((item) => [item.moduleId, item.canAccess]));
  const selected = new Set(systemModules.filter((module) => permissions.has(module.id) ? permissions.get(module.id) : module.defaultRoles.includes(role)).map((module) => module.id));
  if (role === 'MANAGER') for (const moduleId of await roleModuleIds('SELLER')) selected.add(moduleId);
  return new Set([...selected].filter((moduleId) => systemModules.some((module) => module.id === moduleId)));
};

export const listModules = async (_req, res) => {
  const roleAccess = Object.fromEntries(await Promise.all(roles.map(async (role) => [role, [...await roleModuleIds(role)]])));
  const modules = systemModules.map((item) => ({ ...item }));
  return ok(res, { modules, roles, roleAccess });
};

export const getRolePermissions = async (req, res) => {
  const role = normalizeRole(req.params.role);
  if (!roles.includes(role)) return res.status(400).json({ success: false, error: 'BAD_ROLE', message: 'Perfil inválido.' });
  const requesterRole = normalizeRole(req.user?.perfil || req.user?.role);
  if (requesterRole !== 'ADMIN' && requesterRole !== role) return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Você só pode consultar as permissões do seu próprio perfil.' });
  const moduleIds = [...await roleModuleIds(role)];
  return ok(res, { role, moduleIds, allowedModules: systemModules.filter((module) => moduleIds.includes(module.id)).map((module) => module.label) });
};

export const updateRolePermissions = async (req, res) => {
  const role = normalizeRole(req.params.role);
  if (!roles.includes(role)) return res.status(400).json({ success: false, error: 'BAD_ROLE', message: 'Perfil inválido.' });
  if (role === 'ADMIN') return res.status(400).json({ success: false, error: 'ADMIN_LOCKED', message: 'O perfil ADMIN mantém acesso total ao sistema.' });
  const moduleIds = req.body.moduleIds;
  if (!Array.isArray(moduleIds) || moduleIds.some((id) => !systemModules.some((module) => module.id === id))) return res.status(400).json({ success: false, error: 'BAD_MODULES', message: 'A lista de módulos contém valores inválidos.' });
  await prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({ where: { role } });
    if (moduleIds.length) await tx.rolePermission.createMany({ data: [...new Set(moduleIds)].map((moduleId) => ({ role, moduleId, canAccess: true })) });
    const denied = systemModules.filter((module) => !moduleIds.includes(module.id));
    if (denied.length) await tx.rolePermission.createMany({ data: denied.map((module) => ({ role, moduleId: module.id, canAccess: false })) });
  });
  const updatedIds = [...await roleModuleIds(role)];
  return ok(res, { role, moduleIds: updatedIds, allowedModules: systemModules.filter((module) => updatedIds.includes(module.id)).map((module) => module.label) }, 'Permissões atualizadas.');
};
