import {
  CONDITION_LABELS,
  FILTER_CITIES,
  FILTER_CONDITIONS,
  FILTER_MAX_PRICES,
  STATUS_LABELS,
  categoryEmoji,
  categoryIcon,
  formatPrice,
  formatRating,
} from './etiquetas';

describe('etiquetas', () => {
  it('formatPrice usa coma decimal y el símbolo €', () => {
    expect(formatPrice(85)).toBe('85,00 €');
    expect(formatPrice(1200.5)).toBe('1200,50 €');
  });

  it('formatRating usa un decimal con coma', () => {
    expect(formatRating(4.9)).toBe('4,9');
    expect(formatRating(5)).toBe('5,0');
  });

  it('etiqueta las cinco conservaciones del contrato', () => {
    expect(CONDITION_LABELS).toEqual({
      new: 'Nuevo',
      like_new: 'Como nuevo',
      good: 'Buen estado',
      fair: 'Aceptable',
      poor: 'Con desgaste',
    });
  });

  it('etiqueta el estado publicado', () => {
    expect(STATUS_LABELS.published).toBe('Publicado');
  });

  it('asigna icono y emoji por categoría, con valores por defecto', () => {
    expect(categoryIcon('Hogar')).toBe('⌂');
    expect(categoryIcon('Otra')).toBe('✦');
    expect(categoryEmoji('Deporte')).toBe('🚲');
    expect(categoryEmoji('Otra')).toBe('📦');
    expect(categoryEmoji(undefined)).toBe('📦');
  });

  it('tiene icono y emoji para Electrónica y Ropa, las categorías de la base de datos', () => {
    expect(categoryIcon('Electrónica')).toBe('📱');
    expect(categoryIcon('Ropa')).toBe('👕');
    expect(categoryEmoji('Electrónica')).toBe('📱');
    expect(categoryEmoji('Ropa')).toBe('🧥');
  });

  it('define las opciones de filtro de v2', () => {
    expect(FILTER_CONDITIONS).toEqual(['new', 'like_new', 'good', 'fair']);
    expect(FILTER_MAX_PRICES).toEqual([30, 100, 300]);
    expect(FILTER_CITIES).toEqual(['Valencia', 'Madrid', 'Barcelona', 'Bilbao', 'Zaragoza']);
  });
});
