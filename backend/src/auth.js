
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from './db.js';
import { config } from './config.js';

const registerSchema = z.object({
  email: z.string().trim().email().max(190),
  username: z.string().trim().min(3).max(40).regex(/^[a-zA-Z0-9_.-]+$/),
  password: z.string().min(8).max(72),
  name: z.string().trim().min(1).max(120),
  city: z.string().trim().max(100).optional(),
  bio: z.string().trim().max(2000).optional()
});

const loginSchema = z.object({
  email: z.string().trim().email().max(190),
  password: z.string().min(1).max(72)
});

const roleAliases = new Map([
  ['user', 'user'], ['usuario', 'user'],
  ['moderator', 'moderator'], ['moderador', 'moderator'],
  ['admin', 'admin'], ['administrador', 'admin']
]);
const roleRank = { user: 1, moderator: 2, admin: 3 };

function publicUser(row, rawRoles) {
  const roles = rawRoles.map((roleName) => roleAliases.get(String(roleName).trim().toLowerCase())).filter(Boolean);
  const role = roles.sort((a, b) => roleRank[b] - roleRank[a])[0];
  if (!role) {
    const error = new Error('El usuario no tiene un rol reconocido en roles/usuario_roles.');
    error.status = 500;
    error.code = 'ROLE_CONFIGURATION_ERROR';
    throw error;
  }
  return {
    id: Number(row.id),
    email: row.email,
    username: row.nombre_usuario,
    name: row.nombre_completo || row.nombre_usuario,
    role,
    city: row.ciudad,
    bio: row.biografia,
    avatarUrl: row.foto_perfil,
    createdAt: row.creado_en
  };
}

async function loadRoles(executor, userId) {
  const [rows] = await executor.execute(
    `SELECT r.nombre
       FROM roles r
       JOIN usuario_roles ur ON ur.rol_id = r.id
      WHERE ur.usuario_id = ?`,
    [userId]
  );
  return rows.map((row) => row.nombre);
}

async function loadUser(executor, userId) {
  const [rows] = await executor.execute(
    `SELECT id, email, nombre_usuario, nombre_completo, foto_perfil,
            biografia, ciudad, estado, creado_en
       FROM usuarios
      WHERE id = ?
      LIMIT 1`,
    [userId]
  );
  if (!rows[0]) return null;
  return { row: rows[0], user: publicUser(rows[0], await loadRoles(executor, userId)) };
}

function tokenFor(user) {
  return jwt.sign({ sub: String(user.id) }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
}

function authResponse(user) {
  return { accessToken: tokenFor(user), tokenType: 'Bearer', expiresIn: config.JWT_EXPIRES_IN, user };
}

function errorResponse(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

export async function register(req, res) {
  const input = registerSchema.parse(req.body);
  const email = input.email.toLowerCase();
  const username = input.username;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [duplicates] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ? OR nombre_usuario = ? LIMIT 1',
      [email, username]
    );
    if (duplicates.length) {
      await connection.rollback();
      return errorResponse(res, 409, 'ACCOUNT_EXISTS', 'El email o nombre de usuario ya está registrado.');
    }

    const [roleRows] = await connection.execute(
      "SELECT id FROM roles WHERE LOWER(nombre) IN ('user', 'usuario') ORDER BY id LIMIT 1"
    );
    if (!roleRows[0]) {
      await connection.rollback();
      return errorResponse(res, 500, 'ROLE_CONFIGURATION_ERROR', 'Persona 6 debe crear el rol user/usuario en roles.');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const [insert] = await connection.execute(
      `INSERT INTO usuarios
         (email, password_hash, nombre_usuario, nombre_completo, biografia, ciudad, estado)
       VALUES (?, ?, ?, ?, ?, ?, 'activo')`,
      [email, passwordHash, username, input.name, input.bio ?? null, input.city ?? null]
    );
    await connection.execute(
      'INSERT INTO usuario_roles (usuario_id, rol_id) VALUES (?, ?)',
      [insert.insertId, roleRows[0].id]
    );
    const loaded = await loadUser(connection, insert.insertId);
    await connection.commit();
    return res.status(201).json(authResponse(loaded.user));
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse(res, 409, 'ACCOUNT_EXISTS', 'El email o nombre de usuario ya está registrado.');
    }
    throw error;
  } finally {
    connection.release();
  }
}

export async function login(req, res) {
  const input = loginSchema.parse(req.body);
  const email = input.email.toLowerCase();
  const [rows] = await pool.execute(
    `SELECT id, email, nombre_usuario, nombre_completo, foto_perfil,
            biografia, ciudad, estado, creado_en, password_hash
       FROM usuarios
      WHERE email = ?
      LIMIT 1`,
    [email]
  );
  const row = rows[0];
  if (!row || !(await bcrypt.compare(input.password, row.password_hash))) {
    return errorResponse(res, 401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos.');
  }
  if (row.estado === 'bloqueado') {
    return errorResponse(res, 403, 'ACCOUNT_BLOCKED', 'La cuenta está bloqueada.');
  }
  if (row.estado !== 'activo') {
    return errorResponse(res, 403, 'ACCOUNT_NOT_ACTIVE', 'La cuenta no está activa.');
  }
  const user = publicUser(row, await loadRoles(pool, row.id));
  await pool.execute('UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = ?', [row.id]);
  return res.json(authResponse(user));
}

export async function me(req, res) {
  const loaded = await loadUser(pool, req.auth.userId);
  if (!loaded || loaded.row.estado !== 'activo') {
    return errorResponse(res, 401, 'UNAUTHENTICATED', 'La sesión ya no es válida.');
  }
  return res.json({ user: loaded.user });
}

export function requireAuth(req, res, next) {
  const [scheme, token] = (req.get('authorization') || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return errorResponse(res, 401, 'UNAUTHENTICATED', 'Se requiere Authorization: Bearer <token>.');
  }
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    const userId = Number(payload.sub);
    if (!Number.isSafeInteger(userId) || userId <= 0) throw new Error('Invalid subject');
    req.auth = { userId };
    return next();
  } catch {
    return errorResponse(res, 401, 'UNAUTHENTICATED', 'El token no es válido o ha caducado.');
  }
}
