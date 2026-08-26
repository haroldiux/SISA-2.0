---
name: Frontend - Init-project: PASO 5: Módulo Secure (layout)
description: Rules and guidelines for PASO 5: Módulo Secure (layout) in the frontend project.
---

# PASO 5: Módulo Secure (layout)

> **Predecesor:** [04-module-public.md](./04-module-public.md)
> **Sucesor:** [06-environments.md](./06-environments.md)

Generar el módulo `secure` con el layout principal: barra de navegación, avatar de usuario y botón de logout.

---

## src/app/modules/secure/secure.module.ts

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

---

## src/app/modules/secure/secure-routing.module.ts

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

---

## src/app/modules/secure/components/layout/layout.component.ts

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

---

## src/app/modules/secure/components/layout/layout.component.html

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

---

## src/app/modules/secure/components/layout/layout.component.scss

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
