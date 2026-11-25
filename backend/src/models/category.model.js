import {pool} from '../config/db.js';

const obtenerTodas = async (filtros = {}) => {
    let sql = `
        SELECT
            id,
            categoria_padre_id,
            nombre,
            descripcion,
            activa,
            creado_en
        FROM categorias
        WHERE activa = TRUE
    `;

    const params = [];

    // Buscar por nombre
    if (filtros.q) {
        sql += ' AND nombre LIKE ?';
        params.push(`%${filtros.q}%`);
    }

    // Filtrar por categoría padre
    if (filtros.categoriaPadreId !== undefined) {
        if (filtros.categoriaPadreId === null) {
            sql += ' AND categoria_padre_id IS NULL';
        } else {
            sql += ' AND categoria_padre_id = ?';
            params.push(filtros.categoriaPadreId);
        }
    }

    // Ordenación
    const ordenesPermitidos = {
        name_asc: 'nombre ASC',
        name_desc: 'nombre DESC',
        recent: 'creado_en DESC'
    };

    const orden = ordenesPermitidos[filtros.sort] || 'nombre ASC';

    sql += ` ORDER BY ${orden}`;

    const [rows] = await pool.execute(sql, params);

    return rows;
};


// Obtener categoría por ID
const obtenerPorId = async (id) => {
    const [rows] = await pool.execute(
        `SELECT
            id,
            categoria_padre_id,
            nombre,
            descripcion,
            activa,
            creado_en
        FROM categorias
        WHERE id = ?
        AND activa = TRUE`,
        [id]
    );

    return rows[0] || null;
};


export {
    obtenerTodas,
    obtenerPorId
};
