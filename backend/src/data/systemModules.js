export const roles = ['ADMIN', 'MANAGER', 'SELLER', 'SUPPORT'];

export const systemModules = [
  { id: 'DASHBOARD', label: 'Dashboard', defaultRoles: ['ADMIN'] },
  { id: 'SIMULATIONS', label: 'Simulações', defaultRoles: ['ADMIN', 'MANAGER', 'SELLER'] },
  { id: 'PROPOSALS', label: 'Propostas', defaultRoles: ['ADMIN', 'MANAGER', 'SELLER', 'SUPPORT'] },
  { id: 'CONTRACTS', label: 'Contratos', defaultRoles: ['ADMIN', 'MANAGER', 'SELLER', 'SUPPORT'] },
  { id: 'CUSTOMERS', label: 'Clientes', defaultRoles: ['ADMIN', 'MANAGER', 'SELLER'] },
  { id: 'CREDIT_RECOVERY', label: 'Recuperação de crédito', defaultRoles: ['ADMIN', 'MANAGER', 'SELLER', 'SUPPORT'] },
  { id: 'SHOWCASE', label: 'Classificados', defaultRoles: ['ADMIN', 'MANAGER', 'SELLER'] },
  { id: 'VEHICLES', label: 'Veículos', defaultRoles: ['ADMIN', 'MANAGER', 'SELLER', 'SUPPORT'] },
  { id: 'RATES', label: 'Taxas e tabelas', defaultRoles: ['ADMIN', 'MANAGER', 'SELLER', 'SUPPORT'] },
  { id: 'BENEFITS', label: 'Benefícios', defaultRoles: ['ADMIN', 'MANAGER', 'SELLER'] },
  { id: 'USERS', label: 'Usuários e perfis', defaultRoles: ['ADMIN'] },
  { id: 'STORES', label: 'Lojas', defaultRoles: ['ADMIN'] },
  { id: 'MANAGER_DASHBOARD', label: 'Painel do gerente', defaultRoles: ['ADMIN', 'MANAGER'] },
  { id: 'TEAM', label: 'Minha equipe', defaultRoles: ['ADMIN', 'MANAGER'] },
  { id: 'SUPPORT_DASHBOARD', label: 'Painel de suporte', defaultRoles: ['ADMIN', 'SUPPORT'] },
  { id: 'COMMISSIONS', label: 'Equipes e comissões', defaultRoles: ['ADMIN', 'MANAGER', 'SUPPORT'] },
  { id: 'REPORTS', label: 'Relatórios', defaultRoles: ['ADMIN', 'MANAGER', 'SUPPORT'] },
  { id: 'SETTINGS', label: 'Configurações', defaultRoles: ['ADMIN'] },
  { id: 'ACCESS_PERMISSIONS', label: 'Permissões de acesso', defaultRoles: ['ADMIN'] },
];

export const defaultRoleModules = Object.fromEntries(roles.map((role) => [
  role,
  systemModules.filter((module) => module.defaultRoles.includes(role)).map((module) => module.id),
]));
