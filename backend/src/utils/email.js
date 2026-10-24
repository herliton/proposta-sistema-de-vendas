import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { prisma } from '../config/database.js';

const smtpSettingsKey = 'emailSmtp';
const encryptionKey = () => {
  const secret = process.env.SMTP_CONFIG_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!secret) throw new Error('Configure JWT_SECRET ou SMTP_CONFIG_ENCRYPTION_KEY para proteger a senha SMTP.');
  return crypto.scryptSync(secret, 'vfc-smtp-settings-v1', 32);
};
const encryptPassword = (password) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);
  return { iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), value: ciphertext.toString('base64') };
};
const decryptPassword = (encrypted) => {
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(encrypted.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(encrypted.tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(encrypted.value, 'base64')), decipher.final()]).toString('utf8');
};
const envSettings = () => ({ host: process.env.SMTP_HOST || '', port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true', user: process.env.SMTP_USER || '', password: process.env.SMTP_PASS || '', from: process.env.SMTP_FROM || '', appUrl: process.env.APP_URL || 'http://localhost:4173/' });
const activeSettings = async () => {
  const entry = await prisma.configuracao.findUnique({ where: { chave: smtpSettingsKey } });
  const stored = entry?.valor || {};
  const fromEnv = envSettings();
  const password = stored.passwordEncrypted ? decryptPassword(stored.passwordEncrypted) : fromEnv.password;
  return { host: stored.host || fromEnv.host, port: Number(stored.port || fromEnv.port), secure: typeof stored.secure === 'boolean' ? stored.secure : fromEnv.secure, user: stored.user || fromEnv.user, password, from: stored.from || fromEnv.from, appUrl: stored.appUrl || fromEnv.appUrl };
};
const makeTransport = (settings) => nodemailer.createTransport({ host: settings.host, port: settings.port, secure: settings.secure, auth: { user: settings.user, pass: settings.password }, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000 });
const checkRequired = (settings) => {
  const missing = [];
  if (!settings.host) missing.push('servidor SMTP');
  if (!settings.port) missing.push('porta SMTP');
  if (!settings.user) missing.push('usuário da caixa postal');
  if (!settings.password) missing.push('senha SMTP');
  if (!settings.from) missing.push('remetente');
  if (missing.length) { const error = new Error(`Configure ${missing.join(', ')} na tela Configurações de e-mail.`); error.code = 'SMTP_NOT_CONFIGURED'; throw error; }
};
const safeText = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export const getEmailSettings = async () => {
  const settings = await activeSettings();
  return { host: settings.host, port: settings.port, secure: settings.secure, user: settings.user, from: settings.from, appUrl: settings.appUrl, hasPassword: Boolean(settings.password) };
};

export const saveEmailSettings = async (input) => {
  const host = String(input.host || '').trim();
  const port = Number(input.port);
  if (port === 993) { const error = new Error('A porta 993 é IMAP para recebimento. Para SMTP use 465 com SSL ou 587 com STARTTLS.'); error.code = 'INVALID_SMTP_PORT'; throw error; }
  if (!host || !Number.isInteger(port) || port < 1 || port > 65535) { const error = new Error('Informe um servidor SMTP e uma porta válida.'); error.code = 'BAD_REQUEST'; throw error; }
  const existing = await activeSettings();
  const password = String(input.password || '').trim() || existing.password;
  const value = { host, port, secure: Boolean(input.secure), user: String(input.user || '').trim(), from: String(input.from || '').trim(), appUrl: String(input.appUrl || '').trim() || 'http://localhost:4173/', passwordEncrypted: password ? encryptPassword(password) : null, updatedAt: new Date().toISOString() };
  await prisma.configuracao.upsert({ where: { chave: smtpSettingsKey }, create: { chave: smtpSettingsKey, valor: value }, update: { valor: value, updatedAt: new Date() } });
  return getEmailSettings();
};

export const testEmailSettings = async (recipient) => {
  const settings = await activeSettings(); checkRequired(settings); const transporter = makeTransport(settings); await transporter.verify();
  return transporter.sendMail({ from: settings.from, to: recipient, subject: 'Teste de envio — Sistema de Vendas', text: `Este é um e-mail de teste do Sistema de Vendas.\nAcesso: ${settings.appUrl}`, html: `<p>Este é um e-mail de teste do Sistema de Vendas.</p><p><a href="${settings.appUrl}">Acessar o sistema</a></p>` });
};

export const sendPasswordResetEmail = async ({ nome, email, resetToken }) => {
  const settings = await activeSettings(); checkRequired(settings);
  const resetUrl = new URL(settings.appUrl || 'http://localhost:4173/'); resetUrl.searchParams.set('resetToken', resetToken);
  const safeName = safeText(nome);
  await makeTransport(settings).sendMail({ from: settings.from, to: email, subject: 'Redefinição de senha — Sistema de Vendas', text: `Olá, ${nome}.\n\nUse este link para definir uma nova senha (válido por 1 hora):\n${resetUrl}\n\nSe você não solicitou esta alteração, ignore esta mensagem.`, html: `<p>Olá, ${safeName}.</p><p>Recebemos uma solicitação para redefinir sua senha.</p><p><a href="${resetUrl}">Criar nova senha</a></p><p>Este link expira em 1 hora. Se você não solicitou a alteração, ignore este e-mail.</p>` });
};

export const sendTemporaryAccessEmail = async ({ nome, email, temporaryPassword }) => {
  const settings = await activeSettings(); checkRequired(settings);
  const safeName = safeText(nome); const safeEmail = safeText(email);
  await makeTransport(settings).sendMail({ from: settings.from, to: email, subject: 'Acesso ao sistema de vendas', text: `Olá, ${nome}.\n\nSeu acesso ao sistema foi criado/atualizado.\nAcesse: ${settings.appUrl}\nE-mail: ${email}\nSenha temporária: ${temporaryPassword}\n\nPor segurança, você deverá criar uma nova senha no primeiro acesso.`, html: `<p>Olá, ${safeName}.</p><p>Seu acesso ao sistema foi criado ou atualizado.</p><p><a href="${settings.appUrl}">Acessar o sistema</a></p><p>E-mail: <strong>${safeEmail}</strong><br>Senha temporária: <strong>${safeText(temporaryPassword)}</strong></p><p>Por segurança, você deverá criar uma nova senha no primeiro acesso.</p>` });
};
