import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticação ausente',
      error: 'UNAUTHORIZED',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = decoded;
    if (Object.hasOwn(decoded, 'lojaId')) return next();
    import('../config/database.js').then(({ prisma }) => prisma.usuario.findUnique({ where: { id: Number(decoded.id) }, select: { lojaId: true } }))
      .then((user) => { req.user.lojaId = user?.lojaId ?? null; next(); })
      .catch(next);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      error: 'INVALID_TOKEN',
    });
  }
};


export const requireRole = (...allowedRoles) => (req, res, next) => {
  const role = String(req.user?.perfil || req.user?.role || '').toUpperCase();
  if (allowedRoles.map((item) => item.toUpperCase()).includes(role)) return next();
  return res.status(403).json({ success: false, message: 'Acesso permitido somente a administradores', error: 'FORBIDDEN' });
};
