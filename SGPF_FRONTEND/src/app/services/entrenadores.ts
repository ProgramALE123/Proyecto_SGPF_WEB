import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Entrenador {
  id?: string; version?: number; nombres: string; apellidos: string; cedula: string;
  telefono: string; correo: string; cargo: string; fecha_ingreso?: string;
  activo?: boolean; foto_url?: string; foto: string;
}

interface Respuesta { entrenadores: Entrenador[] }
const completar = (e: Entrenador): Entrenador => ({ ...e, foto: e.foto_url || e.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${e.nombres} ${e.apellidos}`)}&background=123d25&color=fff` });
const paraApi = (e: Entrenador) => ({ nombres: e.nombres, apellidos: e.apellidos, cedula: e.cedula, telefono: e.telefono || null, correo: e.correo || null, cargo: e.cargo, fecha_ingreso: e.fecha_ingreso || new Date().toISOString().slice(0, 10), foto_url: e.foto || null, activo: e.activo ?? true });

@Injectable({ providedIn: 'root' })
export class EntrenadoresService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/entrenadores`;
  obtenerEntrenadores(): Observable<Entrenador[]> { return this.http.get<Respuesta>(this.url).pipe(map(r => r.entrenadores.map(completar))); }
  agregarEntrenador(e: Entrenador): Observable<Entrenador> { return this.http.post<{ entrenador: Entrenador }>(this.url, paraApi(e)).pipe(map(r => completar(r.entrenador))); }
  editarEntrenador(e: Entrenador): Observable<Entrenador> { return this.http.patch<{ entrenador: Entrenador }>(`${this.url}/${e.id}`, { ...paraApi(e), version: e.version }).pipe(map(r => completar(r.entrenador))); }
  eliminarEntrenador(e: Entrenador): Observable<void> { return this.http.delete<void>(`${this.url}/${e.id}`, { body: { version: e.version } }); }
}
