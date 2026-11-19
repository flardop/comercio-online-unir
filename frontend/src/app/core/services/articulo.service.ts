import { Injectable, inject } from '@angular/core';
import { Observable, defer, delay, of, throwError } from 'rxjs';
import { notFound } from '../mocks/errores';
import { ARTICLES } from '../mocks/datos-prueba';
import { filtrarArticulos } from '../mocks/filtrar-articulos';
import { Article, ArticleFilter, ArticlePage } from '../models/article';
import { MOCK_DELAY_MS } from './mock-delay';

/**
 * Contrato: GET /articles y GET /articles/{articleId}.
 * GET /articles/{id} responde `{ article: Article }`; este servicio ya devuelve el artículo desenvuelto
 * (como UsuarioService con `{ user }`), así que al cambiar a HttpClient hay que hacer `map(r => r.article)`.
 * Hoy responde con datos de prueba; al conectar la API solo cambia el cuerpo de cada método por HttpClient.
 */
@Injectable({ providedIn: 'root' })
export class ArticuloService {
  private readonly retardo = inject(MOCK_DELAY_MS);

  listar(filtro: ArticleFilter = {}): Observable<ArticlePage> {
    return defer(() => of(filtrarArticulos(ARTICLES, filtro))).pipe(delay(this.retardo));
  }

  obtener(id: number): Observable<Article> {
    return defer(() => {
      const articulo = ARTICLES.find((a) => a.id === id && a.status === 'published');
      return articulo ? of(articulo) : throwError(() => notFound('Artículo no encontrado'));
    }).pipe(delay(this.retardo));
  }
}
