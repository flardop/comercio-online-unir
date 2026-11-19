import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadoCarga } from './estado-carga';

describe('EstadoCarga', () => {
  let fixture: ComponentFixture<EstadoCarga>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EstadoCarga);
  });

  function texto(): string {
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  it('no muestra nada por defecto', () => {
    expect(texto().trim()).toBe('');
  });

  it('muestra el estado cargando', () => {
    fixture.componentRef.setInput('cargando', true);
    expect(texto()).toContain('Cargando');
  });

  it('muestra el error como alerta', () => {
    fixture.componentRef.setInput('error', 'Algo falló');
    expect(texto()).toContain('Algo falló');
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')).not.toBeNull();
  });

  it('muestra el mensaje de vacío', () => {
    fixture.componentRef.setInput('vacio', true);
    fixture.componentRef.setInput('mensajeVacio', 'Sin resultados');
    expect(texto()).toContain('Sin resultados');
  });

  it('el estado cargando tiene prioridad sobre error y vacío', () => {
    fixture.componentRef.setInput('cargando', true);
    fixture.componentRef.setInput('error', 'Algo falló');
    fixture.componentRef.setInput('vacio', true);
    const t = texto();
    expect(t).toContain('Cargando');
    expect(t).not.toContain('Algo falló');
  });
});
