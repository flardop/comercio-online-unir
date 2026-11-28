import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { appConfig } from './app.config';
import { USERS } from './core/mocks/datos-prueba';
import { ArticuloService } from './core/services/articulo.service';
import { CategoriaService } from './core/services/categoria.service';
import { UsuarioService } from './core/services/usuario.service';

describe('Configuración de la aplicación', () => {
  it('pasa el id de la URL al input de la pantalla', async () => {
    const obtener = vi.fn().mockResolvedValue(USERS[2]);
    TestBed.configureTestingModule({
      providers: [
        ...appConfig.providers,
        { provide: UsuarioService, useValue: { obtener } },
        { provide: ArticuloService, useValue: { listarPorVendedor: async () => [] } },
        { provide: CategoriaService, useValue: { listar: async () => [] } },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/perfiles/3');
    harness.detectChanges();
    await new Promise((resolve) => setTimeout(resolve));
    expect(obtener).toHaveBeenCalledWith(3);
  });
});
