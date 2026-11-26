import {pool} from '../config/db.js';

const obtenerTodos = async (filtros = {}) => {
    let sql = `
        SELECT
            a.id,
            a.vendedor_id,
            a.categoria_id,
            a.titulo,
            a.descripcion,
            a.precio,
            a.estado_conservacion,
            a.ciudad,
            a.provincia,
            a.pais,
            a.codigo_postal,
            a.publicado_en,
            a.creado_en,
            a.actualizado_en
        FROM articulos a
        WHERE a.estado_publicacion = 'activo'
    `;

    const params = [];

    // Búsqueda de texto
    if (filtros.q) {
        sql += `
            AND MATCH(a.titulo, a.descripcion)
            AGAINST(? IN NATURAL LANGUAGE MODE)
        `;
        params.push(filtros.q);
    }

    // Categoría
    if (filtros.categoryId !== undefined) {
        sql += ' AND a.categoria_id = ?';
        params.push(filtros.categoryId);
    }

    // Precio mínimo
    if (filtros.minPrice !== undefined) {
        sql += ' AND a.precio >= ?';
        params.push(filtros.minPrice);
    }

    // Precio máximo
    if (filtros.maxPrice !== undefined) {
        sql += ' AND a.precio <= ?';
        params.push(filtros.maxPrice);
    }

    // Estado de conservación
    if (filtros.condition) {
        sql += ' AND a.estado_conservacion = ?';
        params.push(filtros.condition);
    }

    // Ciudad
    if (filtros.city) {
        sql += ' AND a.ciudad LIKE ?';
        params.push(`%${filtros.city}%`);
    }

    // Provincia
    if (filtros.province) {
        sql += ' AND a.provincia LIKE ?';
        params.push(`%${filtros.province}%`);
    }

    // País
    if (filtros.country) {
        sql += ' AND a.pais LIKE ?';
        params.push(`%${filtros.country}%`);
    }

    // Ordenación
    const ordenesPermitidos = {
        recent: 'a.publicado_en DESC',
        price_asc: 'a.precio ASC',
        price_desc: 'a.precio DESC'
    };

    const orden = ordenesPermitidos[filtros.sort] || ordenesPermitidos.recent;

    sql += ` ORDER BY ${orden}`;

    const [rows] = await pool.execute(sql, params);

    return rows;
};


// Obtener artículo por ID
const obtenerPorId = async (id) => {
    const [rows] = await pool.execute(
        `SELECT
            a.id,
            a.vendedor_id,
            a.categoria_id,
            a.titulo,
            a.descripcion,
            a.precio,
            a.estado_conservacion,
            a.ciudad,
            a.provincia,
            a.pais,
            a.codigo_postal,
            a.publicado_en,
            a.creado_en,
            a.actualizado_en
        FROM articulos a
        WHERE a.id = ?
        AND a.estado_publicacion = 'activo'`,
        [id]
    );

    return rows[0] || null;
};


export {obtenerTodos, obtenerPorId};
