import db from '../config/db.js';


// Obtener usuario por ID
const obtenerPorId = async (id) => {
    const [rows] = await db.execute(
        `SELECT
            id,
            rol_id,
            nombre,
            nombre_usuario,
            email,
            activo,
            creado_en
        FROM usuarios
        WHERE id = ?`,
        [id]
    );

    return rows[0] || null;
};

export {
    obtenerPorId
};
