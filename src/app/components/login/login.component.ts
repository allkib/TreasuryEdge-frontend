import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { getAuthErrorMessage } from '../../utils/auth-error.util';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  errorMessage = '';
  submitting = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.submitting = true;
    this.errorMessage = '';

    this.authService.login(email!, password!).subscribe({
      next: () => {
        this.router.navigate(['/compare']);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = getAuthErrorMessage(
          err,
          'Invalid email or password. Please try again.',
        );
      },
    });
  }
}
