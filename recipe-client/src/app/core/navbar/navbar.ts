import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly username = computed(() => {
    this.isAuthenticated(); // track signal for reactivity
    return this.authService.getUsername();
  });
  protected readonly isOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationStart), takeUntilDestroyed())
      .subscribe(() => this.isOpen.set(false));
  }

  protected toggleMenu(): void {
    this.isOpen.update(v => !v);
  }

  protected logout(): void {
    this.authService.logout();
  }
}
