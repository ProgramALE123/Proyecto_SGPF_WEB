import { asyncHandler } from '../utils/errors.js';
import { login } from '../services/auth.service.js';
export const iniciarSesion = asyncHandler(async (req, res) => { res.json(await login({ usuario: req.body?.usuario, clave: req.body?.clave })); });
