import { Routes } from '@angular/router';
import { Explorar } from './pages/explorar/explorar';
import { Ficha } from './pages/ficha/ficha';
import { Perfil } from './pages/perfil/perfil';
import { Portada } from './pages/portada/portada';
import { Registro } from './pages/registro/registro';

export const routes: Routes = [
  { path: '', component: Portada, title: 'Reusa' },
  { path: 'registro', component: Registro, title: 'Crear cuenta — Reusa' },
  { path: 'explorar', component: Explorar, title: 'Explorar — Reusa' },
  { path: 'articulos/:id', component: Ficha, title: 'Artículo — Reusa' },
  { path: 'perfiles/:id', component: Perfil, title: 'Perfil — Reusa' },
  { path: '**', redirectTo: '' },
];
