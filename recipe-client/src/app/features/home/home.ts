import { Component, inject } from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
})
export class HomeComponent {
  private readonly authService = inject(AuthService);

  protected readonly username = this.authService.getUsername();
}
