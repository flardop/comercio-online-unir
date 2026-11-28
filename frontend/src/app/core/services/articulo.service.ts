import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Article, ArticleFilter, ArticlePage } from '../models/article';

@Injectable({ providedIn: 'root' })
export class ArticuloService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/articles';

  /** GET /api/articles: devuelve los artículos y los datos de paginación. */
  async listar(filtro: ArticleFilter = {}): Promise<ArticlePage> {
    // Solo se envían los filtros que tienen valor.
    const params: Record<string, string | number> = {};
    for (const [clave, valor] of Object.entries(filtro)) {
      if (valor !== undefined && valor !== '') {
        params[clave] = valor;
      }
    }
    return firstValueFrom(this.http.get<ArticlePage>(this.apiUrl, { params }));
  }

  /** GET /api/articles/{id}: la API responde { article }. */
  async obtener(id: number): Promise<Article> {
    const respuesta = await firstValueFrom(this.http.get<{ article: Article }>(`${this.apiUrl}/${id}`));
    return respuesta.article;
  }

  /**
   * Artículos publicados de un vendedor, en el orden que devuelve la API (los más recientes primero).
   * 100 es el máximo que admite la API en una sola página.
   */
  async listarPorVendedor(ownerId: number): Promise<Article[]> {
    const params = { ownerId, sort: 'recent', pageSize: 100 };
    const respuesta = await firstValueFrom(this.http.get<ArticlePage>(this.apiUrl, { params }));
    return respuesta.data;
  }
}
