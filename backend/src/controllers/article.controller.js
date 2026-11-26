import {obtenerTodos, obtenerPorId} from '../models/article.model.js';

const obtenerTodosLosArticulos = async (req, res) => {
    try{
        const filtros = {
            q: req.query.q,
            categoryId: req.query.categoryId,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            condition: req.query.condition,
            city: req.query.city,
            lat: req.query.lat,
            lng: req.query.lng,
            radiusKm: req.query.radiusKm,
            sort: req.query.sort
        };

        const articulos = await obtenerTodos(filtros);
        res.json(articulos);
    }catch (error) {
        res.status(500).json({ error: 'Error al obtener los artículos' });
    }
}

const obtenerArticuloPorId = async (req, res) => {
    const articuloId = req.params.id;
    try{
        const articulo = await obtenerPorId(articuloId);
        if (!articulo) {
            return res.status(404).json({ error: 'Artículo no encontrado' });
        }
        res.json(articulo);
    }catch (error) {
        console.error('Error al obtener el artículo por ID:', error);
        res.status(500).json({ error: 'Error al obtener el artículo' });
    }
}




export {obtenerTodosLosArticulos, obtenerArticuloPorId};