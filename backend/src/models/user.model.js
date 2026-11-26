import db from '../config/db.js';


// Obtener usuario por ID
const obtenerPorId = async (id) => {
    const [rows] = await db.execute(
        `SELECT
            id,
            nombre_usuario,
            nombre_completo,
            foto_perfil,
            biografia,
            ciudad,
            provincia,
            pais,
            creado_en
        FROM usuarios
        WHERE id = ?
        AND estado = 'activo'`,
        [id]
    );

    return rows[0] || null;
};

export {
    obtenerPorId
};
