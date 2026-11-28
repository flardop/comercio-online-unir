import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  /** El :id de la ruta (lo rellena el router gracias a withComponentInputBinding). */
  readonly id = input<string>();

  private readonly articulosService = inject(ArticuloService);
  private readonly categoriasService = inject(CategoriaService);
  private readonly usuarios = inject(UsuarioService);

  protected readonly fotoFallida = signal(false);

  protected readonly estado = signal<EstadoPerfil>(CARGANDO);

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
      const vendedor = await this.usuarios.obtener(id);
      const articulos = await this.buscarArticulos(vendedor.id);
      const categorias = await this.buscarCategorias();
      if (peticion !== this.ultimaPeticion) return;
      this.estado.set({ cargando: false, error: null, vendedor, articulos, categorias });
    } catch (error) {
      if (peticion !== this.ultimaPeticion) return;
      this.estado.set(estadoError(error));
    }
  }

  /** Dato secundario: si falla, el perfil se muestra igualmente. */
  private async buscarArticulos(ownerId: number): Promise<Article[] | null> {
    try {
      return await this.articulosService.listarPorVendedor(ownerId);
    } catch {
      return null;
    }
  }

  /** Dato secundario: si falla, se usa el emoji genérico. */
  private async buscarCategorias(): Promise<Category[]> {
    try {
      return await this.categoriasService.listar();
    } catch {
      return [];
    }
  }

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

  protected emojiDe(articulo: Article): string {
    const categoria = this.estado().categorias.find((c) => c.id === articulo.categoryId);
    return categoryEmoji(categoria?.name);
  }

  protected marcarFotoFallida(): void {
    this.fotoFallida.set(true);
  }
}
