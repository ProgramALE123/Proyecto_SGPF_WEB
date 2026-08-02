import { Component, OnInit, AfterViewInit, OnDestroy, inject, signal, viewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Modal } from 'bootstrap';
import { User, UserRole, UsuariosService } from '../../services/usuarios';

@Component({ selector: 'app-usuarios', standalone: true, imports: [FormsModule, CommonModule], templateUrl: './usuarios.html', styleUrl: './usuarios.css' })
export class Usuarios implements OnInit, AfterViewInit, OnDestroy {
  readonly editModalEl = viewChild<ElementRef<HTMLDivElement>>('editModal');
  readonly deleteModalEl = viewChild<ElementRef<HTMLDivElement>>('deleteModal');
  readonly nameInputEl = viewChild<ElementRef<HTMLInputElement>>('nameInput');
  private readonly api = inject(UsuariosService);
  private editModal: Modal | null = null; private deleteModal: Modal | null = null;
  users = signal<User[]>([]); searchTerm = signal(''); editingUser = signal<User | null>(null); deletingUser = signal<User | null>(null); successMsg = signal(''); errorMsg = signal('');
  form = { username: '', password: '', role: 'secretario_tecnico' as UserRole, nombre: '', activo: true };
  roles = [{ value: 'presidente_club' as UserRole, label: 'Presidente' }, { value: 'director_tecnico' as UserRole, label: 'Director Técnico' }, { value: 'secretario_tecnico' as UserRole, label: 'Secretario Técnico' }];
  ngOnInit(): void { this.loadUsers(); }
  ngAfterViewInit(): void { const edit = this.editModalEl()?.nativeElement; const del = this.deleteModalEl()?.nativeElement; if (edit) this.editModal = Modal.getOrCreateInstance(edit); if (del) this.deleteModal = Modal.getOrCreateInstance(del, { backdrop: 'static', keyboard: false }); }
  ngOnDestroy(): void { this.editModal?.dispose(); this.deleteModal?.dispose(); }
  loadUsers(): void { this.api.listar().subscribe({ next: users => this.users.set(users), error: e => this.errorMsg.set(e.error?.message || 'No se pudieron cargar los usuarios') }); }
  get filteredUsers(): User[] { const t = this.searchTerm().toLowerCase(); return !t ? this.users() : this.users().filter(u => u.username.toLowerCase().includes(t) || u.nombre.toLowerCase().includes(t)); }
  openCreate(): void { this.editingUser.set(null); this.errorMsg.set(''); this.form = { username: '', password: '', role: 'secretario_tecnico', nombre: '', activo: true }; this.editModal?.show(); }
  openEdit(user: User): void { this.editingUser.set(user); this.form = { username: user.username, password: '', role: user.role, nombre: user.correo, activo: user.activo }; this.editModal?.show(); }
  save(): void { if (!this.form.username.trim() || !this.form.nombre.trim() || (!this.editingUser() && !this.form.password)) { this.errorMsg.set('Usuario, correo y contraseña son obligatorios'); return; } const request = this.editingUser() ? this.api.editar(this.editingUser()!, this.form) : this.api.crear(this.form); request.subscribe({ next: () => { this.editModal?.hide(); this.loadUsers(); this.showToast(this.editingUser() ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente'); }, error: e => this.errorMsg.set(e.error?.message || 'No se pudo guardar el usuario') }); }
  confirmDelete(user: User): void { this.deletingUser.set(user); this.deleteModal?.show(); }
  deleteUser(): void { const user = this.deletingUser(); if (!user) return; this.api.eliminar(user).subscribe({ next: () => { this.deleteModal?.hide(); this.loadUsers(); this.showToast('Usuario eliminado correctamente'); }, error: e => this.errorMsg.set(e.error?.message || 'No se pudo eliminar') }); }
  showToast(message: string): void { this.successMsg.set(message); setTimeout(() => this.successMsg.set(''), 3000); }
  getRoleLabel(role: UserRole): string { return ({ presidente_club: 'Presidente', director_tecnico: 'Director Técnico', secretario_tecnico: 'Secretario Técnico' })[role]; }
  getRoleBadgeClass(role: UserRole): string { return ({ presidente_club: 'bg-warning text-dark', director_tecnico: 'bg-primary', secretario_tecnico: 'bg-secondary' })[role]; }
}
