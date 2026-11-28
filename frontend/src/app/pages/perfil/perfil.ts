import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, startWith, switchMap, tap } from 'rxjs';
import { Article } from '../../core/models/article';
import { Category } from '../../core/models/category';
import { PublicProfile } from '../../core/models/public-profile';
import { ArticuloService } from '../../core/services/articulo.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { categoryEmoji, formatRating } from '../../core/util/etiquetas';
import { ArticuloCard } from '../../shared/articulo-card/articulo-card';
import { EstadoCarga } from '../../shared/estado-carga/estado-carga';

interface EstadoPerfil {
  cargando: boolean;
  error: string | null;
  vendedor: PublicProfile | null;
  /** null si no se han podido cargar: el perfil se muestra igualmente. */
  articulos: Article[] | null;
  categorias: Category[];
}

const CARGANDO: EstadoPerfil = { cargando: true, error: null, vendedor: null, articulos: null, categorias: [] };

const NO_ENCONTRADO: EstadoPerfil = { ...CARGANDO, cargando: false, error: 'Perfil no encontrado.' };

function estadoError(error: unknown): EstadoPerfil {
  if (error instanceof HttpErrorResponse && error.status === 404) return NO_ENCONTRADO;
  return { ...CARGANDO, cargando: false, error: 'No se ha podido cargar el perfil. Inténtalo de nuevo.' };
}

@Component({
  selector: 'app-perfil',
  imports: [ArticuloCard, EstadoCarga, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  private readonly route = inject(ActivatedRoute);
  private readonly articulosService = inject(ArticuloService);
  private readonly categoriasService = inject(CategoriaService);
  private readonly usuarios = inject(UsuarioService);

  protected readonly fotoFallida = signal(false);

  protected readonly estado = toSignal(
    this.route.paramMap.pipe(
      map((params) => Number(params.get('id'))),
      tap(() => this.fotoFallida.set(false)),
      switchMap((id) =>
        !Number.isInteger(id) || id <= 0
          ? of(NO_ENCONTRADO)
          : this.usuarios.obtener(id).pipe(
              switchMap((vendedor) =>
                forkJoin({
                  articulos: this.articulosService.listarPorVendedor(vendedor.id).pipe(catchError(() => of(null))),
                  categorias: this.categoriasService.listar().pipe(catchError(() => of([] as Category[]))),
                }).pipe(map((r): EstadoPerfil => ({ cargando: false, error: null, vendedor, ...r }))),
              ),
              catchError((error: unknown) => of(estadoError(error))),
              startWith(CARGANDO),
            ),
      ),
    ),
    { initialValue: CARGANDO },
  );

  protected readonly vista = computed(() => {
    const { vendedor } = this.estado();
    if (vendedor === null) return null;
    return {
      nombre: vendedor.name,
      inicial: vendedor.name.charAt(0).toUpperCase(),
      avatar: this.fotoFallida() ? null : vendedor.avatarUrl,
      ciudad: vendedor.city ?? 'Ubicación sin indicar',
      biografia: vendedor.bio,
      valoracion:
        vendedor.ratingCount > 0
          ? `⭐ ${formatRating(vendedor.ratingAverage)} (${vendedor.ratingCount} valoraciones)`
          : 'Sin valoraciones todavía',
    };
  });

  private readonly categoriasPorId = computed(
    () => new Map(this.estado().categorias.map((c) => [c.id, c.name])),
  );

  protected emojiDe(articulo: Article): string {
    return categoryEmoji(this.categoriasPorId().get(articulo.categoryId));
  }

  protected marcarFotoFallida(): void {
    this.fotoFallida.set(true);
  }
}
