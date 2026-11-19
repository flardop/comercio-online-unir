import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { CategoriaService } from './categoria.service';
import { MOCK_DELAY_MS } from './mock-delay';

describe('CategoriaService (datos de prueba)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: MOCK_DELAY_MS, useValue: 0 }] });
  });

  it('listar devuelve solo las categorías activas', async () => {
    const categorias = await firstValueFrom(TestBed.inject(CategoriaService).listar());
    expect(categorias.length).toBe(6);
    expect(categorias.every((c) => c.isActive)).toBe(true);
    expect(categorias.map((c) => c.name)).toContain('Hogar');
  });
});
