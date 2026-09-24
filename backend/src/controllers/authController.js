import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { created, ok } from '../utils/response.js';
import { readStore, writeStore, createId, ensureDefaultAdmin } from '../store.js';

export const register = async (req, res) => {
  const { nome, email, senha, perfil } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({
      success: false,
      message: 'Nome, email e senha são obrigatórios',
      error: 'BAD_REQUEST',
    });
  }

  const store = readStore();
  const existingUser = store.usuarios.find((user) => user.email === email);

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'Usuário com este e-mail já existe',
      error: 'USER_EXISTS',
    });
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const newUser = {
    id: createId('usuarios'),
    nome,
    email,
    senhaHash,
    perfil: perfil || 'vendedor',
    status: 'ativo',
    createdAt: new Date().toISOString(),
  };

  store.usuarios.push(newUser);
  writeStore(store);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, perfil: newUser.perfil }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '8h',
  });

  return created(res, {
    user: {
      id: newUser.id,
      nome: newUser.nome,
      email: newUser.email,
      perfil: newUser.perfil,
    },
    token,
  }, 'Usuário criado com sucesso');
};

export const login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      success: false,
      message: 'Email e senha são obrigatórios',
      error: 'BAD_REQUEST',
    });
  }

  await ensureDefaultAdmin();

  const store = readStore();
  const user = store.usuarios.find((item) => item.email === email.trim().toLowerCase());

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Credenciais inválidas',
      error: 'INVALID_CREDENTIALS',
    });
  }

  const validPassword = await bcrypt.compare(senha, user.senhaHash);

  if (!validPassword) {
    return res.status(401).json({
      success: false,
      message: 'Credenciais inválidas',
      error: 'INVALID_CREDENTIALS',
    });
  }

  const token = jwt.sign({ id: user.id, email: user.email, perfil: user.perfil }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '8h',
  });

  return ok(res, {
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      perfil: user.perfil,
    },
    token,
  }, 'Login realizado com sucesso');
};
