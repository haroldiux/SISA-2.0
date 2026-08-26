---
name: Frontend - Development-modules: Library Modules Development
description: Rules and guidelines for Library Modules Development in the frontend project.
---

# Skill: Library Modules Development

## Estructura de módulos dentro de la librería
```
lib/modules/
├── [prefix]-main.module.ts          # Módulo raíz de la librería
├── [prefix]-main.component.ts       # Componente shell de la librería
├── [prefix]-main-routing.module.ts  # Routing raíz (forChild)
├── [prefix]-shared/                 # Módulo compartido interno
│   ├── components/                  # Componentes reutilizables internos
│   ├── directives/                  # Directivas y pipes compartidos
│   └── [prefix]-shared.module.ts
├── [prefix]-dashboard/              # Módulo dashboard (siempre presente)
│   ├── components/[prefix]-dashboard/
│   ├── routes/
│   │   ├── [prefix]-dashboard-routes.constant.ts
│   │   └── [prefix]-dashboard-routing.module.ts
│   ├── services/
│   ├── models/
│   ├── spp-http-provider.constant.ts                     # Re-exporta todo el módulo
│   └── [prefix]-dashboard.module.ts
└── [prefix]-[feature]/              # Módulo por dominio/feature
    ├── components/
    │   └── [prefix]-[entity]/
    │       ├── [prefix]-[entity].component.ts
    │       ├── [prefix]-[entity].component.html
    │       └── [prefix]-[entity].component.scss
    ├── routes/
    │   └── [prefix]-[feature]-routing.module.ts
    └── [prefix]-[feature].module.ts
```

## public-api.ts de modules
```typescript
/**
 * @author [Autor]
 */
export { [Prefix]MainModule } from './[prefix]-main.module';
export { [Prefix]MainComponent } from './[prefix]-main.component';
```

## spp-http-provider.constant.ts de modules (barrel interno)
```typescript
/**
 * Modules index - exports all module public APIs
 */
export * from './[prefix]-dashboard';
export * from './[prefix]-[feature-a]/[prefix]-[feature-a].module';
export * from './[prefix]-[feature-b]/[prefix]-[feature-b].module';
export * from './[prefix]-shared/[prefix]-shared.module';
```

## [prefix]-main.module.ts
```typescript
/**
 * @author [Autor]
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenubarModule } from 'primeng/menubar';
import { ToastModule } from 'primeng/toast';
import { DialogService } from 'primeng/dynamicdialog';
import { DialogConfig } from '@angular/cdk/dialog';
import { SeaPermissionRoleModule } from '@unitepc/sea-commons';

import { [Prefix]MainComponent } from './[prefix]-main.component';
import { [Prefix]MainRoutingModule } from './[prefix]-main-routing.module';
import { [Prefix]DashboardModule } from './[prefix]-dashboard';
import { [Prefix][FeatureA]Module } from './[prefix]-[feature-a]/[prefix]-[feature-a].module';
import { [Prefix][FeatureB]Module } from './[prefix]-[feature-b]/[prefix]-[feature-b].module';

@NgModule({
  declarations: [[Prefix]MainComponent],
  imports: [
    CommonModule,
    [Prefix]MainRoutingModule,

    // Feature modules
    [Prefix]DashboardModule,
    [Prefix][FeatureA]Module,
    [Prefix][FeatureB]Module,

    // PrimeNG — solo los usados en main (layout, toast, confirm)
    ButtonModule,
    MenubarModule,
    ToastModule,
    ConfirmDialogModule,

    // Permisos
    SeaPermissionRoleModule,
  ],
  providers: [
    ConfirmationService,
    DialogService,
    MessageService,
    DialogConfig,
  ]
})
export class [Prefix]MainModule {}
```

## [prefix]-main-routing.module.ts
```typescript
/**
 * @author [Autor]
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { [Prefix]MainComponent } from './[prefix]-main.component';
import { [Prefix]PermissionGuard } from '../services/[prefix]-permission.guard';
import { [PREFIX]_ROUTE_PERMISSIONS } from '../integration/configs/constants/[prefix]-permission.constant';

// Componentes de ruta directa (no lazy)
import { [Prefix][Entity]Component } from './[prefix]-[feature]/components/[prefix]-[entity]/[prefix]-[entity].component';

const routes: Routes = [
  // Shell de la librería
  { path: '', component: [Prefix]MainComponent },

  // Rutas directas (componentes simples)
  {
    path: '[entity-route]',
    canActivate: [[Prefix]PermissionGuard],
    data: { permissions: [PREFIX]_ROUTE_PERMISSIONS['[entity-route]'] },
    component: [Prefix][Entity]Component
  },

  // Rutas lazy (sub-módulos con más rutas internas)
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

## [prefix]-[feature].module.ts (módulo de feature)
```typescript
/**
 * @author [Autor]
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SeaPermissionRoleModule } from '@unitepc/sea-commons';

// PrimeNG — importar solo los necesarios para esta feature
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';

import { [Prefix]SharedModule } from '../[prefix]-shared/[prefix]-shared.module';
import { [Prefix][Feature]RoutingModule } from './routes/[prefix]-[feature]-routing.module';

// Componentes de la feature
import { [Prefix][EntityA]Component } from './components/[prefix]-[entity-a]/[prefix]-[entity-a].component';
import { [Prefix][EntityB]Component } from './components/[prefix]-[entity-b]/[prefix]-[entity-b].component';

@NgModule({
  declarations: [
    [Prefix][EntityA]Component,
    [Prefix][EntityB]Component,
  ],
  exports: [
    // Solo exportar componentes que otros módulos necesiten
    // La mayoría no necesita exportarse
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    SeaPermissionRoleModule,
    [Prefix]SharedModule,
    [Prefix][Feature]RoutingModule,

    // PrimeNG
    ButtonModule,
    TableModule,
    InputTextModule,
    DropdownModule,
    ConfirmDialogModule,
    TagModule,
    ToolbarModule,
  ]
})
export class [Prefix][Feature]Module {}
```

## [prefix]-[feature]-routing.module.ts (routing de feature)
```typescript
/**
 * @author [Autor]
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Las rutas de feature generalmente están vacías aquí
// Las rutas reales van en [prefix]-main-routing.module.ts
const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class [Prefix][Feature]RoutingModule {}
```

## [prefix]-dashboard.module.ts
```typescript
/**
 * @author [Autor]
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { [Prefix]DashboardComponent } from './components/[prefix]-dashboard/[prefix]-dashboard.component';
import { [Prefix]DashboardRoutingModule } from './routes/[prefix]-dashboard-routing.module';

@NgModule({
  declarations: [[Prefix]DashboardComponent],
  imports: [
    CommonModule,
    [Prefix]DashboardRoutingModule,
    CardModule,
    ChartModule,
    TableModule,
    TagModule,
    SkeletonModule,
    ButtonModule,
    TooltipModule,
  ],
  exports: [[Prefix]DashboardComponent]
})
export class [Prefix]DashboardModule {}
```

## [prefix]-dashboard routing
```typescript
// routes/[prefix]-dashboard-routes.constant.ts
export const [PREFIX]_DASHBOARD_ROUTES: Routes = [{
  path: '',
  component: [Prefix]DashboardComponent,
  children: []
}];

// routes/[prefix]-dashboard-routing.module.ts
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([PREFIX]_DASHBOARD_ROUTES)
  ],
  exports: [RouterModule]
})
export class [Prefix]DashboardRoutingModule {}
```

## [prefix]-shared.module.ts
```typescript
/**
 * @author [Autor]
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { [Prefix]ShowEnumValueDirective } from './directives/[prefix]-show-enum-value.directive';
import { [Prefix]ShowEnumValuePipe } from './directives/[prefix]-show-enum-value.pipe';
import { [Prefix]CustomAccordionModule } from './components/[prefix]-custom-accordion/[prefix]-custom-accordion.module';

@NgModule({
  declarations: [
    [Prefix]ShowEnumValueDirective,
    [Prefix]ShowEnumValuePipe,
  ],
  exports: [
    [Prefix]ShowEnumValueDirective,
    [Prefix]ShowEnumValuePipe,
    [Prefix]CustomAccordionModule,
  ],
  imports: [
    CommonModule,
    [Prefix]CustomAccordionModule,
  ]
})
export class [Prefix]SharedModule {}
```

## dashboard/spp-http-provider.constant.ts
```typescript
/**
 * Dashboard module index - exports all public APIs
 */
export * from './[prefix]-dashboard.module';
export * from './components/[prefix]-dashboard/[prefix]-dashboard.component';
export * from './services/[prefix]-dashboard.service';
export * from './models/[prefix]-dashboard.models';
```

## Reglas
- `[prefix]-main.module.ts` importa todos los feature modules — es el punto de entrada
- `[prefix]-main-routing.module.ts` define TODAS las rutas navegables de la librería
- Los feature routing modules (`[prefix]-[feature]-routing.module.ts`) quedan vacíos — solo declaran `forChild([])`
- Las rutas simples (un solo componente) van directas con `component:`
- Las rutas complejas (con sub-rutas internas) van con `loadChildren:` apuntando a un sub-módulo
- `[prefix]-shared.module.ts` contiene solo directivas, pipes y componentes custom reutilizables — nunca PrimeNG
- `ConfirmationService`, `MessageService`, `DialogService` se proveen en `[prefix]-main.module.ts` — no en cada feature
- Siempre poner `@author` en el JSDoc de cada archivo
