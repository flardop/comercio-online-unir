
// Datos que enviamos al backend para iniciar sesión
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  name: string;
  city?: string;
}

// Información del usuario autenticado
export interface AuthUser {
  id: number;
  email: string;
  username: string;
  name: string;
  role: 'user' | 'moderator' | 'admin';
}

// Respuesta del backend cuando el login es correcto
export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

// Respuesta del endpoint que consulta la sesión actual
export interface CurrentUserResponse {
  user: AuthUser;
}

// Formato de los errores que devuelve la API
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
