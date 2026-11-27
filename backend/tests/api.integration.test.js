import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { once } from 'node:events';
import test from 'node:test';
import mysql from 'mysql2/promise';

// Solo se utiliza MySQL local. No se leen las credenciales DB_* del equipo.
const conexion = {
    host: '127.0.0.1',
    port: Number(process.env.TEST_DB_PORT || 3307),
    user: process.env.TEST_DB_USER || 'root',
    password: process.env.TEST_DB_PASSWORD || ''
};
const nombreBase = `comercio_online_test_${randomBytes(8).toString('hex')}`;

await test('MySQL y API del Sprint 1', { timeout: 30000 }, async (t) => {
    let administrador, baseCreada = false, servidor, pool;
    try {
        administrador = await mysql.createConnection(conexion);
        // Sin IF NOT EXISTS: nunca se reutiliza ni se borra una base anterior.
        await administrador.query(`CREATE DATABASE \`${nombreBase}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`);
        baseCreada = true;
        const sql = await readFile(new URL('../../database/comercio_online.sql', import.meta.url), 'utf8');
        const cabecera = /^CREATE DATABASE IF NOT EXISTS comercio_online\s+CHARACTER SET utf8mb4\s+COLLATE utf8mb4_0900_ai_ci;\s+USE comercio_online;\s*/;
        assert.match(sql, cabecera, 'Revisar la cabecera del SQL antes de adaptar la carga de prueba.');
        const semilla = sql.replace(cabecera, '');
        assert.doesNotMatch(semilla, /\b(?:USE|CREATE\s+DATABASE|DROP\s+DATABASE)\b/i);
        const datos = await mysql.createConnection({ ...conexion, database: nombreBase, multipleStatements: true });
        try {
            await datos.query(semilla);
            await datos.query(semilla);
        } finally { await datos.end(); }

        Object.assign(process.env, {
            NODE_ENV: 'test', DB_HOST: conexion.host, DB_PORT: String(conexion.port),
            DB_USER: conexion.user, DB_PASSWORD: conexion.password, DB_NAME: nombreBase,
            JWT_SECRET: randomBytes(32).toString('hex'), JWT_EXPIRES_IN: '1h'
        });
        // La aplicación se importa después de configurar la base temporal.
        const { default: app } = await import('../src/app.js');
        ({ pool } = await import('../src/config/db.js'));
        servidor = app.listen(0, '127.0.0.1');
        await once(servidor, 'listening');
        const url = `http://127.0.0.1:${servidor.address().port}/api`;
        async function pedir(ruta, estado = 200, opciones = {}) {
            const respuesta = await fetch(url + ruta, { ...opciones, signal: AbortSignal.timeout(5000) });
            const cuerpo = await respuesta.json();
            assert.equal(respuesta.status, estado, `${ruta}: ${JSON.stringify(cuerpo)}`);
            return cuerpo;
        }
        const enviar = (body) => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

        await t.test('la semilla se puede cargar dos veces sin duplicar datos', async () => {
            for (const [tabla, cantidad] of [['usuarios', 3], ['roles', 3], ['categorias', 5], ['articulos', 6]]) {
                const [[fila]] = await pool.query(`SELECT COUNT(*) AS total FROM ${tabla}`);
                assert.equal(Number(fila.total), cantidad, tabla);
            }
        });
        await t.test('listado y ficha respetan el contrato de frontend', async () => {
            await pedir('/health');
            const listado = await pedir('/articles');
            assert.deepEqual(listado.pagination, { page: 1, pageSize: 20, total: 6, totalPages: 1 });
            assert.equal(listado.data.length, 6);
            const campos = ['id', 'ownerId', 'title', 'description', 'price', 'categoryId', 'condition', 'status', 'city', 'lat', 'lng', 'images', 'createdAt'].sort();
            for (const articulo of listado.data) {
                assert.deepEqual(Object.keys(articulo).sort(), campos);
                assert.equal(typeof articulo.price, 'number');
                assert.equal(articulo.status, 'published');
                assert.ok(Array.isArray(articulo.images));
                assert.ok(Number.isFinite(Date.parse(articulo.createdAt)));
                assert.deepEqual((await pedir(`/articles/${articulo.id}`)).article, articulo);
            }
        });
        await t.test('los filtros funcionan por separado y combinados', async () => {
            for (const [filtro, ids] of [
                ['city=Bilbao', [2, 5]], ['categoryId=1', [1, 2]], ['q=Cámara', [2]],
                ['maxPrice=20', [3, 4]], ['minPrice=40', [2]], ['condition=fair', [5]],
                ['city=Bilbao&categoryId=1&minPrice=50&maxPrice=90', [2]],
                [`q=${encodeURIComponent("' OR 1=1 --")}`, []]
            ]) {
                const listado = await pedir(`/articles?${filtro}`);
                assert.deepEqual(listado.data.map(a => a.id).sort((a, b) => a - b), ids);
                assert.equal(listado.pagination.total, ids.length);
            }
        });
        await t.test('paginación y orden por precio', async () => {
            const primera = await pedir('/articles?pageSize=2');
            const segunda = await pedir('/articles?pageSize=2&page=2');
            assert.deepEqual(primera.pagination, { page: 1, pageSize: 2, total: 6, totalPages: 3 });
            assert.equal(primera.data.length, 2);
            assert.equal(segunda.data.length, 2);
            assert.ok(primera.data.every(a => segunda.data.every(b => a.id !== b.id)));
            for (const orden of ['price_asc', 'price_desc']) {
                const precios = (await pedir(`/articles?sort=${orden}`)).data.map(a => a.price);
                assert.deepEqual(precios, [...precios].sort((a, b) => orden === 'price_asc' ? a - b : b - a));
            }
        });
        await t.test('categorías activas y perfiles sin datos privados', async () => {
            const categorias = await pedir('/categories');
            assert.equal(categorias.length, 5);
            for (const categoria of categorias) {
                assert.deepEqual(Object.keys(categoria).sort(), ['id', 'name', 'slug', 'parentId', 'isActive'].sort());
                assert.equal(categoria.isActive, true);
            }
            assert.equal((await pedir('/categories/1')).category.name, 'Electrónica');
            for (const id of [1, 2, 3]) {
                const { user } = await pedir(`/users/${id}`);
                assert.deepEqual(Object.keys(user).sort(), ['id', 'username', 'name', 'city', 'avatarUrl', 'bio', 'ratingAverage', 'ratingCount'].sort());
                assert.equal(user.ratingCount, 0);
            }
        });
        await t.test('identificadores y filtros incorrectos devuelven 400', async () => {
            for (const ruta of ['/articles/abc', '/categories/0', '/users/-1', '/articles?page=0', '/articles?pageSize=101', '/articles?sort=incorrecto', '/articles?condition=incorrecto', '/articles?minPrice=30&maxPrice=20', '/articles?categoryId=abc', '/articles?minPrice=-1']) {
                assert.equal((await pedir(ruta, 400)).error.code, 'VALIDATION_ERROR');
            }
            for (const ruta of ['/articles/999999', '/categories/999999', '/users/999999']) await pedir(ruta, 404);
        });
        await t.test('login y sesión de las tres cuentas de prueba', async () => {
            for (const [email, password, rol] of [
                ['lucia@correo.com', 'Usuario2026!', 'user'],
                ['andres@correo.com', 'Moderador2026!', 'moderator'],
                ['nora@correo.com', 'Admin2026!', 'admin']
            ]) {
                const acceso = await pedir('/auth/login', 200, enviar({ email, password }));
                assert.ok(acceso.accessToken);
                assert.equal(acceso.user.role, rol);
                const sesion = await pedir('/auth/me', 200, { headers: { Authorization: `Bearer ${acceso.accessToken}` } });
                assert.equal(sesion.user.id, acceso.user.id);
                assert.equal(sesion.user.role, rol);
            }
            await pedir('/auth/login', 401, enviar({ email: 'lucia@correo.com', password: 'Incorrecta2026!' }));
            await pedir('/auth/me', 401);
            await pedir('/auth/me', 401, { headers: { Authorization: 'Bearer invalido' } });
            await pedir('/auth/login', 400, enviar({ email: 'incorrecto', password: 'x' }));
        });
        await t.test('registro asigna el rol usuario y rechaza duplicados', async () => {
            const nuevaCuenta = { email: 'prueba@correo.com', username: 'prueba_local', password: 'Prueba2026!', name: 'Cuenta de prueba' };
            const registro = await pedir('/auth/register', 201, enviar(nuevaCuenta));
            assert.equal(registro.user.role, 'user');
            assert.ok(registro.accessToken);
            const acceso = await pedir('/auth/login', 200, enviar(nuevaCuenta));
            assert.equal(acceso.user.id, registro.user.id);
            await pedir('/auth/register', 409, enviar(nuevaCuenta));
        });
        await t.test('artículos no publicados y recursos inactivos quedan ocultos', async () => {
            await pool.execute("UPDATE articulos SET estado_publicacion='draft' WHERE id=1");
            assert.equal((await pedir('/articles')).pagination.total, 5);
            await pedir('/articles/1', 404);
            await pool.execute('UPDATE categorias SET activa=FALSE WHERE id=1');
            assert.equal((await pedir('/categories')).length, 4);
            await pedir('/categories/1', 404);
            await pool.execute("UPDATE usuarios SET estado='bloqueado' WHERE id=1");
            await pedir('/users/1', 404);
            await pedir('/auth/login', 403, enviar({ email: 'lucia@correo.com', password: 'Usuario2026!' }));
        });
        await t.test('la imagen principal llega como lista de imágenes', async () => {
            await pool.execute('UPDATE articulos SET imagen_url=? WHERE id=2', ['https://example.com/prueba.jpg']);
            assert.deepEqual((await pedir('/articles/2')).article.images, [{ id: 2, url: 'https://example.com/prueba.jpg', sortOrder: 0 }]);
        });
    } finally {
        if (servidor) await new Promise((resolve, reject) => servidor.close(error => error ? reject(error) : resolve()));
        if (pool) await pool.end();
        if (administrador) {
            try { if (baseCreada) await administrador.query(`DROP DATABASE \`${nombreBase}\``); }
            finally { await administrador.end(); }
        }
    }
});
