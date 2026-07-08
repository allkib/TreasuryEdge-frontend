import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthModalMode, AuthModalService } from '../../services/auth-modal.service';
import { AuthService } from '../../services/auth.service';
import { getAuthErrorMessage } from '../../utils/auth-error.util';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (password !== confirmPassword) {
    return { passwordsMismatch: true };
  }

  return null;
}

@Component({
  selector: 'app-auth-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.css',
})
export class AuthModalComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly authModal = inject(AuthModalService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  isOpen = false;
  mode: AuthModalMode = 'login';
  errorMessage = '';
  submitting = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  signupForm = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  ngOnInit(): void {
    this.authModal.state$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      this.isOpen = state.open;
      this.mode = state.mode;

      if (state.open) {
        this.errorMessage = '';
        this.submitting = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.close();
    }
  }

  close(): void {
    this.authModal.close();
  }

  setMode(mode: AuthModalMode): void {
    this.errorMessage = '';
    this.submitting = false;
    this.authModal.setMode(mode);
  }

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.submitting = true;
    this.errorMessage = '';

    this.authService.login(email!, password!).subscribe({
      next: () => this.onAuthSuccess(),
      error: (err) => {
        this.submitting = false;
        this.errorMessage = getAuthErrorMessage(
          err,
          'Invalid email or password. Please try again.',
        );
      },
    });
  }

  onSignupSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.signupForm.getRawValue();
    this.submitting = true;
    this.errorMessage = '';

    this.authService.signup(email!, password!).subscribe({
      next: () => this.onAuthSuccess(),
      error: (err) => {
        this.submitting = false;
        this.errorMessage = getAuthErrorMessage(
          err,
          'Unable to create account. That email may already be registered.',
        );
      },
    });
  }

  private onAuthSuccess(): void {
    this.submitting = false;
    this.close();
    this.loginForm.reset();
    this.signupForm.reset();

    if (this.router.url === '/' || this.router.url === '/home') {
      this.router.navigate(['/compare']);
    }
  }
}
