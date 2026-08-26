---
name: Frontend - Init-project: PASO 4: Módulo Public (login)
description: Rules and guidelines for PASO 4: Módulo Public (login) in the frontend project.
---

# PASO 4: Módulo Public (login)

> **Predecesor:** [03-app-core.md](./03-app-core.md)
> **Sucesor:** [05-module-secure.md](./05-module-secure.md)

Generar el módulo `public` que contiene la pantalla de login delegada a Keycloak.

---

## src/app/modules/public/public.module.ts

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

---

## src/app/modules/public/public-routing.module.ts

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

---

## src/app/modules/public/components/login/login.component.ts

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

---

## src/app/modules/public/components/login/login.component.html

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

---

## src/app/modules/public/components/login/login.component.scss

```scss
.login-container {
  background: linear-gradient(135deg, var(--surface-100) 0%, var(--surface-200) 100%);
}
```
