import { pool } from '../config/db.js';

function categoriaPublica(row) {
    return { id: Number(row.id), name: row.nombre, slug: row.slug,
        parentId: row.categoria_padre_id === null ? null : Number(row.categoria_padre_id),
        isActive: Boolean(row.activa) };
}
export async function obtenerTodas() {
    const [rows] = await pool.execute('SELECT id, nombre, slug, categoria_padre_id, activa FROM categorias WHERE activa = TRUE ORDER BY nombre');
    return rows.map(categoriaPublica);
}
export async function obtenerPorId(id) {
    const [rows] = await pool.execute('SELECT id, nombre, slug, categoria_padre_id, activa FROM categorias WHERE id = ? AND activa = TRUE', [id]);
    return rows[0] ? categoriaPublica(rows[0]) : null;
}
