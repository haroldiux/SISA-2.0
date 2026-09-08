# Specification: UNITEPC SEA Portal Shell Architecture & Institutional Layout

## 1. Overview & Purpose
This specification defines the canonical UNITEPC SEA Portal shell architecture (`sea-portal-ui` / `unitepc-pro`) for SISA 2.0. It governs the persistent outer shell layout consisting of a Global Left Sidebar (240px wide, collapsible to 76px rail), a Global Top Header (64px fixed height), the default institutional landing canvas (`view-dashboard`), decoupled module view routing, contextual workspaces (e.g., Carpeta Docente in `view1`), user session indicators, and strict print isolation.

## 2. Shell Architecture & Requirements

### 2.1 Canonical Shell Architecture
- **Root Layout (`sp-shell`)**: The application root container spans 100vw and 100vh with overflow hidden, preventing full-window scrolling.
- **Global Sidebar (`#global-sidebar`)**: Left persistent navigation bar with 240px default width (`w-60`), collapsible to 76px rail (`w-20` / `.sidebar-collapsed`).
- **Global Top Header (`header.sp-topbar`)**: Fixed 64px height (`h-16`) housing institutional identity, global academic period controls, theme switcher, docente selector, SEA Gateway status, and user profile trigger.
- **Main Content Canvas (`#main-canvas`)**: Vertically scrollable independent viewport hosting all views (`view-dashboard`, `view1` through `view6`).
- **Design Tokens & Typography**: Strict compliance with `sea-portal-ui`: `--sp-purple` (`#7B47B8`), `--sp-purple-dark` (`#5C2E94`), `--sp-purple-soft` (`#F0E9F8`), `--sp-teal` (`#1F9FAD`), `--sp-surface` (`#FFFFFF` / `#1A1922`), Geist typography, and neutral Latin American Spanish copy.

### 2.2 Institutional Dashboard Canvas (`view-dashboard`)
- **Default Landing**: The application defaults to `#view-dashboard` upon initial load and authentication.
- **Hero Banner**: Deep Indigo/Purple gradient (`linear-gradient(135deg, #1E1139 0%, #3B1F6A 50%, #4F2686 100%)`) featuring "PANEL INSTITUCIONAL • UNITEPC", "Resumen institucional completo", Sede & Gestión selectors, and "Evaluaciones del Día" action button.
- **Personalized Role & User Card**: Two-column card detailing role context ("VISTA PERSONALIZADA POR CARGO") and active authenticated user ("USUARIO AUTENTICADO", CI, institutional email, session status).
- **4-Metric KPI Grid**: Canonical metrics with color accents: Roles Visibles (2,597 - purple), En Planificación (2,594 - teal), En Proceso (0 - amber), Calificadas (0 - emerald).
- **Information & Direct Action Shortcuts**: "INFORMACIÓN A TU ALCANCE" (announcements and SEA Gateway sync health) and "ACCESOS DIRECTOS DE TU CARGO" (direct links to Carpeta Docente, Supervisión Carrera, Auditoría In Situ, Usuarios y RBAC).
- **Operational Metrics**: Total evaluaciones, Turnos hoy, Variantes del examen, Cobertura de bancos (100%).

### 2.3 Global Navigation & Process Modules
- **13 Process Modules**: The Global Sidebar renders the 13 canonical process modules in sequence:
  1. `Dashboard` (`layout-dashboard`) -> switches to `view-dashboard`
  2. `Plan de Estudios` (`book-open`) -> switches to `view1`
  3. `Banco de Preguntas` (`database`) -> action toast
  4. `Lista de Evaluaciones` (`list-ordered`) -> action toast
  5. `Rol de Exámenes` (`calendar-days`) -> action toast
  6. `Servicios Académicos` (`cpu`) -> toggles SEA Gateway simulation with Live/Offline badge
  7. `Salas Virtuales` (`monitor-play`) -> action toast
  8. `Calificación OMR` (`scan-line`) -> action toast
  9. `Administración de Evaluaciones` (`sliders-horizontal`) -> switches to `view2`
  10. `Auditoría & Bitácora` (`scroll-text`) -> switches to `view3`
  11. `Respaldos y contingencias` (`hard-drive-download`) -> action toast
  12. `Reporte de Evaluaciones` (`file-spreadsheet`) -> switches to `view4`
  13. `Usuarios y accesos` (`user-cog`) -> switches to `view6`
- **Active Navigation State**: Active items display canonical visual styling (`bg-[var(--sp-purple-soft)] text-[var(--sp-purple-dark)]` with purple icon).
- **Client-side View Switching**: Smooth view toggling without page reloading via `window.switchView(viewId)`.

### 2.4 Sidebar Rail Collapse & State Persistence
- **Rail Toggle**: Sidebar header includes a toggle button (`#sidebar-collapse-btn`) with Lucide chevrons.
- **Collapsed Mode**: Reduces width from 240px to 76px, hiding labels and cards while centering icons.
- **Persistence**: Collapsed state persists in `localStorage['sp.sidebar.collapsed']` and auto-restores on session initialization.

### 2.5 Security Notice & User Session Footer
- **Account Security Notice**: Sidebar includes "Seguridad de la cuenta" card prompting secure password management.
- **Session Profile Footer**: Renders authenticated user initials avatar, full name, and role/scope.
- **Logout Action**: Provides direct logout trigger invoking session invalidation and presenting login modal.

### 2.6 Global Top Header Controls
- **Institutional Brand**: Purple brand icon with `graduation-cap`, "Sistema de Evaluaciones" title, and uppercase institutional subtitle.
- **Top Controls**: `+ Parametrizar vista` button, `GESTIÓN: II-2026 (Activa)` dropdown pill, `#docente-api-selector` dropdown, `#theme-toggle-btn` (light/dark switcher), `#sea-gateway-status-container` (Live/Offline indicator), and `#user-profile-header-dropdown` menu.

### 2.7 Contextual Carpeta Docente Workspace (`view1`)
- **Decoupled Inner Rail**: `view1` renders an internal contextual course sub-rail (`Mis Carreras & Cátedras`, 4 document tabs, direct export actions) stripped of duplicate institutional headers.
- **DOM Stability**: Fully preserves legacy hooks (`#sidebar-materias-container`, `#sidebar-summary-hours`, `#sidebar-tab-analitico`, `#sidebar-tab-pac-matrix`, `#sidebar-tab-cronograma-semanas`, `#sidebar-tab-cronograma-planes`, and office export buttons).

### 2.8 Print Isolation (`@media print`)
- **Shell Hidden in Print**: `#global-sidebar`, `.sp-topbar`, and non-printable canvases are strictly hidden (`display: none !important;`).
- **Clean Document Output**: `#print-official-folder-container` isolates with pure white background and 279mm letter portrait page breaks.

## 3. Given/When/Then Scenarios

### Scenario 1: Initial load displays canonical layout with global Top Header and Sidebar
**Given** an authenticated user opens SISA 2.0  
**When** the application completes DOM initialization  
**Then** the outer layout renders as an overflow-hidden flex container with a 240px wide `#global-sidebar` and 64px `header.sp-topbar`  
**And** prototype dev buttons are removed and Geist typography is applied.

### Scenario 2: Main canvas defaults to `view-dashboard`
**Given** the application loads or user logs in  
**When** view visibility is initialized  
**Then** `#view-dashboard` is displayed as active (no `.hidden` class)  
**And** all other views are hidden  
**And** the Hero banner, split role/user cards, 4 KPI stats (2,597 / 2,594 / 0 / 0), middle section, and operational metrics are rendered matching canonical specs.

### Scenario 3: Sidebar item selection switches views smoothly
**Given** the user is viewing `#view-dashboard`  
**When** the user clicks `#nav-item-view1` ("Plan de Estudios")  
**Then** `#view-dashboard` is hidden and `#view1` is displayed  
**And** `#nav-item-view1` receives the active highlight  
**When** the user clicks `#nav-item-view6` ("Usuarios y accesos")  
**Then** `#view1` is hidden, `#view6` is displayed, and `window.loadAdminUsers()` executes.

### Scenario 4: Sidebar rail collapse and persistence
**Given** the sidebar is expanded (240px)  
**When** the user clicks `#sidebar-collapse-btn`  
**Then** the sidebar collapses to 76px, hiding labels and centering icons  
**And** `localStorage['sp.sidebar.collapsed']` is set to `"true"`  
**When** the page is reloaded  
**Then** the sidebar initializes directly in the 76px collapsed state.

### Scenario 5: User profile footer and security modal
**Given** an authenticated user session  
**When** `updateUserProfileUi()` runs  
**Then** sidebar footer and top header dropdown display user initials, full name, and role  
**When** the user clicks "Seguridad de la cuenta", the password change modal opens  
**When** the user clicks logout, session tokens are cleared and the login modal appears.

### Scenario 6: Top Header controls operation
**Given** the global top header is rendered  
**When** the user interacts with docente selector, theme toggle, or SEA status indicator  
**Then** each control executes its action (switching docente, toggling light/dark theme, toggling SEA gateway simulation) without error.

### Scenario 7: Carpeta Docente sub-rail stability
**Given** the user navigates to `view1`  
**When** docente data loads from SEA Gateway  
**Then** `#sidebar-materias-container` renders course cards, tabs switch documents, and DOCX/XLSX/PDF exports function without regression.

### Scenario 8: Print layout isolation
**Given** the user triggers browser print  
**When** `@media print` rules apply  
**Then** `#global-sidebar`, `.sp-topbar`, and all views are hidden, leaving only `#print-official-folder-container` on letter portrait pages.
