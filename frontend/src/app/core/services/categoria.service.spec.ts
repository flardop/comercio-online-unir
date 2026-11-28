import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CATEGORIES } from '../mocks/datos-prueba';
import { CategoriaService } from './categoria.service';

describe('CategoriaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  });

  it('listar pide GET /api/categories y devuelve la lista', async () => {
    const promesa = TestBed.inject(CategoriaService).listar();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/categories').flush(CATEGORIES);
    expect(await promesa).toEqual(CATEGORIES);
    http.verify();
  });
});
