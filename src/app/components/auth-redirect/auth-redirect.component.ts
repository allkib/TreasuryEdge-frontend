import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthModalMode, AuthModalService } from '../../services/auth-modal.service';

@Component({
  selector: 'app-auth-redirect',
  template: '',
})
export class AuthRedirectComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authModal = inject(AuthModalService);

  ngOnInit(): void {
    const mode = (this.route.snapshot.data['mode'] as AuthModalMode) ?? 'login';
    this.authModal.open(mode);
    this.router.navigate(['/']);
  }
}
