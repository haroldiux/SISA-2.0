---
name: Frontend - Development: Service Development
description: Rules and guidelines for Service Development in the frontend project.
---

# Skill: Service Development

## HTTP Service base
- This must be in bootstrap folder
```typescript
/**
 * @author Autor
 */
export abstract class [Prefix]HttpService extends BaseHttpService {

  protected constructor() {
    super();
  }

  public gatewayServer(): BaseGatewayServer {
    return this.injector().get([Prefix]GatewayServer);
  }

  public abstract override path(): string;

  protected abstract injector(): Injector;
}
```

## Utility Functions
```typescript
/**
 * @author Autor
 */

export function [functionName] {
  // funciones de utilidad: transformaciones, cálculos, helpers
  // lógica pura, sin side effects
}
```

## Interceptores
```typescript
/**
 * @author Autor
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private _keycloak: KeycloakService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this._keycloak.getToken();
    if (!token) return next.handle(req);

    return next.handle(req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    }));
  }
}
```

```typescript
// en service de /src/app/
/**
 * @author Autor
 */
import {Injectable} from '@angular/core';

@Injectable()
export class SessionService {

  private _isLoggedIn!: boolean;

  constructor() {
  }

  public loggedIn(value: boolean): void {
    this._isLoggedIn = value;
  }

  public isLoggedIn(): boolean {
    return this._isLoggedIn;
  }
}
```

## Reglas
- `providedIn: 'root'` para servicios singleton globales
- Sin `providedIn` para servicios específicos de un módulo (declarar en providers del módulo)
- Nunca lógica de transformación en el State — hacerlo en el servicio o en un builder
- Siempre agregar `@author`
- Las utilidades nunca en `services/`, siempre en `/utils`
