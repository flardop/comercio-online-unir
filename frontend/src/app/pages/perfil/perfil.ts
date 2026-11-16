import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { muestraPorId, muestras } from '../muestras';

@Component({
  selector: 'app-perfil',
  imports: [RouterLink],
  templateUrl: './perfil.html',
})
export class Perfil {
  private readonly route = inject(ActivatedRoute);
  protected readonly persona = muestraPorId(this.route.snapshot.paramMap.get('id'));
  protected readonly articulos = muestras.filter((item) => item.vendedor === this.persona.vendedor);
}
