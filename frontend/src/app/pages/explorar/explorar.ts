import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { Article, ArticlePage } from '../../core/models/article';
import { Category } from '../../core/models/category';
import { ArticuloService } from '../../core/services/articulo.service';
import { CategoriaService } from '../../core/services/categoria.service';
import {
  CONDITION_LABELS,
  FILTER_CITIES,
  FILTER_CONDITIONS,
  FILTER_MAX_PRICES,
  categoryEmoji,
  categoryIcon,
} from '../../core/util/etiquetas';
import { ArticuloCard } from '../../shared/articulo-card/articulo-card';
import { EstadoCarga } from '../../shared/estado-carga/estado-carga';
import { CLAVES_FILTRO, ClaveFiltro, filtroDesdeUrl } from './filtro-url';

interface EstadoListado {
  cargando: boolean;
  error: string | null;
  pagina: ArticlePage | null;
}

const CARGANDO: EstadoListado = { cargando: true, error: null, pagina: null };
const MENSAJE_ERROR = 'No se han podido cargar los artículos. Inténtalo de nuevo.';

@Component({
  selector: 'app-explorar',
  imports: [ArticuloCard, EstadoCarga],
  templateUrl: './explorar.html',
  styleUrl: './explorar.css',
})
export class Explorar {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly articulosService = inject(ArticuloService);
  private readonly categoriasService = inject(CategoriaService);

  protected readonly condiciones = FILTER_CONDITIONS;
  protected readonly precios = FILTER_MAX_PRICES;
  protected readonly ciudades = FILTER_CITIES;
  protected readonly etiquetas = CONDITION_LABELS;
  protected readonly icono = categoryIcon;

  protected readonly filtro = toSignal(this.route.queryParamMap.pipe(map(filtroDesdeUrl)), {
    initialValue: filtroDesdeUrl(this.route.snapshot.queryParamMap),
  });

  protected readonly categorias = toSignal(
    this.categoriasService.listar().pipe(catchError(() => of([] as Category[]))),
    { initialValue: [] as Category[] },
  );

  protected readonly estado = toSignal(
    this.route.queryParamMap.pipe(
      map(filtroDesdeUrl),
      switchMap((filtro) =>
        this.articulosService.listar(filtro).pipe(
          map((pagina): EstadoListado => ({ cargando: false, error: null, pagina })),
          catchError(() => of<EstadoListado>({ cargando: false, error: MENSAJE_ERROR, pagina: null })),
          startWith(CARGANDO),
        ),
      ),
    ),
    { initialValue: CARGANDO },
  );

  protected readonly articulos = computed(() => this.estado().pagina?.data ?? []);
  protected readonly total = computed(() => this.estado().pagina?.pagination.total ?? 0);
  protected readonly vacio = computed(
    () => !this.estado().cargando && this.estado().error === null && this.total() === 0,
  );
  private readonly categoriasPorId = computed(() => new Map(this.categorias().map((c) => [c.id, c.name])));

  protected emojiDe(articulo: Article): string {
    return categoryEmoji(this.categoriasPorId().get(articulo.categoryId));
  }

  protected fijar(clave: ClaveFiltro, valor: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [clave]: valor.trim() === '' ? null : valor },
      queryParamsHandling: 'merge',
    });
  }

  protected limpiar(): void {
    const vacios = Object.fromEntries(CLAVES_FILTRO.map((clave) => [clave, null]));
    void this.router.navigate([], { relativeTo: this.route, queryParams: vacios, queryParamsHandling: 'merge' });
  }

  protected irAProductos(destino: HTMLElement): void {
    destino.scrollIntoView({ behavior: 'smooth' });
  }
}
