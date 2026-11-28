import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ARTICLES, CATEGORIES } from '../../core/mocks/datos-prueba';
import { Article, ArticlePage } from '../../core/models/article';
import { ArticuloService } from '../../core/services/articulo.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { Explorar } from './explorar';

/** Deja que terminen las promesas pendientes y repinta la pantalla. */
async function esperar(harness: RouterTestingHarness): Promise<void> {
  harness.detectChanges();
  await new Promise((resolve) => setTimeout(resolve));
  harness.detectChanges();
}

function pagina(data: Article[]): ArticlePage {
  return { data, pagination: { page: 1, pageSize: 20, total: data.length, totalPages: 1 } };
}

const PUBLICADOS = ARTICLES.filter((a) => a.status === 'published');
const DE_TECNOLOGIA = PUBLICADOS.filter((a) => a.categoryId === 3);

describe('Explorar', () => {
  const listar = vi.fn();
  const listarCategorias = vi.fn();

  beforeEach(() => {
    listar.mockReset().mockResolvedValue(pagina(PUBLICADOS));
    listarCategorias.mockReset().mockResolvedValue(CATEGORIES);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'explorar', component: Explorar }]),
        { provide: ArticuloService, useValue: { listar } },
        { provide: CategoriaService, useValue: { listar: listarCategorias } },
      ],
    });
  });

  async function abrir(url = '/explorar'): Promise<{ harness: RouterTestingHarness; raiz: HTMLElement }> {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, Explorar);
    await esperar(harness);
    return { harness, raiz: harness.routeNativeElement as HTMLElement };
  }

  it('muestra las tarjetas, el contador y las fichas de categoría', async () => {
    const { raiz } = await abrir();
    expect(raiz.querySelectorAll('.item').length).toBe(8);
    expect(raiz.querySelector('.resultsCount')?.textContent).toContain('8 artículos');
    expect(raiz.querySelectorAll('button.category').length).toBe(6);
    expect(raiz.textContent).toContain('Productos con chispa');
  });

  it('lee los filtros de la URL y los envía al servicio', async () => {
    listar.mockResolvedValue(pagina(DE_TECNOLOGIA));
    const { raiz } = await abrir('/explorar?categoryId=3&maxPrice=100');
    expect(listar).toHaveBeenCalledWith({ categoryId: 3, maxPrice: 100 });
    expect(raiz.querySelectorAll('.item').length).toBe(2);
    expect(raiz.querySelector('button.category.active')?.textContent).toContain('Tecnología');
  });

  it('cambiar un filtro actualiza la URL y vuelve a consultar', async () => {
    const { harness, raiz } = await abrir();
    const select = raiz.querySelector<HTMLSelectElement>('select[aria-label="Precio máximo"]') as HTMLSelectElement;
    select.value = '100';
    select.dispatchEvent(new Event('change'));
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/explorar?maxPrice=100');
    expect(listar).toHaveBeenLastCalledWith({ maxPrice: 100 });
  });

  it('pulsar una ficha de categoría aplica el filtro', async () => {
    const { harness, raiz } = await abrir();
    const fichas = Array.from(raiz.querySelectorAll<HTMLButtonElement>('button.category'));
    fichas.find((f) => f.textContent?.includes('Tecnología'))?.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/explorar?categoryId=3');
  });

  it('«Ver todos» limpia los filtros', async () => {
    const { harness, raiz } = await abrir('/explorar?categoryId=3&city=Madrid');
    raiz.querySelector<HTMLButtonElement>('button.verTodos')?.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/explorar');
  });

  function botonLimpiar(raiz: HTMLElement): HTMLButtonElement | undefined {
    return Array.from(raiz.querySelectorAll('button')).find((b) => b.textContent?.includes('Limpiar filtros'));
  }

  it('sin filtros no muestra «Limpiar filtros»', async () => {
    const { raiz } = await abrir();
    expect(botonLimpiar(raiz)).toBeUndefined();
  });

  it('«Limpiar filtros» quita todos los filtros, incluida la búsqueda, y desaparece', async () => {
    const { harness, raiz } = await abrir('/explorar?q=camara&city=Madrid');
    botonLimpiar(raiz)?.click();
    await esperar(harness);
    expect(TestBed.inject(Router).url).toBe('/explorar');
    expect(listar).toHaveBeenLastCalledWith({});
    expect(botonLimpiar(raiz)).toBeUndefined();
  });

  it('muestra «Limpiar filtros» aunque no haya resultados', async () => {
    listar.mockResolvedValue(pagina([]));
    const { raiz } = await abrir('/explorar?city=Sevilla');
    expect(botonLimpiar(raiz)).toBeDefined();
  });

  it('pasa a la tarjeta el emoji de la categoría del artículo', async () => {
    listar.mockResolvedValue(pagina([{ ...ARTICLES[2], images: [] }]));
    const { raiz } = await abrir();
    expect(raiz.querySelector('.cards .emojiFallback')?.textContent).toBe('🚲');
  });

  it('con un solo resultado dice «1 artículo», en singular', async () => {
    listar.mockResolvedValue(pagina([ARTICLES[0]]));
    const { raiz } = await abrir();
    expect(raiz.querySelector('.resultsCount')?.textContent?.trim()).toBe('1 artículo');
  });

  it('muestra el estado cargando mientras llega la respuesta', async () => {
    listar.mockReturnValue(new Promise(() => {}));
    const { raiz } = await abrir();
    expect(raiz.textContent).toContain('Cargando');
    expect(raiz.querySelectorAll('.item').length).toBe(0);
    expect(raiz.querySelector('.resultsCount')).toBeNull();
  });

  it('muestra el error si falla la consulta', async () => {
    listar.mockRejectedValue(new HttpErrorResponse({ status: 500 }));
    const { raiz } = await abrir();
    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('No se han podido cargar los artículos');
    expect(raiz.querySelector('.resultsCount')).toBeNull();
  });

  it('muestra el texto de v2 cuando no hay resultados', async () => {
    listar.mockResolvedValue(pagina([]));
    const { raiz } = await abrir('/explorar?city=Sevilla');
    expect(raiz.textContent).toContain('Todavía no hay artículos para esos filtros. Prueba otra búsqueda ✨');
    expect(raiz.querySelector('.resultsCount')?.textContent).toContain('0 artículos');
  });

  it('«Vender ahora» está desactivado', async () => {
    const { raiz } = await abrir();
    const boton = Array.from(raiz.querySelectorAll<HTMLButtonElement>('.heroActions button')).find((b) =>
      b.textContent?.includes('Vender ahora'),
    );
    expect(boton?.disabled).toBe(true);
  });

  it('muestra los artículos aunque fallen las categorías', async () => {
    listarCategorias.mockRejectedValue(new HttpErrorResponse({ status: 500 }));
    const { raiz } = await abrir();
    expect(raiz.querySelectorAll('.item').length).toBe(8);
    expect(raiz.querySelectorAll('button.category').length).toBe(0);
  });

  it('ignora una respuesta que llega tarde de un filtro anterior', async () => {
    let responderTarde: (p: ArticlePage) => void = () => {};
    listar.mockReturnValueOnce(new Promise<ArticlePage>((resolve) => (responderTarde = resolve)));
    listar.mockResolvedValue(pagina(DE_TECNOLOGIA));
    const { harness, raiz } = await abrir();
    await harness.navigateByUrl('/explorar?categoryId=3');
    await esperar(harness);
    responderTarde(pagina(PUBLICADOS));
    await esperar(harness);
    expect(raiz.querySelectorAll('.item').length).toBe(DE_TECNOLOGIA.length);
  });
});
