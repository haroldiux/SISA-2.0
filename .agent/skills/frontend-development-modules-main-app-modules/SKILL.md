---
name: Frontend - Development-modules: Main App Modules Development
description: Rules and guidelines for Main App Modules Development in the frontend project.
---

# Skill: Main App Modules Development

## Estructura de módulos de la app principal
```
src/app/
├── app.module.ts                    # Módulo raíz — solo bootstrapping
├── app.component.ts                 # Componente raíz (router-outlet)
├── routes/
│   ├── app-routes.constant.ts
│   └── app-routing.module.ts
├── modules/
│   ├── public/                      # Módulo público (sin auth)
│   │   ├── components/
│   │   │   └── login/
│   │   ├── public-routing.module.ts
│   │   └── public.module.ts
│   └── secure/                      # Módulo seguro (con auth)
│       ├── components/
│       │   └── layout/
│       │       ├── layout.component.ts
│       │       ├── layout.component.html
│       │       └── layout.component.scss
│       ├── secure-routing.module.ts
│       └── secure.module.ts
└── services/
    ├── public-auth-guard.service.ts
    └── secure-auth-guard.service.ts
```

---

## app.module.ts
```typescript
/**
 * @author [Autor]
 */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './routes/app-routing.module';
import { environment } from '../environments/environment';

// Keycloak initializer
function initializeKeycloak(keycloak: KeycloakService) {
  return () => keycloak.init({
    config: {
      url: environment.keycloak.url,
      realm: environment.keycloak.realm,
      clientId: environment.keycloak.clientId,
    },
    initOptions: {
      onLoad: 'login-required',
      silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
    },
    bearerExcludedUrls: ['/assets'],
  }).then(async (result: boolean) => {

    if (!result) {
      return;
    }

    //TODO: Improve this implementation, may be by using a command.

    const userProfile: KeycloakProfile | null = await keycloak.loadUserProfile();
    loggedService.userLogged = {
      userId: userProfile.id as string,
      userName: userProfile.username as string,
      role: keycloak.getUserRoles(true),
      universityId: '1',
      branchOfficeId: 1
    }

    readIdentityUserByIdHttp.doGet().subscribe((value: any) => {
      if (value) {
        loggedService.userLogged.realmMappings = value.realmMappings;
      }
    });

    keycloak.keycloakEvents$.subscribe({
      next(event: KeycloakEvent) {
        if (event.type == KeycloakEventType.OnTokenExpired) {
          keycloak.updateToken(20);
        }
      }
    });
  });
}

// Translate loader factory
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    KeycloakAngularModule,

    // NGXS
    NgxsModule.forRoot({developmentMode: !environment.production}),
    NgxsLoggerPluginModule.forRoot({ disabled: environment.production }),
    NgxsReduxDevtoolsPluginModule.forRoot({ disabled: environment.production }),

    // i18n
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

## app.component.ts
```typescript
/**
 * @author [Autor]
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent {}
```

---

## public.module.ts
```typescript
/**
 * @author [Autor]
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicRoutingModule } from './public-routing.module';
import { LoginComponent } from './components/login/login.component';

// PrimeNG mínimo para pantalla de login
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    PublicRoutingModule,
    ButtonModule,
    CardModule,
  ]
})
export class PublicModule {}
```

## public-routing.module.ts
```typescript
/**
 * @author [Autor]
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule {}
```

---

## secure.module.ts
```typescript
/**
 * @author [Autor]
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecureRoutingModule } from './secure-routing.module';
import { LayoutComponent } from './components/layout/layout.component';

// Módulo principal de la librería
import { [Prefix]MainModule } from '@[org]/[prefix]-[domain]';

// PrimeNG para el layout de la app
import { MenubarModule } from 'primeng/menubar';
import { SidebarModule } from 'primeng/sidebar';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';

@NgModule({
  declarations: [LayoutComponent],
  imports: [
    CommonModule,
    SecureRoutingModule,

    // Librería principal — expone todos los módulos de features
    [Prefix]MainModule,

    // PrimeNG para layout
    MenubarModule,
    SidebarModule,
    AvatarModule,
    ButtonModule,
  ]
})
export class SecureModule {}
```

## secure-routing.module.ts
```typescript
/**
 * @author [Autor]
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '[prefix]',
        loadChildren: () =>
          import('projects/[org]/[prefix]-[domain]/src/lib/modules/[prefix]-main.module')
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

## layout.component.ts
```typescript
/**
 * @author [Autor]
 */
import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  public menuItems: MenuItem[] = [];
  public username: string = '';

  constructor(private _keycloak: KeycloakService) {}

  ngOnInit(): void {
    this.username = this._keycloak.getUsername();
    this._buildMenu();
  }

  public onLogout(): void {
    this._keycloak.logout(window.location.origin);
  }

  private _buildMenu(): void {
    this.menuItems = [
      { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/secure/[prefix]/dashboard' },
      // Agregar ítems según las features
    ];
  }
}
```

## layout.component.html
```html
<div class="layout-wrapper">
  <p-menubar [model]="menuItems">
    <ng-template pTemplate="end">
      <div class="flex align-items-center gap-2">
        <p-avatar [label]="username[0]" shape="circle" />
        <span class="text-sm">{{ username }}</span>
        <p-button
          icon="pi pi-sign-out"
          [text]="true"
          severity="secondary"
          (onClick)="onLogout()"
        />
      </div>
    </ng-template>
  </p-menubar>

  <main class="layout-content">
    <router-outlet></router-outlet>
  </main>
</div>
```

---

## Reglas
- `app.module.ts` hace el bootstrap y registra providers globales (Keycloak, NGXS, i18n)
- NGXS states se registran en `app.module.ts` con `NgxsModule.forRoot()` — una sola vez
- `public.module.ts` solo contiene la pantalla de login y rutas sin auth
- `secure.module.ts` importa `[Prefix]MainModule` de la librería — no importa features individuales
- El layout (menubar, sidebar) vive en `secure/components/layout/` — es parte de la app, no de la librería
- Hay **una sola librería** importada en `secure.module.ts` — ella agrupa todos los feature modules
- `BrowserAnimationsModule` solo en `app.module.ts` — nunca en módulos hijos
- Siempre poner `@author` en el JSDoc de cada archivo
