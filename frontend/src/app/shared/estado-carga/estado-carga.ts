import { Component, input } from '@angular/core';

@Component({
  selector: 'app-estado-carga',
  templateUrl: './estado-carga.html',
  styleUrl: './estado-carga.css',
  host: { style: 'display: contents' },
})
export class EstadoCarga {
  readonly cargando = input(false);
  readonly error = input<string | null>(null);
  readonly vacio = input(false);
  readonly mensajeVacio = input('No hay nada que mostrar.');
}
