import { z } from 'zod';
import { obtenerTodos, obtenerPorId } from '../models/article.model.js';

const filtrosSchema = z.object({
    q: z.string().trim().max(200).optional(),
    ownerId: z.coerce.number().int().positive().safe().optional(),
    categoryId: z.coerce.number().int().positive().safe().optional(),
    minPrice: z.coerce.number().finite().nonnegative().optional(),
    maxPrice: z.coerce.number().finite().nonnegative().optional(),
    condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']).optional(),
    city: z.string().trim().max(100).optional(),
    sort: z.enum(['recent', 'price_asc', 'price_desc']).default('recent'),
    page: z.coerce.number().int().min(1).max(1000000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20)
}).refine(f => f.minPrice === undefined || f.maxPrice === undefined || f.minPrice <= f.maxPrice,
    { message: 'El precio mínimo no puede superar al máximo.', path: ['minPrice'] });

export async function obtenerTodosLosArticulos(req, res) {
    const filtros = filtrosSchema.parse(req.query);
    res.json(await obtenerTodos(filtros));
}
export async function obtenerArticuloPorId(req, res) {
    const id = z.coerce.number().int().positive().safe().parse(req.params.id);
    const article = await obtenerPorId(id);
    if (!article) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Artículo no encontrado.' } });
    res.json({ article });
}
