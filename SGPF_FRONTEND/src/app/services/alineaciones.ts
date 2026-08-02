import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Jugador, JugadoresService } from './jugadores';
import { Partido, PartidosService } from './partidos';

export interface JugadorEnCancha { jugador: Jugador; posicion: { x: number; y: number }; rol: string; slotIndice?: number; }
export interface Alineacion { id: string; version: number; partido: Partido; formacion: string; jugadoresEnCancha: JugadorEnCancha[]; fechaCreacion: string; }
interface AlineacionApi { id: string; version: number; partido_id: string; esquema_tactico: string; creado_en: string; }
interface DetalleApi { jugador_id: string; posicion_en_campo: string; slot_indice?: number; }

@Injectable({ providedIn: 'root' })
export class AlineacionesService {
  private readonly http = inject(HttpClient);
  private readonly jugadoresService = inject(JugadoresService);
  private readonly partidosService = inject(PartidosService);
  private readonly api = environment.apiUrl;

  obtenerAlineaciones(): Observable<Alineacion[]> {
    return forkJoin({
      alineaciones: this.http.get<{ alineaciones: AlineacionApi[] }>(`${this.api}/alineaciones`),
      jugadores: this.jugadoresService.obtenerJugadores(),
      partidos: this.partidosService.obtenerPartidos()
    }).pipe(switchMap(({ alineaciones, jugadores, partidos }) => {
      if (!alineaciones.alineaciones.length) return of([]);
      return forkJoin(alineaciones.alineaciones.map(a => this.http.get<{ detalle_alineacion: DetalleApi[] }>(`${this.api}/detalle-alineacion?alineacion_id=${a.id}`).pipe(map(r => ({ a, detalles: r.detalle_alineacion, jugadores, partidos })))));
    }), map(items => items.map(({ a, detalles, jugadores, partidos }) => ({
      id: a.id, version: a.version,
      partido: partidos.find(p => p.id === a.partido_id)!,
      formacion: a.esquema_tactico,
      fechaCreacion: new Date(a.creado_en).toLocaleDateString('es-EC'),
      jugadoresEnCancha: detalles.map((d, i) => ({ jugador: jugadores.find(j => j.id === d.jugador_id)!, posicion: this.posicionVisual(i), rol: d.posicion_en_campo, slotIndice: d.slot_indice })).filter(x => !!x.jugador)
    }))));
  }

  agregar(datos: Omit<Alineacion, 'id' | 'version'>): Observable<Alineacion> {
    return this.http.get<{ entrenadores: { id: string }[] }>(`${this.api}/entrenadores?limit=1`).pipe(switchMap(r => {
      if (!r.entrenadores.length) throw new Error('Debe registrar al menos un entrenador antes de crear alineaciones');
      return this.http.post<{ alineación?: AlineacionApi; alineacion?: AlineacionApi }>(`${this.api}/alineaciones`, {
        partido_id: datos.partido.id, entrenador_id: r.entrenadores[0].id,
        esquema_tactico: datos.formacion, confirmado: false,
        detalles: datos.jugadoresEnCancha.map((j, i) => ({ jugador_id: j.jugador.id, posicion_en_campo: j.rol, slot_indice: j.slotIndice, titular: true, capitan: i === 0, minuto_ingreso: 0 }))
      });
    }), map(() => ({ ...datos, id: '', version: 1 })));
  }

  editar(id: string, version: number, datos: Omit<Alineacion, 'id' | 'version'>): Observable<unknown> {
    return this.http.patch(`${this.api}/alineaciones/${id}`, {
      partido_id: datos.partido.id, esquema_tactico: datos.formacion, version,
      detalles: datos.jugadoresEnCancha.map((j, i) => ({ jugador_id: j.jugador.id, posicion_en_campo: j.rol, slot_indice: j.slotIndice, titular: true, capitan: i === 0, minuto_ingreso: 0 }))
    });
  }
  eliminar(alineacion: Alineacion): Observable<void> { return this.http.delete<void>(`${this.api}/alineaciones/${alineacion.id}`, { body: { version: alineacion.version } }); }
  private posicionVisual(i: number): { x: number; y: number } { const cols = [18, 38, 62, 82]; return i === 0 ? { x: 50, y: 88 } : { x: cols[(i - 1) % 4], y: i < 5 ? 70 : i < 9 ? 48 : 22 }; }
}
