# Exploration: SISA Portal Shell Layout Restructure

**Change ID**: `09-portal-shell-layout-restructure`  
**Topic**: Shell Layout Restructuring (Top Header, Left Sidemenu, Sidebar Footer, and Main Dashboard Hero Canvas) matching reference image `media_1788880414905.png` and official UNITEPC SEA Portal Design System (`sea-portal-ui` / `unitepc-pro`).  
**Status**: Completed Exploration  
**Artifact Mode**: Hybrid (`openspec` markdown + Engram memory persistence)  

---

## 1. Executive Summary & Objectives

The purpose of change `09-portal-shell-layout-restructure` is to elevate SISA 2.0 from an experimental, tab-based prototype into the official **UNITEPC SEA Portal** shell architecture. 

Based on the canonical production reference UI (`media_1788880414905.png`, URL: `planificacion.unitepc.edu.bo/dashboard`) and the institutional design system (`sea-portal-ui`), this change addresses four critical architectural deficits:
1. **Outer Shell Extraction**: The global left sidebar (240px expandible / 76px rail) and top header (64px) currently live either duplicated inside individual view containers (`view1` through `view5`) or in a temporary top dev bar (`view1` - `view6` tabs). They must be lifted into a persistent outer layout shell.
2. **Creation of `view-dashboard`**: The system currently defaults to `view1` (Docente Planning). A dedicated, institutional **Dashboard Hero Canvas** (`view-dashboard`) must be introduced as the root landing experience, featuring an indigo/purple gradient hero banner, authenticated role customization card, 4-metric KPI row, direct access links, and operational status cards.
3. **Decoupling of Sub-Views**: Duplicate sidebars must be removed from `view2`, `view3`, `view4`, and `view5`. For `view1` (Carpeta Docente), its course selector (`Mis Carreras & Cátedras`), 4 document tabs, and direct export actions must be retained as a clean, contextual sub-rail without pretending to be the global application sidemenu.
4. **Design System Fidelity**: Full alignment with `sea-portal-ui` tokens (`$sp-purple: #7B47B8`, `$sp-purple-dark: #5C2E94`, `$sp-purple-soft: #F0E9F8`, `$sidebar-width: 240px`, `$sidebar-collapsed-width: 76px`, Geist font, runtime CSS variables `--sp-*`, and Latin American neutral Spanish copy).

---

## 2. Deep Dive: Reference UI & Codebase Audit

### 2.1 Visual Audit of Reference Image (`media_1788880414905.png`)

Analysis of the reference UI at `planificacion.unitepc.edu.bo/dashboard`:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Sistema de Evaluaciones                                    [+ Parametrizar vista] [GESTIÓN: II-2026] │
│        GESTIÓN INTEGRAL DEL PROCESO DE EVALUACIONES ACADÉMICAS    [Docente API] [Theme] [SEA Live] [User HM] │
├──────────────┬─────────────────────────────────────────────────────────────────────────────────────────┤
│ MÓDULOS  <<  │ ╔═════════════════════════════════════════════════════════════════════════════════════╗ │
│ ───────────  │ ║ HERO BANNER: "Resumen institucional completo"                                       ║ │
│ • Dashboard  │ ║ Sede Central CBB | Gestión II-2026                 [ Evaluaciones del Día ]         ║ │
│ • Plan Est.  │ ╚═════════════════════════════════════════════════════════════════════════════════════╝ │
│ • Banco Preg │ ┌───────────────────────────────────────────────────┬─────────────────────────────────┐ │
│ • Lista Eval │ │ VISTA PERSONALIZADA POR CARGO                     │ USUARIO AUTENTICADO             │ │
│ • Rol Exám.  │ │ Rol: Administrador • Acceso completo al sistema   │ Harold Iriarte • CI: 3065087    │ │
│ • Serv. Acad │ └───────────────────────────────────────────────────┴─────────────────────────────────┘ │
│   [Live]     │ ┌───────────────┬───────────────┬───────────────────┬─────────────────────────────────┐ │
│ • Salas Virt │ │ Roles Visibles│ En Planificac.│ En Proceso        │ Calificadas                     │ │
│ • OMR        │ │ 2,597         │ 2,594         │ 0                 │ 0                               │ │
│ • Admin Eval │ └───────────────┴───────────────┴───────────────────┴─────────────────────────────────┘ │
│ • Auditoría  │ ┌───────────────────────────────────────────────────┬─────────────────────────────────┐ │
│ • Respaldos  │ │ INFORMACIÓN A TU ALCANCE                          │ ACCESOS DIRECTOS DE TU CARGO    │ │
│ • Reportes   │ │ Calendario, hitos, sincronización SEA Gateway     │ [Docencia] [Auditoría] [Usuarios│ │
│ • Usuarios   │ └───────────────────────────────────────────────────┴─────────────────────────────────┘ │
│ ───────────  │ ┌───────────────┬───────────────┬───────────────────┬─────────────────────────────────┐ │
│ [Card]       │ │ Total Eval.   │ Turnos Hoy    │ Variantes Examen  │ Cobertura Bancos                │ │
│ Seguridad 🛡 │ └───────────────┴───────────────┴───────────────────┴─────────────────────────────────┘ │
│ HM Harold    │                                                                                         │
└──────────────┴─────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Top Header**:
   - **Left**: Purple square brand icon (`bg-[#7B47B8]` with rounded corners) + "Sistema de Evaluaciones" / "GESTIÓN INTEGRAL DEL PROCESO DE EVALUACIONES ACADÉMICAS" (uppercase tracked, font-size 10px).
   - **Right**:
     - `+ Parametrizar vista` button (soft-purple border, ghost styling).
     - `GESTIÓN: II-2026 (Activa)` calendar pill dropdown.
     - Integration points: Docente API selector, Theme toggle (sol/luna), SEA Gateway status badge (`SEA Live`), and user menu dropdown.
2. **Left Sidebar (`w-60` / 240px)**:
   - **Header**: Section label "MÓDULOS DEL PROCESO" (uppercase tracked 0.12em) with collapse button `<<` (collapses to 76px rail).
   - **Navigation Items (13 items)**:
     1. Dashboard (`layout-dashboard`)
     2. Plan de Estudios (`book-open`) → routes/switches to `view1` (Carpeta Docente).
     3. Banco de Preguntas (`database`).
     4. Lista de Evaluaciones (`list-ordered`).
     5. Rol de Exámenes (`calendar-days`).
     6. Servicios Académicos [Live badge] (`cpu`).
     7. Salas Virtuales (`monitor-play`).
     8. Calificación OMR (`scan-line`).
     9. Administración de Evaluaciones (`sliders-horizontal`).
     10. Auditoría & Bitácora (`scroll-text`) → routes/switches to `view3` (Auditoría In Situ).
     11. Respaldos y contingencias (`hard-drive-download`).
     12. Reporte de Evaluaciones (`file-spreadsheet`) → routes/switches to `view4`/`view5`.
     13. Usuarios y accesos (`user-cog`) → routes/switches to `view6` (IAM & RBAC).
   - **Bottom Security Card**:
     - Rounded container with shield icon.
     - Copy: *"Por seguridad, cambia periódicamente tu contraseña y no la compartas."*
     - Click triggers change-password workflow.
   - **Bottom User Profile Bar**:
     - Circle avatar with initials (`HM` / `HI`).
     - Full user name ("Harold Iriarte").
     - Role label ("Docente" / "Administrador").
     - Logout icon button (`onclick="window.logoutUser()"`).
3. **Main Content Canvas (Dashboard)**:
   - **Hero Banner**: Deep Indigo/Purple gradient card (`linear-gradient(135deg, #1E1139 0%, #3B1F6A 50%, #4F2686 100%)`), institutional title *"Resumen institucional completo"*, badges for current scope, dropdowns for Sede and Gestión, and primary action button *"Evaluaciones del Día"*.
   - **Sub-header Card**: Split card with *"VISTA PERSONALIZADA POR CARGO"* on the left (role badge and capabilities) and *"USUARIO AUTENTICADO"* on the right (user metadata).
   - **KPI Row**: 4 stat cards with accent indicators:
     * Roles visibles: **2,597**
     * En planificación: **2,594**
     * En proceso: **0**
     * Calificadas: **0**
   - **Middle Row**:
     * *"INFORMACIÓN A TU ALCANCE"*: Status alerts, active academic cycle, synchronization health.
     * *"ACCESOS DIRECTOS DE TU CARGO"*: Interactive shortcuts to Carpeta Docente (`view1`), Supervisión (`view2`), Auditoría (`view3`), and Usuarios (`view6`).
   - **Bottom Metrics**: 4 operational cards (Total evaluaciones, Turnos hoy, Variantes del examen, Cobertura de bancos).

---

### 2.2 Codebase Diagnosis: Current State of `sisa-frontend`

1. **Root Layout (`app.component.html`)**:
   - Lines 264–361 contain a prototype header with buttons `btn-view1` through `btn-view6` on a dark slate bar (`bg-slate-900 border-b border-slate-800`).
   - Lines 364–2487 wrap views inside `<main class="w-full flex-1 p-6 flex justify-center items-start overflow-auto">`.
   - Each view is boxed into `w-[1440px]`.
   - `view1` embeds an internal `<aside class="w-[280px]">` (lines 372–465) combining institutional branding with course selection and tab switching.
   - `view2`..`view5` replicate this with dummy `<aside class="w-[260px]">` elements.
   - `view6` has no sidebar.
   - There is no `view-dashboard` element.
2. **Controller Logic (`app-controller.js`)**:
   - `window.switchView(viewId)` toggles `.frame-view` classes and activates `btn-view*` buttons.
   - DOM hooks directly query:
     * `user-profile-avatar`, `user-profile-name`, `user-profile-info` (sidebar footer).
     * `header-user-avatar`, `header-user-name`, `header-user-role`, `user-profile-header-dropdown` (topbar).
     * `sidebar-materias-container`, `sidebar-materia-${mKey}`, `sidebar-summary-hours` (`view1` subjects).
     * `sidebar-tab-analitico`, `sidebar-tab-pac-matrix`, etc. (`view1` document tabs).
     * `sidebar-sea-badge`, `sidebar-sea-dot`, `sidebar-sea-text` (SEA gateway status).
   - Any refactoring must preserve these DOM IDs or provide synchronous forwarders so existing business logic (saving, exporting, dynamic rendering) does not break.
3. **Design Tokens (`sea-portal-ui`)**:
   - Sizing: Sidebar width is strictly `240px` (expanded) and `76px` (collapsed rail). Topbar height is `64px`.
   - Font: `Geist` for body and display; `Geist Mono` for codes and CI.
   - Colors: Must use `--sp-purple` (`#7B47B8`), `--sp-purple-dark` (`#5C2E94`), `--sp-purple-soft` (`#F0E9F8`), `--sp-surface`, `--sp-bg`, `--sp-border`.
   - Copy: Neutral Spanish, strictly no voseo ("tienes", "selecciona", "puedes", "completa").

---

## 3. Architectural Comparison: Approaches & Trade-offs

### Option A: In-Place Canonical Shell Extraction (Hybrid Native Architecture) — *RECOMMENDED*
- **Concept**:
  1. Extract the Global Sidebar and Top Header to the outer shell in `app.component.html`.
  2. Implement `view-dashboard` as a first-class `.frame-view` container matching `media_1788880414905.png`.
  3. Strip duplicate sidebars from `view2`..`view5`.
  4. In `view1`, convert the internal course selection and document tabs into a dedicated, clean **Carpeta Docente Context Sub-Panel** (`sidebar-materias-container` + document tabs + export shortcuts) without the redundant global branding/footer.
  5. Update `app-controller.js` to support `view-dashboard`, synchronize sidebar navigation highlights, handle 240px/76px rail collapse, and retain all existing DOM event listeners.
- **Pros**:
  - **Zero Regressions**: All 6,298 lines of tested business logic (Word DOCX export, Excel PAC/Cronograma sync, PDF print layout, RBAC user administration) remain 100% operational.
  - **Pixel-Perfect Fidelity**: Matches the reference UI exactly.
  - **Clean Separation of Concerns**: Global navigation lives in the shell; in-depth subject/document navigation lives inside `view1`.
  - **Feasible within Single Change**: Can be executed reliably with predictable verification steps.
- **Cons**:
  - The views still share the single-page DOM structure rather than being separated into lazy-loaded Angular route files.

---

### Option B: Immediate Full Angular Router Rewrite (Deconstruction into Modular NgModules)
- **Concept**:
  Dismantle `app.component.html` completely. Migrate each view (`view-dashboard`, `view1`..`view6`) into separate Angular components under `src/app/modules/secure/`, rewrite `app-controller.js` (6,298 lines) into Angular TypeScript services, and use `<router-outlet>`.
- **Pros**:
  - Pure Angular idiom; aligns with `scu-layout-shell`.
- **Cons**:
  - **Massive Scope & High Regression Risk**: Rewriting 6,298 lines of complex DOM manipulation, ExcelJS binary generation, and inline editing logic would take weeks and easily break existing features.
  - Exceeds the scope of change `09-portal-shell-layout-restructure`.

---

### Option C: Dual Nested Shell (Preserve Prototype Topbar, Inject Sidebar Inside Main Area)
- **Concept**:
  Keep the top dev bar (`btn-view1`..`btn-view6`) and insert a sidebar inside the main container to fake the layout.
- **Pros**:
  - Low effort.
- **Cons**:
  - **Rejected**: Fails the primary objective. Leaves the UI cluttered with double headers and unaligned with `media_1788880414905.png`.

---

### Comparative Evaluation Matrix

| Metric | Option A: In-Place Canonical Shell (Recommended) | Option B: Full Angular Rewrite | Option C: Dual Nested Shell |
| :--- | :--- | :--- | :--- |
| **Visual Accuracy (`media_1788880414905.png`)** | **100% Exact** | High (after long rework) | Poor (cluttered prototype) |
| **Design System Compliance (`sea-portal-ui`)** | **100% Compliant** | Compliant | Inconsistent |
| **Risk of Breaking Existing Features** | **Very Low** | **Critical / Extremely High** | Low |
| **Preservation of Office/Docx/Excel Generators**| **100% Preserved** | High risk of data loss | Preserved |
| **Implementation Complexity** | **Moderate / Controlled** | **Prohibitive** | Minimal |
| **Time to Working Delivery** | Fast (1 targeted sprint) | Multi-week migration | Fast (unacceptable quality) |

---

## 4. Proposed Architectural Design

### 4.1 Shell DOM Structure (`app.component.html`)

```html
<div class="sp-shell flex h-screen w-screen bg-[var(--sp-bg)] text-[var(--sp-ink)] overflow-hidden font-sans select-none">
  
  <!-- ========================================================================= -->
  <!-- GLOBAL LEFT SIDEBAR (240px expanded / 76px rail)                           -->
  <!-- ========================================================================= -->
  <aside id="global-sidebar" class="w-60 bg-[var(--sp-surface)] border-r border-[var(--sp-border)] flex flex-col justify-between flex-shrink-0 z-30 transition-all duration-250 ease-out no-print">
    
    <div class="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-3 space-y-4">
      
      <!-- Sidebar Header & Toggle -->
      <div class="flex items-center justify-between px-2 py-1.5 border-b border-[var(--sp-border)]">
        <div class="flex items-center gap-2.5 overflow-hidden">
          <div class="w-8 h-8 rounded-lg bg-[var(--sp-purple)] text-white flex items-center justify-center font-bold font-display shadow-sm flex-shrink-0">
            <i data-lucide="layers" class="w-4 h-4"></i>
          </div>
          <div class="sidebar-label-wrap">
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-[var(--sp-ink-4)] block">MÓDULOS DEL PROCESO</span>
            <span class="text-xs font-bold text-[var(--sp-ink)] truncate block font-display">SISA 2.0</span>
          </div>
        </div>
        <button id="sidebar-collapse-btn" onclick="window.toggleSidebarCollapse()" class="p-1.5 rounded-lg text-[var(--sp-ink-3)] hover:text-[var(--sp-purple)] hover:bg-[var(--sp-surface-hover)] transition-colors cursor-pointer" title="Colapsar menú">
          <i id="sidebar-collapse-icon" data-lucide="chevrons-left" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Navigation List (13 items) -->
      <nav class="space-y-1">
        <button onclick="window.switchView('view-dashboard')" id="nav-item-dashboard" class="global-nav-btn active w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
          <i data-lucide="layout-dashboard" class="w-4 h-4 flex-shrink-0"></i>
          <span class="sidebar-item-label truncate">Dashboard</span>
        </button>

        <button onclick="window.switchView('view1')" id="nav-item-view1" class="global-nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[var(--sp-ink-2)] hover:bg-[var(--sp-surface-hover)] transition-all">
          <i data-lucide="book-open" class="w-4 h-4 flex-shrink-0"></i>
          <span class="sidebar-item-label truncate">Plan de Estudios</span>
        </button>

        <button onclick="window.showToast('Módulo Banco de Preguntas en preparación')" id="nav-item-banco" class="global-nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[var(--sp-ink-2)] hover:bg-[var(--sp-surface-hover)] transition-all">
          <i data-lucide="database" class="w-4 h-4 flex-shrink-0"></i>
          <span class="sidebar-item-label truncate">Banco de Preguntas</span>
        </button>

        <button onclick="window.showToast('Módulo Lista de Evaluaciones')" id="nav-item-evaluaciones" class="global-nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[var(--sp-ink-2)] hover:bg-[var(--sp-surface-hover)] transition-all">
          <i data-lucide="list-ordered" class="w-4 h-4 flex-shrink-0"></i>
          <span class="sidebar-item-label truncate">Lista de Evaluaciones</span>
        </button>

        <button onclick="window.showToast('Módulo Rol de Exámenes')" id="nav-item-rol" class="global-nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[var(--sp-ink-2)] hover:bg-[var(--sp-surface-hover)] transition-all">
          <i data-lucide="calendar-days" class="w-4 h-4 flex-shrink-0"></i>
          <span class="sidebar-item-label truncate">Rol de Exámenes</span>
        </button>

        <button onclick="window.toggleSeaGatewaySimulation()" id="nav-item-servicios" class="global-nav-btn w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[var(--sp-ink-2)] hover:bg-[var(--sp-surface-hover)] transition-all">
          <div class="flex items-center gap-3 overflow-hidden">
            <i data-lucide="cpu" class="w-4 h-4 flex-shrink-0"></i>
            <span class="sidebar-item-label truncate">Servicios Académicos</span>
          </div>
          <span id="sidebar-sea-badge" class="sidebar-badge-wrap px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <span id="sidebar-sea-text">Live</span>
          </span>
        </button>

        <button onclick="window.showToast('Salas Virtuales activas')" id="nav-item-salas" class="global-nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[var(--sp-ink-2)] hover:bg-[var(--sp-surface-hover)] transition-all">
          <i data-lucide="monitor-play" class="w-4 h-4 flex-shrink-0"></i>
          <span class="sidebar-item-label truncate">Salas Virtuales</span>
        </button>

        <button onclick="window.showToast('Calificación OMR')" id="nav-item-omr" class="global-nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[var(--sp-ink-2)] hover:bg-[var(--sp-surface-hover)] transition-all">
          <i data-lucide="scan-line" class="w-4 h-4 flex-shrink-0"></i>
          <span class="sidebar-item-label truncate">Calificación OMR</span>
        </button>

        <button onclick="window.switchView('view2')" id="nav-item-admin-eval" class="global-nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[var(--sp-ink-2)] hover:bg-[var(--sp-surface-hover)] transition-all">
          <i data-lucide="sliders-horizontal" class="w-4 h-4 flex-shrink-0"></i>
          <span class="sidebar-item-label truncate">Administración de Evaluaciones</span>
        </button>

        <button onclick="window.switchView('view3')" id="nav-item-view3" class="global-nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[var(--sp-ink-2)] hover:bg-[var(--sp-surface-hover)] transition-all">
          <i data-lucide="scroll-text" class="w-4 h-4 flex-shrink-0"></i>
          <span class="sidebar-item-label truncate">Auditoría & Bitácora</span>
        </button>

        <button onclick="window.showToast('Respaldos y contingencias')" id="nav-item-respaldos" class="global-nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[var(--sp-ink-2)] hover:bg-[var(--sp-surface-hover)] transition-all">
          <i data-lucide="hard-drive-download" class="w-4 h-4 flex-shrink-0"></i>
          <span class="sidebar-item-label truncate">Respaldos y contingencias</span>
        </button>

        <button onclick="window.switchView('view4')" id="nav-item-reportes" class="global-nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[var(--sp-ink-2)] hover:bg-[var(--sp-surface-hover)] transition-all">
          <i data-lucide="file-spreadsheet" class="w-4 h-4 flex-shrink-0"></i>
          <span class="sidebar-item-label truncate">Reporte de Evaluaciones</span>
        </button>

        <button onclick="window.switchView('view6')" id="nav-item-view6" class="global-nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[var(--sp-ink-2)] hover:bg-[var(--sp-surface-hover)] transition-all">
          <i data-lucide="user-cog" class="w-4 h-4 flex-shrink-0"></i>
          <span class="sidebar-item-label truncate">Usuarios y accesos</span>
        </button>
      </nav>

      <!-- Bottom Security Card -->
      <div class="sidebar-security-card p-3 rounded-xl bg-[var(--sp-surface-2)] border border-[var(--sp-border)] text-xs space-y-1 cursor-pointer" onclick="window.openModal('Seguridad de la cuenta', '<p>Por políticas de seguridad de UNITEPC, recuerda actualizar tu contraseña periódicamente.</p>')">
        <div class="flex items-center gap-2 font-bold text-[var(--sp-ink)]">
          <i data-lucide="shield-check" class="w-4 h-4 text-[var(--sp-purple)] flex-shrink-0"></i>
          <span class="sidebar-item-label">Seguridad de la cuenta</span>
        </div>
        <p class="sidebar-item-label text-[11px] text-[var(--sp-ink-3)] leading-relaxed">Por seguridad, cambia periódicamente tu contraseña y no la compartas.</p>
      </div>

    </div>

    <!-- Bottom User Profile Bar -->
    <div class="p-3 border-t border-[var(--sp-border)] flex items-center justify-between flex-shrink-0 bg-[var(--sp-surface)]">
      <div class="flex items-center gap-2.5 overflow-hidden">
        <div id="user-profile-avatar" class="w-8 h-8 rounded-full bg-[var(--sp-purple-soft)] text-[var(--sp-purple-dark)] font-bold flex items-center justify-center text-xs border border-[var(--sp-purple)]/20 flex-shrink-0 font-display">HM</div>
        <div class="sidebar-label-wrap overflow-hidden">
          <div id="user-profile-name" class="text-xs font-bold text-[var(--sp-ink)] truncate font-display">Harold Iriarte</div>
          <div id="user-profile-info" class="text-[10px] font-medium text-[var(--sp-ink-3)] truncate">Docente • UNITEPC</div>
        </div>
      </div>
      <button onclick="window.logoutUser()" title="Cerrar sesión" class="p-1.5 rounded-lg text-[var(--sp-ink-3)] hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer flex-shrink-0">
        <i data-lucide="log-out" class="w-4 h-4"></i>
      </button>
    </div>

  </aside>

  <!-- ========================================================================= -->
  <!-- MAIN WORKSPACE CONTAINER (HEADER + VIEWS CANVAS)                          -->
  <!-- ========================================================================= -->
  <div class="flex-1 flex flex-col h-full overflow-hidden">

    <!-- Canonical Top Header -->
    <header class="h-16 bg-[var(--sp-surface)] border-b border-[var(--sp-border)] px-6 flex items-center justify-between flex-shrink-0 z-20 no-print">
      
      <!-- Brand / App Title -->
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-[var(--sp-purple)] flex items-center justify-center text-white shadow-sm font-bold font-display">
          <i data-lucide="graduation-cap" class="w-5 h-5"></i>
        </div>
        <div>
          <h1 class="text-sm font-bold text-[var(--sp-ink)] font-display tracking-tight leading-none">Sistema de Evaluaciones</h1>
          <p class="text-[10px] font-extrabold uppercase tracking-wider text-[var(--sp-ink-3)] mt-0.5">GESTIÓN INTEGRAL DEL PROCESO DE EVALUACIONES ACADÉMICAS</p>
        </div>
      </div>

      <!-- Right Header Actions -->
      <div class="flex items-center gap-3">
        
        <!-- Parametrizar Vista Action -->
        <button onclick="window.showToast('Configurador de parámetros de vista')" class="px-3 py-1.5 rounded-xl border border-[var(--sp-border)] hover:bg-[var(--sp-surface-hover)] text-xs font-semibold text-[var(--sp-ink)] flex items-center gap-1.5 transition-colors cursor-pointer">
          <i data-lucide="plus" class="w-3.5 h-3.5 text-[var(--sp-purple)]"></i>
          <span>Parametrizar vista</span>
        </button>

        <!-- Gestión Académica Pill Selector -->
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--sp-purple-soft)] border border-[var(--sp-purple)]/20 text-[var(--sp-purple-dark)] text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity">
          <i data-lucide="calendar" class="w-3.5 h-3.5 text-[var(--sp-purple)]"></i>
          <span>GESTIÓN: II-2026 (Activa)</span>
          <i data-lucide="chevron-down" class="w-3 h-3 opacity-60"></i>
        </div>

        <!-- Docente API Selector -->
        <div class="hidden md:flex items-center gap-2 bg-[var(--sp-surface-2)] px-2.5 py-1 rounded-xl border border-[var(--sp-border)]">
          <i data-lucide="user-check" class="w-3.5 h-3.5 text-[var(--sp-purple)]"></i>
          <select id="docente-api-selector" (change)="onDocenteSelectorChange($event)" class="bg-transparent border-none text-xs text-[var(--sp-ink)] font-medium focus:outline-none cursor-pointer pr-1">
            <optgroup label="DOCENTES SEA - SEDE COCHABAMBA">
              <option value="3065087" selected>ROSMERY LUIZAGA SALINAS (3065087)</option>
              <option value="6600808">WALTER JOSE CAZAS CASTRO (6600808)</option>
              <option value="4421998">MARTIN XAVIER SANCHEZ FLORES (4421998)</option>
              <option value="7906983">RUBEN SERGIO VELASQUEZ ADRIAZOLA (7906983)</option>
            </optgroup>
          </select>
        </div>

        <!-- Theme Toggle Button -->
        <button id="theme-toggle-btn" onclick="window.toggleTheme()" class="p-2 rounded-xl border border-[var(--sp-border)] text-[var(--sp-ink-3)] hover:text-[var(--sp-ink)] hover:bg-[var(--sp-surface-hover)] transition-colors cursor-pointer" title="Alternar tema claro/oscuro">
          <i id="theme-icon" data-lucide="sun" class="w-4 h-4 text-amber-500"></i>
        </button>

        <!-- SEA Gateway Status Badge -->
        <div id="sea-gateway-status-container" onclick="window.toggleSeaGatewaySimulation()" class="cursor-pointer" title="Click para alternar simulación Gateway Online/Offline">
          <span id="sea-status-badge" class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span id="sea-status-dot" class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span id="sea-status-text">SEA Live</span>
          </span>
        </div>

        <!-- User Profile Dropdown -->
        <div class="relative" id="user-profile-header-dropdown">
          <button id="user-dropdown-btn" onclick="window.toggleUserDropdown(event)" class="flex items-center gap-2 p-1 rounded-xl hover:bg-[var(--sp-surface-hover)] transition-colors cursor-pointer">
            <div id="header-user-avatar" class="w-8 h-8 rounded-full bg-[var(--sp-purple)] text-white font-bold text-xs flex items-center justify-center font-display">HM</div>
            <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-[var(--sp-ink-3)]"></i>
          </button>
        </div>

      </div>
    </header>

    <!-- Main Content Canvas (Scrollable View Host) -->
    <main id="main-canvas" class="flex-1 overflow-y-auto bg-[var(--sp-bg)] p-6 space-y-6 custom-scrollbar">
      
      <!-- ========================================================================= -->
      <!-- VIEW: DASHBOARD (INSTITUTIONAL HERO CANVAS)                               -->
      <!-- ========================================================================= -->
      <div id="view-dashboard" class="frame-view space-y-6 max-w-7xl mx-auto">
        <!-- 1. Top Hero Banner -->
        <!-- 2. Sub-header Card (Cargo & Usuario Autenticado) -->
        <!-- 3. KPI Row (4 metrics) -->
        <!-- 4. Middle Row (Información a tu alcance + Accesos directos) -->
        <!-- 5. Bottom Operational Metrics (4 cards) -->
      </div>

      <!-- ========================================================================= -->
      <!-- VIEW 1: [DOCENTE] CARPETA DOCENTE & PESTAÑAS (STRIPPED OF GLOBAL SIDEBAR) -->
      <!-- ========================================================================= -->
      <div id="view1" class="frame-view hidden max-w-7xl mx-auto flex gap-6">
        <!-- Contextual Sub-panel: Mis Carreras & Cátedras + 4 Tabs + Export shortcuts -->
        <!-- Main Document Editing Body -->
      </div>

      <!-- VIEW 2: SUPERVISIÓN DIR. CARRERA -->
      <div id="view2" class="frame-view hidden max-w-7xl mx-auto">...</div>

      <!-- VIEW 3: AUDITORÍA IN SITU -->
      <div id="view3" class="frame-view hidden max-w-7xl mx-auto">...</div>

      <!-- VIEW 4: VICERRECTORADO SEDE -->
      <div id="view4" class="frame-view hidden max-w-7xl mx-auto">...</div>

      <!-- VIEW 5: VICERRECTORADO NACIONAL -->
      <div id="view5" class="frame-view hidden max-w-7xl mx-auto">...</div>

      <!-- VIEW 6: ADMINISTRACIÓN DE USUARIOS & RBAC -->
      <div id="view6" class="frame-view hidden max-w-7xl mx-auto">...</div>

    </main>

  </div>
</div>
```

---

### 4.2 Dashboard Hero Canvas Detailed Design (`view-dashboard`)

1. **Top Hero Banner**:
   - Container: `rounded-2xl p-6 text-white shadow-lg relative overflow-hidden bg-gradient-to-r from-[#1E1139] via-[#3B1F6A] to-[#4F2686] border border-purple-500/20`.
   - Content:
     * Eyebrow: `PANEL INSTITUCIONAL • UNITEPC` in uppercase tracked typography.
     * Title: `Resumen institucional completo` (text-2xl font-bold font-display).
     * Subtitle: `Monitoreo del ciclo académico, cobertura curricular y avance de evaluaciones.`.
     * Control cluster:
       - Dropdown Sede: `Sede Central Cochabamba`, `Sede La Paz`, `Sede El Alto`, `Sede Cobija`.
       - Dropdown Gestión: `II-2026 (Activa)`.
       - Button: `Evaluaciones del Día` (with calendar icon and shadow).
2. **Sub-header Card**:
   - Grid 2-column card (`grid grid-cols-1 md:grid-cols-2 gap-4 bg-[var(--sp-surface)] rounded-2xl p-5 border border-[var(--sp-border)]`).
   - Left Panel:
     * Title: `VISTA PERSONALIZADA POR CARGO`.
     * Badge: `ROL ADMINISTRADOR` (or dynamic role label from `window.getCurrentUser()`).
     * Description: Contextual permissions based on active role.
   - Right Panel:
     * Title: `USUARIO AUTENTICADO`.
     * Details: Full user name, Institutional Email, CI, and Active Session status.
3. **KPI Row (4 cards)**:
   - Card 1: `Roles visibles` → **2,597** (purple accent bar).
   - Card 2: `En planificación` → **2,594** (teal accent bar).
   - Card 3: `En proceso` → **0** (amber accent bar).
   - Card 4: `Calificadas` → **0** (emerald accent bar).
4. **Middle Row (2 columns)**:
   - Column 1: `INFORMACIÓN A TU ALCANCE`:
     * System status announcements, active academic calendar milestones, SEA Gateway sync health.
   - Column 2: `ACCESOS DIRECTOS DE TU CARGO`:
     * Quick action tiles:
       - *Plan de Estudios / Docencia* → calls `window.switchView('view1')`.
       - *Supervisión Curricular* → calls `window.switchView('view2')`.
       - *Auditoría In Situ* → calls `window.switchView('view3')`.
       - *Gestión de Usuarios* → calls `window.switchView('view6')`.
5. **Bottom Operational Metrics (4 cards)**:
   - Card 1: `Total evaluaciones` (Value: 0).
   - Card 2: `Turnos hoy` (Value: 0).
   - Card 3: `Variantes del examen` (Value: 0).
   - Card 4: `Cobertura de bancos` (Value: 100%).

---

### 4.3 Controller Updates (`app-controller.js`)

1. **`switchView(viewId)` Extension**:
   - Register `view-dashboard` as a valid view.
   - Set `view-dashboard` as the default view on initial session start (while retaining view navigation state if specified).
   - Update global sidebar active link class:
     * Remove `active` from all `.global-nav-btn`.
     * Add `active` to the matching `#nav-item-*`.
     * Style active item with `bg-[var(--sp-purple-soft)] text-[var(--sp-purple-dark)]` and purple icon.
2. **Sidebar Collapse Engine**:
   - Function `window.toggleSidebarCollapse()`:
     * Toggles CSS class `sidebar-collapsed` on `#global-sidebar`.
     * Changes width from `w-60` (240px) to `w-20` (76px).
     * Hides `.sidebar-item-label`, `.sidebar-label-wrap`, and `.sidebar-security-card` when collapsed.
     * Changes collapse icon between `chevrons-left` and `chevrons-right`.
     * Persists choice in `localStorage.setItem('sp.sidebar.collapsed', isCollapsed)`.
     * Re-applies state on startup.
3. **Preservation of Contextual IDs**:
   - Keep `#sidebar-materias-container`, `#sidebar-summary-hours`, `#sidebar-tab-*` inside `view1`'s contextual rail.
   - Keep `#user-profile-avatar`, `#user-profile-name`, `#user-profile-info` in the global sidebar footer so `updateUserProfileUi()` updates both topbar and sidebar automatically.

---

## 5. Design System Alignment (`sea-portal-ui`)

All elements will follow the tokens declared in `.agent/skills/sea-portal-ui/SKILL.md`:

| Token / Concept | Value / Rule | Implementation in Shell Restructure |
| :--- | :--- | :--- |
| **`$sidebar-width`** | `240px` (`w-60`) | Global left sidebar default width |
| **`$sidebar-collapsed-width`** | `76px` (`w-20`) | Global left sidebar collapsed rail width |
| **`$topbar-height`** | `64px` (`h-16`) | Canonical topbar fixed height |
| **`$sp-purple`** | `#7B47B8` | Brand icon background, active state icons, primary buttons |
| **`$sp-purple-dark`** | `#5C2E94` | Active nav link text, dark purple highlights |
| **`$sp-purple-soft`** | `#F0E9F8` | Active nav link background pill, gestión pill background |
| **`--sp-surface`** | `#FFFFFF` (light) / `#1A1922` (dark) | Sidebar background, topbar background, cards |
| **`--sp-bg`** | `#FAFAF9` (light) / `#0F0E14` (dark) | Canvas background |
| **`--sp-border`** | `#E6E5E8` (light) / `#2A2935` (dark) | Layout dividers and card borders |
| **Typography** | `Geist` & `Geist Mono` | Display titles, table numbers, CI codes |
| **Copy Rules** | Neutral Spanish (no voseo) | "cambia periódicamente", "tienes", "selecciona" |
| **Anti-Patterns** | No sidebar hidden in desktop | Collapses to 76px rail, never completely hidden in desktop |
| **Anti-Patterns** | No padding in `.sp-layout__content` | Padding applied by each page component / canvas container |

---

## 6. Risks, Gotchas & Mitigation Strategies

1. **Risk: DOM ID Breakage in `app-controller.js`**  
   - *Detail*: `app-controller.js` has queries for `#user-profile-avatar`, `#sidebar-materias-container`, `#sidebar-sea-badge`, etc. If an ID is missing, exceptions might be thrown during API load or view switching.  
   - *Mitigation*: Perform an exact audit of all IDs queried by `app-controller.js`. Ensure all IDs are retained in their respective global or contextual positions. Add null-guards in any controller method where elements might be absent.
2. **Risk: Export Engines & PDF Print Layout Regression**  
   - *Detail*: Print to PDF relies on `@media print` rules that hide `header, aside, .no-print`. If new shell elements don't have `.no-print` or `@media print` coverage, they might appear in PDF outputs.  
   - *Mitigation*: Tag `#global-sidebar` and the canonical topbar with `no-print`. Ensure `#print-official-folder-container` remains completely isolated in print stylesheet rules.
3. **Risk: Mobile & Tablet Responsiveness Breakpoints**  
   - *Detail*: A fixed 240px sidebar on small screens (<768px) will crush the dashboard canvas.  
   - *Mitigation*: On mobile screens (≤768px), convert sidebar into an off-canvas drawer (`transform: -translate-x-full`) with a topbar hamburger button, exactly as defined in `sea-portal-ui`.

---

## 7. Next Steps & Implementation Roadmap

1. **Create Spec & Tasks** under `openspec/changes/09-portal-shell-layout-restructure/`:
   - `spec.md`: Detailed delta specifications for `app.component.html`, `app.component.scss`, and `app-controller.js`.
   - `tasks.md`: Incremental, verified task breakdown.
2. **Phase 1: Shell & Sidebar Extraction**:
   - Restructure `app.component.html` outer container into global flex shell.
   - Insert `#global-sidebar` with 13 nav items, collapse toggle, security card, and profile bar.
   - Insert canonical top header with institutional branding and action controls.
3. **Phase 2: Dashboard Hero Canvas (`view-dashboard`)**:
   - Build Hero banner, Cargo/User personalization card, 4-stat KPI grid, middle access row, and operational metrics.
4. **Phase 3: Contextual Sub-rail for `view1`**:
   - Streamline `view1`'s internal sidebar into a dedicated Carpeta Docente sub-panel.
   - Remove duplicate sidebars from `view2`..`view5`.
5. **Phase 4: Controller Orchestration & Verification**:
   - Wire `switchView('view-dashboard')` and active link highlighting.
   - Implement rail collapse toggle and persistence.
   - Verify all existing workflows (teacher selection, document tabs, exports, login/logout, RBAC).
