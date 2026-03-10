import { Injectable, computed, inject, signal } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly oauthService = inject(OAuthService);
  private readonly _isAuthenticated = signal(this.oauthService.hasValidAccessToken());

  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  readonly isAdmin = computed(() => {
    if (!this._isAuthenticated()) return false;
    const claims = this.oauthService.getIdentityClaims() as Record<string, unknown> | null;
    const realmAccess = claims?.['realm_access'] as { roles?: string[] } | undefined;
    return realmAccess?.roles?.includes('ROLE_ADMIN') ?? false;
  });

  constructor() {
    this.oauthService.events.subscribe(() => {
      this._isAuthenticated.set(this.oauthService.hasValidAccessToken());
    });
    this.oauthService.setupAutomaticSilentRefresh();
  }

  getAccessToken(): string | null {
    return this.oauthService.getAccessToken() || null;
  }

  getUsername(): string | null {
    const claims = this.oauthService.getIdentityClaims() as Record<string, unknown> | null;
    return (claims?.['preferred_username'] as string) ?? null;
  }

  login(returnUrl?: string): void {
    if (returnUrl && returnUrl !== '/') {
      sessionStorage.setItem('post_login_redirect', returnUrl);
    }
    this.oauthService.initCodeFlow();
  }

  logout(): void {
    this.oauthService.logOut();
  }
}
