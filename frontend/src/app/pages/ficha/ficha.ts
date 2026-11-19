import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, startWith, switchMap } from 'rxjs';
import { Article } from '../../core/models/article';
import { Category } from '../../core/models/category';
import { PublicProfile } from '../../core/models/public-profile';
import { ArticuloService } from '../../core/services/articulo.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { CONDITION_LABELS, STATUS_LABELS, categoryEmoji, formatPrice, formatRating } from '../../core/util/etiquetas';
import { EstadoCarga } from '../../shared/estado-carga/estado-carga';

interface EstadoFicha {
  cargando: boolean;
  error: string | null;
  article: Article | null;
  categoria: Category | null;
  vendedor: PublicProfile | null;
}

const CARGANDO: EstadoFicha = { cargando: true, error: null, article: null, categoria: null, vendedor: null };

function estadoError(error: unknown): EstadoFicha {
  const noEncontrado = error instanceof HttpErrorResponse && error.status === 404;
  return {
    ...CARGANDO,
    cargando: false,
    error: noEncontrado
      ? 'Artículo no encontrado.'
      : 'No se ha podido cargar el artículo. Inténtalo de nuevo.',
  };
}

@Component({
  selector: 'app-ficha',
  imports: [EstadoCarga, RouterLink],
  templateUrl: './ficha.html',
  styleUrl: './ficha.css',
})
export class Ficha {
  private readonly route = inject(ActivatedRoute);
  private readonly articulos = inject(ArticuloService);
  private readonly categorias = inject(CategoriaService);
  private readonly usuarios = inject(UsuarioService);

  protected readonly fotoFallida = signal(false);

  protected readonly estado = toSignal(
    this.route.paramMap.pipe(
      map((params) => Number(params.get('id'))),
      switchMap((id) =>
        this.articulos.obtener(id).pipe(
          switchMap((article) =>
            forkJoin({
              categorias: this.categorias.listar().pipe(catchError(() => of([] as Category[]))),
              vendedor: this.usuarios.obtener(article.ownerId).pipe(catchError(() => of(null))),
            }).pipe(
              map(
                (r): EstadoFicha => ({
                  cargando: false,
                  error: null,
                  article,
                  categoria: r.categorias.find((c) => c.id === article.categoryId) ?? null,
                  vendedor: r.vendedor,
                }),
              ),
            ),
          ),
          catchError((error: unknown) => of(estadoError(error))),
          startWith(CARGANDO),
        ),
      ),
    ),
    { initialValue: CARGANDO },
  );

  protected readonly vista = computed(() => {
    const { article, categoria, vendedor } = this.estado();
    if (article === null) return null;
    const nombre = vendedor?.name ?? 'Vendedor';
    return {
      titulo: article.title,
      descripcion: article.description,
      precio: formatPrice(article.price),
      condicion: CONDITION_LABELS[article.condition],
      estado: STATUS_LABELS[article.status],
      ciudad: article.city ?? 'Ubicación sin indicar',
      categoria: categoria?.name ?? 'Sin categoría',
      foto: this.fotoFallida() ? null : (article.images[0]?.url ?? null),
      emoji: categoryEmoji(categoria?.name),
      vendedor: nombre,
      inicial: nombre.charAt(0).toUpperCase(),
      valoracion:
        vendedor === null
          ? 'Vendedor no disponible'
          : vendedor.ratingCount > 0
            ? `⭐ ${formatRating(vendedor.ratingAverage)} (${vendedor.ratingCount} valoraciones)`
            : 'Sin valoraciones todavía',
    };
  });

  protected marcarFotoFallida(): void {
    this.fotoFallida.set(true);
  }
}
