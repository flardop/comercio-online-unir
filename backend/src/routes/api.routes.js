import {Router} from 'express';
import apiArticles from './articles.router.js';
import apiUsers from './users.router.js';
import apiCategories from './category.router.js';

const router = Router();

//router.use('/authors', apiAuthors);
router.use('/articulos', apiArticles);
router.use('/categorias', apiCategories);

export default router;