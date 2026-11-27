import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { MOCK_DELAY_MS } from './mock-delay';
import { UsuarioService } from './usuario.service';

describe('UsuarioService (datos de prueba)', () => {
  let service: UsuarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: MOCK_DELAY_MS, useValue: 0 }] });
    service = TestBed.inject(UsuarioService);
  });

  it('obtener devuelve el perfil público sin datos privados', async () => {
    const perfil = await firstValueFrom(service.obtener(1));
    expect(perfil.name).toBe('Álex');
    expect(Object.keys(perfil)).not.toContain('email');
    expect(Object.keys(perfil)).not.toContain('phone');
  });

  it('obtener falla con 404 si el usuario no existe', async () => {
    const error = (await firstValueFrom(service.obtener(99)).catch((e: unknown) => e)) as HttpErrorResponse;
    expect(error.status).toBe(404);
    expect(error.error).toEqual({ error: { code: 'NOT_FOUND', message: 'Usuario no encontrado' } });
  });
});
