import { ARTICLES } from './datos-prueba';
import { filtrarArticulos } from './filtrar-articulos';
import { ArticleFilter } from '../models/article';

function ids(filtro: ArticleFilter = {}): number[] {
  return filtrarArticulos(ARTICLES, filtro).data.map((a) => a.id);
}

describe('filtrarArticulos', () => {
  it('devuelve solo artículos publicados', () => {
    const pagina = filtrarArticulos(ARTICLES);
    expect(pagina.pagination.total).toBe(8);
    expect(pagina.data.map((a) => a.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(ids()).not.toContain(9);
    expect(ids()).not.toContain(10);
  });

  it('busca por texto en título y descripción, sin distinguir mayúsculas', () => {
    expect(ids({ q: 'BICI' })).toEqual([3]);
    expect(ids({ q: 'zzz' })).toEqual([]);
  });

  it('filtra por categoría', () => {
    expect(ids({ categoryId: 3 })).toEqual([1, 4]);
  });

  it('filtra por precio mínimo y máximo', () => {
    expect(ids({ maxPrice: 30 })).toEqual([5, 7]);
    expect(ids({ minPrice: 100 })).toEqual([2, 3]);
  });

  it('filtra por conservación', () => {
    expect(ids({ condition: 'good' })).toEqual([2, 3, 5, 7]);
  });

  it('filtra por ciudad sin distinguir mayúsculas', () => {
    expect(ids({ city: 'valencia' })).toEqual([3, 4, 8]);
  });

  it('ordena por precio', () => {
    expect(ids({ sort: 'price_asc' })[0]).toBe(5);
    expect(ids({ sort: 'price_desc' })[0]).toBe(3);
  });

  it('pagina con page y pageSize', () => {
    const pagina = filtrarArticulos(ARTICLES, { page: 2, pageSize: 3 });
    expect(pagina.data.map((a) => a.id)).toEqual([4, 5, 6]);
    expect(pagina.pagination).toEqual({ page: 2, pageSize: 3, total: 8, totalPages: 3 });
  });

  it('devuelve cero páginas si no hay resultados', () => {
    expect(filtrarArticulos(ARTICLES, { q: 'zzz' }).pagination).toEqual({
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
    });
  });
});
