import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Category } from '../models/category';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly http = inject(HttpClient);

  /** GET /api/categories: la API responde directamente la lista de categorías activas. */
  async listar(): Promise<Category[]> {
    return firstValueFrom(this.http.get<Category[]>('/api/categories'));
  }
}
