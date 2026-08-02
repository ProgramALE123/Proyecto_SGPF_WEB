import jwt from 'jsonwebtoken';
import { verifyPassword } from '../utils/passwords.js';
import { unauthorized } from '../utils/errors.js';
import { findUserForLogin, registerSuccessfulLogin } from '../repositories/auth.repository.js';
const secret = () => { const value = process.env.JWT_SECRET; if (!value || value.length < 32) throw new Error('JWT_SECRET debe tener al menos 32 caracteres'); return value; };
export const login = async ({ usuario, clave }) => {
  if (!usuario || !clave) throw unauthorized('Usuario y contraseña son obligatorios');
  const account = await findUserForLogin(usuario);
  if (!account || !account.activo || !(await verifyPassword(clave, account.clave_hash))) throw unauthorized('Credenciales inválidas');
  const token = jwt.sign({ sub: account.id, username: account.nombre_usuario, role: account.rol }, secret(), { expiresIn: process.env.JWT_EXPIRES_IN || '30d', issuer: 'sgpf-backend', audience: 'sgpf-frontend' });
  await registerSuccessfulLogin(account.id);
  return { token, usuario: { id: account.id, nombre_usuario: account.nombre_usuario, correo: account.correo, rol: account.rol } };
};
export const verifyAccessToken = (token) => jwt.verify(token, secret(), { issuer: 'sgpf-backend', audience: 'sgpf-frontend' });
