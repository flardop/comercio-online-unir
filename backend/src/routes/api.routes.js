import {Router} from 'express';
import apiArticles from './articles.router.js';
import apiCategories from './category.router.js';
import apiAuth from './auth.router.js';

const router = Router();

router.use('/articles', apiArticles);
router.use('/categories', apiCategories);
router.use('/auth', apiAuth);

export default router;