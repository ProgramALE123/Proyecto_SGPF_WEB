import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

interface JugadorApi {
  id: string; nombres: string; apellidos: string; cedula: string;
  fecha_nacimiento: string; posicion: string; dorsal: number;
  nacionalidad: string; foto_url?: string; activo: boolean; version: number;
  estado_deportivo?: Jugador['estado']; condicion_fisica?: number; observaciones_medicas?: string;
}

export interface Jugador {
  id?: string; version?: number; nombres: string; apellidos: string;
  cedula?: string; fecha_nacimiento?: string; nacionalidad?: string; activo?: boolean;
  edad: number; posicion: string; estatura: number; peso: number;
  camiseta: number; foto: string;
  estado: 'Disponible' | 'Lesionado' | 'Suspendido' | 'Recuperacion';
  condicionFisica: number; observacionesMedicas: string;
}

const edadDesdeFecha = (fecha: string): number => {
  const nacimiento = new Date(`${fecha.slice(0, 10)}T00:00:00`);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  if (hoy < new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate())) edad--;
  return edad;
};

const desdeApi = (j: JugadorApi): Jugador => ({
  ...j, edad: edadDesdeFecha(j.fecha_nacimiento), camiseta: j.dorsal,
  estatura: 0, peso: 0, estado: j.estado_deportivo || 'Disponible',
  condicionFisica: j.condicion_fisica ?? 100, observacionesMedicas: j.observaciones_medicas || '',
  foto: j.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${j.nombres} ${j.apellidos}`)}&background=123d25&color=fff`
});

const paraApi = (j: Jugador) => ({
  nombres: j.nombres, apellidos: j.apellidos,
  cedula: j.cedula || `TEMP-${Date.now()}`,
  fecha_nacimiento: j.fecha_nacimiento || `${new Date().getFullYear() - Number(j.edad || 18)}-01-01`,
  posicion: ['Portero', 'Defensa', 'Mediocampista', 'Delantero'].includes(j.posicion) ? j.posicion : 'Delantero',
  dorsal: Number(j.camiseta), nacionalidad: j.nacionalidad || 'Ecuatoriana', foto_url: j.foto || null,
  estado_deportivo: j.estado || 'Disponible', condicion_fisica: Number(j.condicionFisica ?? 100), observaciones_medicas: j.observacionesMedicas || null, activo: j.activo ?? true
});

@Injectable({ providedIn: 'root' })
export class JugadoresService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/jugadores`;

  obtenerJugadores(): Observable<Jugador[]> {
    return this.http.get<{ jugadores: JugadorApi[] }>(`${this.url}?limit=100`).pipe(map(r => r.jugadores.map(desdeApi)));
  }
  agregarJugador(jugador: Jugador): Observable<Jugador> {
    return this.http.post<{ jugador: JugadorApi }>(this.url, paraApi(jugador)).pipe(map(r => desdeApi(r.jugador)));
  }
  editarJugador(jugador: Jugador): Observable<Jugador> {
    return this.http.patch<{ jugador: JugadorApi }>(`${this.url}/${jugador.id}`, { ...paraApi(jugador), version: jugador.version }).pipe(map(r => desdeApi(r.jugador)));
  }
  eliminarJugador(jugador: Jugador): Observable<void> {
    return this.http.delete<void>(`${this.url}/${jugador.id}`, { body: { version: jugador.version } });
  }
}
