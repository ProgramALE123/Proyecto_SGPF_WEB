import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Jugador, JugadoresService } from '../../services/jugadores';
@Component({
  selector: 'app-jugadores',
  imports: [CommonModule, FormsModule],
  templateUrl: './jugadores.html',
  styleUrl: './jugadores.css',
})
export class Jugadores {
  mostrarFormulario: boolean = false;
  editando: boolean = false;
  indiceEditar: number = -1;

  jugador: Jugador = {
    nombres: '',
    apellidos: '',
    edad: 0,
    posicion: '',
    estatura: 0,
    peso: 0,
    camiseta: 0,
    foto: '', estado: 'Disponible', condicionFisica: 100, observacionesMedicas: ''
  };
  jugadorSeleccionado: Jugador | null = null;
  mostrarDetalle: boolean = false;
  jugadores: Jugador[] = [];
  filtroEstado: string = 'Todos';

  get jugadoresFiltrados(): Jugador[] { return this.filtroEstado === 'Todos' ? this.jugadores : this.jugadores.filter(j => j.estado === this.filtroEstado); }
  get disponibles(): number { return this.jugadores.filter(j => j.estado === 'Disponible').length; }
  claseEstado(estado: string): string { return ({ Disponible: 'estado-disponible', Lesionado: 'estado-lesionado', Suspendido: 'estado-suspendido', Recuperacion: 'estado-recuperacion' } as Record<string,string>)[estado] || ''; }

  constructor(private jugadoresService: JugadoresService, private cdr: ChangeDetectorRef) { this.cargarJugadores(); }
  cargarJugadores(): void { this.jugadoresService.obtenerJugadores().subscribe({ next: jugadores => { this.jugadores = jugadores; this.cdr.detectChanges(); }, error: error => console.error('Error al cargar jugadores', error) }); }
  verMas(jugador: Jugador): void {
    this.jugadorSeleccionado = jugador;
    this.mostrarDetalle = true;
  }

  cerrarDetalle(): void {
    this.jugadorSeleccionado = null;
    this.mostrarDetalle = false;
  }
  abrirFormulario(): void {
    this.mostrarFormulario = true;
    this.editando = false;
    this.limpiarFormulario();
  }

  guardarJugador(): void {
    if (this.editando) {
      this.jugadoresService.editarJugador(this.jugador).subscribe(() => this.cargarJugadores());
    } else {
      this.jugadoresService.agregarJugador(this.jugador).subscribe(() => this.cargarJugadores());
    }

    this.cerrarFormulario();
  }

  editarJugadorSeleccionado(jugador: Jugador): void {
    this.jugador = { ...jugador };
    this.indiceEditar = this.jugadores.indexOf(jugador);
    this.editando = true;
    this.mostrarFormulario = true;
  }

  eliminarJugadorSeleccionado(jugador: Jugador): void {
    this.jugadoresService.eliminarJugador(jugador).subscribe(() => this.cargarJugadores());
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.editando = false;
    this.indiceEditar = -1;
    this.limpiarFormulario();
  }

  limpiarFormulario(): void {
    this.jugador = {
      nombres: '',
      apellidos: '',
      edad: 0,
      posicion: '',
      estatura: 0,
      peso: 0,
      camiseta: 0,
      foto: '', estado: 'Disponible', condicionFisica: 100, observacionesMedicas: ''
    };
  }
}
