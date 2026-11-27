import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { NEVER, of, throwError } from 'rxjs';
import { ARTICLES, CATEGORIES, USERS } from '../../core/mocks/datos-prueba';
import { PublicProfile } from '../../core/models/public-profile';
import { ArticuloService } from '../../core/services/articulo.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Perfil } from './perfil';

const NEREA = USERS[2];
const SUS_ARTICULOS = ARTICLES.filter((a) => a.ownerId === NEREA.id);

describe('Perfil público', () => {
  const obtenerUsuario = vi.fn();
  const listarPorVendedor = vi.fn();
  const listarCategorias = vi.fn();

  beforeEach(() => {
    obtenerUsuario.mockReset().mockReturnValue(of(NEREA));
    listarPorVendedor.mockReset().mockReturnValue(of(SUS_ARTICULOS));
    listarCategorias.mockReset().mockReturnValue(of(CATEGORIES));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'perfiles/:id', component: Perfil }]),
        { provide: ArticuloService, useValue: { listarPorVendedor } },
        { provide: CategoriaService, useValue: { listar: listarCategorias } },
        { provide: UsuarioService, useValue: { obtener: obtenerUsuario } },
      ],
    });
  });

  async function abrir(url = '/perfiles/3') {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, Perfil);
    harness.detectChanges();
    return { harness, raiz: harness.routeNativeElement as HTMLElement };
  }

  function con(cambios: Partial<PublicProfile>): void {
    obtenerUsuario.mockReturnValue(of({ ...NEREA, ...cambios }));
  }

  it('muestra los datos públicos del vendedor', async () => {
    const { raiz } = await abrir();
    const texto = raiz.textContent ?? '';
    expect(obtenerUsuario).toHaveBeenCalledWith(3);
    expect(texto).toContain('← Volver a explorar');
    expect(raiz.querySelector('h1')?.textContent).toContain('Nerea');
    expect(texto).toContain('⌖ Valencia · ⭐ 5,0 (21 valoraciones)');
    expect(texto).toContain('Perfil público. El email no se muestra.');
    expect(texto).toContain('Siempre en bici.');
    expect(raiz.querySelector('.avatar')?.textContent?.trim()).toBe('N');
  });

  it('no muestra alias, direcciones de correo ni teléfono', async () => {
    const { raiz } = await abrir();
    expect(raiz.querySelector('h1')?.textContent).toContain('Nerea');
    expect(raiz.textContent).not.toMatch(/@|nerea|teléfono/);
  });

  it('muestra sus artículos publicados con articulo-card', async () => {
    const { raiz } = await abrir();
    expect(listarPorVendedor).toHaveBeenCalledWith(3);
    expect(raiz.textContent).toContain('Artículos publicados');
    const tarjetas = raiz.querySelectorAll('.cards app-articulo-card');
    expect(tarjetas.length).toBe(1);
    expect(tarjetas[0].textContent).toContain('Bicicleta urbana');
    expect(tarjetas[0].querySelector('a')?.getAttribute('href')).toBe('/articulos/3');
  });

  it('pasa a la tarjeta el emoji de la categoría del artículo', async () => {
    listarPorVendedor.mockReturnValue(of([{ ...SUS_ARTICULOS[0], images: [] }]));
    const { raiz } = await abrir();
    expect(raiz.querySelector('.cards .emojiFallback')?.textContent).toBe('🚲');
  });

  it('muestra las tarjetas aunque fallen las categorías', async () => {
    listarCategorias.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    const { raiz } = await abrir();
    expect(raiz.querySelectorAll('app-articulo-card').length).toBe(1);
  });

  it('usa textos alternativos si faltan ciudad y valoraciones, y omite la biografía', async () => {
    con({ city: null, bio: null, ratingCount: 0, ratingAverage: 0 });
    const { raiz } = await abrir();
    expect(raiz.textContent).toContain('⌖ Ubicación sin indicar · Sin valoraciones todavía');
    expect(raiz.querySelector('.perfil-bio')).toBeNull();
  });

  it('muestra la foto del avatar y vuelve a la inicial si falla', async () => {
    con({ avatarUrl: 'https://example.test/nerea.jpg' });
    const { harness, raiz } = await abrir();
    const foto = raiz.querySelector('.avatar img');
    expect(foto?.getAttribute('src')).toBe('https://example.test/nerea.jpg');
    foto?.dispatchEvent(new Event('error'));
    harness.detectChanges();
    expect(raiz.querySelector('.avatar img')).toBeNull();
    expect(raiz.querySelector('.avatar')?.textContent?.trim()).toBe('N');
  });

  it('avisa si el vendedor no tiene artículos publicados', async () => {
    listarPorVendedor.mockReturnValue(of([]));
    const { raiz } = await abrir();
    expect(raiz.textContent).toContain('Este vendedor todavía no tiene artículos publicados.');
  });

  it('muestra el perfil con un error en la lista si fallan solo los artículos', async () => {
    listarPorVendedor.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    const { raiz } = await abrir();
    expect(raiz.querySelector('h1')?.textContent).toContain('Nerea');
    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('No se han podido cargar sus artículos');
    expect(raiz.textContent).not.toContain('todavía no tiene artículos');
  });

  it('muestra «Perfil no encontrado.» si la API responde 404', async () => {
    obtenerUsuario.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    const { raiz } = await abrir('/perfiles/999');
    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('Perfil no encontrado.');
    expect(raiz.querySelector('h1')).toBeNull();
  });

  it('muestra un error genérico si falla el perfil', async () => {
    obtenerUsuario.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    const { raiz } = await abrir();
    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain(
      'No se ha podido cargar el perfil. Inténtalo de nuevo.',
    );
  });

  it('muestra el estado cargando mientras llega la respuesta', async () => {
    obtenerUsuario.mockReturnValue(NEVER);
    const { raiz } = await abrir();
    expect(raiz.textContent).toContain('Cargando');
    expect(raiz.querySelector('h1')).toBeNull();
  });

  it('no consulta nada si el id no es un entero positivo', async () => {
    const { raiz } = await abrir('/perfiles/abc');
    expect(obtenerUsuario).not.toHaveBeenCalled();
    expect(listarPorVendedor).not.toHaveBeenCalled();
    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('Perfil no encontrado.');
  });

  it('se actualiza al cambiar el id y recupera la foto del nuevo vendedor', async () => {
    obtenerUsuario.mockImplementation((id: number) =>
      of({ ...(USERS.find((u) => u.id === id) as PublicProfile), avatarUrl: `https://example.test/${id}.jpg` }),
    );
    const { harness, raiz } = await abrir();
    raiz.querySelector('.avatar img')?.dispatchEvent(new Event('error'));
    harness.detectChanges();
    await harness.navigateByUrl('/perfiles/1');
    harness.detectChanges();
    expect(raiz.querySelector('h1')?.textContent).toContain('Álex');
    expect(raiz.querySelector('.avatar img')?.getAttribute('src')).toBe('https://example.test/1.jpg');
    expect(listarPorVendedor).toHaveBeenLastCalledWith(1);
  });
});
