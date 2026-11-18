import { Routes } from '@angular/router';
import { Demo } from './pages/demo/demo';
import { Explorar } from './pages/explorar/explorar';
import { Ficha } from './pages/ficha/ficha';
import { Perfil } from './pages/perfil/perfil';
import { Portada } from './pages/portada/portada';
import { Registro } from './pages/registro/registro';

export const routes: Routes = [
  { path: '', component: Portada, title: 'ChispApp' },
  { path: 'registro', component: Registro, title: 'Crear cuenta — ChispApp' },
  { path: 'explorar', component: Explorar, title: 'Explorar — ChispApp' },
  { path: 'demo', component: Demo, title: 'Endpoints — ChispApp' },
  { path: 'articulos/:id', component: Ficha, title: 'Artículo — ChispApp' },
  { path: 'perfiles/:id', component: Perfil, title: 'Perfil — ChispApp' },
  { path: '**', redirectTo: '' },
];
