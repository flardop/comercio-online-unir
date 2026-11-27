import { pool } from '../config/db.js';

export async function obtenerPorId(id) {
    // Selección explícita: el perfil público no incluye email ni contraseña.
    const [rows] = await pool.execute(`SELECT id, nombre_usuario, nombre_completo,
        foto_perfil, biografia, ciudad FROM usuarios WHERE id = ? AND estado = 'activo'`, [id]);
    const row = rows[0];
    if (!row) return null;
    return { id: Number(row.id), username: row.nombre_usuario, name: row.nombre_completo || row.nombre_usuario,
        city: row.ciudad, avatarUrl: row.foto_perfil, bio: row.biografia,
        // Este sprint no tiene valoraciones: el contador queda a cero.
        ratingAverage: 0, ratingCount: 0 };
}
