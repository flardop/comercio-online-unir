import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { NEVER, of, throwError } from 'rxjs';
import { ARTICLES, CATEGORIES, USERS } from '../../core/mocks/datos-prueba';
import { ArticuloService } from '../../core/services/articulo.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Ficha } from './ficha';

describe('Ficha', () => {
  const obtener = vi.fn();
  const obtenerUsuario = vi.fn();

  beforeEach(() => {
    obtener.mockReset();
    obtenerUsuario.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'articulos/:id', component: Ficha }]),
        { provide: ArticuloService, useValue: { obtener } },
        { provide: CategoriaService, useValue: { listar: () => of(CATEGORIES) } },
        { provide: UsuarioService, useValue: { obtener: obtenerUsuario } },
      ],
    });
  });

  async function abrir(url = '/articulos/1'): Promise<HTMLElement> {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, Ficha);
    harness.detectChanges();
    return harness.routeNativeElement as HTMLElement;
  }

  it('muestra el artículo con el diseño de v2', async () => {
    obtener.mockReturnValue(of(ARTICLES[0]));
    obtenerUsuario.mockReturnValue(of(USERS[0]));
    const raiz = await abrir();
    const texto = raiz.textContent ?? '';
    expect(obtener).toHaveBeenCalledWith(1);
    expect(obtenerUsuario).toHaveBeenCalledWith(1);
    expect(texto).toContain('← Volver a explorar');
    expect(texto).toContain('Cámara instantánea');
    expect(texto).toContain('85,00 €');
    expect(texto).toContain('⌖ Madrid · Tecnología');
    expect(texto).toContain('Descripción');
    expect(texto).toContain('Álex');
    expect(texto).toContain('⭐ 4,9 (12 valoraciones)');
    expect(texto).toContain('📍 Ubicación aproximada: Madrid.');
    expect(raiz.querySelector('.bigImg img')?.getAttribute('src')).toBe(ARTICLES[0].images[0].url);
  });

  it('muestra la conservación y el estado como etiquetas', async () => {
    obtener.mockReturnValue(of(ARTICLES[0]));
    obtenerUsuario.mockReturnValue(of(USERS[0]));
    const raiz = await abrir();
    const etiquetas = Array.from(raiz.querySelectorAll('.tag')).map((t) => t.textContent?.trim());
    expect(etiquetas).toEqual(['Como nuevo', 'Publicado']);
    expect(raiz.querySelector('.tag.green')?.textContent).toContain('Publicado');
  });

  it('dibuja desactivados Contactar, Favoritos y Reportar', async () => {
    obtener.mockReturnValue(of(ARTICLES[0]));
    obtenerUsuario.mockReturnValue(of(USERS[0]));
    const raiz = await abrir();
    const botones = Array.from(raiz.querySelectorAll<HTMLButtonElement>('.detail button'));
    expect(botones.map((b) => b.textContent?.trim())).toEqual(['💬 Contactar', '♡ Favoritos', 'Reportar']);
    expect(botones.every((b) => b.disabled)).toBe(true);
  });

  it('no muestra datos de contacto del vendedor', async () => {
    obtener.mockReturnValue(of(ARTICLES[0]));
    obtenerUsuario.mockReturnValue(of(USERS[0]));
    const raiz = await abrir();
    expect(raiz.textContent).not.toMatch(/@|teléfono|email/i);
  });

  it('usa el emoji de la categoría si el artículo no tiene fotos', async () => {
    obtener.mockReturnValue(of({ ...ARTICLES[0], images: [] }));
    obtenerUsuario.mockReturnValue(of(USERS[0]));
    const raiz = await abrir();
    expect(raiz.querySelector('.bigImg img')).toBeNull();
    expect(raiz.querySelector('.bigImg .emojiFallback')?.textContent).toBe('📷');
  });

  it('sigue mostrando el artículo si falla la carga del vendedor', async () => {
    obtener.mockReturnValue(of(ARTICLES[0]));
    obtenerUsuario.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    const raiz = await abrir();
    expect(raiz.textContent).toContain('Cámara instantánea');
    expect(raiz.textContent).toContain('Vendedor no disponible');
  });

  it('muestra «Artículo no encontrado.» si la API responde 404', async () => {
    obtener.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    const raiz = await abrir('/articulos/999');
    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('Artículo no encontrado.');
    expect(raiz.querySelector('.detail')).toBeNull();
  });

  it('muestra un error genérico si la API falla', async () => {
    obtener.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    const raiz = await abrir();
    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('No se ha podido cargar el artículo');
  });

  it('muestra el estado cargando mientras llega la respuesta', async () => {
    obtener.mockReturnValue(NEVER);
    const raiz = await abrir();
    expect(raiz.textContent).toContain('Cargando');
    expect(raiz.querySelector('.detail')).toBeNull();
  });

  it('no consulta la API y muestra «Artículo no encontrado.» si el id no es un entero positivo', async () => {
    const raiz = await abrir('/articulos/abc');
    expect(obtener).not.toHaveBeenCalled();
    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('Artículo no encontrado.');
  });

  it('vuelve a mostrar la foto al cambiar de artículo tras fallar la anterior', async () => {
    obtener.mockImplementation((id: number) => of(ARTICLES.find((a) => a.id === id) ?? ARTICLES[0]));
    obtenerUsuario.mockReturnValue(of(USERS[0]));
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/articulos/1', Ficha);
    harness.detectChanges();
    const raiz = harness.routeNativeElement as HTMLElement;
    raiz.querySelector('.bigImg img')?.dispatchEvent(new Event('error'));
    harness.detectChanges();
    expect(raiz.querySelector('.bigImg img')).toBeNull();
    expect(raiz.querySelector('.bigImg .emojiFallback')).not.toBeNull();
    const otro = ARTICLES.find((a) => a.id !== 1 && a.images.length > 0) as (typeof ARTICLES)[number];
    await harness.navigateByUrl(`/articulos/${otro.id}`);
    harness.detectChanges();
    expect(raiz.querySelector('.bigImg img')?.getAttribute('src')).toBe(otro.images[0].url);
  });

  it('el bloque del vendedor enlaza a su perfil público', async () => {
    obtener.mockReturnValue(of(ARTICLES[2]));
    obtenerUsuario.mockReturnValue(of(USERS[2]));
    const raiz = await abrir('/articulos/3');
    const enlace = raiz.querySelector('a.vendedor');
    expect(enlace?.getAttribute('href')).toBe('/perfiles/3');
    expect(enlace?.textContent).toContain('Nerea');
    expect(enlace?.textContent).toContain('Ver perfil');
  });

  it('no enlaza al perfil si no se ha podido cargar el vendedor', async () => {
    obtener.mockReturnValue(of(ARTICLES[0]));
    obtenerUsuario.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    const raiz = await abrir();
    expect(raiz.querySelector('a[href^="/perfiles/"]')).toBeNull();
    expect(raiz.querySelector('.vendedor')?.textContent).toContain('Vendedor no disponible');
  });
});
