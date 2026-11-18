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
      metodo: 'GET',
      ruta: '/api/health',
      nota: 'Comprueba que la API está en marcha.',
    },
    {
      metodo: 'POST',
      ruta: '/api/auth/register',
      nota: 'Crea la cuenta nueva@correo.com. Si ya existe, responde 409.',
      cuerpo: {
        email: 'nueva@correo.com',
        username: 'nueva',
        password: 'demo1234',
        name: 'Nueva',
        city: 'Valencia',
      },
    },
    {
      metodo: 'POST',
      ruta: '/api/auth/login',
      nota: 'Entra con demo@correo.com y la contraseña demo1234.',
      cuerpo: { email: 'demo@correo.com', password: 'demo1234' },
    },
    {
      metodo: 'GET',
      ruta: '/api/auth/me',
      nota: 'Usa el accessToken del login o del registro. Sin ese paso responde 401.',
      conToken: true,
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
      const datos = JSON.parse(texto) as { accessToken?: string };
      visible = JSON.stringify(datos, null, 2);
      if (respuesta.ok && datos.accessToken) this.token = datos.accessToken;
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
