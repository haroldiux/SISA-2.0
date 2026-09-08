# Proposal: 09-portal-shell-layout-restructure

## Intent
Restructure the SISA 2.0 application layout (Top Header, Left Sidemenu, Sidebar Footer, and Main Content Canvas) into the canonical UNITEPC SEA Portal design system (`sea-portal-ui` / `unitepc-pro`) matching reference screenshot `media_1788880414905.png` (`planificacion.unitepc.edu.bo/dashboard`).

## Scope
### In Scope
- **Global Top Header (64px)**: Purple brand icon + "Sistema de Evaluaciones" / "GESTIÓN INTEGRAL DEL PROCESO DE EVALUACIONES ACADÉMICAS". Right: `+ Parametrizar vista`, `GESTIÓN: II-2026 (Activa)` dropdown, Docente selector, Theme switch, SEA Live status, and User menu.
- **Global Left Sidebar (240px / 76px rail)**:
  - Header: "MÓDULOS DEL PROCESO" + `<<` rail collapse toggle (`sp.sidebar.collapsed`).
  - 13 Process Modules: Dashboard, Plan de Estudios, Banco de Preguntas, Lista de Evaluaciones, Rol de Exámenes, Servicios Académicos [Live badge], Salas Virtuales, Calificación OMR, Administración de Evaluaciones, Auditoría & Bitácora, Respaldos y contingencias, Reporte de Evaluaciones, Usuarios y accesos.
  - Bottom Security Card: "Seguridad de la cuenta" (shield icon, security notice).
  - Bottom User Profile Bar: Circle avatar initials ("HM"), user name, role, and logout button.
- **Main Canvas (`view-dashboard`)**:
  - Deep Indigo/Purple Hero Banner (`Resumen institucional completo`, Sede & Gestión selectors, `Evaluaciones del Día` button).
  - Sub-header Card: `VISTA PERSONALIZADA POR CARGO` + `USUARIO AUTENTICADO` box.
  - 4-card KPI grid: Roles visibles (2,597), En planificación (2,594), En proceso (0), Calificadas (0).
  - Middle Row: `INFORMACIÓN A TU ALCANCE` + `ACCESOS DIRECTOS DE TU CARGO`.
  - Bottom Row: Total evaluaciones, Turnos hoy, Variantes del examen, Cobertura de bancos.
- **Decouple `view1`**: Retain contextual subject sub-rail and document tabs; strip duplicate outer headers/sidebars. Remove duplicate sidebars in `view2`–`view5`.
- **Navigation Wiring (`app-controller.js`)**: Default to `view-dashboard`, wire sidebar items (Dashboard -> `view-dashboard`, Plan de Estudios -> `view1`, Usuarios y accesos -> `view6`), manage active link state and collapse rail toggle.

### Out of Scope
- Rewriting underlying business logic of Word/Excel/PDF exports.
- Standalone implementations for future unbuilt modules (provide toast/placeholder or route to relevant view).

## Approach
**Option A (In-Place Canonical Shell Extraction)**: Extract sidebar and header into the outer layout, create `view-dashboard` as a first-class view, and retain `view1`'s contextual rail to guarantee zero business logic regressions.

## Affected Areas
- `sisa-frontend/src/app/app.component.html`
- `sisa-frontend/src/assets/app-controller.js`
- `sisa-frontend/src/styles.scss`

## Risks and Mitigations
- **DOM ID Breakage in `app-controller.js`**: Audit and preserve all queried IDs (`#user-profile-*`, `#sidebar-materias-*`, `#sidebar-sea-*`).
- **Print/PDF Export Leakage**: Mark `#global-sidebar` and header with `.no-print` and isolate `#print-official-folder-container`.

## Rollback Plan
Revert changes to `app.component.html`, `app-controller.js`, and `styles.scss` via Git.

## Success Criteria
- Root view renders canonical Dashboard matching `media_1788880414905.png`.
- Sidebar switches views seamlessly and collapses to 76px rail with state persistence.
- Document editing, DOCX/Excel exports, and RBAC admin operate without regressions.
