import { Injectable, inject } from '@angular/core';
import { Observable, defer, delay, of, throwError } from 'rxjs';
import { USERS } from '../mocks/datos-prueba';
import { notFound } from '../mocks/errores';
import { PublicProfile } from '../models/public-profile';
import { MOCK_DELAY_MS } from './mock-delay';

/** Contrato: GET /users/{userId}, que responde { user: PublicProfile }. Aquí se devuelve el PublicProfile ya desenvuelto. */
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly retardo = inject(MOCK_DELAY_MS);

  obtener(id: number): Observable<PublicProfile> {
    return defer(() => {
      const usuario = USERS.find((u) => u.id === id);
      return usuario ? of(usuario) : throwError(() => notFound('Usuario no encontrado'));
    }).pipe(delay(this.retardo));
  }
}
