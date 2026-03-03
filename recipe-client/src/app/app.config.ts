import { APP_INITIALIZER, ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthConfig, OAuthService, provideOAuthClient } from 'angular-oauth2-oidc';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';

const authConfig: AuthConfig = {
  issuer: 'http://localhost:8180/realms/recipe',
  redirectUri: window.location.origin,
  clientId: 'recipe-client',
  responseType: 'code',
  scope: 'openid profile',
  showDebugInformation: false,
  requireHttps: false,
  sessionChecksEnabled: false,
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideOAuthClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const oauthService = inject(OAuthService);
        oauthService.configure(authConfig);
        return () => oauthService.loadDiscoveryDocumentAndTryLogin();
      },
      multi: true,
    },
  ],
};
