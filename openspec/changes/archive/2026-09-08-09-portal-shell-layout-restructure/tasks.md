# Tasks: 09 Portal Shell Layout Restructure

**Change ID**: `09-portal-shell-layout-restructure`  
**Topic**: Canonical UNITEPC SEA Portal Shell Architecture (`sea-portal-ui` / `unitepc-pro`)  
**Status**: Ready for Implementation  
**Artifact Mode**: Hybrid (`openspec` markdown + Engram memory persistence)  
**Reference Design**: `media_1788880414905.png` (`planificacion.unitepc.edu.bo/dashboard`)  
**Target Files**:
- `sisa-frontend/src/styles.scss`
- `sisa-frontend/src/app/app.component.html`
- `sisa-frontend/src/assets/app-controller.js`

---

## Phase 1: CSS & SCSS Shell Foundation

- [x] 1.1 Implement sidebar rail collapse utilities, CSS transitions, and `.no-print` print isolation in `sisa-frontend/src/styles.scss`
  - [x] 1.1.1 Add `#global-sidebar` rail width transition rules (`240px` to `76px` with `cubic-bezier(0.16, 0.84, 0.44, 1)`) and `.sidebar-collapsed` hiding classes (`.sidebar-item-label`, `.sidebar-label-wrap`, `.sidebar-badge-wrap`, `.sidebar-security-card`)
  - [x] 1.1.2 Center navigation icons and collapse toggle in collapsed rail state (`justify-content: center !important;` with zero horizontal padding)
  - [x] 1.1.3 Define active state `.global-nav-btn.active` with `--sp-purple-soft` background and `--sp-purple-dark` text
  - [x] 1.1.4 Enhance `@media print` isolation to strictly hide `.sp-shell > aside`, `#global-sidebar`, `.sp-topbar`, and `#view-dashboard`, isolating `#print-official-folder-container` with pure letter portrait styling
- [x] 1.2 Verify and complement `sea-portal-ui` design tokens in `sisa-frontend/src/styles.scss`
  - [x] 1.2.1 Verify `--sp-purple` (`#7B47B8`), `--sp-purple-dark` (`#5C2E94`), `--sp-purple-soft` (`#F0E9F8`), `--sp-teal` (`#1F9FAD`), `--sp-teal-dark` (`#157985`), and `--sp-teal-soft` (`#E0F2F4`)
  - [x] 1.2.2 Add layout dimension variables: `--sidebar-width: 240px;`, `--sidebar-collapsed-width: 76px;`, `--topbar-height: 64px;`
  - [x] 1.2.3 Ensure dark mode token overrides for `--sp-purple`, `--sp-surface`, `--sp-bg`, and borders

---

## Phase 2: Shell Layout Restructuring in `app.component.html`

- [x] 2.1 Replace legacy prototype top header with canonical Top Header (64px)
  - [x] 2.1.1 Remove experimental prototype header (`header.w-full.bg-slate-900` with buttons `btn-view1` through `btn-view6`)
  - [x] 2.1.2 Wrap workspace inside root layout `<div class="sp-shell flex h-screen w-screen bg-[var(--sp-bg)] text-[var(--sp-ink)] overflow-hidden font-sans select-none">`
  - [x] 2.1.3 Implement `header.sp-topbar` (`h-16`, 64px) with purple square brand icon (`graduation-cap`) + title "Sistema de Evaluaciones" / uppercase subtitle "GESTIÓN INTEGRAL DEL PROCESO DE EVALUACIONES ACADÉMICAS"
  - [x] 2.1.4 Insert `+ Parametrizar vista` button with icon and action toast trigger
  - [x] 2.1.5 Insert `GESTIÓN: II-2026 (Activa)` calendar pill dropdown with purple soft background
  - [x] 2.1.6 Integrate `#docente-api-selector` dropdown wired to `onDocenteSelectorChange($event)`
  - [x] 2.1.7 Embed `#theme-toggle-btn` wired to `window.toggleTheme()`
  - [x] 2.1.8 Embed `#sea-gateway-status-container` with animated status dot and toggle simulation handler
  - [x] 2.1.9 Integrate user profile header dropdown (`#user-profile-header-dropdown`, `#header-user-avatar`, `#header-user-name`, `#header-user-role`, and `#user-dropdown-menu`)
- [x] 2.2 Create Global Left Sidebar (`#global-sidebar`, 240px / 76px rail)
  - [x] 2.2.1 Construct `<aside id="global-sidebar">` with 240px default width (`w-60`), surface styling, and transition properties
  - [x] 2.2.2 Implement sidebar header with "MÓDULOS DEL PROCESO" uppercase tag, "SISA 2.0" title, and `#sidebar-collapse-btn` toggle (`<<` / `chevrons-left`)
  - [x] 2.2.3 Build 13 canonical process module navigation items (`#nav-item-dashboard`, `#nav-item-view1`, `#nav-item-banco`, `#nav-item-evaluaciones`, `#nav-item-rol`, `#nav-item-servicios` [Live badge], `#nav-item-salas`, `#nav-item-omr`, `#nav-item-admin-eval`, `#nav-item-view3`, `#nav-item-respaldos`, `#nav-item-reportes`, `#nav-item-view6`) with exact icons and labels
  - [x] 2.2.4 Implement "Seguridad de la cuenta" bottom card with shield icon and security advisory modal trigger
  - [x] 2.2.5 Implement authenticated user profile footer (`#user-profile-avatar`, `#user-profile-name`, `#user-profile-info`, `#sidebar-user-avatar`, `#sidebar-user-name`, `#sidebar-user-role`) and logout button (`window.logoutUser()`)
- [x] 2.3 Create Main Canvas `view-dashboard` matching reference screenshot (`media_1788880414905.png`)
  - [x] 2.3.1 Prepend `<div id="view-dashboard" class="frame-view space-y-6 max-w-7xl mx-auto">` inside `#main-canvas`
  - [x] 2.3.2 Construct Deep Indigo/Purple gradient Hero Banner (`Resumen institucional completo`, Sede dropdown, Gestión dropdown, and `Evaluaciones del Día` button)
  - [x] 2.3.3 Construct split Role Context and Authenticated User sub-header cards (`VISTA PERSONALIZADA POR CARGO` + `USUARIO AUTENTICADO` box)
  - [x] 2.3.4 Construct 4-card KPI metric grid (Roles Visibles: 2,597; En Planificación: 2,594; En Proceso: 0; Calificadas: 0) with distinct color accent top bars
  - [x] 2.3.5 Construct middle row with `INFORMACIÓN A TU ALCANCE` (active announcements, SEA Gateway status) and `ACCESOS DIRECTOS DE TU CARGO` (4 shortcut cards to Carpeta Docente, Supervisión Carrera, Auditoría In Situ, Usuarios y RBAC)
  - [x] 2.3.6 Construct bottom operational metrics cards (Total evaluaciones: 0, Turnos hoy: 0, Variantes del examen: 0, Cobertura de bancos: 100%)
- [x] 2.4 Refactor `view1` (Carpeta Docente) and views 2–5
  - [x] 2.4.1 Decouple `view1` outer container into contextual subject sub-rail (`Mis Carreras & Cátedras`, 4 document tabs, direct export actions)
  - [x] 2.4.2 Preserve all legacy DOM IDs in `view1` (`#sidebar-materias-container`, `#sidebar-summary-hours`, `#sidebar-materias-skeleton`, `#sidebar-tab-analitico`, `#sidebar-tab-pac-matrix`, `#sidebar-tab-cronograma-semanas`, `#sidebar-tab-cronograma-planes`, export buttons)
  - [x] 2.4.3 Remove duplicate institutional headers, brand banners, and duplicate profile footers from `view1`
  - [x] 2.4.4 Remove duplicate sidebars and outer banners from `view2`, `view3`, `view4`, and `view5`, streamlining them to fill the main canvas cleanly

---

## Phase 3: Script Controller (`app-controller.js`) Navigation & State Wiring

- [x] 3.1 Extend `switchView` to support `view-dashboard` as default view
  - [x] 3.1.1 Update `switchView(viewId)` to default to `'view-dashboard'` when `viewId` is omitted or empty
  - [x] 3.1.2 Implement active class toggling across `.global-nav-btn` items (`bg-[var(--sp-purple-soft)] text-[var(--sp-purple-dark)] font-semibold`)
  - [x] 3.1.3 Maintain backward-compatibility for legacy `.view-tab-btn` if present
- [x] 3.2 Wire sidebar navigation button clicks and routing
  - [x] 3.2.1 Connect Dashboard -> `view-dashboard`, Plan de Estudios -> `view1`, Administración de Evaluaciones -> `view2`, Auditoría & Bitácora -> `view3`, Reporte de Evaluaciones -> `view4`, Usuarios y accesos -> `view6`
  - [x] 3.2.2 Wire placeholder/toast notifications for Banco de Preguntas, Lista de Evaluaciones, Rol de Exámenes, Salas Virtuales, Calificación OMR, and Respaldos
  - [x] 3.2.3 Wire Servicios Académicos button to `window.toggleSeaGatewaySimulation()` with Live badge synchronization
  - [x] 3.2.4 Wire `view6` activation to trigger `window.loadAdminUsers()`
- [x] 3.3 Implement `toggleSidebarCollapse()` with persistence
  - [x] 3.3.1 Implement `window.toggleSidebarCollapse()` toggling `.sidebar-collapsed`, `w-60` vs `w-20`, and icon `chevrons-left` vs `chevrons-right`
  - [x] 3.3.2 Persist sidebar collapse preference in `localStorage.getItem('sp.sidebar.collapsed')` / `setItem()`
  - [x] 3.3.3 Add self-invoking initializer to restore collapsed state on controller startup
- [x] 3.4 Wire `updateUserProfileUi()` synchronization
  - [x] 3.4.1 Update `window.updateUserProfileUi(user)` to sync credentials to both Top Header (`#header-user-avatar`, `#header-user-name`, `#header-user-role`, dropdown) and Global Sidebar footer (`#user-profile-avatar`, `#user-profile-name`, `#user-profile-info`, `#sidebar-user-avatar`, `#sidebar-user-name`, `#sidebar-user-role`)
  - [x] 3.4.2 Format initials, display names, and role/scope labels cleanly according to authenticated session
  - [x] 3.4.3 Ensure `logoutUser()` properly wipes tokens and presents `#sisa-login-modal`

---

## Phase 4: Build, Deployment & Docker Synchronization

- [x] 4.1 Syntax validation & script integrity
  - [x] 4.1.1 Execute JavaScript syntax validation: `node --check sisa-frontend/src/assets/app-controller.js`
- [x] 4.2 Angular production build
  - [x] 4.2.1 Run `npm run build` in `sisa-frontend` and verify error-free compilation
- [x] 4.3 Docker container synchronization
  - [x] 4.3.1 Deploy built bundle and assets to container: `docker cp sisa-frontend/dist/sisa-frontend/. sisa-frontend:/usr/share/nginx/html/`
  - [x] 4.3.2 Copy updated `app-controller.js` to container assets: `docker cp sisa-frontend/src/assets/app-controller.js sisa-frontend:/usr/share/nginx/html/assets/app-controller.js`

---

## Phase 5: Verification & Acceptance Testing

- [x] 5.1 Visual & Layout Fidelity Verification
  - [x] 5.1.1 Verify canonical shell layout renders at `http://localhost:4200/` matching reference screenshot `media_1788880414905.png`
  - [x] 5.1.2 Verify Top Header fixed 64px height with brand identity, active gestión pill, docente selector, and theme switcher
  - [x] 5.1.3 Verify Hero banner, KPI cards, and operational cards layout
- [x] 5.2 Navigation & Routing Verification
  - [x] 5.2.1 Test switching between Dashboard (`view-dashboard`), Plan de Estudios (`view1`), and Usuarios y accesos (`view6`)
  - [x] 5.2.2 Verify active link highlight updates correctly on each sidebar button
  - [x] 5.2.3 Verify shortcut cards in Dashboard middle row switch to their respective views
- [x] 5.3 Rail Collapse & Persistence Verification
  - [x] 5.3.1 Test clicking `#sidebar-collapse-btn`: sidebar collapses from 240px to 76px rail with labels hidden and icons centered
  - [x] 5.3.2 Verify `localStorage['sp.sidebar.collapsed']` stores state and persists upon page refresh
  - [x] 5.3.3 Test expanding back to 240px
- [x] 5.4 Session, Security & Admin Verification
  - [x] 5.4.1 Test user session rendering in header dropdown and sidebar footer
  - [x] 5.4.2 Test "Seguridad de la cuenta" dialog trigger
  - [x] 5.4.3 Test `logoutUser()` and verify return to institutional login modal
- [x] 5.5 Regression Testing on Carpeta Docente & Export Engines
  - [x] 5.5.1 Verify docente selection updates `#sidebar-materias-container` and subject cards
  - [x] 5.5.2 Verify document tab switching (Programa Analítico, PAC, Cronograma, Planes de Clase)
  - [x] 5.5.3 Test exports: Word (.docx), Excel PAC/Cronograma (.xlsx), Planes (.xlsx)
  - [x] 5.5.4 Test PDF print modal and verify `@media print` isolation hides shell navigation completely
