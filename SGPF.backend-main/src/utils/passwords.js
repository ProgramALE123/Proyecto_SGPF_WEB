import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { badRequest } from './errors.js';

const scryptAsync = promisify(scrypt);
const VERSION = 'scrypt-v1';
const KEY_LENGTH = 64;

export const hashPassword = async (password) => {
  if (typeof password !== 'string' || password.length < 8) {
    throw badRequest('La clave debe tener al menos 8 caracteres');
  }
  const salt = randomBytes(16).toString('base64url');
  const derived = await scryptAsync(password, salt, KEY_LENGTH);
  return `${VERSION}$${salt}$${derived.toString('base64url')}`;
};

export const verifyPassword = async (password, storedHash) => {
  const [version, salt, encoded] = String(storedHash || '').split('$');
  if (version !== VERSION || !salt || !encoded) return false;
  const expected = Buffer.from(encoded, 'base64url');
  if (expected.length !== KEY_LENGTH) return false;
  const actual = await scryptAsync(password, salt, KEY_LENGTH);
  return timingSafeEqual(actual, expected);
};

export const isPasswordHash = (value) => /^scrypt-v1\$[A-Za-z0-9_-]+\$[A-Za-z0-9_-]+$/.test(value || '');
