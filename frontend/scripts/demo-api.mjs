import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const cuentas = [
  {
    id: 1,
    email: 'demo@correo.com',
    username: 'demo',
    password: 'demo1234',
    name: 'Demo',
    city: 'Valencia',
    bio: null,
    avatarUrl: null,
    role: 'user',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

function usuario(cuenta) {
  return {
    id: cuenta.id,
    email: cuenta.email,
    username: cuenta.username,
    name: cuenta.name,
    role: cuenta.role,
    city: cuenta.city,
    bio: cuenta.bio,
    avatarUrl: cuenta.avatarUrl,
    createdAt: cuenta.createdAt,
  };
}

function sesion(cuenta) {
  return {
    accessToken: `demo-${cuenta.id}`,
    tokenType: 'Bearer',
    expiresIn: '1h',
    user: usuario(cuenta),
  };
}

function cuentaDe(token) {
  const id = Number(String(token).replace('demo-', ''));
  return cuentas.find((cuenta) => cuenta.id === id);
}

function leerCuerpo(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(null);
      }
    });
  });
}

function enviar(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function error(res, status, code, message, details) {
  const body = { error: { code, message } };
  if (details) body.error.details = details;
  enviar(res, status, body);
}

function validarRegistro(datos) {
  const details = [];
  const email = String(datos?.email ?? '').trim();
  const username = String(datos?.username ?? '').trim();
  const password = String(datos?.password ?? '');
  const name = String(datos?.name ?? '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 190) {
    details.push({ field: 'email', message: 'Email no válido.' });
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(username) || username.length < 3 || username.length > 40) {
    details.push({ field: 'username', message: 'El usuario debe tener entre 3 y 40 caracteres.' });
  }
  if (password.length < 8 || password.length > 72) {
    details.push({ field: 'password', message: 'La contraseña debe tener entre 8 y 72 caracteres.' });
  }
  if (!name || name.length > 120) {
    details.push({ field: 'name', message: 'El nombre es obligatorio.' });
  }
  return details;
}

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const url = new URL(req.url ?? '/', 'http://localhost:3000');
  const ruta = url.pathname;

  if (req.method === 'GET' && ruta === '/api/health') {
    enviar(res, 200, { status: 'ok' });
    return;
  }

  if (req.method === 'POST' && ruta === '/api/auth/register') {
    const datos = await leerCuerpo(req);
    if (!datos) {
      error(res, 400, 'VALIDATION_ERROR', 'Revisa los datos enviados.');
      return;
    }
    const details = validarRegistro(datos);
    if (details.length) {
      error(res, 400, 'VALIDATION_ERROR', 'Revisa los datos enviados.', details);
      return;
    }
    const email = String(datos.email).trim().toLowerCase();
    const username = String(datos.username).trim();
    if (cuentas.some((cuenta) => cuenta.email === email || cuenta.username === username)) {
      error(res, 409, 'ACCOUNT_EXISTS', 'El email o nombre de usuario ya está registrado.');
      return;
    }
    const cuenta = {
      id: cuentas.length + 1,
      email,
      username,
      password: String(datos.password),
      name: String(datos.name).trim(),
      city: datos.city ? String(datos.city).trim() : null,
      bio: null,
      avatarUrl: null,
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    cuentas.push(cuenta);
    enviar(res, 201, sesion(cuenta));
    return;
  }

  if (req.method === 'POST' && ruta === '/api/auth/login') {
    const datos = await leerCuerpo(req);
    const email = String(datos?.email ?? '').trim().toLowerCase();
    const cuenta = cuentas.find((item) => item.email === email && item.password === datos?.password);
    if (!cuenta) {
      error(res, 401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos.');
      return;
    }
    enviar(res, 200, sesion(cuenta));
    return;
  }

  if (req.method === 'GET' && ruta === '/api/auth/me') {
    const header = String(req.headers.authorization ?? '');
    const [scheme, token] = header.split(' ');
    const cuenta = scheme === 'Bearer' ? cuentaDe(token) : undefined;
    if (!cuenta) {
      error(res, 401, 'UNAUTHENTICATED', 'Se requiere Authorization: Bearer <token>.');
      return;
    }
    enviar(res, 200, { user: usuario(cuenta) });
    return;
  }

  error(res, 404, 'NOT_FOUND', 'Ruta no encontrada.');
});

server.listen(3000, () => {
  console.log('Demo API en http://localhost:3000/api');
  const frontend = join(dirname(fileURLToPath(import.meta.url)), '..');
  const ng = spawn('pnpm', ['exec', 'ng', 'serve'], { cwd: frontend, stdio: 'inherit', shell: true });
  const cerrar = () => {
    server.close();
    ng.kill();
  };
  process.on('SIGINT', () => {
    cerrar();
    process.exit(0);
  });
  ng.on('exit', (code) => {
    server.close();
    process.exit(code ?? 0);
  });
});
