---
name: Frontend - Ui: PrimeNG + TailwindCSS PrimeUI
description: Rules and guidelines for PrimeNG + TailwindCSS PrimeUI in the frontend project.
---

# Skill: PrimeNG + TailwindCSS PrimeUI

## Setup en nuevo proyecto
```bash
pnpm install primeng @primeng/themes
pnpm install tailwindcss @tailwindcss/postcss postcss autoprefixer
pnpm install tailwindcss-primeui
```

## tailwind.config.js
```javascript
module.exports = {
  content: ['./src/**/*.{html,ts}', './projects/**/*.{html,ts}'],
  plugins: [require('tailwindcss-primeui')],
};
```

## styles.scss principal
```scss
@import "tailwindcss";
@import "tailwindcss-primeui";
```

## app.config.ts (Angular 17+ standalone)
```typescript
import { ApplicationConfig } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura'; // o Material, Lara, Nora

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeNG({
      theme: {
        preset: Aura,
        options: { darkModeSelector: '.dark-mode' }
      }
    })
  ]
};
```

## Componentes PrimeNG más usados
```html
<!-- Tabla -->
<p-table [value]="items" [paginator]="true" [rows]="10" [rowTrackBy]="trackById">
  <ng-template pTemplate="header"><tr><th>Campo</th></tr></ng-template>
  <ng-template pTemplate="body" let-item><tr><td>{{item.name}}</td></tr></ng-template>
</p-table>

<!-- Formulario -->
<p-floatLabel>
  <input pInputText id="name" [formControl]="nameControl" />
  <label for="name">Nombre</label>
</p-floatLabel>

<!-- Dropdown -->
<p-select [options]="options" formControlName="field"
  optionLabel="label" optionValue="value" placeholder="Seleccionar" />

<!-- Botones -->
<p-button label="Guardar" icon="pi pi-save" (onClick)="onSave()" />
<p-button label="Cancelar" [outlined]="true" severity="secondary" (onClick)="onCancel()" />
<p-button icon="pi pi-trash" [text]="true" severity="danger" (onClick)="onDelete(item.id)" />

<!-- Dialog -->
<p-dialog header="Título" [(visible)]="showDialog" [modal]="true" [style]="{width: '500px'}">
  <!-- contenido -->
  <ng-template pTemplate="footer">
    <p-button label="Cancelar" [outlined]="true" (onClick)="showDialog = false" />
    <p-button label="Guardar" (onClick)="onSave()" />
  </ng-template>
</p-dialog>

<!-- Toast (notificaciones) -->
<p-toast />

<!-- ConfirmDialog -->
<p-confirmDialog />
```

## Usar Toast en servicios/componentes
```typescript
constructor(private _messageService: MessageService) {}

// Éxito
this._messageService.add({
  severity: 'success',
  summary: 'Éxito',
  detail: 'Registro guardado correctamente'
});

// Error
this._messageService.add({
  severity: 'error',
  summary: 'Error',
  detail: 'Ocurrió un error al guardar'
});
```

## Clases de Tailwind + PrimeUI
```html
<!-- Layout con Tailwind -->
<div class="flex flex-col gap-4 p-4">
  <div class="grid grid-cols-2 gap-4">
    <!-- Usar colores PrimeNG via CSS vars -->
    <div class="bg-surface-0 border border-surface-200 rounded-lg p-4">
      <span class="text-primary-500 font-semibold">Título</span>
    </div>
  </div>
</div>
```

## Variables CSS de PrimeNG (usar en lugar de hardcodear colores)
```css
/* Superficie */
var(--p-surface-0)        /* fondo principal */
var(--p-surface-100)      /* fondo sutil */
var(--p-surface-500)      /* texto secundario */

/* Primario */
var(--p-primary-500)      /* color principal */
var(--p-primary-600)      /* hover */

/* Semánticos */
var(--p-green-500)        /* éxito */
var(--p-red-500)          /* error */
var(--p-yellow-500)       /* advertencia */
```

## Reglas
- En los botones usar siempre el atributo `p-button` en `<button>`
- Preferir `p-floatLabel` para inputs de formularios solo si se selecciona primeng 17 o más
- Los colores siempre con variables CSS de PrimeNG, nunca valores hardcodeados
- `MessageService` y `ConfirmationService` se proveen en `app.module.ts`, en el main module de la libreria o en el módulo generado
- Importar solo los módulos de PrimeNG que se usan (tree-shaking)
