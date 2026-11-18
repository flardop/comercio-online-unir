import {obtenerPorId} from '../models/user.model.js';

const obtenerUsuarioPorId = async (req, res) => {
    const usuarioId = req.params.id;
    try {
        const usuario = await obtenerPorId(usuarioId);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
}

export { obtenerUsuarioPorId };