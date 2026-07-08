import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AuthModalMode = 'login' | 'signup';

export interface AuthModalState {
  open: boolean;
  mode: AuthModalMode;
}

@Injectable({
  providedIn: 'root',
})
export class AuthModalService {
  private readonly stateSubject = new BehaviorSubject<AuthModalState>({
    open: false,
    mode: 'login',
  });

  readonly state$ = this.stateSubject.asObservable();

  get snapshot(): AuthModalState {
    return this.stateSubject.value;
  }

  open(mode: AuthModalMode = 'login'): void {
    this.stateSubject.next({ open: true, mode });
  }

  close(): void {
    this.stateSubject.next({ ...this.stateSubject.value, open: false });
  }

  setMode(mode: AuthModalMode): void {
    this.stateSubject.next({ ...this.stateSubject.value, mode });
  }
}
