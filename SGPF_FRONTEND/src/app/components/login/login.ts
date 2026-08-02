import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { finalize, timeout } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private router = inject(Router);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  username = '';
  password = '';
  error = '';
  loading = false;
  showPassword = false;

  onSubmit(): void {
    this.error = '';
    if (!this.username.trim() || !this.password.trim()) {
      this.error = 'Ingrese usuario y contraseña';
      return;
    }

    this.loading = true;
    this.auth.login(this.username.trim(), this.password).pipe(
      timeout(8000),
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (error) => {
        this.error = error.name === 'TimeoutError'
          ? 'El servidor tardó demasiado en responder'
          : error.error?.mensaje || 'Usuario o contraseña incorrectos';
        this.cdr.detectChanges();
      }
    });
  }
}
