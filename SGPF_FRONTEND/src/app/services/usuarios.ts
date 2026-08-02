import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';

export type UserRole = 'presidente_club' | 'director_tecnico' | 'secretario_tecnico';
export interface User { id: string; version: number; username: string; correo: string; foto: string; role: UserRole; nombre: string; activo: boolean; }
interface Rol { id: string; nombre: UserRole; }
interface UsuarioApi { id: string; version: number; rol_id: string; nombre_usuario: string; correo: string; foto_url?: string; activo: boolean; }

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient); private readonly api = environment.apiUrl;
  listar(): Observable<User[]> { return forkJoin({ usuarios: this.http.get<{ usuarios: UsuarioApi[] }>(`${this.api}/usuarios`), roles: this.http.get<{ roles: Rol[] }>(`${this.api}/roles`) }).pipe(map(({ usuarios, roles }) => usuarios.usuarios.map(u => ({ id: u.id, version: u.version, username: u.nombre_usuario, correo: u.correo, nombre: u.correo, foto: u.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nombre_usuario)}&background=123d25&color=fff`, role: roles.roles.find(r => r.id === u.rol_id)?.nombre || 'secretario_tecnico', activo: u.activo })))); }
  private rolId(role: UserRole): Observable<string> { return this.http.get<{ roles: Rol[] }>(`${this.api}/roles`).pipe(map(r => { const rol = r.roles.find(x => x.nombre === role); if (!rol) throw new Error('Rol no encontrado'); return rol.id; })); }
  crear(form: { username: string; password: string; role: UserRole; nombre: string; activo: boolean }): Observable<unknown> { return this.rolId(form.role).pipe(switchMap(rol_id => this.http.post(`${this.api}/usuarios`, { rol_id, nombre_usuario: form.username, correo: form.nombre.includes('@') ? form.nombre : `${form.username}@sgpf.local`, clave: form.password, activo: form.activo }))); }
  editar(user: User, form: { username: string; password: string; role: UserRole; nombre: string; activo: boolean }): Observable<unknown> { return this.rolId(form.role).pipe(switchMap(rol_id => this.http.patch(`${this.api}/usuarios/${user.id}`, { rol_id, nombre_usuario: form.username, correo: form.nombre.includes('@') ? form.nombre : user.correo, ...(form.password ? { clave: form.password } : {}), activo: form.activo, version: user.version }))); }
  eliminar(user: User): Observable<void> { return this.http.delete<void>(`${this.api}/usuarios/${user.id}`, { body: { version: user.version } }); }
}
