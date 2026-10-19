import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticação ausente',
      error: 'UNAUTHORIZED',
    });
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      error: 'INVALID_TOKEN',
    });
  }

  try {
    const userId = Number(decoded.id);
    if (!Number.isSafeInteger(userId) || userId < 1) {
      return res.status(401).json({ success: false, message: 'Token inválido', error: 'INVALID_TOKEN' });
    }
    const currentUser = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true, email: true, perfil: true, status: true, lojaId: true, firstAccess: true },
    });
    if (!currentUser || currentUser.status === 'inativo') {
      return res.status(401).json({ success: false, message: 'A conta foi desativada ou não está disponível.', error: 'ACCOUNT_INACTIVE' });
    }
    req.user = { ...decoded, ...currentUser };
    return next();
  } catch (error) {
    return next(error);
  }
};


export const requireRole = (...allowedRoles) => (req, res, next) => {
  const aliases = { ADMINISTRADOR: 'ADMIN', GERENTE: 'MANAGER', VENDEDOR: 'SELLER', SUPORTE: 'SUPPORT' };
  const role = String(req.user?.perfil || req.user?.role || '').trim().toUpperCase();
  const normalizedRole = aliases[role] || role;
  if (allowedRoles.map((item) => item.toUpperCase()).includes(normalizedRole)) return next();
  return res.status(403).json({ success: false, message: 'Acesso permitido somente a administradores', error: 'FORBIDDEN' });
};
