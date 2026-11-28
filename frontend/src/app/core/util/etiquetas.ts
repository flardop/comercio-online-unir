import { ArticleStatus, Condition } from '../models/article';

export const CONDITION_LABELS: Record<Condition, string> = {
  new: 'Nuevo',
  like_new: 'Como nuevo',
  good: 'Buen estado',
  fair: 'Aceptable',
  poor: 'Con desgaste',
};

export const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  in_review: 'En revisión',
  removed: 'Retirado',
  sold: 'Vendido',
};

export const FILTER_CONDITIONS: Condition[] = ['new', 'like_new', 'good', 'fair'];
export const FILTER_MAX_PRICES: number[] = [30, 100, 300];
export const FILTER_CITIES: string[] = ['Valencia', 'Madrid', 'Barcelona', 'Bilbao', 'Zaragoza'];

const CATEGORY_ICONS: Record<string, string> = {
  Hogar: '🏠',
  Moda: '👕',
  Tecnología: '▣',
  Electrónica: '📱',
  Ropa: '👕',
  Deporte: '⚽',
  Libros: '📚',
  Mascotas: '🐾',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Hogar: '🛋️',
  Moda: '🧥',
  Tecnología: '📷',
  Electrónica: '📱',
  Ropa: '🧥',
  Deporte: '🚲',
  Libros: '📚',
  Mascotas: '🐾',
};

export const DEFAULT_EMOJI = '📦';

export function formatPrice(value: number): string {
  return `${value.toFixed(2).replace('.', ',')} €`;
}

export function formatRating(value: number): string {
  return value.toFixed(1).replace('.', ',');
}

export function categoryIcon(name: string): string {
  return CATEGORY_ICONS[name] ?? '✦';
}

export function categoryEmoji(name: string | undefined): string {
  return (name !== undefined ? CATEGORY_EMOJIS[name] : undefined) ?? DEFAULT_EMOJI;
}
