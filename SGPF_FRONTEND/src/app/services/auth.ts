import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Sesion { token: string; usuario: { id: string; nombre_usuario: string; correo: string; rol: string } }
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  login(usuario: string, clave: string): Observable<Sesion> { return this.http.post<Sesion>(`${environment.apiUrl}/auth/login`, { usuario, clave }).pipe(tap(s => { localStorage.setItem('sgpf_token', s.token); localStorage.setItem('sgpf_usuario', JSON.stringify(s.usuario)); })); }
  token(): string | null { return localStorage.getItem('sgpf_token'); }
  autenticado(): boolean { return !!this.token(); }
  usuario(): Sesion['usuario'] | null { try { return JSON.parse(localStorage.getItem('sgpf_usuario') || 'null'); } catch { return null; } }
  rol(): string | null { return this.usuario()?.rol || null; }
  tieneRol(...roles: string[]): boolean { const rol = this.rol(); return !!rol && roles.includes(rol); }
  logout(): void { localStorage.removeItem('sgpf_token'); localStorage.removeItem('sgpf_usuario'); }
}
