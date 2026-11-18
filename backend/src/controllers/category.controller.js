import {obtenerPorId, obtenerTodas} from '../models/category.model.js';

const obtenerCategorias = async (req, res) => {
    try {
        const categorias = await obtenerTodas();
        res.json(categorias);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
}

const obtenerCategoriaPorId = async (req, res) => {
    const categoriaId = req.params.id;
    try {
        const categoria = await obtenerPorId(categoriaId);
        if (!categoria) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        res.json(categoria);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la categoría' });
    }
};

export {obtenerCategorias, obtenerCategoriaPorId};