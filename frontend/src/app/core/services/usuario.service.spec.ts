import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { USERS } from '../mocks/datos-prueba';
import { UsuarioService } from './usuario.service';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(UsuarioService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('obtener pide GET /api/users/{id} y devuelve el perfil sin envoltorio', async () => {
    const promesa = service.obtener(1);
    http.expectOne('/api/users/1').flush({ user: USERS[0] });
    expect(await promesa).toEqual(USERS[0]);
  });

  it('obtener falla con el 404 de la API', async () => {
    const promesa = service.obtener(99);
    http
      .expectOne('/api/users/99')
      .flush({ error: { code: 'NOT_FOUND', message: 'Usuario no encontrado.' } }, { status: 404, statusText: 'Not Found' });
    const error = (await promesa.catch((e: unknown) => e)) as HttpErrorResponse;
    expect(error.status).toBe(404);
  });
});
