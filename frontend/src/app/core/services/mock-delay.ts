import { InjectionToken } from '@angular/core';

/** Espera simulada (ms) de los servicios con datos de prueba. Las pruebas la ponen a 0. */
export const MOCK_DELAY_MS = new InjectionToken<number>('MOCK_DELAY_MS', {
  providedIn: 'root',
  factory: () => 250,
});
