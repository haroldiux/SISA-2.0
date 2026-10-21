# Design: Docente Materia Cards Highlight

## Componentes UI / Clases Tailwind

### Tarjeta (Estado Activo)
```css
doc-materia-card p-3.5 rounded-xl border-2 border-brand-600 bg-brand-50/60 dark:bg-brand-950/40 ring-4 ring-brand-500/20 shadow-lg scale-[1.02] cursor-pointer transition-all duration-200
```

### Tarjeta (Estado Inactivo)
```css
doc-materia-card p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-md cursor-pointer transition-all duration-200
```

### Badge (Estado Activo)
```html
<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-600 text-white shadow-sm flex items-center gap-1.5 ring-2 ring-brand-500/30">
  <span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> Activa
</span>
```

### Badge (Estado Inactivo)
```html
<span class="text-slate-400 text-[10px] font-semibold hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1">
  Ver Carga ➔
</span>
```

## Refactorización de JavaScript

*   **`window.selectDocenteMateria`**:
    *   Ubicación: `app-controller.js` (y referencias en `index.html`).
    *   Lógica: Debe iterar sobre todos los elementos que representan tarjetas de materias para limpiar las clases de estado activo y establecer las de inactivo. Luego, se aplicarán las clases y el HTML del badge de estado activo específicamente al elemento seleccionado, asegurando la actualización visual correcta en modo claro y oscuro.
