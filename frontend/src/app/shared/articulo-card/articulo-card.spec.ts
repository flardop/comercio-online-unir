import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ARTICLES } from '../../core/mocks/datos-prueba';
import { ArticuloCard } from './articulo-card';

describe('ArticuloCard', () => {
  let fixture: ComponentFixture<ArticuloCard>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(ArticuloCard);
  });

  function el(): HTMLElement {
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('muestra título, precio, ciudad y conservación', () => {
    fixture.componentRef.setInput('article', ARTICLES[0]);
    const texto = el().textContent ?? '';
    expect(texto).toContain('Cámara instantánea');
    expect(texto).toContain('85,00 €');
    expect(texto).toContain('⌖ Madrid · Como nuevo');
  });

  it('enlaza a la ficha del artículo', () => {
    fixture.componentRef.setInput('article', ARTICLES[0]);
    expect(el().querySelector('a.itemLink')?.getAttribute('href')).toBe('/articulos/1');
  });

  it('muestra la primera foto', () => {
    fixture.componentRef.setInput('article', ARTICLES[0]);
    const img = el().querySelector('img');
    expect(img?.getAttribute('src')).toBe(ARTICLES[0].images[0].url);
    expect(img?.getAttribute('alt')).toBe('Cámara instantánea');
  });

  it('usa el emoji de respaldo si no hay fotos', () => {
    fixture.componentRef.setInput('article', { ...ARTICLES[0], images: [] });
    fixture.componentRef.setInput('emoji', '📷');
    const elemento = el();
    expect(elemento.querySelector('img')).toBeNull();
    expect(elemento.querySelector('.emojiFallback')?.textContent).toBe('📷');
  });

  it('el corazón está desactivado', () => {
    fixture.componentRef.setInput('article', ARTICLES[0]);
    const corazon = el().querySelector<HTMLButtonElement>('button.heart');
    expect(corazon?.disabled).toBe(true);
    expect(corazon?.getAttribute('title')).toBe('Disponible próximamente');
  });

  it('indica la ubicación sin indicar si el artículo no tiene ciudad', () => {
    fixture.componentRef.setInput('article', { ...ARTICLES[0], city: null });
    expect(el().textContent).toContain('⌖ Ubicación sin indicar · Como nuevo');
  });
});
