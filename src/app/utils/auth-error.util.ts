import { HttpErrorResponse } from '@angular/common/http';

export function getAuthErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (err.status === 0) {
    return 'Could not reach the server. Check your connection or try again in a moment.';
  }

  if (err.status === 429) {
    return (
      err.error?.error ??
      'Too many sign-in attempts. Please wait a few minutes and try again.'
    );
  }

  const apiMessage = err.error?.error ?? err.error?.message;
  if (typeof apiMessage === 'string' && apiMessage.trim()) {
    return apiMessage;
  }

  if (err.status === 401) {
    return 'Invalid email or password. Please try again.';
  }

  return fallback;
}
