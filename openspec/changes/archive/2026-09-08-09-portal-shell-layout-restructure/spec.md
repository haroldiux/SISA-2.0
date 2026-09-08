# Specification: 09 Portal Shell Layout Restructure

**Change ID**: `09-portal-shell-layout-restructure`  
**Topic**: Canonical UNITEPC SEA Portal Shell Architecture (`sea-portal-ui` / `unitepc-pro`)  
**Status**: Draft / Proposed  
**Artifact Mode**: Hybrid (`openspec` markdown + Engram memory persistence)  
**Reference Design**: `media_1788880414905.png` (`planificacion.unitepc.edu.bo/dashboard`)

---

## 1. Introduction & Context

The UNITEPC SISA 2.0 system currently relies on an experimental tab-based layout header (`btn-view1` through `btn-view6`), contains duplicate sidebars nested inside individual view containers (`view1` through `view5`), omits any sidebar in `view6`, and defaults immediately to the course planning view (`view1`) rather than an institutional overview canvas.

This specification formalizes the transformation of SISA 2.0 into the canonical **UNITEPC SEA Portal** architecture. The new shell structure extracts a global, persistent left sidebar (240px wide, collapsible to 76px rail) and a global top header (64px), introduces `view-dashboard` as the default institutional landing canvas matching production reference `media_1788880414905.png`, and converts `view1` into a focused workspace with an internal contextual rail for academic syllabus and document tabs, preserving all 6,298 lines of tested office generation and export logic without regressions.

---

## 2. Requirements

### 2.1 Canonical Shell Architecture
- **REQ-SHELL-01**: The application root layout MUST be an outer flex container (`sp-shell`) spanning 100vw and 100vh with overflow hidden, preventing full-window scrolling.
- **REQ-SHELL-02**: The left navigation MUST be a persistent Global Sidebar (`#global-sidebar`) with a default width of 240px (`w-60`), collapsible to a 76px rail (`w-20` / `sidebar-collapsed`).
- **REQ-SHELL-03**: The top section MUST be a persistent Global Top Header (`header.sp-topbar`) with a fixed height of 64px (`h-16`), housing institutional identity, global academic period controls, theme switch, docente selector, SEA Gateway status, and user profile trigger.
- **REQ-SHELL-04**: The main content canvas (`#main-canvas`) MUST be an independent, vertically scrollable viewport containing all view containers (`#view-dashboard`, `#view1`, `#view2`, `#view3`, `#view4`, `#view5`, `#view6`).
- **REQ-SHELL-05**: Layout styling MUST strictly follow the `sea-portal-ui` design system: `--sp-purple` (`#7B47B8`), `--sp-purple-dark` (`#5C2E94`), `--sp-purple-soft` (`#F0E9F8`), `--sp-surface` (`#FFFFFF` / `#1A1922`), Geist font family for display and body, Geist Mono for codes, and neutral Latin American Spanish copy without voseo.

### 2.2 Institutional Dashboard Canvas (`view-dashboard`)
- **REQ-DASH-01**: The application MUST default to `#view-dashboard` upon initial load for all authenticated sessions unless a specific view is requested.
- **REQ-DASH-02**: `#view-dashboard` MUST display an institutional **Hero Banner** styled with an indigo/purple gradient (`linear-gradient(135deg, #1E1139 0%, #3B1F6A 50%, #4F2686 100%)`), containing:
  - Uppercase eyebrow: `PANEL INSTITUCIONAL • UNITEPC`.
  - Display title: `Resumen institucional completo`.
  - Subtitle: `Monitoreo del ciclo académico, cobertura curricular y avance de evaluaciones.`.
  - Interactive Sede and Gestión selectors.
  - Primary button: `Evaluaciones del Día`.
- **REQ-DASH-03**: `#view-dashboard` MUST display a two-column **Personalized Role & User Card**:
  - Left panel (`VISTA PERSONALIZADA POR CARGO`): active role badge and institutional access scope description.
  - Right panel (`USUARIO AUTENTICADO`): active user full name, CI, institutional email, and session indicator.
- **REQ-DASH-04**: `#view-dashboard` MUST display a **4-Metric KPI Grid** matching reference metrics:
  - Roles visibles: **2,597** (purple accent bar).
  - En planificación: **2,594** (teal accent bar).
  - En proceso: **0** (amber accent bar).
  - Calificadas: **0** (emerald accent bar).
- **REQ-DASH-05**: `#view-dashboard` MUST display a **Middle Section** with:
  - `INFORMACIÓN A TU ALCANCE`: active academic announcements, calendar milestones, and SEA Gateway sync health.
  - `ACCESOS DIRECTOS DE TU CARGO`: interactive shortcut tiles directly switching to `view1` (Carpeta Docente), `view2` (Supervisión Curricular), `view3` (Auditoría In Situ), and `view6` (Usuarios y accesos).
- **REQ-DASH-06**: `#view-dashboard` MUST display **Operational Metrics**:
  - Total evaluaciones (0), Turnos hoy (0), Variantes del examen (0), Cobertura de bancos (100%).

### 2.3 Global Navigation & Sidebar Modules
- **REQ-NAV-01**: The Global Sidebar MUST list the 13 canonical process modules in exact order:
  1. `Dashboard` (`layout-dashboard`) -> switches to `view-dashboard`.
  2. `Plan de Estudios` (`book-open`) -> switches to `view1`.
  3. `Banco de Preguntas` (`database`) -> feedback toast.
  4. `Lista de Evaluaciones` (`list-ordered`) -> feedback toast.
  5. `Rol de Exámenes` (`calendar-days`) -> feedback toast.
  6. `Servicios Académicos` (`cpu`) -> toggles SEA Gateway simulation with Live/Offline badge.
  7. `Salas Virtuales` (`monitor-play`) -> feedback toast.
  8. `Calificación OMR` (`scan-line`) -> feedback toast.
  9. `Administración de Evaluaciones` (`sliders-horizontal`) -> switches to `view2`.
  10. `Auditoría & Bitácora` (`scroll-text`) -> switches to `view3`.
  11. `Respaldos y contingencias` (`hard-drive-download`) -> feedback toast.
  12. `Reporte de Evaluaciones` (`file-spreadsheet`) -> switches to `view4`.
  13. `Usuarios y accesos` (`user-cog`) -> switches to `view6`.
- **REQ-NAV-02**: Active navigation items MUST display the canonical active visual state (`bg-[var(--sp-purple-soft)] text-[var(--sp-purple-dark)]` with purple icon) while non-active items display subdued ink color (`text-[var(--sp-ink-2)]` with hover surface).
- **REQ-NAV-03**: Clicking any navigation button MUST smoothly transition the main content canvas without page reloads.

### 2.4 Sidebar Rail Collapse & State Persistence
- **REQ-RAIL-01**: The sidebar header MUST provide a collapse toggle button (`#sidebar-collapse-btn`) with Lucide chevrons icon.
- **REQ-RAIL-02**: Toggling collapse MUST reduce width from 240px (`w-60`) to 76px (`w-20` / `sidebar-collapsed`), hiding text labels, badges, and security notice while keeping centered icons and tooltips visible.
- **REQ-RAIL-03**: Sidebar collapsed state MUST persist in browser storage under `localStorage['sp.sidebar.collapsed']` and restore automatically on subsequent sessions.

### 2.5 Security Notice & User Session Footer
- **REQ-SEC-01**: The sidebar MUST include a "Seguridad de la cuenta" card with a shield icon and advisory text (*"Por seguridad, cambia periódicamente tu contraseña y no la compartas."*), which opens the password update workflow upon click.
- **REQ-SEC-02**: The sidebar footer MUST render the authenticated user's circular avatar with initials (`#sidebar-user-avatar` / `#user-profile-avatar`), full name (`#sidebar-user-name` / `#user-profile-name`), and role/scope (`#sidebar-user-role` / `#user-profile-info`).
- **REQ-SEC-03**: The sidebar footer MUST provide a logout icon button invoking `window.logoutUser()`, clearing the active session and returning to the institutional login modal.

### 2.6 Global Top Header Controls
- **REQ-TOP-01**: Top Header MUST contain the institutional brand block: purple rounded icon with `graduation-cap`, title "Sistema de Evaluaciones", and subtitle "GESTIÓN INTEGRAL DEL PROCESO DE EVALUACIONES ACADÉMICAS".
- **REQ-TOP-02**: Top Header MUST contain the `+ Parametrizar vista` action button.
- **REQ-TOP-03**: Top Header MUST contain the `GESTIÓN: II-2026 (Activa)` calendar pill dropdown.
- **REQ-TOP-04**: Top Header MUST house the `#docente-api-selector` dropdown wired to the SEA Gateway API.
- **REQ-TOP-05**: Top Header MUST provide `#theme-toggle-btn` toggling light and dark themes via `window.toggleTheme()`.
- **REQ-TOP-06**: Top Header MUST display `#sea-gateway-status-container` with animated pulse dot and text (`SEA Live` / `Offline`).
- **REQ-TOP-07**: Top Header MUST provide `#user-profile-header-dropdown` displaying user avatar, name, role, and actions menu.

### 2.7 Contextual Carpeta Docente Sub-Rail (`view1`)
- **REQ-DOC-01**: When navigating to `view1`, the view container MUST render an internal contextual sub-panel dedicated solely to course and document management, stripped of duplicate institutional headers and footers.
- **REQ-DOC-02**: All legacy DOM elements and hooks queried by `app-controller.js` MUST be 100% preserved:
  - Dynamic subject container: `#sidebar-materias-container`.
  - Total workload badge: `#sidebar-summary-hours`.
  - Subject skeleton loader: `#sidebar-materias-skeleton`.
  - Document tabs: `#sidebar-tab-analitico`, `#sidebar-tab-pac-matrix`, `#sidebar-tab-cronograma-semanas`, `#sidebar-tab-cronograma-planes`.
  - Direct export buttons: `exportExactFile('docx')`, `exportExactFile('pac_cronograma_xlsx')`, `exportExactFile('planes_xlsx')`, and `openPdfPrintModal()`.
- **REQ-DOC-03**: Subject switching and document tab selection MUST continue to operate with full fidelity, updating reactive tables, matrices, and inline editors.

### 2.8 Print Isolation (`@media print`)
- **REQ-PRINT-01**: All shell elements including `#global-sidebar`, `.sp-topbar`, `#toast-container`, and `#view-dashboard` MUST be explicitly hidden during browser printing (`display: none !important;`).
- **REQ-PRINT-02**: The official document print container (`#print-official-folder-container`) MUST render completely isolated with pure white background, black serif typography, and strict 279mm page breaks.

---

## 3. Scenarios & Acceptance Criteria

### Scenario 1: Initial load displays canonical layout with global Top Header and Sidebar
- **Given** an authenticated user opens SISA 2.0 in their browser
- **When** the application completes DOM initialization
- **Then** the outer layout renders as an overflow-hidden flex container with a 240px wide `#global-sidebar` on the left and a 64px high `header.sp-topbar` on top
- **And** the experimental prototype dev bar (`btn-view1` through `btn-view6`) is no longer present in the DOM
- **And** all typography uses the Geist font family and institutional color tokens.

### Scenario 2: Main canvas default displays `view-dashboard` matching reference image
- **Given** the application is loaded on initial visit or user login
- **When** view visibility is determined
- **Then** `#view-dashboard` is displayed as active without the `.hidden` class
- **And** all other views (`#view1` through `#view6`) have the `.hidden` class applied
- **And** `#view-dashboard` displays:
  - The indigo/purple Hero Banner with "Resumen institucional completo" and Sede/Gestión selectors
  - The split card showing "VISTA PERSONALIZADA POR CARGO" and "USUARIO AUTENTICADO"
  - The 4 KPI cards showing 2,597 (Roles visibles), 2,594 (En planificación), 0 (En proceso), and 0 (Calificadas)
  - The middle row with "INFORMACIÓN A TU ALCANCE" and "ACCESOS DIRECTOS DE TU CARGO"
  - The bottom row with 4 operational metric cards.

### Scenario 3: Sidebar item selection switches views smoothly updating active item visual state
- **Given** the user is viewing `#view-dashboard` with `#nav-item-dashboard` styled with `.active`
- **When** the user clicks `#nav-item-view1` ("Plan de Estudios") in the global sidebar
- **Then** `#view-dashboard` is assigned class `.hidden` and `#view1` has class `.hidden` removed
- **And** `#nav-item-dashboard` loses its `.active` class and returns to default styling
- **And** `#nav-item-view1` receives the `.active` class with `bg-[var(--sp-purple-soft)] text-[var(--sp-purple-dark)]`
- **When** the user then clicks `#nav-item-view6` ("Usuarios y accesos")
- **Then** `#view1` is hidden, `#view6` is displayed, and `#nav-item-view6` becomes active
- **And** the admin user management table is loaded via `window.loadAdminUsers()`.

### Scenario 4: Sidebar collapse toggle collapses width to 76px rail with tooltip/icon state, persisting to `localStorage`
- **Given** the global sidebar is in its expanded 240px state (`w-60`)
- **When** the user clicks `#sidebar-collapse-btn`
- **Then** `#global-sidebar` toggles class `sidebar-collapsed`, changing its width to 76px (`w-20`)
- **And** labels with class `.sidebar-item-label`, `.sidebar-label-wrap`, and `.sidebar-security-card` are hidden from view
- **And** the collapse icon flips from `chevrons-left` to `chevrons-right`
- **And** `localStorage.getItem('sp.sidebar.collapsed')` is set to `"true"`
- **When** the page is reloaded
- **Then** the sidebar initializes directly in the 76px collapsed rail state.

### Scenario 5: Security card & User profile footer reflect authenticated user with session termination
- **Given** an authenticated user session for "Harold Marco Antonio Rojas Torres" (username `admin`, role `ROLE_ADMIN`)
- **When** `updateUserProfileUi()` executes
- **Then** the sidebar user profile avatar displays initials "HM" or "HI"
- **And** `#user-profile-name` / `#sidebar-user-name` displays "Harold Marco Antonio Rojas Torres" (or "Harold Iriarte")
- **And** `#user-profile-info` / `#sidebar-user-role` displays "Administrador del sistema • Sede Central"
- **When** the user clicks the "Seguridad de la cuenta" card
- **Then** the system opens the password update modal dialog
- **When** the user clicks the logout icon button (`onclick="window.logoutUser()"`)
- **Then** session tokens are invalidated and the institutional login modal (`#sisa-login-modal`) is presented.

### Scenario 6: Top Header controls remain fully functional
- **Given** the global top header is rendered at the top of the viewport
- **When** the user interacts with the top header controls:
  - Clicks `+ Parametrizar vista` -> a parameter configuration toast or modal is shown
  - Interacts with `GESTIÓN: II-2026 (Activa)` -> academic period selection is verified
  - Selects a different docente in `#docente-api-selector` -> triggers `onDocenteSelectorChange($event)` and fetches SEA Gateway data
  - Clicks `#theme-toggle-btn` -> toggles `document.documentElement` between light and dark themes
  - Clicks `#sea-gateway-status-container` -> triggers `window.toggleSeaGatewaySimulation()`, toggling between Live and Offline states
  - Clicks `#user-dropdown-btn` -> toggles `#user-dropdown-menu` with user credentials and action links
- **Then** each control performs its designated action without script errors.

### Scenario 7: Contextual Carpeta Docente rail in `view1` preserves all existing functionality without DOM regression
- **Given** the user navigates to `view1` ("Plan de Estudios")
- **When** the docente curriculum data is received from SEA Gateway
- **Then** `#sidebar-materias-container` populates with dynamic subject cards
- **And** `#sidebar-summary-hours` displays total assigned academic hours
- **When** the user switches between `#sidebar-tab-analitico`, `#sidebar-tab-pac-matrix`, `#sidebar-tab-cronograma-semanas`, and `#sidebar-tab-cronograma-planes`
- **Then** the active document panel changes instantly and the tab button highlights with purple accent
- **When** the user clicks any export button (`exportExactFile('docx')`, `exportExactFile('pac_cronograma_xlsx')`, `exportExactFile('planes_xlsx')`, or `openPdfPrintModal()`)
- **Then** the respective binary file generation and download executes successfully.

### Scenario 8: PDF print layout preserves `@media print` isolation without showing global sidebar or topbar
- **Given** the user is viewing any document in SISA 2.0
- **When** the user triggers the browser print dialog via `window.print()` or the official folder print modal
- **Then** `@media print` rules apply:
  - `#global-sidebar` is completely hidden (`display: none !important;`)
  - `header.sp-topbar` and `.no-print` elements are completely hidden
  - `#view-dashboard`, `#view1`, `#view2`, `#view3`, `#view4`, `#view5`, and `#view6` are hidden
  - Only `#print-official-folder-container` is visible and formatted to letter portrait pages
- **And** the exported document has zero visual contamination from the application shell.
