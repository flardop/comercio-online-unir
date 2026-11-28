import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ARTICLES } from '../mocks/datos-prueba';
import { ArticuloService } from './articulo.service';

describe('ArticuloService', () => {
  let service: ArticuloService;
  let http: HttpTestingController;

  const PAGINA = { data: [ARTICLES[0]], pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 } };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ArticuloService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('listar sin filtros pide GET /api/articles y devuelve la página completa', async () => {
    const promesa = service.listar();
    const peticion = http.expectOne('/api/articles');
    expect(peticion.request.method).toBe('GET');
    peticion.flush(PAGINA);
    expect(await promesa).toEqual(PAGINA);
  });

  it('listar envía solo los filtros que tienen valor', async () => {
    const promesa = service.listar({ q: 'cámara', categoryId: 3, maxPrice: 100, city: '', condition: undefined });
    const peticion = http.expectOne((p) => p.url === '/api/articles');
    expect(peticion.request.params.keys().sort()).toEqual(['categoryId', 'maxPrice', 'q']);
    expect(peticion.request.params.get('q')).toBe('cámara');
    expect(peticion.request.params.get('categoryId')).toBe('3');
    expect(peticion.request.params.get('maxPrice')).toBe('100');
    peticion.flush(PAGINA);
    await promesa;
  });

  it('obtener pide GET /api/articles/{id} y devuelve el artículo sin envoltorio', async () => {
    const promesa = service.obtener(1);
    http.expectOne('/api/articles/1').flush({ article: ARTICLES[0] });
    expect(await promesa).toEqual(ARTICLES[0]);
  });

  it('obtener falla con el 404 de la API', async () => {
    const promesa = service.obtener(999);
    http
      .expectOne('/api/articles/999')
      .flush({ error: { code: 'NOT_FOUND', message: 'Artículo no encontrado.' } }, { status: 404, statusText: 'Not Found' });
    const error = (await promesa.catch((e: unknown) => e)) as HttpErrorResponse;
    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect(error.status).toBe(404);
  });

  it('listarPorVendedor usa ownerId y sort=recent y respeta el orden recibido', async () => {
    const promesa = service.listarPorVendedor(3);
    const peticion = http.expectOne((p) => p.url === '/api/articles');
    expect(peticion.request.params.get('ownerId')).toBe('3');
    expect(peticion.request.params.get('sort')).toBe('recent');
    expect(peticion.request.params.get('pageSize')).toBe('100');
    const recibidos = [{ ...ARTICLES[0], id: 2 }, { ...ARTICLES[0], id: 7 }];
    peticion.flush({ data: recibidos, pagination: PAGINA.pagination });
    expect((await promesa).map((a) => a.id)).toEqual([2, 7]);
  });
});
