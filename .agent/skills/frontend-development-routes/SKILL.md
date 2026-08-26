---
name: Frontend - Development: Routes Development
description: Rules and guidelines for Routes Development in the frontend project.
---

# Skill: Routes Development

## Estructura de archivos de rutas
```
src/app/
├── routes/
│   ├── app-routes.constant.ts       # Definición de rutas (constante separada)
│   └── app-routing.module.ts        # NgModule que registra las rutas

lib/modules/
├── [prefix]-main-routing.module.ts  # Rutas raíz de la librería (forChild)
├── [prefix]-dashboard/
│   └── routes/
│       ├── [prefix]-dashboard-routes.constant.ts
│       └── [prefix]-dashboard-routing.module.ts
└── [prefix]-[feature]/
    └── routes/
        └── [prefix]-[feature]-routing.module.ts  # Generalmente vacío
```

---

## Main App — app-routes.constant.ts
```typescript
/**
 * @author [Autor]
 */
// src/app/routes/app-routes.constant.ts
export const APP_ROUTES: Routes = [
  {
    path: 'public',
    loadChildren: () =>
      import('../modules/public/public.module').then(m => m.PublicModule),
    canActivate: [PublicAuthGuardService]
  },
  {
    path: 'secure',
    loadChildren: () =>
      import('../modules/secure/secure.module').then(m => m.SecureModule),
    canActivate: [SecureAuthGuardService]
  },
  { path: '**', redirectTo: 'public', pathMatch: 'full' },
];
```

## Main App — app-routing.module.ts
```typescript
/**
 * @author [Autor]
 */
// src/app/routes/app-routing.module.ts
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(APP_ROUTES, { useHash: false })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
```

---

## Secure Module — secure.module.ts
```typescript
/**
 * @author [Autor]
 */
// src/app/modules/secure/secure.module.ts
@NgModule({
  declarations: [SecureComponent],
  imports: [
    CommonModule,
    SecureRoutingModule,
    // Importar la librería principal
    [Prefix]MainModule,
  ]
})
export class SecureModule {}
```

## Secure Module — secure-routing.module.ts
```typescript
/**
 * @author [Autor]
 */
// src/app/modules/secure/secure-routing.module.ts
const routes: Routes = [
  {
    path: '',
    component: SecureComponent,
    children: [
      {
        // La librería toma control del routing desde aquí
        path: '[prefix]',
        loadChildren: () =>
          import('projects/[prefix]-[domain]/src/lib/modules/[prefix]-main.module')
            .then(m => m.[Prefix]MainModule)
      },
      { path: '', redirectTo: '[prefix]', pathMatch: 'full' },
      { path: '**', redirectTo: '[prefix]', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecureRoutingModule {}
```

---

## Library — [prefix]-main-routing.module.ts (raíz de rutas de librería)
```typescript
/**
 * @author [Autor]
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { [Prefix]MainComponent } from './[prefix]-main.component';
import { [Prefix]PermissionGuard } from '../services/[prefix]-permission.guard';
import { [PREFIX]_ROUTE_PERMISSIONS } from '../integration/configs/constants/[prefix]-permission.constant';

// Componentes de ruta directa (no lazy — ya declarados en sus feature modules)
import { [Prefix][EntityA]Component } from './[prefix]-[feature-a]/components/[prefix]-[entity-a]/[prefix]-[entity-a].component';
import { [Prefix][EntityB]Component } from './[prefix]-[feature-b]/components/[prefix]-[entity-b]/[prefix]-[entity-b].component';

const routes: Routes = [
  // Shell de la librería (layout + menú)
  {
    path: '',
    component: [Prefix]MainComponent
  },

  // Dashboard
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./[prefix]-dashboard/routes/[prefix]-dashboard-routing.module')
        .then(m => m.[Prefix]DashboardRoutingModule)
  },

  // Rutas directas (componente simple, sin sub-rutas)
  {
    path: '[entity-a-route]',
    canActivate: [[Prefix]PermissionGuard],
    data: { permissions: [PREFIX]_ROUTE_PERMISSIONS['[entity-a-route]'] },
    component: [Prefix][EntityA]Component
  },
  {
    path: '[entity-b-route]',
    canActivate: [[Prefix]PermissionGuard],
    data: { permissions: [PREFIX]_ROUTE_PERMISSIONS['[entity-b-route]'] },
    component: [Prefix][EntityB]Component
  },

  // Rutas lazy (sub-módulo con rutas hijas)
  {
    path: '[feature-route]',
    canActivate: [[Prefix]PermissionGuard],
    data: { permissions: [PREFIX]_ROUTE_PERMISSIONS['[feature-route]'] },
    loadChildren: () =>
      import('./[prefix]-[feature]/components/[prefix]-[feature]-manager/[prefix]-[feature]-manager.module')
        .then(m => m.[Prefix][Feature]ManagerModule)
  },

  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class [Prefix]MainRoutingModule {}
```

## Library — [prefix]-dashboard-routes.constant.ts
```typescript
/**
 * @author [Autor]
 */
import { Routes } from '@angular/router';
import { [Prefix]DashboardComponent } from '../components/[prefix]-dashboard/[prefix]-dashboard.component';

export const [PREFIX]_DASHBOARD_ROUTES: Routes = [{
  path: '',
  component: [Prefix]DashboardComponent,
  children: []
}];
```

## Library — [prefix]-dashboard-routing.module.ts
```typescript
/**
 * @author [Autor]
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { [PREFIX]_DASHBOARD_ROUTES } from './[prefix]-dashboard-routes.constant';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([PREFIX]_DASHBOARD_ROUTES)
  ],
  exports: [RouterModule]
})
export class [Prefix]DashboardRoutingModule {}
```

## Library — [prefix]-[feature]-routing.module.ts (feature vacío)
```typescript
/**
 * @author [Autor]
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Las rutas de esta feature se definen en [prefix]-main-routing.module.ts
const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class [Prefix][Feature]RoutingModule {}
```

---

## Auth Guards (src/app/services/)

### public-auth-guard.service.ts
```typescript
/**
 * @author [Autor]
 */
@Injectable({ providedIn: 'root' })
export class PublicAuthGuardService implements CanActivate {

  constructor(private _keycloak: KeycloakService, private _router: Router) {}

  canActivate(): boolean {
    if (this._keycloak.isLoggedIn()) {
      this._router.navigate(['/secure']);
      return false;
    }
    return true;
  }
}
```

### secure-auth-guard.service.ts
```typescript
/**
 * @author [Autor]
 */
@Injectable({ providedIn: 'root' })
export class SecureAuthGuardService extends KeycloakAuthGuard {

  constructor(
    protected override readonly router: Router,
    protected readonly keycloak: KeycloakService
  ) {
    super(router, keycloak);
  }

  async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    if (!this.authenticated) {
      await this.keycloak.login({ redirectUri: window.location.origin + state.url });
      return false;
    }
    return true;
  }
}
```

### [prefix]-permission.guard.ts (en lib/services/)
```typescript
/**
 * @author [Autor]
 */
@Injectable({ providedIn: 'root' })
export class [Prefix]PermissionGuard implements CanActivate {

  constructor(private _router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const permissions = route.data['permissions'];
    // Verificar permisos según la lógica del proyecto
    // Si no tiene permisos, redirigir
    return true;
  }
}
```

---

## Reglas
- `app-routes.constant.ts` y `app-routing.module.ts` van en `src/app/routes/` (main app)
- `app-routing.module.ts` usa `RouterModule.forRoot()` — solo una vez en toda la app
- Todos los demás módulos usan `RouterModule.forChild()` — nunca `forRoot`
- Las rutas públicas y seguras se separan en módulos distintos con guards propios
- `public-auth-guard.service.ts` y `secure-auth-guard.service.ts` van en `src/app/services/`
- El guard de permisos de la librería (`[prefix]-permission.guard.ts`) vive en `lib/services/`
- Las constantes de rutas se definen en archivos `*-routes.constant.ts` separados del NgModule
- Siempre poner `@author` en el JSDoc de cada archivo
- Rutas directas (`component:`) para componentes simples; `loadChildren:` para features con sub-rutas
