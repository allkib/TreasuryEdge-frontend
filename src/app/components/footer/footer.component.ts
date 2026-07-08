import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthModalService } from '../../services/auth-modal.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  private readonly authModal = inject(AuthModalService);

  openSignIn(): void {
    this.authModal.open('login');
  }
}
