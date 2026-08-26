---
name: Frontend - Auth: Keycloak Authentication
description: Rules and guidelines for Keycloak Authentication in the frontend project.
---

# Skill: Keycloak Authentication

## Instalación
```bash
pnpm install keycloak-angular keycloak-js
```

## Inicialización en app 
- verificar .agents/skills/development/modules/main-app-modules.md para la 

## environment.ts
```typescript
// archivo en environments/properties/dev/
// nombre de archivo: common.properties.ts
/**
 * @author Autor
 */
export const [PROJECT_SUFFIX]_COMMON_PROPERTIES = {
  host: 'http://localhost',
  gateway: {
    port: '',
    health: '/health'
  }
};
```
```typescript
// archivo en environments/properties/dev/
// nombre de archivo: [nombre_libreria].properties.ts
/**
 * @author Autor
 */
import {[PROJECT_SUFFIX]_COMMON_PROPERTIES} from './common.properties';

export const [LIBRARY_NAME]_PROPERTIES = {
  enableLogs: true,
  service: {
    identity: {
      host: [PROJECT_SUFFIX]_COMMON_PROPERTIES.host,
      port: ''
    },
    gateway: [PROJECT_SUFFIX]_COMMON_PROPERTIES.gateway,
    [libraryName]: {
      host: [PROJECT_SUFFIX]_COMMON_PROPERTIES.host,
      port: ''
    }
  }
};
```
```typescript
/**
 * @author Autor
 */
export const environment = {
  production: false,
  [LIBRARY_NAME]: [LIBRARY_NAME]_PROPERTIES
};
```

## AuthGuard
```typescript
// auth.guard.ts
@Injectable({ providedIn: 'root' })
export class AuthGuard extends KeycloakAuthGuard {

  constructor(
    protected override readonly router: Router,
    protected readonly keycloak: KeycloakService
  ) {
    super(router, keycloak);
  }

  public async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    if (!this.authenticated) {
      await this.keycloak.login({ redirectUri: window.location.origin + state.url });
    }

    const requiredRoles = route.data['roles'] as string[];
    if (!requiredRoles || requiredRoles.length === 0) return true;

    return requiredRoles.every(role => this.roles.includes(role));
  }
}
```

## Uso en routing
```typescript
const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: [] }  // autenticado, sin rol específico
  }
];
```

## Obtener datos del usuario
```typescript
@Injectable({ providedIn: 'root' })
export class UserSessionService {

  constructor(private _keycloak: KeycloakService) {}

  public getUsername(): string {
    return this._keycloak.getUsername();
  }

  public getRoles(): string[] {
    return this._keycloak.getUserRoles();
  }

  public hasRole(role: string): boolean {
    return this._keycloak.isUserInRole(role);
  }

  public getToken(): Promise<string> {
    return this._keycloak.getToken();
  }

  public logout(): void {
    this._keycloak.logout(window.location.origin);
  }
}
```

## HTTP Interceptor (token automático)
```typescript
// keycloak-angular lo hace automáticamente con bearerPrefix
// Solo configurar bearerExcludedUrls para rutas públicas
```

## En Microfrontends
- El Shell inicializa Keycloak con `APP_INITIALIZER`
- Los MFEs **no** inicializan Keycloak — lo reciben del Shell
- Compartir el `KeycloakService` como singleton via Module Federation shared
- En el MFE usar directamente `KeycloakService` — ya está inicializado

```javascript
// webpack.config.js del MFE
shared: {
  ...shareAll({ singleton: true, strictVersion: false, requiredVersion: 'auto' }),
  'keycloak-angular': { singleton: true, strictVersion: false },
  'keycloak-js': { singleton: true, strictVersion: false },
}
```

## Reglas
- Nunca almacenar el token en `localStorage` manualmente — Keycloak lo gestiona
- Usar `silentCheckSsoRedirectUri` para renovación automática de tokens
- `bearerExcludedUrls` debe incluir todas las URLs públicas (assets, health checks)
- En producción usar `onLoad: 'check-sso'` si hay rutas públicas, `'login-required'` si todo requiere auth
