import { Router } from 'express';
import controller from '../controllers/alineaciones.controller.js';

const router = Router();

router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.post('/', controller.registrar);
router.put('/:id', controller.editar);
router.patch('/:id', controller.editar);
router.delete('/:id', controller.borrar);

export default router;
