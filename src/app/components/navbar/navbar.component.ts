import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthModalService } from '../../services/auth-modal.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  private readonly authModal = inject(AuthModalService);
  private readonly router = inject(Router);

  openSignIn(): void {
    this.authModal.open('login');
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
