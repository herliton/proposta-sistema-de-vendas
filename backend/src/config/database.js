import { PrismaClient } from '@prisma/client';
import { defaultRoleModules, roles, systemModules } from '../data/systemModules.js';

export const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

const moduleRouteFor = (moduleId) => `/${moduleId.toLowerCase().replaceAll('_', '-')}`;
const moduleIconFor = (moduleId) => ({
  DASHBOARD: 'home',
  SIMULATIONS: 'calculator',
  PROPOSALS: 'proposal',
  CONTRACTS: 'contract',
  CUSTOMERS: 'users',
  CREDIT_RECOVERY: 'trend',
  SHOWCASE: 'car',
  VEHICLES: 'car',
  RATES: 'percent',
  BENEFITS: 'gift',
  USERS: 'users',
  STORES: 'home',
  MANAGER_DASHBOARD: 'home',
  TEAM: 'users',
  SUPPORT_DASHBOARD: 'trend',
  COMMISSIONS: 'chart',
  REPORTS: 'file',
  SETTINGS: 'settings',
  ACCESS_PERMISSIONS: 'settings',
})[moduleId] || null;

export const ensureSystemSeed = async () => {
  const modules = systemModules.map((module) => ({
    id: module.id,
    name: module.label,
    route: moduleRouteFor(module.id),
    icon: moduleIconFor(module.id),
  }));
  const permissions = roles.flatMap((role) => {
    const allowed = new Set(defaultRoleModules[role] || []);
    if (role === 'MANAGER') {
      for (const moduleId of defaultRoleModules.SELLER || []) {
        allowed.add(moduleId);
      }
    }

    return systemModules.map((module) => ({
      role,
      moduleId: module.id,
      canAccess: allowed.has(module.id),
    }));
  });

  await prisma.$transaction(async (tx) => {
    await tx.systemModule.createMany({ data: modules, skipDuplicates: true });
    await tx.rolePermission.createMany({ data: permissions, skipDuplicates: true });
  });
};
