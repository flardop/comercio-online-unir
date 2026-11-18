import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { muestras } from '../muestras';

@Component({
  selector: 'app-explorar',
  imports: [RouterLink],
  templateUrl: './explorar.html',
})
export class Explorar {
  protected readonly articulos = muestras;
}
