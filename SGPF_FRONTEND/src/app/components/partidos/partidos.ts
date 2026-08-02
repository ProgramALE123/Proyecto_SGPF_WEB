import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Partido, PartidosService } from '../../services/partidos';

@Component({
  selector: 'app-partidos',
  imports: [CommonModule, FormsModule],
  templateUrl: './partidos.html',
  styleUrl: './partidos.css',
})
export class Partidos {
  mostrarFormulario: boolean = false;
  editando: boolean = false;
  indiceEditar: number = -1;

  partido: Partido = this.partidoVacio();

  partidoSeleccionado: Partido | null = null;
  mostrarDetalle: boolean = false;

  mostrarConfirmacion: boolean = false;
  indiceEliminar: number = -1;

  partidos: Partido[] = [];

  constructor(private partidosService: PartidosService, private cdr: ChangeDetectorRef) { this.cargarPartidos(); }
  cargarPartidos(): void { this.partidosService.obtenerPartidos().subscribe({ next: partidos => { this.partidos = partidos; this.cdr.detectChanges(); }, error: error => console.error('Error al cargar partidos', error) }); }

  partidoVacio(): Partido {
    return {
      rival: '',
      fecha: '',
      lugar: '',
      resultado: '',
      torneo: '',
      condicion: 'Local',
    };
  }

  abrirFormulario(): void {
    this.mostrarFormulario = true;
    this.editando = false;
    this.partido = this.partidoVacio();
  }

  guardarPartido(): void {
    if (this.editando) {
      this.partidosService.editarPartido(this.partido).subscribe(() => this.cargarPartidos());
    } else {
      this.partidosService.agregarPartido(this.partido).subscribe(() => this.cargarPartidos());
    }
    this.cerrarFormulario();
  }

  editarPartido(indice: number): void {
    this.partido = { ...this.partidos[indice] };
    this.indiceEditar = indice;
    this.editando = true;
    this.mostrarFormulario = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  confirmarEliminar(indice: number): void {
    this.indiceEliminar = indice;
    this.mostrarConfirmacion = true;
  }

  eliminarPartido(): void {
    this.partidosService.eliminarPartido(this.partidos[this.indiceEliminar]).subscribe(() => this.cargarPartidos());
    this.mostrarConfirmacion = false;
    this.indiceEliminar = -1;
  }

  cancelarEliminar(): void {
    this.mostrarConfirmacion = false;
    this.indiceEliminar = -1;
  }

  verDetalle(partido: Partido): void {
    this.partidoSeleccionado = partido;
    this.mostrarDetalle = true;
  }

  cerrarDetalle(): void {
    this.partidoSeleccionado = null;
    this.mostrarDetalle = false;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.editando = false;
    this.indiceEditar = -1;
    this.partido = this.partidoVacio();
  }

  obtenerEstado(resultado: string): string {
    if (!resultado) return 'Programado';
    const [gF, gC] = resultado.split('-').map(Number);
    if (gF > gC) return 'Victoria';
    if (gF < gC) return 'Derrota';
    return 'Empate';
  }

  obtenerClaseEstado(resultado: string): string {
    const estado = this.obtenerEstado(resultado);
    if (estado === 'Victoria') return 'badge-victoria';
    if (estado === 'Derrota') return 'badge-derrota';
    if (estado === 'Empate') return 'badge-empate';
    return 'badge-programado';
  }
}
