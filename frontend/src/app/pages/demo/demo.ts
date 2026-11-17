import { Component, signal } from '@angular/core';

interface Llamada {
  metodo: string;
  ruta: string;
  nota: string;
  cuerpo?: unknown;
  conToken?: boolean;
  estado?: number;
  respuesta?: string;
}

@Component({
  selector: 'app-demo',
  templateUrl: './demo.html',
})
export class Demo {
  private token = '';
  protected readonly llamadas = signal<Llamada[]>([
    {
      metodo: 'POST',
      ruta: '/api/auth/registro',
      nota: 'Crea una cuenta de demo y devuelve la sesión.',
      cuerpo: { nombre: 'Demo', email: 'demo@correo.com', password: '1234', ciudad: 'Valencia' },
    },
    {
      metodo: 'POST',
      ruta: '/api/auth/login',
      nota: 'Entra con lucia@correo.com y la contraseña 1234.',
      cuerpo: { email: 'lucia@correo.com', password: '1234' },
    },
    {
      metodo: 'GET',
      ruta: '/api/auth/me',
      nota: 'Usa el token del login. Sin ese paso responde 401.',
      conToken: true,
    },
    {
      metodo: 'GET',
      ruta: '/api/categorias',
      nota: 'Lista las categorías.',
    },
    {
      metodo: 'GET',
      ruta: '/api/articulos',
      nota: 'Lista los artículos publicados.',
    },
    {
      metodo: 'GET',
      ruta: '/api/articulos?texto=abrigo&ciudad=Sevilla',
      nota: 'El mismo listado, filtrado.',
    },
    {
      metodo: 'GET',
      ruta: '/api/articulos/1',
      nota: 'Ficha de un artículo publicado.',
    },
    {
      metodo: 'GET',
      ruta: '/api/perfiles/1',
      nota: 'Perfil público y sus artículos, sin email ni teléfono.',
    },
  ]);

  protected async abrir(llamada: Llamada): Promise<void> {
    const headers: Record<string, string> = {};
    if (llamada.cuerpo) headers['Content-Type'] = 'application/json';
    if (llamada.conToken && this.token) headers['Authorization'] = `Bearer ${this.token}`;
    const respuesta = await fetch(llamada.ruta, {
      method: llamada.metodo,
      headers,
      body: llamada.cuerpo ? JSON.stringify(llamada.cuerpo) : undefined,
    });
    const texto = await respuesta.text();
    let visible = texto;
    try {
      visible = JSON.stringify(JSON.parse(texto), null, 2);
      if (llamada.ruta === '/api/auth/login' && respuesta.ok) {
        this.token = JSON.parse(texto).token ?? '';
      }
    } catch {
      visible = texto;
    }
    this.llamadas.update((lista) =>
      lista.map((item) =>
        item.ruta === llamada.ruta ? { ...item, estado: respuesta.status, respuesta: visible } : item,
      ),
    );
  }
}
