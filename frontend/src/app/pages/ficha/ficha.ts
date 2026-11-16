import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { muestraPorId } from '../muestras';

@Component({
  selector: 'app-ficha',
  imports: [RouterLink],
  templateUrl: './ficha.html',
})
export class Ficha {
  private readonly route = inject(ActivatedRoute);
  protected readonly articulo = muestraPorId(this.route.snapshot.paramMap.get('id'));
}
