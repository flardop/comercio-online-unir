import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-portada',
  imports: [RouterLink],
  templateUrl: './portada.html',
})
export class Portada {
  protected readonly email = signal('');

  protected rellenar(correo: string): void {
    this.email.set(correo);
  }

  protected emailDe(event: Event): string {
    const input = event.target;
    return input instanceof HTMLInputElement ? input.value : '';
  }
}
