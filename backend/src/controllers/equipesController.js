import { prisma } from '../config/database.js';
import { normalizeRole } from './permissionsController.js';
import { created, notFound, ok } from '../utils/response.js';
import { storeScope } from '../utils/storeScope.js';
import { createUser } from './authController.js';

const roleOf = (user) => normalizeRole(user?.perfil || user?.role);
const teamScope = (user) => {
  const store = storeScope(user);
  return roleOf(user) === 'MANAGER'
    ? { AND: [store, { gerenteId: Number(user.id) }] }
    : store;
};
const teamInclude = {
  gerente: { select: { id: true, nome: true, email: true, status: true } },
  loja: { select: { id: true, nome: true } },
  _count: { select: { membros: true } },
};
const teamListInclude = {
  ...teamInclude,
  membros: { select: { id: true, nome: true, email: true, perfil: true, status: true, gerenteId: true }, orderBy: { nome: 'asc' } },
};

const validName = (value) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 120;

export const listTeams = async (req, res) => {
  const rows = await prisma.equipe.findMany({
    where: { ...teamScope(req.user), deletedAt: null },
    include: teamListInclude,
    orderBy: { nome: 'asc' },
  });
  return ok(res, rows, 'Equipes carregadas.');
};

export const getTeam = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'Identificador de equipe inválido.' });
  const team = await prisma.equipe.findFirst({
    where: { AND: [teamScope(req.user), { id, deletedAt: null }] },
    include: {
      ...teamInclude,
      membros: { select: { id: true, nome: true, email: true, perfil: true, status: true, createdAt: true }, orderBy: { nome: 'asc' } },
    },
  });
  if (!team) return notFound(res, 'Equipe não encontrada.');
  return ok(res, team, 'Equipe carregada.');
};

export const createTeam = async (req, res) => {
  const nome = typeof req.body.nome === 'string' ? req.body.nome.trim() : '';
  const gerenteId = Number(req.body.gerenteId);
  const lojaId = roleOf(req.user) === 'ADMIN' ? Number(req.body.lojaId) : Number(req.user.lojaId);
  if (!validName(nome)) return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'Informe o nome da equipe (até 120 caracteres).' });
  if (!Number.isInteger(gerenteId) || gerenteId < 1 || !Number.isInteger(lojaId) || lojaId < 1) {
    return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'Selecione um gerente e uma loja válidos.' });
  }
  if (roleOf(req.user) === 'MANAGER' && gerenteId !== Number(req.user.id)) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Um gerente só pode criar uma equipe para si mesmo.' });
  }
  const [manager, store] = await Promise.all([
    prisma.usuario.findFirst({ where: { id: gerenteId, perfil: { in: ['MANAGER', 'GERENTE'] }, status: 'ativo', lojaId }, select: { id: true } }),
    prisma.loja.findFirst({ where: { id: lojaId, status: 'ativo' }, select: { id: true } }),
  ]);
  if (!manager) return res.status(400).json({ success: false, error: 'INVALID_MANAGER', message: 'O gerente deve estar ativo e vinculado à loja selecionada.' });
  if (!store) return res.status(400).json({ success: false, error: 'INVALID_STORE', message: 'A loja selecionada não existe ou está inativa.' });
  if (await prisma.equipe.findFirst({ where: { gerenteId, lojaId, status: 'ativo', deletedAt: null }, select: { id: true } })) {
    return res.status(409).json({ success: false, error: 'TEAM_CONFLICT', message: 'Este gerente já possui uma equipe ativa nesta loja.' });
  }
  const memberIds = req.body.memberIds;
  if (memberIds !== undefined && (!Array.isArray(memberIds) || memberIds.some((memberId) => !Number.isInteger(Number(memberId)) || Number(memberId) < 1))) {
    return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'A lista de membros é inválida.' });
  }
  const selectedMemberIds = memberIds?.map(Number);
  if (selectedMemberIds && selectedMemberIds.length !== new Set(selectedMemberIds).size) {
    return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'A lista contém membros duplicados.' });
  }
  const members = selectedMemberIds
    ? await prisma.usuario.findMany({
      where: {
        id: { in: selectedMemberIds },
        perfil: { in: ['SELLER', 'VENDEDOR'] },
        status: 'ativo',
        lojaId,
      },
      select: { id: true },
    })
    : [];
  if (selectedMemberIds && members.length !== selectedMemberIds.length) {
    return res.status(400).json({ success: false, error: 'INVALID_MEMBERS', message: 'Selecione vendedores ativos da loja e do escopo autorizado.' });
  }

  try {
    const team = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM Usuario WHERE id = ${gerenteId} FOR UPDATE`;
      if (await tx.equipe.findFirst({ where: { gerenteId, lojaId, status: 'ativo', deletedAt: null }, select: { id: true } })) {
        const conflict = new Error('O gerente já possui uma equipe ativa nesta loja.');
        conflict.code = 'ACTIVE_TEAM_EXISTS';
        throw conflict;
      }
      const createdTeam = await tx.equipe.create({
        data: { nome, gerenteId, lojaId },
        include: teamInclude,
      });
      let movedFrom = [];
      if (selectedMemberIds?.length) {
        movedFrom = (await tx.usuario.findMany({ where: { id: { in: selectedMemberIds }, equipeId: { not: null } }, select: { id: true, equipeId: true } })).map((item) => ({ usuarioId: item.id, equipeId: item.equipeId }));
        await tx.usuario.updateMany({ where: { id: { in: selectedMemberIds } }, data: { equipeId: createdTeam.id, gerenteId } });
      } else if (!selectedMemberIds) {
        await tx.usuario.updateMany({
          where: { gerenteId, lojaId, equipeId: null, status: { not: 'inativo' } },
          data: { equipeId: createdTeam.id },
        });
      }
      await tx.auditLog.create({
        data: { actorId: Number(req.user.id), action: 'TEAM_CREATED', details: { equipeId: createdTeam.id, gerenteId, lojaId, movedFrom } },
      });
      return tx.equipe.findUnique({ where: { id: createdTeam.id }, include: teamListInclude });
    });
    return created(res, team, 'Equipe criada.');
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ success: false, error: 'TEAM_CONFLICT', message: 'Já existe uma equipe com este nome nesta loja.' });
    if (error.code === 'ACTIVE_TEAM_EXISTS') return res.status(409).json({ success: false, error: 'TEAM_CONFLICT', message: error.message });
    throw error;
  }
};

export const updateTeam = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'Identificador de equipe inválido.' });
  const role = roleOf(req.user);
  if (role !== 'ADMIN' && role !== 'MANAGER') return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Seu perfil não pode alterar equipes.' });
  const existing = await prisma.equipe.findFirst({
    where: { AND: [teamScope(req.user), { id, deletedAt: null }] },
    include: { membros: { select: { id: true, gerenteId: true } } },
  });
  if (!existing) return notFound(res, 'Equipe não encontrada.');
  const nome = req.body.nome === undefined ? existing.nome : typeof req.body.nome === 'string' ? req.body.nome.trim() : '';
  if (!validName(nome)) return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'Informe o nome da equipe (até 120 caracteres).' });
  if (role === 'MANAGER' && req.body.gerenteId !== undefined && Number(req.body.gerenteId) !== existing.gerenteId) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Somente ADMIN pode transferir uma equipe para outro gerente.' });
  }
  const gerenteId = role === 'ADMIN' && req.body.gerenteId !== undefined ? Number(req.body.gerenteId) : existing.gerenteId;
  if (!Number.isInteger(gerenteId) || gerenteId < 1) return res.status(400).json({ success: false, error: 'INVALID_MANAGER', message: 'Selecione um gerente válido.' });
  if (gerenteId !== existing.gerenteId) {
    const manager = await prisma.usuario.findFirst({ where: { id: gerenteId, perfil: { in: ['MANAGER', 'GERENTE'] }, status: 'ativo', lojaId: existing.lojaId }, select: { id: true } });
    if (!manager) return res.status(400).json({ success: false, error: 'INVALID_MANAGER', message: 'O novo gerente deve estar ativo e vinculado à loja da equipe.' });
    if (await prisma.equipe.findFirst({ where: { gerenteId, lojaId: existing.lojaId, status: 'ativo', deletedAt: null, id: { not: id } }, select: { id: true } })) {
      return res.status(409).json({ success: false, error: 'TEAM_CONFLICT', message: 'O gerente já possui outra equipe ativa nesta loja.' });
    }
  }
  const memberIds = req.body.memberIds;
  if (memberIds !== undefined && (!Array.isArray(memberIds) || memberIds.some((memberId) => !Number.isInteger(Number(memberId)) || Number(memberId) < 1))) {
    return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'A lista de membros é inválida.' });
  }
  const selectedMemberIds = memberIds?.map(Number);
  if (selectedMemberIds && selectedMemberIds.length !== new Set(selectedMemberIds).size) {
    return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'A lista contém membros duplicados.' });
  }
  if (selectedMemberIds) {
    const selectedMembers = await prisma.usuario.findMany({
      where: {
        AND: [
          {
            id: { in: selectedMemberIds },
            perfil: { in: ['SELLER', 'VENDEDOR'] },
            OR: [{ status: 'ativo' }, { equipeId: id }],
            lojaId: existing.lojaId,
          },
        ],
      },
      select: { id: true },
    });
    if (selectedMembers.length !== selectedMemberIds.length) {
      return res.status(400).json({ success: false, error: 'INVALID_MEMBERS', message: 'A lista contém vendedores inativos, de outra loja ou fora do seu escopo.' });
    }
  }
  try {
    const team = await prisma.$transaction(async (tx) => {
      if (gerenteId !== existing.gerenteId) {
        await tx.$queryRaw`SELECT id FROM Usuario WHERE id = ${gerenteId} FOR UPDATE`;
        if (await tx.equipe.findFirst({ where: { gerenteId, lojaId: existing.lojaId, status: 'ativo', deletedAt: null, id: { not: id } }, select: { id: true } })) {
          const conflict = new Error('O gerente já possui outra equipe ativa nesta loja.');
          conflict.code = 'ACTIVE_TEAM_EXISTS';
          throw conflict;
        }
      }
      await tx.$queryRaw`SELECT id FROM Equipe WHERE id = ${id} FOR UPDATE`;
      await tx.equipe.update({ where: { id }, data: { nome, gerenteId, updatedAt: new Date() } });
      const movedFrom = selectedMemberIds?.length
        ? (await tx.usuario.findMany({ where: { id: { in: selectedMemberIds }, equipeId: { notIn: [id] }, NOT: { equipeId: null } }, select: { id: true, equipeId: true } })).map((item) => ({ usuarioId: item.id, equipeId: item.equipeId }))
        : [];
      if (selectedMemberIds) {
        const removedFilter = selectedMemberIds.length
          ? { equipeId: id, id: { notIn: selectedMemberIds } }
          : { equipeId: id };
        await tx.usuario.updateMany({ where: removedFilter, data: { equipeId: null } });
        if (selectedMemberIds.length) {
          await tx.usuario.updateMany({ where: { id: { in: selectedMemberIds } }, data: { equipeId: id, gerenteId } });
        }
      } else if (gerenteId !== existing.gerenteId) {
        await tx.usuario.updateMany({ where: { equipeId: id }, data: { gerenteId } });
      }
      await tx.auditLog.create({
        data: { actorId: Number(req.user.id), action: 'TEAM_UPDATED', details: { equipeId: id, before: { nome: existing.nome, gerenteId: existing.gerenteId, memberIds: existing.membros.map((member) => member.id) }, after: { nome, gerenteId, memberIds: selectedMemberIds || existing.membros.map((member) => member.id) }, movedFrom } },
      });
      return tx.equipe.findUnique({ where: { id }, include: teamListInclude });
    });
    return ok(res, team, 'Equipe atualizada.');
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ success: false, error: 'TEAM_CONFLICT', message: 'Já existe uma equipe com este nome nesta loja.' });
    if (error.code === 'ACTIVE_TEAM_EXISTS') return res.status(409).json({ success: false, error: 'TEAM_CONFLICT', message: error.message });
    throw error;
  }
};

export const deleteTeam = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'Identificador de equipe inválido.' });
  if (roleOf(req.user) !== 'ADMIN') return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Somente ADMIN pode desativar equipes.' });
  const team = await prisma.equipe.findFirst({ where: { AND: [teamScope(req.user), { id, deletedAt: null }] }, include: { _count: { select: { membros: true } } } });
  if (!team) return notFound(res, 'Equipe não encontrada.');
  if (team._count.membros > 0) return res.status(409).json({ success: false, error: 'TEAM_HAS_MEMBERS', message: 'Transfira os membros para outra equipe antes de desativar esta equipe.' });
  try {
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM Equipe WHERE id = ${id} FOR UPDATE`;
      if (await tx.usuario.count({ where: { equipeId: id } })) {
        const conflict = new Error('Transfira os membros para outra equipe antes de desativar esta equipe.');
        conflict.code = 'TEAM_HAS_MEMBERS';
        throw conflict;
      }
      await tx.equipe.update({ where: { id }, data: { status: 'inativo', deletedAt: new Date(), updatedAt: new Date() } });
      await tx.auditLog.create({ data: { actorId: Number(req.user.id), action: 'TEAM_DEACTIVATED', details: { equipeId: id, nome: team.nome } } });
    });
  } catch (error) {
    if (error.code === 'TEAM_HAS_MEMBERS') return res.status(409).json({ success: false, error: error.code, message: error.message });
    throw error;
  }
  return ok(res, null, 'Equipe desativada.');
};

export const listSellerOptions = async (req, res) => {
  const role = roleOf(req.user);
  const lojaId = role === 'ADMIN' && req.query.lojaId ? Number(req.query.lojaId) : Number(req.user.lojaId);
  if (!Number.isInteger(lojaId) || lojaId < 1) return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'Loja inválida.' });
  const rows = await prisma.usuario.findMany({
    where: { lojaId, perfil: { in: ['SELLER', 'VENDEDOR'] }, status: 'ativo' },
    select: { id: true, nome: true, email: true, gerenteId: true, equipeId: true, equipeComercial: { select: { id: true, nome: true, gerenteId: true, gerente: { select: { nome: true } } } } },
    orderBy: { nome: 'asc' },
  });
  return ok(res, rows.map(({ equipeComercial, ...item }) => ({ ...item, equipeNome: equipeComercial?.nome || null, equipeGerenteId: equipeComercial?.gerenteId || null, equipeGerenteNome: equipeComercial?.gerente?.nome || null })), 'Vendedores carregados.');
};

export const createTeamSeller = async (req, res, next) => {
  try {
    const lojaId = Number(req.user.lojaId);
    const team = await prisma.equipe.findFirst({ where: { gerenteId: Number(req.user.id), lojaId, status: 'ativo', deletedAt: null }, select: { id: true } });
    req.body = { ...req.body, perfil: 'SELLER', lojaId, status: 'ativo' };
    req.teamAssignment = { gerenteId: Number(req.user.id), ...(team ? { equipeId: team.id } : {}) };
    return await createUser(req, res);
  } catch (error) { return next(error); }
};
