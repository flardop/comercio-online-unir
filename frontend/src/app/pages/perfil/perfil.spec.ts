import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ARTICLES, CATEGORIES, USERS } from '../../core/mocks/datos-prueba';
import { PublicProfile } from '../../core/models/public-profile';
import { ArticuloService } from '../../core/services/articulo.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Perfil } from './perfil';

const NEREA = USERS[2];
const SUS_ARTICULOS = ARTICLES.filter((a) => a.ownerId === NEREA.id);

/** Deja que terminen las promesas pendientes y repinta la pantalla. */
async function esperar(harness: RouterTestingHarness): Promise<void> {
  harness.detectChanges();
  await new Promise((resolve) => setTimeout(resolve));
  harness.detectChanges();
}

describe('Perfil público', () => {
  const obtenerUsuario = vi.fn();
  const listarPorVendedor = vi.fn();
  const listarCategorias = vi.fn();

  beforeEach(() => {
    obtenerUsuario.mockReset().mockResolvedValue(NEREA);
    listarPorVendedor.mockReset().mockResolvedValue(SUS_ARTICULOS);
    listarCategorias.mockReset().mockResolvedValue(CATEGORIES);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'perfiles/:id', component: Perfil }], withComponentInputBinding()),
        { provide: ArticuloService, useValue: { listarPorVendedor } },
        { provide: CategoriaService, useValue: { listar: listarCategorias } },
        { provide: UsuarioService, useValue: { obtener: obtenerUsuario } },
      ],
    });
  });

  async function abrir(url = '/perfiles/3') {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, Perfil);
    await esperar(harness);
    return { harness, raiz: harness.routeNativeElement as HTMLElement };
  }

  function con(cambios: Partial<PublicProfile>): void {
    obtenerUsuario.mockResolvedValue({ ...NEREA, ...cambios });
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
    listarPorVendedor.mockResolvedValue([{ ...SUS_ARTICULOS[0], images: [] }]);
    const { raiz } = await abrir();
    expect(raiz.querySelector('.cards .emojiFallback')?.textContent).toBe('🚲');
  });

  it('muestra las tarjetas aunque fallen las categorías', async () => {
    listarCategorias.mockRejectedValue(new HttpErrorResponse({ status: 500 }));
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
    listarPorVendedor.mockResolvedValue([]);
    const { raiz } = await abrir();
    expect(raiz.textContent).toContain('Este vendedor todavía no tiene artículos publicados.');
  });

  it('muestra el perfil con un error en la lista si fallan solo los artículos', async () => {
    listarPorVendedor.mockRejectedValue(new HttpErrorResponse({ status: 500 }));
    const { raiz } = await abrir();
    expect(raiz.querySelector('h1')?.textContent).toContain('Nerea');
    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('No se han podido cargar sus artículos');
    expect(raiz.textContent).not.toContain('todavía no tiene artículos');
  });

  it('muestra «Perfil no encontrado.» si la API responde 404', async () => {
    obtenerUsuario.mockRejectedValue(new HttpErrorResponse({ status: 404 }));
    const { raiz } = await abrir('/perfiles/999');
    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('Perfil no encontrado.');
    expect(raiz.querySelector('h1')).toBeNull();
  });

  it('muestra un error genérico si falla el perfil', async () => {
    obtenerUsuario.mockRejectedValue(new HttpErrorResponse({ status: 500 }));
    const { raiz } = await abrir();
    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain(
      'No se ha podido cargar el perfil. Inténtalo de nuevo.',
    );
  });

  it('muestra el estado cargando mientras llega la respuesta', async () => {
    obtenerUsuario.mockReturnValue(new Promise(() => {}));
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
    obtenerUsuario.mockImplementation(async (id: number) => ({
      ...(USERS.find((u) => u.id === id) as PublicProfile),
      avatarUrl: `https://example.test/${id}.jpg`,
    }));
    const { harness, raiz } = await abrir();
    raiz.querySelector('.avatar img')?.dispatchEvent(new Event('error'));
    harness.detectChanges();
    await harness.navigateByUrl('/perfiles/1');
    await esperar(harness);
    expect(raiz.querySelector('h1')?.textContent).toContain('Álex');
    expect(raiz.querySelector('.avatar img')?.getAttribute('src')).toBe('https://example.test/1.jpg');
    expect(listarPorVendedor).toHaveBeenLastCalledWith(1);
  });

  it('ignora una respuesta que llega tarde de un vendedor anterior', async () => {
    let responderTarde: (u: PublicProfile) => void = () => {};
    obtenerUsuario.mockReturnValueOnce(new Promise<PublicProfile>((resolve) => (responderTarde = resolve)));
    obtenerUsuario.mockResolvedValue(USERS[0]);
    const { harness } = await abrir('/perfiles/3');
    await harness.navigateByUrl('/perfiles/1');
    await esperar(harness);
    responderTarde(NEREA);
    await esperar(harness);
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain(USERS[0].name);
  });
});
