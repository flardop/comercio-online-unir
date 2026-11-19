import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { NEVER, of, throwError } from 'rxjs';
import { ARTICLES, CATEGORIES } from '../../core/mocks/datos-prueba';
import { filtrarArticulos } from '../../core/mocks/filtrar-articulos';
import { ArticuloService } from '../../core/services/articulo.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { Explorar } from './explorar';

describe('Explorar', () => {
  const listar = vi.fn();

  beforeEach(() => {
    listar.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'explorar', component: Explorar }]),
        { provide: ArticuloService, useValue: { listar } },
        { provide: CategoriaService, useValue: { listar: () => of(CATEGORIES) } },
      ],
    });
  });

  async function abrir(url = '/explorar'): Promise<{ harness: RouterTestingHarness; raiz: HTMLElement }> {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, Explorar);
    harness.detectChanges();
    return { harness, raiz: harness.routeNativeElement as HTMLElement };
  }

  it('muestra las tarjetas, el contador y las fichas de categoría', async () => {
    listar.mockImplementation((filtro) => of(filtrarArticulos(ARTICLES, filtro)));
    const { raiz } = await abrir();
    expect(raiz.querySelectorAll('.item').length).toBe(8);
    expect(raiz.querySelector('.resultsCount')?.textContent).toContain('8 artículos');
    expect(raiz.querySelectorAll('button.category').length).toBe(6);
    expect(raiz.textContent).toContain('Productos con chispa');
  });

  it('lee los filtros de la URL y los envía al servicio', async () => {
    listar.mockImplementation((filtro) => of(filtrarArticulos(ARTICLES, filtro)));
    const { raiz } = await abrir('/explorar?categoryId=3&maxPrice=100');
    expect(listar).toHaveBeenCalledWith({ categoryId: 3, maxPrice: 100 });
    expect(raiz.querySelectorAll('.item').length).toBe(2);
    expect(raiz.querySelector('button.category.active')?.textContent).toContain('Tecnología');
  });

  it('cambiar un filtro actualiza la URL y vuelve a consultar', async () => {
    listar.mockImplementation((filtro) => of(filtrarArticulos(ARTICLES, filtro)));
    const { harness, raiz } = await abrir();
    const select = raiz.querySelector<HTMLSelectElement>('select[aria-label="Precio máximo"]') as HTMLSelectElement;
    select.value = '100';
    select.dispatchEvent(new Event('change'));
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/explorar?maxPrice=100');
    expect(listar).toHaveBeenLastCalledWith({ maxPrice: 100 });
  });

  it('pulsar una ficha de categoría aplica el filtro', async () => {
    listar.mockImplementation((filtro) => of(filtrarArticulos(ARTICLES, filtro)));
    const { harness, raiz } = await abrir();
    const fichas = Array.from(raiz.querySelectorAll<HTMLButtonElement>('button.category'));
    fichas.find((f) => f.textContent?.includes('Tecnología'))?.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/explorar?categoryId=3');
  });

  it('«Ver todos» limpia los filtros', async () => {
    listar.mockImplementation((filtro) => of(filtrarArticulos(ARTICLES, filtro)));
    const { harness, raiz } = await abrir('/explorar?categoryId=3&city=Madrid');
    raiz.querySelector<HTMLButtonElement>('button.verTodos')?.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/explorar');
  });

  it('muestra el estado cargando mientras llega la respuesta', async () => {
    listar.mockReturnValue(NEVER);
    const { raiz } = await abrir();
    expect(raiz.textContent).toContain('Cargando');
    expect(raiz.querySelectorAll('.item').length).toBe(0);
  });

  it('muestra el error si falla la consulta', async () => {
    listar.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    const { raiz } = await abrir();
    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('No se han podido cargar los artículos');
  });

  it('muestra el texto de v2 cuando no hay resultados', async () => {
    listar.mockImplementation((filtro) => of(filtrarArticulos(ARTICLES, filtro)));
    const { raiz } = await abrir('/explorar?city=Sevilla');
    expect(raiz.textContent).toContain('Todavía no hay artículos para esos filtros. Prueba otra búsqueda ✨');
    expect(raiz.querySelector('.resultsCount')?.textContent).toContain('0 artículos');
  });

  it('«Vender ahora» está desactivado', async () => {
    listar.mockImplementation((filtro) => of(filtrarArticulos(ARTICLES, filtro)));
    const { raiz } = await abrir();
    const boton = Array.from(raiz.querySelectorAll<HTMLButtonElement>('.heroActions button')).find((b) =>
      b.textContent?.includes('Vender ahora'),
    );
    expect(boton?.disabled).toBe(true);
  });
});
