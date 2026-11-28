import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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

const NO_ENCONTRADO: EstadoFicha = { ...CARGANDO, cargando: false, error: 'Artículo no encontrado.' };

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
  /** El :id de la ruta (lo rellena el router gracias a withComponentInputBinding). */
  readonly id = input<string>();

  private readonly articulos = inject(ArticuloService);
  private readonly categorias = inject(CategoriaService);
  private readonly usuarios = inject(UsuarioService);

  protected readonly fotoFallida = signal(false);

  protected readonly estado = signal<EstadoFicha>(CARGANDO);

  /** Número de la última carga: sirve para ignorar las respuestas que llegan tarde. */
  private ultimaPeticion = 0;

  constructor() {
    // El effect se ejecuta al entrar y cada vez que cambia el id.
    effect(() => {
      this.cargar(Number(this.id()));
    });
  }

  private async cargar(id: number): Promise<void> {
    const peticion = ++this.ultimaPeticion;
    this.fotoFallida.set(false);
    if (!Number.isInteger(id) || id <= 0) {
      this.estado.set(NO_ENCONTRADO);
      return;
    }
    this.estado.set(CARGANDO);
    try {
      const article = await this.articulos.obtener(id);
      const categoria = await this.buscarCategoria(article.categoryId);
      const vendedor = await this.buscarVendedor(article.ownerId);
      if (peticion !== this.ultimaPeticion) return;
      this.estado.set({ cargando: false, error: null, article, categoria, vendedor });
    } catch (error) {
      if (peticion !== this.ultimaPeticion) return;
      this.estado.set(estadoError(error));
    }
  }

  /** Dato secundario: si falla, la ficha se muestra igualmente. */
  private async buscarCategoria(id: number): Promise<Category | null> {
    try {
      const categorias = await this.categorias.listar();
      return categorias.find((c) => c.id === id) ?? null;
    } catch {
      return null;
    }
  }

  /** Dato secundario: si falla, la ficha se muestra igualmente. */
  private async buscarVendedor(id: number): Promise<PublicProfile | null> {
    try {
      return await this.usuarios.obtener(id);
    } catch {
      return null;
    }
  }

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
      perfilId: vendedor?.id ?? null,
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
