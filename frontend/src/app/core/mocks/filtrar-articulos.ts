import { Article, ArticleFilter, ArticlePage } from '../models/article';

export const DEFAULT_PAGE_SIZE = 20;

export function filtrarArticulos(articles: Article[], filtro: ArticleFilter = {}): ArticlePage {
  const texto = filtro.q?.trim().toLocaleLowerCase('es');
  const ciudad = filtro.city?.trim().toLocaleLowerCase('es');

  let lista = articles.filter((a) => a.status === 'published');
  if (texto) {
    lista = lista.filter((a) => `${a.title} ${a.description}`.toLocaleLowerCase('es').includes(texto));
  }
  if (filtro.categoryId !== undefined) {
    lista = lista.filter((a) => a.categoryId === filtro.categoryId);
  }
  if (filtro.minPrice !== undefined) {
    lista = lista.filter((a) => a.price >= (filtro.minPrice as number));
  }
  if (filtro.maxPrice !== undefined) {
    lista = lista.filter((a) => a.price <= (filtro.maxPrice as number));
  }
  if (filtro.condition) {
    lista = lista.filter((a) => a.condition === filtro.condition);
  }
  if (ciudad) {
    lista = lista.filter((a) => (a.city ?? '').toLocaleLowerCase('es').includes(ciudad));
  }

  const orden = filtro.sort ?? 'recent';
  lista = [...lista].sort((a, b) => {
    if (orden === 'price_asc') return a.price - b.price;
    if (orden === 'price_desc') return b.price - a.price;
    return b.createdAt.localeCompare(a.createdAt);
  });

  const page = filtro.page ?? 1;
  const pageSize = filtro.pageSize ?? DEFAULT_PAGE_SIZE;
  const total = lista.length;
  return {
    data: lista.slice((page - 1) * pageSize, page * pageSize),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}
