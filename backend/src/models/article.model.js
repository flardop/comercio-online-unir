import { pool } from '../config/db.js';

function articuloPublico(row) {
    return {
        id: Number(row.id), ownerId: Number(row.vendedor_id),
        title: row.titulo, description: row.descripcion, price: Number(row.precio),
        categoryId: Number(row.categoria_id), condition: row.estado_conservacion,
        status: row.estado_publicacion, city: row.ciudad,
        lat: row.latitud === null ? null : Number(row.latitud),
        lng: row.longitud === null ? null : Number(row.longitud),
        images: row.imagen_url ? [{ id: Number(row.id), url: row.imagen_url, sortOrder: 0 }] : [],
        createdAt: row.creado_en
    };
}

const campos = `id, vendedor_id, categoria_id, titulo, descripcion, precio,
    estado_conservacion, estado_publicacion, ciudad, latitud, longitud,
    imagen_url, creado_en`;

export async function obtenerTodos(filtros) {
    const condiciones = ["estado_publicacion = 'published'"];
    const params = [];
    if (filtros.q) {
        // LIKE permite buscar sin requerir un índice FULLTEXT en la base del sprint.
        condiciones.push('(titulo LIKE ? OR descripcion LIKE ?)');
        params.push(`%${filtros.q}%`, `%${filtros.q}%`);
    }
    for (const [valor, condicion] of [
        [filtros.categoryId, 'categoria_id = ?'],
        [filtros.minPrice, 'precio >= ?'], [filtros.maxPrice, 'precio <= ?'],
        [filtros.condition, 'estado_conservacion = ?']
    ]) {
        if (valor !== undefined) { condiciones.push(condicion); params.push(valor); }
    }
    if (filtros.city) { condiciones.push('ciudad LIKE ?'); params.push(`%${filtros.city}%`); }
    const where = condiciones.join(' AND ');
    const [cuenta] = await pool.execute(`SELECT COUNT(*) AS total FROM articulos WHERE ${where}`, params);
    const total = Number(cuenta[0].total);
    const ordenes = { recent: 'publicado_en DESC, id DESC', price_asc: 'precio ASC, id ASC', price_desc: 'precio DESC, id DESC' };
    const offset = (filtros.page - 1) * filtros.pageSize;
    // page/pageSize están validados como enteros positivos antes de llegar al modelo.
    const [rows] = await pool.execute(
        `SELECT ${campos} FROM articulos WHERE ${where} ORDER BY ${ordenes[filtros.sort]} LIMIT ${filtros.pageSize} OFFSET ${offset}`, params
    );
    return { data: rows.map(articuloPublico), pagination: {
        page: filtros.page, pageSize: filtros.pageSize, total,
        totalPages: Math.ceil(total / filtros.pageSize)
    } };
}

export async function obtenerPorId(id) {
    const [rows] = await pool.execute(`SELECT ${campos} FROM articulos WHERE id = ? AND estado_publicacion = 'published'`, [id]);
    return rows[0] ? articuloPublico(rows[0]) : null;
}
