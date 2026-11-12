import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configurar transporter de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outros
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Enviar email
 * @param {Object} options - Opções do email
 * @param {string} options.to - Email destinatário
 * @param {string} options.subject - Assunto
 * @param {string} options.html - Conteúdo HTML
 * @param {Array} options.attachments - Anexos (opcional)
 * @returns {Promise}
 */
export const sendEmail = async (options) => {
  try {
    // Se SMTP não está configurado, logar e retornar sucesso
    if (!process.env.SMTP_HOST) {
      console.log('📧 Email Service: SMTP não configurado. Email não será enviado.');
      console.log(`   Para: ${options.to}`);
      console.log(`   Assunto: ${options.subject}`);
      return { success: true, message: 'Email seria enviado (SMTP não configurado)' };
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    throw error;
  }
};

/**
 * Verificar se SMTP está configurado
 */
export const isSMTPConfigured = () => {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
};
