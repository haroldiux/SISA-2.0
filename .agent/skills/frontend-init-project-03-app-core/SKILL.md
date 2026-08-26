---
name: Frontend - Init-project: PASO 3: Core de la aplicación principal
description: Rules and guidelines for PASO 3: Core de la aplicación principal in the frontend project.
---

# PASO 3: Core de la aplicación principal

> **Predecesor:** [02-root-config.md](./02-root-config.md)
> **Sucesor:** [04-module-public.md](./04-module-public.md)

Generar los archivos del núcleo de la aplicación: bootstrap, AppModule, AppComponent, routing y guards.

---

## src/main.ts

```typescript
/**
 * @author <Author>
 */
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
```

---

## src/index.html

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title><n></title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

---

## src/app/app.module.ts

```typescript
/**
 * @author <Author>
 */
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './routes/app-routing.module';
import { environment } from '../environments/environment';

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

function initializeKeycloak(keycloak: KeycloakService): () => Promise<boolean> {
  return () =>
    keycloak.init({
      config: {
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId,
      },
      initOptions: {
        onLoad: 'login-required',
        checkLoginIframe: false,
      },
      bearerExcludedUrls: ['/assets', '/public'],
    });
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    KeycloakAngularModule,
    NgxsModule.forRoot([], { developmentMode: !environment.production }),
    NgxsLoggerPluginModule.forRoot({ disabled: environment.production }),
    NgxsReduxDevtoolsPluginModule.forRoot({ disabled: environment.production }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      defaultLanguage: 'es',
    }),
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

---

## src/app/app.component.ts

```typescript
/**
 * @author <Author>
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
```

---

## src/app/routes/app-routing.module.ts

```typescript
/**
 * @author <Author>
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { APP_ROUTES } from './app-routes.constant';

@NgModule({
  imports: [RouterModule.forRoot(APP_ROUTES, { useHash: false })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
```

---

## src/app/routes/app-routes.constant.ts

```typescript
/**
 * @author <Author>
 */
import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: 'public',
    loadChildren: () =>
      import('../modules/public/public.module').then((m) => m.PublicModule),
  },
  {
    path: 'secure',
    loadChildren: () =>
      import('../modules/secure/secure.module').then((m) => m.SecureModule),
  },
  { path: '', redirectTo: 'public', pathMatch: 'full' },
  { path: '**', redirectTo: 'public', pathMatch: 'full' },
];
```

---

## src/app/services/public-auth-guard.service.ts

```typescript
/**
 * @author <Author>
 */
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class PublicAuthGuardService implements CanActivate {
  constructor(
    private _keycloak: KeycloakService,
    private _router: Router
  ) {}

  public canActivate(): boolean {
    if (this._keycloak.isLoggedIn()) {
      this._router.navigate(['/secure']);
      return false;
    }
    return true;
  }
}
```

---

## src/app/services/secure-auth-guard.service.ts

```typescript
/**
 * @author <Author>
 */
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class SecureAuthGuardService implements CanActivate {
  constructor(
    private _keycloak: KeycloakService,
    private _router: Router
  ) {}

  public canActivate(): boolean {
    if (!this._keycloak.isLoggedIn()) {
      this._router.navigate(['/public']);
      return false;
    }
    return true;
  }
}
```
