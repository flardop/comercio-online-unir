import db from '../config/db.js';

// Obtener categorías con filtros
const obtenerTodas = async () => {
    let sql = `
        SELECT
            id,
            nombre,
            activa
        FROM categorias
        WHERE 1 = 1
    `;

    const [rows] = await db.execute(sql);

    return rows;
};


// Obtener categoría por ID
const obtenerPorId = async (id) => {
    const [rows] = await db.execute(
        `SELECT
            id,
            nombre,
            activa
        FROM categorias
        WHERE id = ?`,
        [id]
    );

    return rows[0] || null;
};


export {
    obtenerTodas,
    obtenerPorId
};
