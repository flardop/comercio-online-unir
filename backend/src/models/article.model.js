import db from '../config/db.js';

// Obtener artículos con filtros
const obtenerTodos = async (filtros = {}) => {
    let sql = `
        SELECT a.*
        FROM articulos a
        INNER JOIN usuarios u ON a.usuario_id = u.id
        WHERE a.estado_publicacion = 'publicado'
    `;

    const params = [];

    // Búsqueda por título o descripción
    if (filtros.q) {
        sql += ` AND (
            a.titulo LIKE ?
            OR a.descripcion LIKE ?
        )`;

        params.push(`%${filtros.q}%`, `%${filtros.q}%`);
    }

    // Filtrar por categoría
    if (filtros.categoryId) {
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

    // Filtrar por ciudad
    if (filtros.city) {
        sql += ' AND u.ciudad LIKE ?';
        params.push(`%${filtros.city}%`);
    }

    // Filtrar por distancia geográfica
    if (
        filtros.lat !== undefined &&
        filtros.lng !== undefined &&
        filtros.radiusKm !== undefined
    ) {
        sql += `
            AND (
                6371 * ACOS(
                    LEAST(1, GREATEST(-1,
                        COS(RADIANS(?)) *
                        COS(RADIANS(u.latitud)) *
                        COS(RADIANS(u.longitud) - RADIANS(?)) +
                        SIN(RADIANS(?)) *
                        SIN(RADIANS(u.latitud))
                    ))
                )
            ) <= ?
        `;

        params.push(
            filtros.lat,
            filtros.lng,
            filtros.lat,
            filtros.radiusKm
        );
    }

    // Ordenación
    const ordenesPermitidos = {
        recent: 'a.creado_en DESC',
        price_asc: 'a.precio ASC',
        price_desc: 'a.precio DESC'
    };

    const orden = ordenesPermitidos[filtros.sort] || ordenesPermitidos.recent;

    sql += ` ORDER BY ${orden}`;

    const [rows] = await db.execute(sql, params);

    return rows;
};


// Obtener artículo por ID
const obtenerPorId = async (id) => {
    const [rows] = await db.execute(
        `SELECT *
         FROM articulos
         WHERE id = ?
         AND estado_publicacion = 'publicado'`,
        [id]
    );

    return rows[0] || null;
};


export {obtenerTodos, obtenerPorId};
