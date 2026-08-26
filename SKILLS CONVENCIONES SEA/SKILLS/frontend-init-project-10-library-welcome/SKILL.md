---
name: Frontend - Init-project: PASO 10: Módulo Welcome de la librería
description: Rules and guidelines for PASO 10: Módulo Welcome de la librería in the frontend project.
---

# PASO 10: Módulo Welcome de la librería

> **Predecesor:** [09-library-modules.md](./09-library-modules.md)
> **Sucesor:** [11-library-assets.md](./11-library-assets.md)

Generar el módulo `<prefix>-welcome` con su componente, routing y estilos. Es la pantalla de bienvenida que el usuario ve al ingresar por primera vez.

---

## projects/\<prefix\>-\<domain\>/src/lib/modules/\<prefix\>-welcome/\<prefix\>-welcome.module.ts

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

---

## projects/\<prefix\>-\<domain\>/src/lib/modules/\<prefix\>-welcome/routes/\<prefix\>-welcome-routing.module.ts

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

---

## projects/\<prefix\>-\<domain\>/src/lib/modules/\<prefix\>-welcome/components/\<prefix\>-welcome/\<prefix\>-welcome.component.ts

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

---

## projects/\<prefix\>-\<domain\>/src/lib/modules/\<prefix\>-welcome/components/\<prefix\>-welcome/\<prefix\>-welcome.component.html

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

---

## projects/\<prefix\>-\<domain\>/src/lib/modules/\<prefix\>-welcome/components/\<prefix\>-welcome/\<prefix\>-welcome.component.scss

```scss
.<prefix>-welcome-container {
  background: linear-gradient(135deg, var(--surface-100) 0%, var(--surface-200) 100%);
}
```
