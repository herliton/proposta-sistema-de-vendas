import { Router } from 'express';
import { login, register, listUsers, createUser, updateUser, firstAccessChange, forgotPassword, resetPassword } from '../controllers/authController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { getEmailSettings, saveEmailSettings, testEmailSettings } from '../utils/email.js';
import { ok } from '../utils/response.js';

const router = Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/register', register);
router.get('/users', authMiddleware, requireRole('ADMIN'), listUsers);
router.post('/users', authMiddleware, requireRole('ADMIN'), createUser);
router.put('/users/:id', authMiddleware, requireRole('ADMIN'), updateUser);
router.post('/first-access-change', authMiddleware, firstAccessChange);
router.get('/email-settings', authMiddleware, requireRole('ADMIN'), async (req, res, next) => { try { return ok(res, await getEmailSettings()); } catch (error) { return next(error); } });
router.put('/email-settings', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try { return ok(res, await saveEmailSettings(req.body), 'Configuração de e-mail salva.'); }
  catch (error) { return res.status(error.code === 'BAD_REQUEST' ? 400 : 422).json({ success: false, error: error.code || 'EMAIL_SETTINGS_ERROR', message: error.message }); }
});
router.post('/email-settings/test', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  const recipient = String(req.body.email || '').trim();
  if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'Informe um e-mail destinatário válido.' });
  try {
    const result = await testEmailSettings(recipient);
    return ok(res, { accepted: result.accepted, messageId: result.messageId }, 'E-mail de teste enviado.');
  } catch (error) {
    const message = error.code === 'EAUTH' ? 'O servidor SMTP recusou a autenticação. Confira usuário, senha e acesso de aplicativos.'
      : error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION' ? 'Não foi possível conectar ao servidor SMTP. Confira host e porta.'
        : error.code === 'INVALID_SMTP_PORT' || error.code === 'SMTP_NOT_CONFIGURED' ? error.message
          : 'O teste de envio falhou. Confira a configuração SMTP.';
    console.error('Falha no teste SMTP:', error.code || 'UNKNOWN', error.responseCode || '');
    return res.status(error.code === 'SMTP_NOT_CONFIGURED' ? 503 : 502).json({ success: false, error: error.code || 'EMAIL_TEST_FAILED', message });
  }
});

export default router;
