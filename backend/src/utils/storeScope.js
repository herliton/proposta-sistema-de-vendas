const roleOf = (user) => String(user?.perfil || user?.role || '').toUpperCase();
export const storeScope = (user, field = 'lojaId') => {
  if (user?.lojaId !== null && user?.lojaId !== undefined) return { [field]: Number(user.lojaId) || -1 };
  return ['ADMIN', 'SUPPORT'].includes(roleOf(user)) ? {} : { [field]: -1 };
};
export const writeStoreId = (user, requested) => {
  const role = roleOf(user);
  const id = Number(requested || user?.lojaId || 0);
  if (id > 0) return id;
  if (['ADMIN', 'SUPPORT'].includes(role)) return null;
  return Number(user?.lojaId) || null;
};
