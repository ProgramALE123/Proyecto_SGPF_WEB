import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Jugadores } from './components/jugadores/jugadores';
import { Entrenadores } from './components/entrenadores/entrenadores';
import { Partidos } from './components/partidos/partidos';
import { Alineaciones } from './components/alineaciones/alineaciones';
import { Usuarios } from './components/usuarios/usuarios';
import { authGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'usuarios', component: Usuarios, canActivate: [authGuard, roleGuard], data: { roles: ['presidente_club'] } },
  { path: 'jugadores', component: Jugadores, canActivate: [authGuard] },
  { path: 'entrenadores', component: Entrenadores, canActivate: [authGuard, roleGuard], data: { roles: ['presidente_club', 'director_tecnico'] } },
  { path: 'partidos', component: Partidos, canActivate: [authGuard] },
  { path: 'alineaciones', component: Alineaciones, canActivate: [authGuard, roleGuard], data: { roles: ['presidente_club', 'director_tecnico'] } },
  { path: '**', redirectTo: '' },
];
