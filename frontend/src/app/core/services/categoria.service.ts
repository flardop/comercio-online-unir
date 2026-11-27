import { Injectable, inject } from '@angular/core';
import { Observable, defer, delay, of } from 'rxjs';
import { CATEGORIES } from '../mocks/datos-prueba';
import { Category } from '../models/category';
import { MOCK_DELAY_MS } from './mock-delay';

/** Contrato: GET /categories (array de categorías activas, sin envoltorio). */
@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly retardo = inject(MOCK_DELAY_MS);

  listar(): Observable<Category[]> {
    return defer(() => of(CATEGORIES.filter((c) => c.isActive))).pipe(delay(this.retardo));
  }
}
