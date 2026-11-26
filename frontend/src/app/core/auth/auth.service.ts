
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  CurrentUserResponse
} from './auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // HttpClient permite hacer peticiones al backend
  private readonly http = inject(HttpClient);

  // Ruta base de los endpoints de autenticación
  private readonly apiUrl = '/api/auth';

  // Guardamos la información de la sesión actual
  private readonly currentUserSignal = signal<AuthUser | null>(null);
  private readonly accessTokenSignal = signal<string | null>(null);

  // Permitimos consultar el usuario sin modificarlo desde otros componentes
  readonly currentUser = this.currentUserSignal.asReadonly();

  // Indicamos si hay una sesión iniciada
  readonly isAuthenticated = () => this.accessTokenSignal() !== null;

  // Enviamos el email y la contraseña al backend
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      credentials
    ).pipe(tap((response) => this.guardarSesion(response)));
  }

  register(datos: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/register`,
      datos
    ).pipe(tap((response) => this.guardarSesion(response)));
  }

  // Consultamos los datos del usuario conectado
  getCurrentUser(): Observable<CurrentUserResponse> {
    const token = this.accessTokenSignal();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`
    });

    return this.http.get<CurrentUserResponse>(
      `${this.apiUrl}/me`,
      { headers }
    ).pipe(
      tap((response) => {
        this.currentUserSignal.set(response.user);
      })
    );
  }

  private guardarSesion(response: LoginResponse): void {
    this.accessTokenSignal.set(response.accessToken);
    this.currentUserSignal.set(response.user);
  }

  // Cerramos la sesión y limpiamos los datos del usuario
  logout(): void {
    this.accessTokenSignal.set(null);
    this.currentUserSignal.set(null);
  }
}
