import { ParamMap } from '@angular/router';
import { ArticleFilter, Condition } from '../../core/models/article';
import { FILTER_CONDITIONS } from '../../core/util/etiquetas';

export type ClaveFiltro = 'q' | 'categoryId' | 'maxPrice' | 'condition' | 'city';

function numero(valor: string | null): number | undefined {
  if (valor === null || valor.trim() === '') return undefined;
  const n = Number(valor);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function esCondicion(valor: string): valor is Condition {
  return (FILTER_CONDITIONS as string[]).includes(valor);
}

export function filtroDesdeUrl(params: ParamMap): ArticleFilter {
  const filtro: ArticleFilter = {};

  const q = params.get('q')?.trim();
  if (q) filtro.q = q;

  const categoryId = numero(params.get('categoryId'));
  if (categoryId !== undefined) filtro.categoryId = categoryId;

  const maxPrice = numero(params.get('maxPrice'));
  if (maxPrice !== undefined) filtro.maxPrice = maxPrice;

  const condition = params.get('condition');
  if (condition && esCondicion(condition)) filtro.condition = condition;

  const city = params.get('city')?.trim();
  if (city) filtro.city = city;

  return filtro;
}
