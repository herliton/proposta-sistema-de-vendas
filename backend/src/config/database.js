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
  await prisma.$transaction(async (tx) => {
    for (const module of systemModules) {
      await tx.systemModule.upsert({
        where: { id: module.id },
        create: {
          id: module.id,
          name: module.label,
          route: moduleRouteFor(module.id),
          icon: moduleIconFor(module.id),
        },
        update: {
          name: module.label,
          route: moduleRouteFor(module.id),
          icon: moduleIconFor(module.id),
        },
      });
    }

    for (const role of roles) {
      const allowed = new Set(defaultRoleModules[role] || []);
      if (role === 'MANAGER') {
        for (const moduleId of defaultRoleModules.SELLER || []) {
          allowed.add(moduleId);
        }
      }

      for (const module of systemModules) {
        const canAccess = allowed.has(module.id);
        await tx.rolePermission.upsert({
          where: { role_moduleId: { role, moduleId: module.id } },
          create: { role, moduleId: module.id, canAccess },
          update: { canAccess },
        });
      }
    }
  });
};
