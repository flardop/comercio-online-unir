import { z } from 'zod';
import { obtenerPorId, obtenerTodas } from '../models/category.model.js';

export async function obtenerCategorias(_req, res) { res.json(await obtenerTodas()); }
export async function obtenerCategoriaPorId(req, res) {
    const id = z.coerce.number().int().positive().safe().parse(req.params.id);
    const category = await obtenerPorId(id);
    if (!category) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Categoría no encontrada.' } });
    res.json({ category });
}
