import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
})
export class Header {
  private readonly router = inject(Router);

  protected readonly visible = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => this.muestraCabecera(event.urlAfterRedirects)),
      startWith(this.muestraCabecera(this.router.url)),
    ),
    { initialValue: false },
  );

  private muestraCabecera(url: string): boolean {
    const path = url.split('?')[0];
    return path !== '/' && path !== '/registro';
  }
}
