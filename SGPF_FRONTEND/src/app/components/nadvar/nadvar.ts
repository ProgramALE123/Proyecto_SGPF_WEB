import { Component, AfterViewInit, OnDestroy, inject, viewChild, ElementRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Offcanvas } from 'bootstrap';
import { AuthService } from '../../services/auth';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles: string[];
}

@Component({
  selector: 'app-nadvar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './nadvar.html',
  styleUrl: './nadvar.css',
})
export class Nadvar implements AfterViewInit, OnDestroy {
  private router = inject(Router);
  private auth = inject(AuthService);

  readonly offcanvasEl = viewChild<ElementRef<HTMLDivElement>>('offcanvasSidebar');
  private offcanvas: Offcanvas | null = null;

  navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2', roles: ['presidente_club', 'director_tecnico', 'secretario_tecnico'] },
    { path: '/usuarios', label: 'Usuarios', icon: 'bi-people-fill', roles: ['presidente_club'] },
    { path: '/jugadores', label: 'Jugadores', icon: 'bi-person-badge-fill', roles: ['presidente_club', 'director_tecnico', 'secretario_tecnico'] },
    { path: '/entrenadores', label: 'Entrenadores', icon: 'bi-person-workspace', roles: ['presidente_club', 'director_tecnico'] },
    { path: '/partidos', label: 'Partidos', icon: 'bi-calendar-event-fill', roles: ['presidente_club', 'director_tecnico', 'secretario_tecnico'] },
    { path: '/alineaciones', label: 'Alineaciones', icon: 'bi-diagram-3-fill', roles: ['presidente_club', 'director_tecnico'] },
  ];

  get filteredNavItems(): NavItem[] { return this.navItems.filter(item => this.auth.tieneRol(...item.roles)); }
  get usuarioActual() { return this.auth.usuario(); }
  get rolVisible(): string { return ({ presidente_club: 'Presidente', director_tecnico: 'Director tecnico', secretario_tecnico: 'Secretaria' } as Record<string, string>)[this.auth.rol() || ''] || ''; }

  ngAfterViewInit(): void {
    const el = this.offcanvasEl()?.nativeElement;
    if (el) {
      this.offcanvas = Offcanvas.getOrCreateInstance(el, { backdrop: true });
    }
  }

  ngOnDestroy(): void {
    this.offcanvas?.dispose();
  }

  openMobile(): void {
    this.offcanvas?.show();
  }

  closeMobile(): void {
    this.offcanvas?.hide();
  }

  logout(): void {
    this.offcanvas?.hide();
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
