import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { Nadvar } from './components/nadvar/nadvar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Nadvar, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private router = inject(Router);

  isLoginRoute = signal(true);

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.isLoginRoute.set(this.router.url === '/');
    });
  }
}
