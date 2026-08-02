import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Entrenador, EntrenadoresService} from '../../services/entrenadores';
@Component({
  selector: 'app-entrenadores',
  imports: [CommonModule, FormsModule],
  templateUrl: './entrenadores.html',
  styleUrl: './entrenadores.css',
})
export class Entrenadores {
   mostrarFormulario: boolean = false;
  mostrarDetalle: boolean = false;
  editando: boolean = false;
  indiceEditar: number = -1;

  entrenadorSeleccionado: Entrenador | null = null;

  entrenador: Entrenador = {
    nombres: '',
    apellidos: '',
    cedula: '',
    telefono: '',
    correo: '',
    cargo: '',
    foto: ''
  };

  entrenadores: Entrenador[] = [];

  constructor(private entrenadoresService: EntrenadoresService, private cdr: ChangeDetectorRef) { this.cargarEntrenadores(); }
  cargarEntrenadores(): void { this.entrenadoresService.obtenerEntrenadores().subscribe({ next: entrenadores => { this.entrenadores = entrenadores; this.cdr.detectChanges(); }, error: error => console.error('Error al cargar entrenadores', error) }); }

  abrirFormulario(): void {
    this.mostrarFormulario = true;
    this.editando = false;
    this.limpiarFormulario();
  }

  guardarEntrenador(): void {
    if (this.editando) {
      this.entrenadoresService.editarEntrenador(this.entrenador).subscribe(() => this.cargarEntrenadores());
    } else {
      this.entrenadoresService.agregarEntrenador(this.entrenador).subscribe(() => this.cargarEntrenadores());
    }

    this.cerrarFormulario();
  }

  editarEntrenador(indice: number): void {
    this.entrenador = { ...this.entrenadores[indice] };
    this.indiceEditar = indice;
    this.editando = true;
    this.mostrarFormulario = true;
  }

  eliminarEntrenador(indice: number): void {
    this.entrenadoresService.eliminarEntrenador(this.entrenadores[indice]).subscribe(() => this.cargarEntrenadores());
  }

  verMas(entrenador: Entrenador): void {
    this.entrenadorSeleccionado = entrenador;
    this.mostrarDetalle = true;
  }

  cerrarDetalle(): void {
    this.entrenadorSeleccionado = null;
    this.mostrarDetalle = false;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.editando = false;
    this.indiceEditar = -1;
    this.limpiarFormulario();
  }

  limpiarFormulario(): void {
    this.entrenador = {
      nombres: '',
      apellidos: '',
      cedula: '',
      telefono: '',
      correo: '',
      cargo: '',
      foto: ''
    };
  }
}
