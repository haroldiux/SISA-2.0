---
name: sea-portal-ui
description: Sistema de diseño y patrones UI del Portal del Estudiante UNITEPC (Angular 15 + PrimeNG 15 + SCSS). Invocar al construir o evolucionar interfaces dentro del ecosistema SEA (sea-student-portal-ui, sea-student-ui, otros portales internos) o al replicar el lenguaje visual "unitepc-pro" en proyectos nuevos. Cubre design tokens, theme infra light/dark, layout shell, componentes reusables (sidebar, topbar, cards, forms, modals, tables), naming, loading/error patterns, copy en español neutro y overrides de PrimeNG.
---

# Sistema de diseño "Portal UNITEPC" (unitepc-pro)

Sistema de UI institucional para portales estudiantiles UNITEPC. Estética
"modern professional product" — refinada, profesional, sin gradients
agresivos. Inspirada en paperless-ngx, Linear y Vercel.

## Stack base

- **Angular 15** con NgModules + lazy-loaded feature modules
- **PrimeNG 15.4.1** (Lara Light Indigo base + custom overrides)
- **Tailwind CSS 3** (utilities solo, no para colores)
- **PrimeFlex** (layout utilities legacy)
- **SCSS** con variables estáticas (sizing/type/spacing) + **CSS custom properties runtime** para colores theme-aware
- **NGXS 3.8** para state management
- **@unitepc/sea-commons** desde Nexus (`BaseGatewayServer`, `BaseHttpService`, `SyncCommand`, etc.)

Fuentes: **Geist** (display + body) + **Geist Mono** (códigos, IDs). Importar
desde Google Fonts en `styles.scss`:

```scss
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400;500;600&display=swap');
```

## Estructura de estilos globales

```
src/styles.scss
├── @import 'styles/variables'   ← SCSS tokens estáticos
├── @import 'styles/theme'        ← CSS custom properties runtime (light/dark)
├── @import 'styles/layout'       ← shell global + page-header + .card .badge
└── @import 'styles/primeng-theme'← overrides p-button, p-menu, p-table, etc.
```

Orden importa: `variables` antes que `theme`, `theme` antes que cualquier
componente.

## Design tokens — `_variables.scss`

```scss
$sp-purple:         #7B47B8;
$sp-purple-dark:    #5C2E94;
$sp-purple-light:   #9B6FD0;
$sp-purple-soft:    #F0E9F8;
$sp-purple-tint:    rgba(123, 71, 184, 0.08);

$sp-teal:           #1F9FAD;
$sp-teal-dark:      #157985;
$sp-teal-light:     #4FBCC8;
$sp-teal-soft:      #E0F2F4;
$sp-teal-tint:      rgba(31, 159, 173, 0.08);

$sp-success:        #10B981;
$sp-warning:        #F59E0B;
$sp-danger:         #EF4444;

$sidebar-width:           240px;
$sidebar-collapsed-width: 76px;
$topbar-height:           60px;

$font-display: 'Geist', system-ui, sans-serif;
$font-body:    'Geist', system-ui, sans-serif;
$font-mono:    'Geist Mono', 'JetBrains Mono', monospace;

$fs-xs:    0.6875rem; // 11px
$fs-sm:    0.8125rem; // 13px
$fs-base:  0.875rem;  // 14px
$fs-md:    0.9375rem; // 15px
$fs-lg:    1.0625rem; // 17px
$fs-xl:    1.25rem;   // 20px
$fs-2xl:   1.625rem;  // 26px
$fs-3xl:   2rem;      // 32px

$fw-normal:   400;
$fw-medium:   500;
$fw-semibold: 600;
$fw-bold:     700;

$sp-1: 0.25rem;  $sp-2: 0.5rem;   $sp-3: 0.75rem;
$sp-4: 1rem;     $sp-5: 1.25rem;  $sp-6: 1.5rem;
$sp-8: 2rem;     $sp-10: 2.5rem;  $sp-12: 3rem;

$radius-sm:   6px;
$radius-md:   10px;
$radius-lg:   14px;
$radius-xl:   18px;
$radius-full: 9999px;

$ease-out:      cubic-bezier(0.16, 0.84, 0.44, 1);
$ease-in-out:   cubic-bezier(0.65, 0, 0.35, 1);
$duration-fast: 150ms;
$duration-base: 250ms;
$duration-slow: 400ms;

$z-sidebar: 100;
$z-topbar:  90;
$z-overlay: 99;
$z-modal:   200;
```

## Theme infra — `_theme.scss` (light/dark via runtime CSS variables)

```scss
:root,
[data-theme='light'] {
  --sp-bg:           #FAFAF9;
  --sp-bg-warm:      #F7F5F0;
  --sp-surface:      #FFFFFF;
  --sp-surface-2:    #F4F4F2;
  --sp-surface-hover:#F7F6FA;

  --sp-ink:          #18171C;
  --sp-ink-2:        #3A3A41;
  --sp-ink-3:        #6B6873;
  --sp-ink-4:        #A3A0AA;

  --sp-border:       #E6E5E8;
  --sp-border-strong:#D4D2D9;

  --sp-purple:       #{$sp-purple};
  --sp-purple-dark:  #{$sp-purple-dark};
  --sp-purple-soft:  #{$sp-purple-soft};
  --sp-purple-tint:  #{$sp-purple-tint};
  --sp-teal:         #{$sp-teal};
  --sp-teal-dark:    #{$sp-teal-dark};
  --sp-teal-soft:    #{$sp-teal-soft};
  --sp-teal-tint:    #{$sp-teal-tint};

  --sp-success:      #{$sp-success};
  --sp-success-soft: rgba(16, 185, 129, 0.10);
  --sp-warning:      #{$sp-warning};
  --sp-warning-soft: rgba(245, 158, 11, 0.10);
  --sp-danger:       #{$sp-danger};
  --sp-danger-soft:  rgba(239, 68, 68, 0.10);

  --sp-shadow-sm:     0 1px 2px rgba(24, 23, 28, 0.04);
  --sp-shadow-md:     0 4px 12px rgba(24, 23, 28, 0.06), 0 1px 3px rgba(24, 23, 28, 0.04);
  --sp-shadow-lg:     0 12px 32px rgba(24, 23, 28, 0.08), 0 2px 6px rgba(24, 23, 28, 0.04);
  --sp-shadow-purple: 0 0 0 3px rgba(123, 71, 184, 0.15);
  --sp-shadow-teal:   0 0 0 3px rgba(31, 159, 173, 0.15);
}

[data-theme='dark'] {
  --sp-bg:           #0F0E14;
  --sp-bg-warm:      #14131A;
  --sp-surface:      #1A1922;
  --sp-surface-2:    #1F1E28;
  --sp-surface-hover:#252430;

  --sp-ink:          #F2F0F5;
  --sp-ink-2:        #C5C2CC;
  --sp-ink-3:        #888592;
  --sp-ink-4:        #56535E;

  --sp-border:       #2A2935;
  --sp-border-strong:#3A3845;

  --sp-purple:       #9B6FD0;
  --sp-purple-dark:  #B58BE3;
  --sp-purple-soft:  rgba(155, 111, 208, 0.18);
  --sp-purple-tint:  rgba(155, 111, 208, 0.10);
  --sp-teal:         #4FBCC8;
  --sp-teal-dark:    #6CCBD5;
  --sp-teal-soft:    rgba(79, 188, 200, 0.18);
  --sp-teal-tint:    rgba(79, 188, 200, 0.10);

  --sp-success:      #34D399;
  --sp-success-soft: rgba(52, 211, 153, 0.16);
  --sp-warning:      #FBBF24;
  --sp-warning-soft: rgba(251, 191, 36, 0.14);
  --sp-danger:       #F87171;
  --sp-danger-soft:  rgba(248, 113, 113, 0.14);

  --sp-shadow-sm:     0 1px 2px rgba(0, 0, 0, 0.30);
  --sp-shadow-md:     0 4px 12px rgba(0, 0, 0, 0.45);
  --sp-shadow-lg:     0 12px 32px rgba(0, 0, 0, 0.55);
  --sp-shadow-purple: 0 0 0 3px rgba(155, 111, 208, 0.30);
  --sp-shadow-teal:   0 0 0 3px rgba(79, 188, 200, 0.30);
}

html { transition: background-color $duration-base $ease-out, color $duration-base $ease-out; }
* { transition: background-color $duration-fast $ease-out, border-color $duration-fast $ease-out, color $duration-fast $ease-out; }
[class*='animate-'], [class*='ng-animat'] { transition: none; }
```

**Regla maestra**: en cualquier componente de página, los colores van vía
`var(--sp-*)`. Los SCSS estáticos (`$sp-purple`, `$fs-sm`, `$sp-4`, etc.)
solo para tamaños, spacing, radii, durations.

## Theme service (Angular)

```typescript
@Injectable({providedIn: 'root'})
export class SpThemeService {
  public readonly theme$: Observable<SpTheme>;

  private readonly _STORAGE_KEY = 'sp.theme';
  private readonly _DATA_ATTR = 'data-theme';
  private _theme$: BehaviorSubject<SpTheme>;

  constructor(@Inject(DOCUMENT) private _document: Document) {
    const initial = this._resolveInitial();
    this._theme$ = new BehaviorSubject(initial);
    this.theme$ = this._theme$.asObservable();
    this._applyToDocument(initial);
  }

  public toggle(): void {
    const next = this._theme$.value === SpTheme.Dark ? SpTheme.Light : SpTheme.Dark;
    this.setTheme(next);
  }

  public setTheme(theme: SpTheme): void {
    this._theme$.next(theme);
    this._document.documentElement.setAttribute(this._DATA_ATTR, theme);
    localStorage.setItem(this._STORAGE_KEY, theme);
  }

  private _resolveInitial(): SpTheme {
    const saved = localStorage.getItem(this._STORAGE_KEY);
    if (saved === SpTheme.Dark || saved === SpTheme.Light) return saved as SpTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? SpTheme.Dark : SpTheme.Light;
  }
}
```

Inyectar en el topbar y proveer un botón ícono (sol/luna) que llame `toggle()`.

## Layout shell

```
[Sidebar fijo] [Topbar sticky] + [Edge toggle flotante]
                Main content (sin padding propio, lo da cada página)
```

Sidebar 240px expandido / 76px colapsado (rail con solo iconos).
Mobile (≤768px): sidebar → drawer overlay, hamburger en topbar.

**Edge toggle flotante** (estilo paperless-ngx) entre sidebar y main:

```scss
.sp-layout__edge-toggle {
  position: fixed;
  bottom: 28px;
  left: $sidebar-width;
  transform: translateX(-50%);
  z-index: $z-sidebar + 1;
  width: 22px;
  height: 30px;
  background: var(--sp-surface);
  border: 1px solid var(--sp-border);
  border-radius: $radius-sm;
  color: var(--sp-ink-3);
  box-shadow: var(--sp-shadow-sm);
  transition: left $duration-base $ease-out;

  i { font-size: 0.7rem; } // pi-angle-double-left/right

  &:hover { background: var(--sp-surface-hover); color: var(--sp-purple); }
  &--collapsed { left: $sidebar-collapsed-width; }
}

@media (max-width: 768px) { .sp-layout__edge-toggle { display: none; } }
```

Sidebar persist state en `localStorage` (`sp.sidebar.collapsed`).

## Sidebar pattern

- Fondo `var(--sp-surface)`, border-right, padding `$sp-5 $sp-4`.
- Logo institucional centrado en el `__brand` (PNG en `assets/images/`, `max-height: 25px` en md, `18px` en sm cuando colapsado).
- Nav agrupado en secciones con header uppercase `--sp-ink-4` tracked 0.12em.
- Active state: `background: var(--sp-purple-soft); color: var(--sp-purple-dark);` con icono purple. NO usar barra lateral accent.
- Bottom: user chip (avatar gradient purple→teal + nombre + meta) clicable que abre `p-menu` popup con "Mi Perfil" / "Cerrar Sesión".
- Mobile drawer: `transform: translateX(-100%)` por default, `--mobile-open` lo desliza.
- En mobile, ignorar `collapsed` (el drawer siempre se muestra full):
  ```typescript
  get effectiveCollapsed(): boolean {
    return this.isMobile ? false : this.sidebarCollapsed;
  }
  ```

## Topbar pattern

- Background `var(--sp-bg)` (NO surface — para diferenciarse del sidebar).
- Border-bottom 1px.
- Left: hamburger (`*ngIf="showMobileToggle"`) + breadcrumb dinámico via `Router.events` mapeando URL → label.
- Right: botones icon 34×34 bordered (notificaciones bell+dot, theme toggle sol/luna), botón ghost texto "Ayuda".
- NO user chip en topbar (vive en sidebar bottom).

Icon button mockup-v4 style:

```scss
.sp-topbar__icon-btn {
  width: 34px; height: 34px;
  background: var(--sp-bg);
  border: 1px solid var(--sp-border);
  border-radius: $radius-md;
  color: var(--sp-ink-3);

  &:hover {
    background: var(--sp-surface-hover);
    color: var(--sp-ink);
    border-color: var(--sp-border-strong);
  }
}
```

## Page header pattern

NO usar hero gradients agresivos. Patrón limpio del mockup unitepc-pro:

```html
<header class="sp-{page}__head">
  <div>
    <span class="sp-{page}__eyebrow">CONTEXT · GESTIÓN 2026-I</span>
    <h1 class="sp-{page}__title">Título de página</h1>
    <p class="sp-{page}__subtitle">Descripción opcional.</p>
  </div>
  <div class="sp-{page}__pills">
    <span class="sp-pill sp-pill--success"><span class="sp-pill__dot"></span> N inscritas</span>
    <span class="sp-pill sp-pill--ghost">N por inscribir</span>
  </div>
</header>
```

```scss
&__eyebrow {
  font-size: $fs-xs; font-weight: $fw-medium;
  letter-spacing: 0.10em; text-transform: uppercase;
  color: var(--sp-ink-3); margin-bottom: $sp-3;
}
&__title {
  font-family: $font-display;
  font-weight: $fw-semibold;
  font-size: clamp(1.5rem, 2.4vw, 1.875rem);
  letter-spacing: -0.025em;
  line-height: 1.15;
  color: var(--sp-ink);
  margin: 0 0 $sp-2;
}
&__subtitle {
  font-size: $fs-sm;
  color: var(--sp-ink-3);
  line-height: 1.5;
  max-width: 60ch;
}
```

## Card pattern (para sections)

```scss
.sp-{page}-card {
  background: var(--sp-surface);
  border: 1px solid var(--sp-border);
  border-radius: $radius-lg;
  padding: $sp-6;
}

.sp-{page}-card__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: $sp-5;
  margin-bottom: $sp-5;
  border-bottom: 1px solid var(--sp-border);
}

.sp-{page}-card__title {
  font-family: $font-display;
  font-weight: $fw-semibold;
  font-size: $fs-md;
  letter-spacing: -0.015em;
  color: var(--sp-ink);
}

.sp-{page}-card__hint {
  font-size: $fs-xs;
  font-weight: $fw-medium;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--sp-ink-4);
}
```

## Identity / hero card "interesante"

Cuando un perfil necesita un hero más expresivo, **sin caer en gradients
agresivos**: card horizontal con border-left purple, pattern decorativo de
fondo con `radial-gradient` tints, avatar con halo doble, status badge.

```scss
.sp-identity {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: $sp-6;
  padding: $sp-6 $sp-6 $sp-6 $sp-5;
  background: var(--sp-surface);
  border: 1px solid var(--sp-border);
  border-left: 3px solid var(--sp-purple);
  border-radius: $radius-lg;
  overflow: hidden;
  isolation: isolate;
}

.sp-identity__pattern {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(circle at 100% 0%, var(--sp-purple-tint) 0%, transparent 45%),
    radial-gradient(circle at 80% 100%, var(--sp-teal-tint) 0%, transparent 40%);
  opacity: 0.85;
}

.sp-identity__avatar {
  width: 72px; height: 72px;
  border-radius: $radius-full;
  background: linear-gradient(135deg, var(--sp-purple), var(--sp-teal));
  color: #ffffff;
  display: flex; align-items: center; justify-content: center;
  font-family: $font-display;
  font-size: 26px; font-weight: $fw-semibold;
  box-shadow: 0 0 0 4px var(--sp-surface), 0 0 0 5px var(--sp-purple-soft);
}
```

## Stat card pattern

```html
<article class="sp-{page}-stat">
  <span class="sp-{page}-stat__accent sp-{page}-stat__accent--purple"></span>
  <div class="sp-{page}-stat__icon sp-{page}-stat__icon--purple"><i class="pi pi-book"></i></div>
  <div class="sp-{page}-stat__body">
    <div class="sp-{page}-stat__value">{{ data.count }}</div>
    <div class="sp-{page}-stat__label">Materias inscritas</div>
  </div>
</article>
```

Cada stat tiene una barra accent en el top (3px gradient) y un icono pintado.
Grid: `repeat(auto-fit, minmax(220px, 1fr))`.

Variants: `--purple`, `--teal`, `--success`, `--warning`.

## Pill / chip pattern

```scss
.sp-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: $radius-full;
  font-size: 11px;
  font-weight: $fw-medium;

  &__dot { width: 6px; height: 6px; border-radius: $radius-full; background: currentColor; }

  &--success { background: var(--sp-success-soft); color: var(--sp-success); }
  &--ghost   { background: transparent; color: var(--sp-ink-3); border: 1px solid var(--sp-border); }
  &--teal    { background: var(--sp-teal-tint); color: var(--sp-teal-dark); }
  &--warning { background: var(--sp-warning-soft); color: var(--sp-warning); }
  &--danger  { background: var(--sp-danger-soft); color: var(--sp-danger); }
}
```

## Loading spinner compartido

Único component `<sp-loading-spinner [icon] [message] [block]>` con ring purple
animado + ícono PrimeIcons opcional dentro:

```typescript
@Component({
  selector: 'sp-loading-spinner',
  template: `
    <div class="sp-loading-spinner" [class.sp-loading-spinner--block]="block">
      <div class="sp-loading-spinner__ring-wrap">
        <div class="sp-loading-spinner__ring"></div>
        <i *ngIf="icon" [class]="icon" class="sp-loading-spinner__icon"></i>
      </div>
      <p *ngIf="message" class="sp-loading-spinner__text">{{ message }}</p>
    </div>
  `,
  ...
})
export class LoadingSpinnerComponent {
  @Input() public icon = '';
  @Input() public message = '';
  @Input() public block = true;
}
```

```scss
.sp-loading-spinner__ring {
  border: 2px solid var(--sp-purple-tint);
  border-top-color: var(--sp-purple);
  animation: sp-loading-spin 0.9s linear infinite;
}
```

Uso: `<sp-loading-spinner icon="pi pi-book" message="Cargando materias..."></sp-loading-spinner>`.

## Error state pattern

```html
<div *ngIf="error$ | async as error" class="sp-{page}__error">
  <i class="pi pi-exclamation-triangle"></i>
  <span>{{ error }}</span>
</div>
```

```scss
.sp-{page}__error {
  display: flex; align-items: center; gap: $sp-3;
  padding: $sp-4 $sp-5;
  background: var(--sp-danger-soft);
  color: var(--sp-danger);
  border-radius: $radius-md;
  font-size: $fs-sm;
  font-weight: $fw-medium;
}
```

## PrimeNG overrides en `_primeng-theme.scss`

Regla: si una clase es un componente PrimeNG (`p-button`, `p-menu`, etc.),
los hover/active deben usar `var(--sp-purple)` y backgrounds `var(--sp-surface)`.
Para ganar sobre el tema base `lara-light-indigo`, prefijar con `body`:

```scss
body .p-menu,
body .p-menu.p-component {
  background: var(--sp-surface);
  border: 1px solid var(--sp-border);
  color: var(--sp-ink-2);

  .p-menu-list, .p-menuitem, .p-menuitem-content { background: transparent; }

  .p-menuitem-link {
    color: var(--sp-ink-2);
    .p-menuitem-text { color: var(--sp-ink-2); font-weight: $fw-medium; }
    .p-menuitem-icon { color: var(--sp-ink-3); }

    &:hover, &:focus {
      background: var(--sp-purple-tint);
      .p-menuitem-text { color: var(--sp-purple-dark); }
      .p-menuitem-icon { color: var(--sp-purple); }
    }
  }
}
```

Botones primarios: `background: var(--sp-purple); border-color: var(--sp-purple); color: #ffffff;` hover `var(--sp-purple-dark)`.

Inputs: `border: 1px solid var(--sp-border); background: var(--sp-surface); color: var(--sp-ink);` focus `border-color: var(--sp-purple); box-shadow: var(--sp-shadow-purple);`.

Tables: `background: var(--sp-surface);` thead `background: var(--sp-bg); color: var(--sp-ink-3);` font-size xs uppercase tracked.

## Naming conventions

| Capa | Sufijo | Ejemplo |
|------|--------|---------|
| Page component | `Sp{Domain}PageComponent` | `SpDashboardPageComponent` |
| Page module | `Sp{Domain}PageModule` | `SpDashboardPageModule` |
| Command (BLCMD wrapper) | `Sp{Domain}{Action}Cmd` | `SpDashboardLoadCmd` |
| NGXS State | `Sp{Domain}State` | `SpDashboardState` |
| NGXS Action | `Sp{Action}{Domain}Action` | `SpLoadDashboardAction` |
| HTTP service | `Sp{Domain}{Action}Http` | `SpDashboardLoadHttp` |
| Selector | prefijo `sp-` | `sp-dashboard-page` |
| BEM | `sp-{page}__{element}--{modifier}` | `sp-materia__name--enrolled` |

Conventions:
- Private members con `_` prefix (`_destroy$`, `_initialize()`, `_finalize()`).
- Lifecycle: `_initialize()` en `ngOnInit()`, `_finalize()` en `ngOnDestroy()`.
- `ChangeDetectionStrategy.OnPush` + `ViewEncapsulation.None`.
- Comandos provistos a nivel componente (`providers: [SpFooCmd]`).
- Stores inyectan HTTP services directos (sin capa intermedia).

## Comentarios en código

**SOLO** se permite Javadoc `@author` arriba de la declaración de la clase:

```typescript
/**
 * @author Nombre Apellido
 */
@Component({...})
export class FooComponent {...}
```

Las decisiones de diseño se documentan en `design-explorations/UI-DECISIONS.md`
del proyecto. NO comentarios decorativos (`// ═══ SECTION ═══`), NO comentarios
HTML `<!-- ... -->`, NO inline `// fix por X`. Si una decisión no es obvia,
va al `.md` con rationale.

## Copy: español neutro latino (NO voseo)

Toda la copy de la app va en **español neutro**:
- `Tienes`, NO `Tenés`
- `selecciona`, NO `elegí`
- `puedes`, NO `podés`
- `continuar`, NO `seguir/seguí`
- `completa/cancela`, NO `completá/cancelá`

Verbos en imperativo o presente sin acentuación rioplatense.

## Animaciones

Stagger sutil en page load:

```scss
@keyframes sp-fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.sp-fade            { animation: sp-fade-up $duration-slow $ease-out both; }
.sp-fade--d1        { animation-delay: 80ms; }
.sp-fade--d2        { animation-delay: 160ms; }
```

Aplicar en orden de aparición visual. No animar elementos que cambian con
theme toggle (`* { transition: ... }` lo cubre).

Hover transitions: `$duration-fast` (150ms). Layout transitions: `$duration-base` (250ms).

## Responsive breakpoints

- `@media (max-width: 1100px)` — tablet (algunos grids colapsan)
- `@media (max-width: 900px)` — break intermedio
- `@media (max-width: 768px)` — mobile

Cada página ajusta tipografía + padding + grids al menos a 768px.
Mobile-first NO se usa: empezamos con desktop y hacemos overrides.

## Padding de layout vs página

`.sp-layout__content` tiene **padding: 0**. Cada componente de página define
su propio padding:

```scss
.sp-{page}-page {
  padding: $sp-8 $sp-8 $sp-12;
  @media (max-width: 768px) { padding: $sp-5 $sp-4 $sp-8; }
}
```

Esto permite que algunas secciones (ej. hero full-width) se salten el padding
sin trucos, mientras el resto del contenido respeta la grilla.

## Spanish form labels

Labels uppercase tracked 0.06em–0.10em en `var(--sp-ink-4)`, values en
`var(--sp-ink)` body normal:

```scss
.sp-form-label {
  font-size: 10.5px;
  font-weight: $fw-medium;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--sp-ink-4);
}

.sp-form-value {
  font-size: $fs-sm;
  font-weight: $fw-normal;
  color: var(--sp-ink);
  line-height: 1.4;
}
```

Para códigos numéricos/IDs usar `font-family: $font-mono;` pero MISMO
`font-size` y `line-height` que body para que no se "salten" filas.

## Anti-patterns (NO hacer)

1. **NO colores hardcoded** en componentes — siempre `var(--sp-*)` o `$sp-*` para tokens.
2. **NO hero purple gradient agresivo** como cabecera por default — usar page-head plano con eyebrow + h1.
3. **NO `darken()/lighten()` SCSS** sobre tokens — usan tiempo de compilación y no reaccionan a theme runtime. Definir las variantes en `_theme.scss`.
4. **NO voseo** en copy.
5. **NO comentarios** decorativos/explicativos en código — solo `@author`.
6. **NO mezclar `$font-body` y `$font-mono`** con tamaños diferentes en filas adyacentes — provoca "saltos" entre líneas.
7. **NO usar `font:` shorthand** con `/` para line-height — Sass deprecation. Separar en propiedades.
8. **NO ocultar el sidebar completo en desktop** — colapsar a rail (76px solo iconos).
9. **NO poner padding en `.sp-layout__content`** — vive en cada página.
10. **NO depender de `lara-light-indigo`** para colores PrimeNG en dark mode — siempre overridear con `body .p-{component}` para ganar specificity.

## Cuándo aplicar este skill

- Construyendo UI nueva en `sea-student-portal-ui`, `sea-student-ui` u otros portales internos UNITEPC.
- Replicando el sistema en proyectos nuevos del workspace SEA.
- Al iterar sobre componentes existentes — usar como referencia de patrones canónicos.
- Cuando hay duda sobre qué color/tipografía/spacing aplicar.
- Antes de inventar un patrón nuevo (revisar si ya existe acá).

## Archivos críticos a leer en el proyecto target

Si Claude trabaja en uno de estos proyectos, revisar primero estos archivos
antes de aplicar el skill (la implementación real puede haber evolucionado):

- `src/styles/_variables.scss`
- `src/styles/_theme.scss`
- `src/styles/_primeng-theme.scss`
- `src/app/modules/secure/secure.component.{ts,html,scss}`
- `src/app/modules/secure/components/sp-secure-sidebar/`
- `src/app/modules/secure/components/sp-secure-topbar/`
- `src/app/shared/components/loading-spinner/`
- `design-explorations/unitepc-pro/UI-DECISIONS.md` (decisiones específicas del proyecto)
