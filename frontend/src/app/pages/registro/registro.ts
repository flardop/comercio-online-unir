import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly cargando = signal(false);
  readonly mensajeError = signal('');

  readonly formulario = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40), Validators.pattern(/^[a-zA-Z0-9_.-]+$/)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(190)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    city: ['', Validators.maxLength(100)],
  });

  constructor() {
    this.formulario.valueChanges.subscribe(() => this.mensajeError.set(''));
  }

  crearCuenta(): void {
    this.mensajeError.set('');
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos = this.formulario.getRawValue();
    this.cargando.set(true);
    this.authService
      .register({
        name: datos.name.trim(),
        username: datos.username.trim(),
        email: datos.email.trim(),
        password: datos.password,
        ...(datos.city.trim() ? { city: datos.city.trim() } : {}),
      })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/explorar');
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 409) {
            this.mensajeError.set('El correo o el nombre de usuario ya está registrado.');
          } else if (error.status === 400) {
            this.mensajeError.set('Revisa los datos del formulario.');
          } else {
            this.mensajeError.set('No se ha podido crear la cuenta. Inténtalo de nuevo.');
          }
        },
      });
  }
}
