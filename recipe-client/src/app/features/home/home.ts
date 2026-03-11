import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { AuthService } from '../../core/auth/auth.service';
import { BowlService } from '../../core/bowl/bowl.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
})
export class HomeComponent {
  private readonly authService = inject(AuthService);
  private readonly bowlService = inject(BowlService);

  protected readonly username = this.authService.getUsername();
  protected readonly bowl = toSignal(this.bowlService.getBowl());
}
