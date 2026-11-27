import { convertToParamMap } from '@angular/router';
import { filtroDesdeUrl } from './filtro-url';

describe('filtroDesdeUrl', () => {
  it('devuelve un filtro vacío sin parámetros', () => {
    expect(filtroDesdeUrl(convertToParamMap({}))).toEqual({});
  });

  it('convierte los parámetros válidos', () => {
    const filtro = filtroDesdeUrl(
      convertToParamMap({ q: ' lámpara ', categoryId: '3', maxPrice: '100', condition: 'like_new', city: 'Madrid' }),
    );
    expect(filtro).toEqual({ q: 'lámpara', categoryId: 3, maxPrice: 100, condition: 'like_new', city: 'Madrid' });
  });

  it('ignora números inválidos, condiciones desconocidas y valores vacíos', () => {
    const filtro = filtroDesdeUrl(
      convertToParamMap({ categoryId: 'abc', maxPrice: '-5', condition: 'roto', city: '  ', q: '' }),
    );
    expect(filtro).toEqual({});
  });
});
