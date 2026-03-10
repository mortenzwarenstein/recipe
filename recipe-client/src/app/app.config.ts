import { APP_INITIALIZER, ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { OAuthService, provideOAuthClient } from 'angular-oauth2-oidc';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';

interface ClientEnv {
  keycloakIssuer: string;
  requireHttps: boolean;
  sessionChecksEnabled: boolean;
}

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
        const router = inject(Router);
        return () => fetch('/env.json')
          .then(r => r.json() as Promise<ClientEnv>)
          .then(env => {
            oauthService.configure({
              issuer: env.keycloakIssuer,
              redirectUri: window.location.origin,
              clientId: 'recipe-client',
              responseType: 'code',
              scope: 'openid profile',
              showDebugInformation: false,
              requireHttps: env.requireHttps,
              sessionChecksEnabled: env.sessionChecksEnabled,
              useSilentRefresh: false,
            });
            return oauthService.loadDiscoveryDocumentAndTryLogin()
              .then(() => {
                if (oauthService.hasValidAccessToken()) {
                  const redirect = sessionStorage.getItem('post_login_redirect');
                  if (redirect) {
                    sessionStorage.removeItem('post_login_redirect');
                    router.navigateByUrl(redirect);
                  }
                }
              })
              .catch(() => {
                oauthService.logOut(true);
              });
          });
      },
      multi: true,
    },
  ],
};
