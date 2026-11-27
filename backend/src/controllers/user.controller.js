import { z } from 'zod';
import { obtenerPorId } from '../models/user.model.js';

export async function obtenerUsuarioPorId(req, res) {
    const id = z.coerce.number().int().positive().safe().parse(req.params.id);
    const user = await obtenerPorId(id);
    if (!user) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Usuario no encontrado.' } });
    res.json({ user });
}
