import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import multer from 'multer';
import {
  createFicha,
  updateFicha,
  getFicha,
  listClientFichas,
  deleteFicha,
  uploadPdf,
  downloadPdf,
  listClientPdfs,
  deletePdf,
  emailPdf,
  persistFichaWithPdf,
  getFichasStats,
} from '../controllers/fichasController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const wrap = (handler) => (req, res, next) => 
  Promise.resolve(handler(req, res, next)).catch(next);

// Aplicar middleware de autenticação para todos os endpoints
router.use(authMiddleware);

// ==================== FICHAS ====================

// Criar ficha
router.post('/', wrap(createFicha));

// Atualizar ficha
router.put('/:fichaId', wrap(updateFicha));

// Recuperar ficha específica
router.get('/:fichaId', wrap(getFicha));

// Listar fichas do cliente
router.get('/cliente/:clienteId', wrap(listClientFichas));

// Deletar ficha
router.delete('/:fichaId', wrap(deleteFicha));

// ==================== PDFS ====================

// Upload de PDF
router.post('/upload-pdf', upload.single('file'), wrap(uploadPdf));

// Download de PDF
router.get('/download-pdf/:pdfId', wrap(downloadPdf));

// Listar PDFs do cliente
router.get('/pdfs/:clienteId', wrap(listClientPdfs));

// Deletar PDF
router.delete('/pdf/:pdfId', wrap(deletePdf));

// ==================== EMAIL ====================

// Enviar PDF por email
router.post('/email-pdf', wrap(emailPdf));

// ==================== PERSIST ====================

// Persistir ficha com PDF (atomic operation)
router.post('/persist-with-pdf', upload.single('pdf'), wrap(persistFichaWithPdf));

// ==================== STATS ====================

// Obter estatísticas
router.get('/stats', wrap(getFichasStats));

export default router;
