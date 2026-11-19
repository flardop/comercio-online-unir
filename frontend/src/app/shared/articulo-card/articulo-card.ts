import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Article } from '../../core/models/article';
import { CONDITION_LABELS, DEFAULT_EMOJI, formatPrice } from '../../core/util/etiquetas';

@Component({
  selector: 'app-articulo-card',
  imports: [RouterLink],
  templateUrl: './articulo-card.html',
  styleUrl: './articulo-card.css',
})
export class ArticuloCard {
  readonly article = input.required<Article>();
  readonly emoji = input(DEFAULT_EMOJI);

  protected readonly fotoFallida = signal(false);
  protected readonly foto = computed(() =>
    this.fotoFallida() ? null : (this.article().images[0]?.url ?? null),
  );
  protected readonly precio = computed(() => formatPrice(this.article().price));
  protected readonly condicion = computed(() => CONDITION_LABELS[this.article().condition]);
  protected readonly ciudad = computed(() => this.article().city ?? 'Ubicación sin indicar');

  protected marcarFotoFallida(): void {
    this.fotoFallida.set(true);
  }
}
