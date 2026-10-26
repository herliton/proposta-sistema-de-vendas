import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireModuleAccess } from '../middleware/requireModuleAccess.js';
import { createCreditOpportunity, listCreditOpportunities, updateCreditOpportunity } from '../controllers/creditRecoveryController.js';
import {
  addAcompanhamento, addAnalise, addContato, createFicha, getFicha, getRequisitos, listFichas, listResponsaveis,
  removeAcompanhamento, removeAnalise, removeContato, updateAcompanhamento, updateAnalise, updateContato, updateFicha, updateScore,
} from '../controllers/fichaRecuperacaoController.js';

const router = Router();
const wrap = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

router.use(authMiddleware, requireModuleAccess('CREDIT_RECOVERY'));
router.get('/', listCreditOpportunities);
router.post('/', createCreditOpportunity);

router.get('/fichas/requisitos', wrap(getRequisitos));
router.get('/fichas/responsaveis', wrap(listResponsaveis));
router.get('/fichas', wrap(listFichas));
router.post('/fichas', wrap(createFicha));
router.get('/fichas/:id', wrap(getFicha));
router.put('/fichas/:id', wrap(updateFicha));
router.patch('/fichas/:id/score', wrap(updateScore));
router.post('/fichas/:id/contatos', wrap(addContato));
router.put('/fichas/:id/contatos/:itemId', wrap(updateContato));
router.delete('/fichas/:id/contatos/:itemId', wrap(removeContato));
router.post('/fichas/:id/analises', wrap(addAnalise));
router.put('/fichas/:id/analises/:itemId', wrap(updateAnalise));
router.delete('/fichas/:id/analises/:itemId', wrap(removeAnalise));
router.post('/fichas/:id/acompanhamentos', wrap(addAcompanhamento));
router.put('/fichas/:id/acompanhamentos/:itemId', wrap(updateAcompanhamento));
router.delete('/fichas/:id/acompanhamentos/:itemId', wrap(removeAcompanhamento));

router.patch('/:id', updateCreditOpportunity);
export default router;
