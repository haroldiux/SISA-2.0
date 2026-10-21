---
change_name: 03-docente-materia-cards-highlight
status: COMPLETED
store_mode: Hybrid
---

# Tasks

## [x] Task 1.1: Actualizar HTML inicial en app.component
**Descripción**: Actualizar el HTML inicial en `sisa-frontend/src/app/app.component.html` para que la tarjeta activa tenga las clases resaltadas.
**Archivos Afectados**:
- `sisa-frontend/src/app/app.component.html`
**Criterios de Aceptación**:
- [x] Las clases `border-2 border-brand-600 bg-brand-50/60 dark:bg-brand-950/40 ring-4 ring-brand-500/20 shadow-lg scale-[1.02]` se aplican a la tarjeta activa.
- [x] El badge de la tarjeta activa incluye el estado pulsante: `<span class="doc-card-action-badge px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-600 text-white shadow-sm flex items-center gap-1.5 ring-2 ring-brand-500/30"><span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> Activa</span>`.

## [x] Task 1.2: Actualizar index.html
**Descripción**: Actualizar `index.html` con la misma estructura HTML inicial en las tarjetas de materia.
**Archivos Afectados**:
- `index.html`
**Criterios de Aceptación**:
- [x] `index.html` cuenta con las mismas clases y badge de estado activo que en Task 1.1 para consistencia.

## [x] Task 1.3: Refactorizar toggle dinámico
**Descripción**: Refactorizar `window.selectDocenteMateria` en `sisa-frontend/src/assets/app-controller.js` (y en `index.html` de ser necesario) para alternar dinámicamente las clases del card y el contenido del badge en el footer al hacer clic en cualquier tarjeta.
**Archivos Afectados**:
- `sisa-frontend/src/assets/app-controller.js`
- `index.html`
**Criterios de Aceptación**:
- [x] Al interactuar, las clases se transfieren correctamente a la nueva tarjeta activa, removiéndose de las anteriores.
- [x] El badge pulsante se desplaza hacia la tarjeta seleccionada.

## [x] Task 1.4: Validar legibilidad y contraste
**Descripción**: Validar en modo Claro y Oscuro (Light/Dark mode) la legibilidad y contraste.
**Archivos Afectados**: N/A
**Criterios de Aceptación**:
- [x] Todos los elementos resaltados mantienen una adecuada legibilidad y coherencia estética tanto en tema claro como oscuro.
