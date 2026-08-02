import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Partido {
  id?: string; version?: number; rival_id?: string; rival: string; fecha: string;
  lugar: string; resultado: string; torneo: string; condicion: 'Local' | 'Visitante' | 'Neutral';
  finalizado?: boolean; rivalFoto?: string;
}
interface PartidoApi { id: string; version: number; rival_id: string; rival_nombre: string; rival_foto_url?: string; fecha_partido: string; estadio: string; condicion: Partido['condicion']; goles_orense: number; goles_rival: number; finalizado: boolean; }
interface RivalApi { id: string; nombre: string; version: number; }
const desdeApi = (p: PartidoApi): Partido => ({ id: p.id, version: p.version, rival_id: p.rival_id, rival: p.rival_nombre, rivalFoto: p.rival_foto_url, fecha: p.fecha_partido, lugar: p.estadio, resultado: p.finalizado ? `${p.goles_orense}-${p.goles_rival}` : '', torneo: 'Liga Pro Serie A', condicion: p.condicion, finalizado: p.finalizado });
const goles = (resultado: string) => { const [a = 0, b = 0] = resultado.split('-').map(Number); return { goles_orense: a || 0, goles_rival: b || 0 }; };

@Injectable({ providedIn: 'root' })
export class PartidosService {
  private readonly http = inject(HttpClient); private readonly api = environment.apiUrl;
  obtenerPartidos(): Observable<Partido[]> { return this.http.get<{ partidos: PartidoApi[] }>(`${this.api}/partidos`).pipe(map(r => r.partidos.map(desdeApi))); }
  private resolverRival(nombre: string): Observable<string> {
    return this.http.get<{ rivales: RivalApi[] }>(`${this.api}/rivales?search=${encodeURIComponent(nombre)}`).pipe(
      switchMap(r => r.rivales.length ? new Observable<string>(s => { s.next(r.rivales[0].id); s.complete(); }) : this.http.post<{ rival: RivalApi }>(`${this.api}/rivales`, { nombre, ciudad: 'Sin especificar', pais: 'Ecuador', activo: true }).pipe(map(x => x.rival.id)))
    );
  }
  agregarPartido(p: Partido): Observable<Partido> { return this.resolverRival(p.rival).pipe(switchMap(rival_id => this.http.post<{ partido: PartidoApi }>(`${this.api}/partidos`, { rival_id, fecha_partido: p.fecha, estadio: p.lugar, condicion: p.condicion, ...goles(p.resultado), finalizado: !!p.resultado }).pipe(map(r => desdeApi(r.partido))))); }
  editarPartido(p: Partido): Observable<Partido> { return this.resolverRival(p.rival).pipe(switchMap(rival_id => this.http.patch<{ partido: PartidoApi }>(`${this.api}/partidos/${p.id}`, { rival_id, fecha_partido: p.fecha, estadio: p.lugar, condicion: p.condicion, ...goles(p.resultado), finalizado: !!p.resultado, version: p.version }).pipe(map(r => desdeApi(r.partido))))); }
  eliminarPartido(p: Partido): Observable<void> { return this.http.delete<void>(`${this.api}/partidos/${p.id}`, { body: { version: p.version } }); }
}
