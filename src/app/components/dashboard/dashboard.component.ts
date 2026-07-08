import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ComparisonPanelComponent } from '../comparison-panel/comparison-panel.component';

@Component({
  selector: 'app-dashboard',
  imports: [ComparisonPanelComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  userEmail: string | null;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.userEmail = this.authService.getCurrentUserEmail();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
