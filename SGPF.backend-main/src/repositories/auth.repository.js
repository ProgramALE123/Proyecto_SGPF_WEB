import { pool } from '../database/connection.js';
export const findUserForLogin = async (identifier) => {
  const result = await pool.query(`SELECT u.id, u.nombre_usuario, u.correo, u.clave_hash, u.activo, r.nombre AS rol FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE lower(u.nombre_usuario) = lower($1) OR lower(u.correo) = lower($1) LIMIT 1`, [identifier]);
  return result.rows[0];
};
export const registerSuccessfulLogin = async (id) => { await pool.query('UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1', [id]); };
