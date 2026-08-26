---
name: Frontend: /init-project:monorepo
description: Rules and guidelines for /init-project:monorepo in the frontend project.
---

# Skill: /init-project:monorepo

## Propósito
Inicializar un proyecto monorepo Angular completo con toda la estructura base, configuración de Keycloak, NGXS, PrimeNG, TailwindCSS y una librería interna con un módulo de bienvenida.

## Cuándo usar
- Al crear un proyecto Angular nuevo desde cero
- Cuando se necesita la estructura base completa con autenticación, estado y UI

## Cuándo NO usar
- Para agregar features a un proyecto existente (usar `/project:new-feature`)
- Para crear solo una librería (usar `/project:new-library`)

## Parámetros de entrada
```typescript
interface InitProjectParams {
  name: string;      // Nombre del proyecto (kebab-case)
  prefix: string;    // Prefijo 2-3 letras (ej: spp)
  domain: string;    // Dominio de la librería (ej: payment-pos)
  author?: string;   // Nombre del autor (opcional, default: "Developer")
  org?: string;      // Organización pnpm (opcional, default: "organization")
}
```

## Proceso de ejecución

### PASO 1: Crear estructura de carpetas
Ejecutar en orden:
```bash
# Raíz del proyecto
mkdir -p <name>/{src/{app/{modules/{public/{components/login,guards},secure/{components/layout,guards}},routes,services,http,bootstrap/core,integration},assets/{i18n,images},environments/properties/dev},projects/<prefix>-<domain>/src/lib/{modules/{<prefix>-welcome/{components/<prefix>-welcome,routes},<prefix>-shared},api/{constants,enums,models,response},bootstrap,builders,commands,http,services,store},docs}

# Archivos de configuración raíz
touch <name>/angular.json
touch <name>/package.json
touch <name>/tsconfig.json
touch <name>/tsconfig.app.json
touch <name>/tsconfig.spec.json
touch <name>/tailwind.config.js
touch <name>/postcss.config.js
touch <name>/.gitignore
touch <name>/README.md
touch <name>/CHANGELOG.md
touch <name>/ANTIGRAVITY.md
touch <name>/ANTIGRAVITY.local.md

# Archivos src/app
touch <name>/src/app/app.module.ts
touch <name>/src/app/app.component.ts
touch <name>/src/app/app.component.html
touch <name>/src/app/app.component.scss
touch <name>/src/app/routes/app-routing.module.ts
touch <name>/src/app/routes/app-routes.constant.ts
touch <name>/src/app/services/public-auth-guard.service.ts
touch <name>/src/app/services/secure-auth-guard.service.ts

# Módulo public
touch <name>/src/app/modules/public/public.module.ts
touch <name>/src/app/modules/public/public-routing.module.ts
touch <name>/src/app/modules/public/components/login/login.component.ts
touch <name>/src/app/modules/public/components/login/login.component.html
touch <name>/src/app/modules/public/components/login/login.component.scss

# Módulo secure
touch <name>/src/app/modules/secure/secure.module.ts
touch <name>/src/app/modules/secure/secure-routing.module.ts
touch <name>/src/app/modules/secure/components/layout/layout.component.ts
touch <name>/src/app/modules/secure/components/layout/layout.component.html
touch <name>/src/app/modules/secure/components/layout/layout.component.scss

# Environments
touch <name>/src/environments/environment.ts
touch <name>/src/environments/environment.prod.ts
touch <name>/src/environments/properties/dev/common.properties.ts
touch <name>/src/environments/properties/dev/<name>.properties.ts

# i18n
touch <name>/src/assets/i18n/es.json

# Styles
touch <name>/src/styles.scss

# Librería - Config
touch <name>/projects/<prefix>-<domain>/package.json
touch <name>/projects/<prefix>-<domain>/ng-package.json
touch <name>/projects/<prefix>-<domain>/tsconfig.lib.json
touch <name>/projects/<prefix>-<domain>/tsconfig.lib.prod.json
touch <name>/projects/<prefix>-<domain>/tsconfig.spec.json
touch <name>/projects/<prefix>-<domain>/public-api.ts

# Librería - Module raíz
touch <name>/projects/<prefix>-<domain>/src/public-api.ts
touch <name>/projects/<prefix>-<domain>/src/lib/<prefix>-<domain>.module.ts

# Librería - Módulos
touch <name>/projects/<prefix>-<domain>/src/lib/modules/<prefix>-main.module.ts
touch <name>/projects/<prefix>-<domain>/src/lib/modules/<prefix>-main.component.ts
touch <name>/projects/<prefix>-<domain>/src/lib/modules/<prefix>-main-routing.module.ts

# Librería - Welcome Module
touch <name>/projects/<prefix>-<domain>/src/lib/modules/<prefix>-welcome/<prefix>-welcome.module.ts
touch <name>/projects/<prefix>-<domain>/src/lib/modules/<prefix>-welcome/components/<prefix>-welcome/<prefix>-welcome.component.ts
touch <name>/projects/<prefix>-<domain>/src/lib/modules/<prefix>-welcome/components/<prefix>-welcome/<prefix>-welcome.component.html
touch <name>/projects/<prefix>-<domain>/src/lib/modules/<prefix>-welcome/components/<prefix>-welcome/<prefix>-welcome.component.scss
touch <name>/projects/<prefix>-<domain>/src/lib/modules/<prefix>-welcome/routes/<prefix>-welcome-routing.module.ts

# Librería - Shared Module
touch <name>/projects/<prefix>-<domain>/src/lib/modules/<prefix>-shared/<prefix>-shared.module.ts

# Librería - Assets
touch <name>/projects/<prefix>-<domain>/assets/<prefix>-<domain>-styles.scss
touch <name>/projects/<prefix>-<domain>/assets/styles/<prefix>-styles.scss
touch <name>/projects/<prefix>-<domain>/assets/styles/<prefix>-styles-components.scss
touch <name>/projects/<prefix>-<domain>/assets/styles/components/<prefix>-styles-components.scss
```

### PASO 2: Generar contenido de archivos

#### angular.json
```json
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "<name>": {
      "projectType": "application",
      "schematics": {
        "@schematics/angular:component": {
          "style": "scss",
          "changeDetection": "OnPush"
        },
        "@schematics/angular:application": {
          "strict": true
        }
      },
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "outputPath": "dist/<name>",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json",
            "inlineStyleLanguage": "scss",
            "assets": [
              "src/favicon.ico",
              "src/assets"
            ],
            "styles": [
              "src/styles.scss"
            ],
            "scripts": [],
            "allowedCommonJsDependencies": [
              "keycloak-js"
            ]
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kb",
                  "maximumError": "1mb"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "2kb",
                  "maximumError": "4kb"
                }
              ],
              "outputHashing": "all"
            },
            "development": {
              "buildOptimizer": false,
              "optimization": false,
              "vendorChunk": true,
              "extractLicenses": false,
              "sourceMap": true,
              "namedChunks": true
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "configurations": {
            "production": {
              "buildTarget": "<name>:build:production"
            },
            "development": {
              "buildTarget": "<name>:build:development"
            }
          },
          "defaultConfiguration": "development",
          "options": {
            "port": 4200
          }
        },
        "extract-i18n": {
          "builder": "@angular-devkit/build-angular:extract-i18n",
          "options": {
            "buildTarget": "<name>:build"
          }
        },
        "test": {
          "builder": "@angular-devkit/build-angular:karma",
          "options": {
            "polyfills": ["zone.js", "zone.js/testing"],
            "tsConfig": "tsconfig.spec.json",
            "inlineStyleLanguage": "scss",
            "assets": [
              "src/favicon.ico",
              "src/assets"
            ],
            "styles": [
              "src/styles.scss"
            ],
            "scripts": []
          }
        }
      }
    },
    "<prefix>-<domain>": {
      "projectType": "library",
      "schematics": {
        "@schematics/angular:component": {
          "style": "scss",
          "changeDetection": "OnPush"
        }
      },
      "root": "projects/<prefix>-<domain>",
      "sourceRoot": "projects/<prefix>-<domain>/src",
      "prefix": "<prefix>",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:ng-packagr",
          "options": {
            "project": "projects/<prefix>-<domain>/ng-package.json"
          },
          "configurations": {
            "production": {
              "tsConfig": "projects/<prefix>-<domain>/tsconfig.lib.prod.json"
            },
            "development": {
              "tsConfig": "projects/<prefix>-<domain>/tsconfig.lib.json"
            }
          },
          "defaultConfiguration": "production"
        },
        "test": {
          "builder": "@angular-devkit/build-angular:karma",
          "options": {
            "tsConfig": "projects/<prefix>-<domain>/tsconfig.spec.json",
            "polyfills": [
              "zone.js",
              "zone.js/testing"
            ]
          }
        }
      }
    }
  },
  "defaultProject": "<name>"
}
```

#### package.json (raíz)
```json
{
  "name": "<name>",
  "version": "0.1.0",
  "description": "Angular monorepo project with <Prefix> library",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "lint": "ng lint",
    "<prefix>-<domain>": "pnpm run <prefix>-<domain>:package && pnpm run <prefix>-<domain>:publish",
    "<prefix>-<domain>:package": "ng build <prefix>-<domain> --configuration production",
    "<prefix>-<domain>:publish": "pnpm publish ./dist/<prefix>-<domain>",
    "<prefix>-<domain>:pack-local": "cd dist/<prefix>-<domain> && pnpm pack"
  },
  "private": true,
  "dependencies": {
    "@angular/animations": "^15.2.0",
    "@angular/common": "^15.2.0",
    "@angular/compiler": "^15.2.0",
    "@angular/core": "^15.2.0",
    "@angular/forms": "^15.2.0",
    "@angular/platform-browser": "^15.2.0",
    "@angular/platform-browser-dynamic": "^15.2.0",
    "@angular/router": "^15.2.0",
    "@ngx-translate/core": "^14.0.0",
    "@ngx-translate/http-loader": "^7.0.0",
    "@ngxs/store": "^3.8.1",
    "@ngxs/devtools-plugin": "^3.8.1",
    "@ngxs/logger-plugin": "^3.8.1",
    "keycloak-angular": "^15.0.0",
    "keycloak-js": "^22.0.0",
    "primeng": "^15.4.0",
    "primeicons": "^6.0.1",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.12.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^15.2.0",
    "@angular/cli": "~15.2.0",
    "@angular/compiler-cli": "^15.2.0",
    "@types/jasmine": "~4.3.0",
    "@types/node": "^18.15.0",
    "jasmine-core": "~4.5.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.1.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.0.0",
    "ng-packagr": "^15.2.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "tailwindcss-primeui": "^0.3.0",
    "typescript": "~4.9.0"
  }
}
```

#### tsconfig.json
```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "target": "ES2022",
    "module": "es2020",
    "lib": [
      "es2020",
      "dom"
    ],
    "useDefineForClassFields": false,
    "paths": {
      "<prefix>-<domain>": [
        "dist/<prefix>-<domain>/<prefix>-<domain>",
        "dist/<prefix>-<domain>"
      ],
      "<prefix>-<domain>/*": [
        "dist/<prefix>-<domain>/<prefix>-<domain>/*",
        "dist/<prefix>-<domain>/*"
      ]
    }
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

#### tsconfig.app.json
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
  },
  "files": [
    "src/main.ts"
  ],
  "include": [
    "src/**/*.d.ts"
  ]
}
```

#### tsconfig.spec.json
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": [
      "jasmine"
    ]
  },
  "include": [
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
```

#### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
    './projects/**/*.{html,ts}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwindcss-primeui'),
  ],
};
```

#### postcss.config.js
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

#### .gitignore
```
# See http://help.github.com/ignore-files/ for more about ignoring files.

# Compiled output
/dist
/tmp
/out-tsc
/bazel-out

# Node
/node_modules
pnpm-debug.log
yarn-error.log

# IDEs and editors
.idea/
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# Visual Studio Code
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.history/*

# Miscellaneous
/.angular/cache
.sass-cache/
/connect.lock
/coverage
/libpeerconnection.log
testem.log
/typings

# System files
.DS_Store
Thumbs.db

# Environment
ANTIGRAVITY.local.md
*.tgz
```

#### README.md
```markdown
# <Name>

Angular monorepo project with <Prefix> library.

## Development server

Run `pnpm start` for a dev server. Navigate to `http://localhost:4200/`.

## Build

Run `pnpm run build` to build the project.

## Build Library

Run `pnpm run <prefix>-<domain>:package` to build the library.

## Publish Library

Run `pnpm run <prefix>-<domain>` to build and publish the library.

## Project Structure

- `src/` - Main application
- `projects/<prefix>-<domain>/` - Library
- `docs/` - Documentation
```

#### CHANGELOG.md
```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - YYYY-MM-DD

### Added
- Initial project setup
- Angular monorepo structure
- Keycloak authentication
- NGXS state management
- PrimeNG + TailwindCSS UI
- Welcome module in library
```

### PASO 3: Generar archivos de la aplicación principal

#### src/main.ts
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

#### src/index.html
```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title><Name></title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

#### src/app/app.module.ts
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

#### src/app/app.component.ts
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

#### src/app/routes/app-routing.module.ts
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

#### src/app/routes/app-routes.constant.ts
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

#### src/app/services/public-auth-guard.service.ts
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

#### src/app/services/secure-auth-guard.service.ts
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

### PASO 4: Generar módulo Public (login)

#### src/app/modules/public/public.module.ts
```typescript
/**
 * @author <Author>
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { PublicRoutingModule } from './public-routing.module';
import { LoginComponent } from './components/login/login.component';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    PublicRoutingModule,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
  ],
})
export class PublicModule {}
```

#### src/app/modules/public/public-routing.module.ts
```typescript
/**
 * @author <Author>
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicAuthGuardService } from '../../services/public-auth-guard.service';
import { LoginComponent } from './components/login/login.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    canActivate: [PublicAuthGuardService],
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicRoutingModule {}
```

#### src/app/modules/public/components/login/login.component.ts
```typescript
/**
 * @author <Author>
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  public loading = false;

  constructor(private _keycloak: KeycloakService) {}

  public onLogin(): void {
    this._keycloak.login();
  }
}
```

#### src/app/modules/public/components/login/login.component.html
```html
<div class="login-container flex items-center justify-center min-h-screen bg-surface-100">
  <p-card styleClass="w-full max-w-md">
    <ng-template pTemplate="header">
      <div class="text-center p-4">
        <h1 class="text-2xl font-bold text-primary-500">{{ 'LOGIN.TITLE' | translate }}</h1>
        <p class="text-surface-500">{{ 'LOGIN.SUBTITLE' | translate }}</p>
      </div>
    </ng-template>

    <div class="flex flex-col items-center gap-4 p-4">
      <p-button
        [label]="'LOGIN.BUTTON' | translate"
        icon="pi pi-sign-in"
        (onClick)="onLogin()"
        styleClass="w-full"
        [loading]="loading">
      </p-button>
    </div>
  </p-card>
</div>
```

#### src/app/modules/public/components/login/login.component.scss
```scss
.login-container {
  background: linear-gradient(135deg, var(--surface-100) 0%, var(--surface-200) 100%);
}
```

### PASO 5: Generar módulo Secure (layout)

#### src/app/modules/secure/secure.module.ts
```typescript
/**
 * @author <Author>
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { SecureRoutingModule } from './secure-routing.module';
import { LayoutComponent } from './components/layout/layout.component';

import { <Prefix>MainModule } from '../../../../projects/<prefix>-<domain>/src/lib/modules/<prefix>-main.module';

import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [LayoutComponent],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    SecureRoutingModule,
    <Prefix>MainModule,
    MenubarModule,
    ButtonModule,
    AvatarModule,
    TooltipModule,
  ],
})
export class SecureModule {}
```

#### src/app/modules/secure/secure-routing.module.ts
```typescript
/**
 * @author <Author>
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecureAuthGuardService } from '../../services/secure-auth-guard.service';
import { LayoutComponent } from './components/layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [SecureAuthGuardService],
    children: [
      {
        path: '<prefix>',
        loadChildren: () =>
          import('../../../../projects/<prefix>-<domain>/src/lib/modules/<prefix>-main.module').then(
            (m) => m.<Prefix>MainModule
          ),
      },
      { path: '', redirectTo: '<prefix>', pathMatch: 'full' },
      { path: '**', redirectTo: '<prefix>', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecureRoutingModule {}
```

#### src/app/modules/secure/components/layout/layout.component.ts
```typescript
/**
 * @author <Author>
 */
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent implements OnInit {
  public menuItems: MenuItem[] = [];
  public username = '';

  constructor(private _keycloak: KeycloakService) {}

  public ngOnInit(): void {
    this.username = this._keycloak.getUsername() || 'Usuario';
    this._buildMenu();
  }

  public onLogout(): void {
    this._keycloak.logout(window.location.origin);
  }

  private _buildMenu(): void {
    this.menuItems = [
      {
        label: 'Inicio',
        icon: 'pi pi-home',
        routerLink: ['/secure/<prefix>'],
      },
      {
        label: 'Welcome',
        icon: 'pi pi-star',
        routerLink: ['/secure/<prefix>/welcome'],
      },
    ];
  }
}
```

#### src/app/modules/secure/components/layout/layout.component.html
```html
<div class="layout-wrapper">
  <p-menubar [model]="menuItems" styleClass="shadow-1">
    <ng-template pTemplate="end">
      <div class="flex align-items-center gap-3">
        <div class="flex align-items-center gap-2">
          <p-avatar [label]="username.charAt(0) | uppercase" shape="circle" styleClass="bg-primary-500 text-white"></p-avatar>
          <span class="text-sm font-medium">{{ username }}</span>
        </div>
        <p-button
          icon="pi pi-sign-out"
          [text]="true"
          severity="secondary"
          (onClick)="onLogout()"
          pTooltip="Cerrar sesión"
          tooltipPosition="bottom">
        </p-button>
      </div>
    </ng-template>
  </p-menubar>

  <main class="layout-content p-4">
    <router-outlet></router-outlet>
  </main>
</div>
```

#### src/app/modules/secure/components/layout/layout.component.scss
```scss
.layout-wrapper {
  min-height: 100vh;
  background-color: var(--surface-100);
}

.layout-content {
  max-width: 1400px;
  margin: 0 auto;
}
```

### PASO 6: Generar archivos de environment

#### src/environments/environment.ts
```typescript
/**
 * @author <Author>
 */
export const environment = {
  production: false,
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'master',
    clientId: '<name>-client',
  },
};
```

#### src/environments/environment.prod.ts
```typescript
/**
 * @author <Author>
 */
export const environment = {
  production: true,
  keycloak: {
    url: 'https://keycloak.example.com',
    realm: 'production',
    clientId: '<name>-client',
  },
};
```

### PASO 7: Generar archivos de i18n y estilos

#### src/assets/i18n/es.json
```json
{
  "LOGIN": {
    "TITLE": "Bienvenido",
    "SUBTITLE": "Sistema de <Name>",
    "BUTTON": "Iniciar sesión"
  },
  "WELCOME": {
    "TITLE": "¡BIENVENIDO!",
    "SUBTITLE": "Ahora crea tus módulos o componentes y dale funcionalidad a tu aplicación",
    "MESSAGE": "Usa el comando /project:new-feature para generar nuevas features"
  }
}
```

#### src/styles.scss
```scss
// Tailwind CSS
@tailwind base;
@tailwind components;
@tailwind utilities;

// PrimeNG Icons
@import 'primeicons/primeicons.css';

// Librería styles
@import 'projects/<prefix>-<domain>/assets/<prefix>-<domain>-styles';

// Global styles
html {
  font-family: var(--font-family);
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--surface-ground);
}
```

### PASO 8: Generar librería

#### projects/<prefix>-<domain>/package.json
```json
{
  "name": "@<org>/<prefix>-<domain>",
  "version": "0.1.0",
  "description": "<Prefix> library for <Name>",
  "publishConfig": {
    "registry": "https://registry.npmjs.org/"
  },
  "peerDependencies": {
    "@angular/common": "^15.0.0",
    "@angular/core": "^15.0.0"
  },
  "dependencies": {
    "tslib": "^2.3.0"
  },
  "sideEffects": false,
  "private": false
}
```

#### projects/<prefix>-<domain>/ng-package.json
```json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "dest": "../../dist/<prefix>-<domain>",
  "lib": {
    "entryFile": "src/public-api.ts"
  }
}
```

#### projects/<prefix>-<domain>/tsconfig.lib.json
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "../../out-tsc/lib",
    "declaration": true,
    "declarationMap": true,
    "inlineSources": true,
    "types": []
  },
  "exclude": [
    "src/**/*.spec.ts"
  ]
}
```

#### projects/<prefix>-<domain>/tsconfig.lib.prod.json
```json
{
  "extends": "./tsconfig.lib.json",
  "compilerOptions": {
    "declarationMap": false
  },
  "angularCompilerOptions": {
    "compilationMode": "partial"
  }
}
```

#### projects/<prefix>-<domain>/tsconfig.spec.json
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "../../out-tsc/spec",
    "types": [
      "jasmine"
    ]
  },
  "include": [
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
```

#### projects/<prefix>-<domain>/public-api.ts
```typescript
/**
 * Public API Surface of <prefix>-<domain>
 * @author <Author>
 */

export * from './src/lib/<prefix>-<domain>.module';
export * from './src/lib/modules/<prefix>-main.module';
export * from './src/lib/modules/<prefix>-main.component';
```

#### projects/<prefix>-<domain>/src/public-api.ts
```typescript
/**
 * Public API Surface of <prefix>-<domain>
 * @author <Author>
 */
export * from './lib/public-api';
```

#### projects/<prefix>-<domain>/src/lib/<prefix>-<domain>.module.ts
```typescript
/**
 * @author <Author>
 */
import { NgModule } from '@angular/core';
import { <Prefix>MainModule } from './modules/<prefix>-main.module';

@NgModule({
  imports: [<Prefix>MainModule],
  exports: [<Prefix>MainModule],
})
export class <Prefix><Domain>Module {}
```

### PASO 9: Generar módulos de la librería

#### projects/<prefix>-<domain>/src/lib/modules/<prefix>-main.module.ts
```typescript
/**
 * @author <Author>
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogService } from 'primeng/dynamicdialog';

import { <Prefix>MainComponent } from './<prefix>-main.component';
import { <Prefix>MainRoutingModule } from './<prefix>-main-routing.module';
import { <Prefix>WelcomeModule } from './<prefix>-welcome/<prefix>-welcome.module';
import { <Prefix>SharedModule } from './<prefix>-shared/<prefix>-shared.module';

@NgModule({
  declarations: [<Prefix>MainComponent],
  imports: [
    CommonModule,
    RouterModule,
    <Prefix>MainRoutingModule,
    <Prefix>WelcomeModule,
    <Prefix>SharedModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [
    ConfirmationService,
    DialogService,
    MessageService,
  ],
})
export class <Prefix>MainModule {}
```

#### projects/<prefix>-<domain>/src/lib/modules/<prefix>-main.component.ts
```typescript
/**
 * @author <Author>
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: '<prefix>-main',
  template: '<router-outlet></router-outlet>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class <Prefix>MainComponent {}
```

#### projects/<prefix>-<domain>/src/lib/modules/<prefix>-main-routing.module.ts
```typescript
/**
 * @author <Author>
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { <Prefix>MainComponent } from './<prefix>-main.component';

const routes: Routes = [
  {
    path: '',
    component: <Prefix>MainComponent,
  },
  {
    path: 'welcome',
    loadChildren: () =>
      import('./<prefix>-welcome/routes/<prefix>-welcome-routing.module').then(
        (m) => m.<Prefix>WelcomeRoutingModule
      ),
  },
  { path: '**', redirectTo: 'welcome', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class <Prefix>MainRoutingModule {}
```

#### projects/<prefix>-<domain>/src/lib/modules/<prefix>-shared/<prefix>-shared.module.ts
```typescript
/**
 * @author <Author>
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  exports: [],
})
export class <Prefix>SharedModule {}
```

### PASO 10: Generar módulo Welcome

#### projects/<prefix>-<domain>/src/lib/modules/<prefix>-welcome/<prefix>-welcome.module.ts
```typescript
/**
 * @author <Author>
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { <Prefix>WelcomeRoutingModule } from './routes/<prefix>-welcome-routing.module';
import { <Prefix>WelcomeComponent } from './components/<prefix>-welcome/<prefix>-welcome.component';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@NgModule({
  declarations: [<Prefix>WelcomeComponent],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    <Prefix>WelcomeRoutingModule,
    CardModule,
    ButtonModule,
  ],
  exports: [<Prefix>WelcomeComponent],
})
export class <Prefix>WelcomeModule {}
```

#### projects/<prefix>-<domain>/src/lib/modules/<prefix>-welcome/routes/<prefix>-welcome-routing.module.ts
```typescript
/**
 * @author <Author>
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { <Prefix>WelcomeComponent } from '../components/<prefix>-welcome/<prefix>-welcome.component';

const routes: Routes = [
  {
    path: '',
    component: <Prefix>WelcomeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class <Prefix>WelcomeRoutingModule {}
```

#### projects/<prefix>-<domain>/src/lib/modules/<prefix>-welcome/components/<prefix>-welcome/<prefix>-welcome.component.ts
```typescript
/**
 * @author <Author>
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: '<prefix>-welcome',
  templateUrl: './<prefix>-welcome.component.html',
  styleUrls: ['./<prefix>-welcome.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class <Prefix>WelcomeComponent {
  public title = '¡BIENVENIDO!';
  public subtitle = 'Ahora crea tus módulos o componentes y dale funcionalidad a tu aplicación';
  public message = 'Usa el comando /project:new-feature para generar nuevas features';

  public nextSteps = [
    'Usa /project:new-feature para crear nuevas features',
    'Configura Keycloak en environments/environment.ts',
    'Agrega módulos a la librería según necesites',
  ];
}
```

#### projects/<prefix>-<domain>/src/lib/modules/<prefix>-welcome/components/<prefix>-welcome/<prefix>-welcome.component.html
```html
<div class="<prefix>-welcome-container flex flex-col items-center justify-center min-h-[60vh] p-4">
  <p-card styleClass="w-full max-w-2xl">
    <ng-template pTemplate="header">
      <div class="flex flex-col items-center justify-center pt-8 pb-4">
        <div class="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-4 shadow-4">
          <i class="pi pi-check-circle text-5xl text-white"></i>
        </div>
        <h1 class="text-4xl font-bold text-primary-500 mb-2">{{ title }}</h1>
        <p class="text-xl text-surface-600 text-center px-4">{{ subtitle }}</p>
      </div>
    </ng-template>

    <div class="p-4">
      <div class="bg-surface-100 rounded-xl p-6 mb-6">
        <div class="flex items-center gap-2 mb-4">
          <i class="pi pi-info-circle text-primary-500 text-xl"></i>
          <span class="font-semibold text-lg">Próximos pasos:</span>
        </div>

        <ul class="space-y-3">
          <li *ngFor="let step of nextSteps; trackBy: trackByIndex" class="flex items-start gap-3">
            <div class="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-medium">
              {{ $index + 1 }}
            </div>
            <code class="text-surface-700 text-sm bg-surface-200 px-2 py-1 rounded">{{ step }}</code>
          </li>
        </ul>
      </div>

      <div class="flex justify-center">
        <p-button
          label="Empezar"
          icon="pi pi-arrow-right"
          iconPos="right"
          styleClass="p-button-lg">
        </p-button>
      </div>
    </div>

    <ng-template pTemplate="footer">
      <div class="text-center pb-4">
        <p class="text-sm text-surface-400">{{ message }}</p>
      </div>
    </ng-template>
  </p-card>
</div>
```

#### projects/<prefix>-<domain>/src/lib/modules/<prefix>-welcome/components/<prefix>-welcome/<prefix>-welcome.component.scss
```scss
.<prefix>-welcome-container {
  background: linear-gradient(135deg, var(--surface-100) 0%, var(--surface-200) 100%);
}
```

### PASO 11: Generar archivos de assets de la librería

#### projects/<prefix>-<domain>/assets/<prefix>-<domain>-styles.scss
```scss
/**
 * Main entry point for <Prefix> styles
 * @author <Author>
 */

@import 'styles/<prefix>-styles';
```

#### projects/<prefix>-<domain>/assets/styles/<prefix>-styles.scss
```scss
/**
 * <Prefix> styles
 * @author <Author>
 */

@import '<prefix>-styles-components';
```

#### projects/<prefix>-<domain>/assets/styles/<prefix>-styles-components.scss
```scss
/**
 * <Prefix> component styles
 * @author <Author>
 */

@import 'components/<prefix>-styles-components';
```

#### projects/<prefix>-<domain>/assets/styles/components/<prefix>-styles-components.scss
```scss
/**
 * <Prefix> component styles aggregator
 * @author <Author>
 */

// Import component styles from resources/
// @import 'resources/<prefix>-welcome.component';
```

## Post-ejecución

Después de generar todos los archivos:

1. **Instalar dependencias**:
   ```bash
   cd <name> && pnpm install
   ```

2. **Configurar Keycloak** en `src/environments/environment.ts`:
   ```typescript
   keycloak: {
     url: 'https://tu-keycloak-server',
     realm: 'tu-realm',
     clientId: 'tu-client-id'
   }
   ```

3. **Iniciar desarrollo**:
   ```bash
   pnpm start
   ```

4. **Verificar** que el proyecto compila sin errores

5. **Crear nuevas features** con:
   ```
   /project:new-feature
   ```

## Notas importantes

- El comando debe ejecutarse con los parámetros: `--name`, `--prefix`, `--domain`
- Opcionalmente: `--author` y `--org`
- Todos los archivos se generan con contenido real y funcional
- La estructura sigue las convenciones del proyecto `sea-payment-pos-ui`
- El módulo Welcome muestra el mensaje "BIENVENIDO" y pasos a seguir
- No se generan servicios HTTP ni comandos - usar `/project:new-feature`
- El prefijo `<prefix>` se reemplaza por el valor proporcionado (ej: spp)
- El nombre `<Name>` se reemplaza por el valor capitalizado
- El autor `<Author>` se reemplaza por el valor proporcionado o "Developer"
