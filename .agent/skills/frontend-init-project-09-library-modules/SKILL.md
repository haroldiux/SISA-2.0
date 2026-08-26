---
name: Frontend - Init-project: PASO 9: Módulos de la librería — Main y Shared
description: Rules and guidelines for PASO 9: Módulos de la librería — Main y Shared in the frontend project.
---

# PASO 9: Módulos de la librería — Main y Shared

> **Predecesor:** [08-library-config.md](./08-library-config.md)
> **Sucesor:** [10-library-welcome.md](./10-library-welcome.md)

Generar el módulo raíz de la librería (`<prefix>-main`) y el módulo compartido (`<prefix>-shared`).

---

## projects/\<prefix\>-\<domain\>/src/lib/modules/\<prefix\>-main.module.ts

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

---

## projects/\<prefix\>-\<domain\>/src/lib/modules/\<prefix\>-main.component.ts

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

---

## projects/\<prefix\>-\<domain\>/src/lib/modules/\<prefix\>-main-routing.module.ts

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

---

## projects/\<prefix\>-\<domain\>/src/lib/modules/\<prefix\>-shared/\<prefix\>-shared.module.ts

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
