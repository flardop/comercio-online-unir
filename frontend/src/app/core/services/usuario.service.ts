import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PublicProfile } from '../models/public-profile';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);

  /** GET /api/users/{id}: la API responde { user }. */
  async obtener(id: number): Promise<PublicProfile> {
    const respuesta = await firstValueFrom(this.http.get<{ user: PublicProfile }>(`/api/users/${id}`));
    return respuesta.user;
  }
}
