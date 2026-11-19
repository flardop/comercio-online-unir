import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ArticuloService } from './articulo.service';
import { MOCK_DELAY_MS } from './mock-delay';

describe('ArticuloService (datos de prueba)', () => {
  let service: ArticuloService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: MOCK_DELAY_MS, useValue: 0 }] });
    service = TestBed.inject(ArticuloService);
  });

  it('listar devuelve una página con solo artículos publicados', async () => {
    const pagina = await firstValueFrom(service.listar());
    expect(pagina.pagination.total).toBe(8);
    expect(pagina.data.every((a) => a.status === 'published')).toBe(true);
  });

  it('listar aplica los filtros del contrato', async () => {
    const pagina = await firstValueFrom(service.listar({ categoryId: 3 }));
    expect(pagina.data.map((a) => a.id)).toEqual([1, 4]);
  });

  it('obtener devuelve un artículo publicado', async () => {
    const articulo = await firstValueFrom(service.obtener(1));
    expect(articulo.title).toBe('Cámara instantánea');
  });

  it('obtener falla con 404 y la forma de error del contrato si no está publicado', async () => {
    const error = (await firstValueFrom(service.obtener(9)).catch((e: unknown) => e)) as HttpErrorResponse;
    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect(error.status).toBe(404);
    expect(error.error).toEqual({ error: { code: 'NOT_FOUND', message: 'Artículo no encontrado' } });
  });

  it('obtener falla con 404 si el id no existe', async () => {
    const error = (await firstValueFrom(service.obtener(999)).catch((e: unknown) => e)) as HttpErrorResponse;
    expect(error.status).toBe(404);
  });
});
