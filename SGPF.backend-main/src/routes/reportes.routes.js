import { Router } from 'express';
import { alineacionPartido, rendimientoJugadores, resumenPartidos } from '../controllers/reportes.controller.js';

const router = Router();
router.get('/jugadores/rendimiento', rendimientoJugadores);
router.get('/partidos/resumen', resumenPartidos);
router.get('/alineaciones/:partido_id', alineacionPartido);
export default router;
