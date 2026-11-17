import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const categorias = [
  { id: 1, nombre: 'Ropa' },
  { id: 2, nombre: 'Hogar' },
  { id: 3, nombre: 'Electrónica' },
];

const cuentas = [
  { id: 1, nombre: 'Lucía Herrera', email: 'lucia@correo.com', password: '1234', ciudad: 'Valencia', rol: 'usuario' },
  { id: 2, nombre: 'Andrés Molina', email: 'andres@correo.com', password: '1234', ciudad: 'Madrid', rol: 'moderador' },
  { id: 3, nombre: 'Nora Campos', email: 'nora@correo.com', password: '1234', ciudad: 'Bilbao', rol: 'administrador' },
];

function publico(cuenta, total) {
  return {
    id: cuenta.id,
    nombre: cuenta.nombre,
    ciudad: cuenta.ciudad,
    articulosPublicados: total,
  };
}

function articulo(id, titulo, descripcion, precio, categoria, conservacion, ciudad, cuenta) {
  return {
    id,
    titulo,
    descripcion,
    precio,
    categoria,
    conservacion,
    ciudad,
    estado: 'publicado',
    vendedor: publico(cuenta, 1),
  };
}

const articulos = [
  articulo(1, 'Abrigo de lana', 'Abrigo de lana, talla M.', 25, categorias[0], 'como_nuevo', 'Sevilla', cuentas[0]),
  articulo(2, 'Mesa de roble', 'Mesa de roble macizo.', 60, categorias[1], 'buen_estado', 'Bilbao', cuentas[2]),
  articulo(3, 'Silla de escritorio', 'Silla de escritorio negra.', 40, categorias[2], 'aceptable', 'Madrid', cuentas[1]),
];

function sesion(cuenta) {
  return {
    token: `demo-${cuenta.id}`,
    usuario: {
      id: cuenta.id,
      nombre: cuenta.nombre,
      email: cuenta.email,
      ciudad: cuenta.ciudad,
      rol: cuenta.rol,
    },
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

function filtrar(url) {
  return articulos.filter((item) => {
    const texto = (url.searchParams.get('texto') ?? '').toLocaleLowerCase('es');
    const categoriaId = Number(url.searchParams.get('categoriaId') || 0);
    const precioMax = Number(url.searchParams.get('precioMax') || 0);
    const conservacion = url.searchParams.get('conservacion') ?? '';
    const ciudad = (url.searchParams.get('ciudad') ?? '').toLocaleLowerCase('es');
    const coincideTexto = !texto || `${item.titulo} ${item.descripcion}`.toLocaleLowerCase('es').includes(texto);
    const coincideCategoria = !categoriaId || item.categoria.id === categoriaId;
    const coincidePrecio = !precioMax || item.precio <= precioMax;
    const coincideEstado = !conservacion || item.conservacion === conservacion;
    const coincideCiudad = !ciudad || item.ciudad.toLocaleLowerCase('es') === ciudad;
    return coincideTexto && coincideCategoria && coincidePrecio && coincideEstado && coincideCiudad;
  });
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

  if (req.method === 'POST' && ruta === '/api/auth/registro') {
    const datos = await leerCuerpo(req);
    if (!datos?.nombre || !datos.email || !datos.password || !datos.ciudad) {
      enviar(res, 400, { mensaje: 'Completa los datos.' });
      return;
    }
    const email = String(datos.email).toLowerCase();
    if (cuentas.some((cuenta) => cuenta.email === email)) {
      enviar(res, 409, { mensaje: 'Ese email ya está registrado.' });
      return;
    }
    const cuenta = {
      id: cuentas.length + 1,
      nombre: String(datos.nombre),
      email,
      password: String(datos.password),
      ciudad: String(datos.ciudad),
      rol: 'usuario',
    };
    cuentas.push(cuenta);
    enviar(res, 201, sesion(cuenta));
    return;
  }

  if (req.method === 'POST' && ruta === '/api/auth/login') {
    const datos = await leerCuerpo(req);
    const email = String(datos?.email ?? '').toLowerCase();
    const cuenta = cuentas.find((item) => item.email === email && item.password === datos?.password);
    if (!cuenta) {
      enviar(res, 401, { mensaje: 'Email o contraseña incorrectos' });
      return;
    }
    enviar(res, 200, sesion(cuenta));
    return;
  }

  if (req.method === 'GET' && ruta === '/api/auth/me') {
    const token = String(req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
    const cuenta = cuentaDe(token);
    if (!cuenta) {
      enviar(res, 401, { mensaje: 'Token no válido' });
      return;
    }
    const { password, ...usuario } = cuenta;
    enviar(res, 200, usuario);
    return;
  }

  if (req.method === 'GET' && ruta === '/api/categorias') {
    enviar(res, 200, categorias);
    return;
  }

  if (req.method === 'GET' && ruta === '/api/articulos') {
    enviar(res, 200, filtrar(url));
    return;
  }

  const ficha = ruta.match(/^\/api\/articulos\/(\d+)$/);
  if (req.method === 'GET' && ficha) {
    const item = articulos.find((articuloItem) => articuloItem.id === Number(ficha[1]));
    if (!item) {
      enviar(res, 404, { mensaje: 'Artículo no encontrado' });
      return;
    }
    enviar(res, 200, item);
    return;
  }

  const perfil = ruta.match(/^\/api\/perfiles\/(\d+)$/);
  if (req.method === 'GET' && perfil) {
    const cuenta = cuentas.find((item) => item.id === Number(perfil[1]));
    if (!cuenta) {
      enviar(res, 404, { mensaje: 'Perfil no encontrado' });
      return;
    }
    const suyos = articulos.filter((item) => item.vendedor.id === cuenta.id);
    enviar(res, 200, { ...publico(cuenta, suyos.length), articulos: suyos });
    return;
  }

  enviar(res, 404, { mensaje: 'Ruta no encontrada' });
});

server.listen(3000, () => {
  console.log('Demo API en http://localhost:3000/api');
  const frontend = join(dirname(fileURLToPath(import.meta.url)), '..');
  const ng = spawn('npx', ['ng', 'serve'], { cwd: frontend, stdio: 'inherit', shell: true });
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
