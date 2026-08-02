import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Jugador, JugadoresService } from '../../services/jugadores';
import { Partido, PartidosService } from '../../services/partidos';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  totalJugadores: number = 0;
  totalEntrenadores: number = 5;
  totalPartidos: number = 0;

  ultimosJugadores: Jugador[] = [];
  ultimosPartidos: Partido[] = [];
  proximosPartidos: Partido[] = [];
  jugadoresDisponibles = 0;
  jugadoresNoDisponibles = 0;
  cargando = true;

  constructor(
    private jugadoresService: JugadoresService,
    private partidosService: PartidosService,
    private cdr: ChangeDetectorRef
  ) {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.jugadoresService.obtenerJugadores().subscribe(jugadores => {
      this.totalJugadores = jugadores.length;
      this.ultimosJugadores = jugadores.slice(-3);
      this.jugadoresDisponibles = jugadores.filter(j => j.estado === 'Disponible').length;
      this.jugadoresNoDisponibles = jugadores.length - this.jugadoresDisponibles;
      this.cdr.detectChanges();
    });
    this.partidosService.obtenerPartidos().subscribe(partidos => {
      this.totalPartidos = partidos.length;
      this.ultimosPartidos = partidos.filter(p => p.resultado).sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 4);
      this.proximosPartidos = partidos.filter(p => !p.resultado).sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(0, 3);
      this.cargando = false;
      this.cdr.detectChanges();
    });
  }

  diasPara(fecha: string): number { return Math.max(0, Math.ceil((new Date(fecha).getTime() - Date.now()) / 86400000)); }
  urgenciaPartido(fecha: string): string { const d=this.diasPara(fecha); return d<=3?'urgente':d<=7?'proximo':'normal'; }

  obtenerEstado(resultado: string): string {
    if (!resultado) return 'Programado';
    const [gF, gC] = resultado.split('-').map(Number);
    if (gF > gC) return 'Victoria';
    if (gF < gC) return 'Derrota';
    return 'Empate';
  }

  obtenerClaseBadge(resultado: string): string {
    const estado = this.obtenerEstado(resultado);
    if (estado === 'Victoria') return 'badge bg-success';
    if (estado === 'Derrota') return 'badge bg-danger';
    if (estado === 'Empate') return 'badge bg-warning text-dark';
    return 'badge bg-secondary';
  }
}
