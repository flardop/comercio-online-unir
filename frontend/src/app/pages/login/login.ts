
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html'
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Controlamos el estado del formulario
  readonly cargando = signal(false);
  readonly mensajeError = signal('');

  // Campos del formulario con sus validaciones
  readonly formulario = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  // Comprobamos los datos y enviamos el login al backend
  iniciarSesion(): void {
    this.mensajeError.set('');

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);

    this.authService.login(this.formulario.getRawValue())
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: () => {
          // Después de iniciar sesión accedemos al catálogo
          void this.router.navigateByUrl('/explorar');
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.mensajeError.set('El correo o la contraseña no son correctos.');
          } else {
            this.mensajeError.set(
              'No se ha podido iniciar sesión. Inténtalo de nuevo.'
            );
          }
        }
      });
  }
}
