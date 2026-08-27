# Specification: 02-office-ingestion-and-live-sync

## 1. Metadata
- **Change Name**: `02-office-ingestion-and-live-sync`
- **Project**: SISA (Sistema Integrado de Seguimiento Académico)
- **Author**: GentleAI SISA Architecture Team
- **Date**: 2026-08-25
- **Status**: SPECIFIED
- **Store Mode**: Hybrid (`openspec/changes/02-office-ingestion-and-live-sync/spec.md` + Engram)
- **Standards & Conventions**: SEA Coding Standards (`.atl/conventions-frontend.md`, `.atl/conventions-backend.md`)
- **RFC 2119 Conformance**: Requirements use MUST, SHALL, SHOULD, MAY keywords.

---

## 2. Executive Summary & Architecture Overview
This specification defines the functional, technical, and architectural requirements for change `02-office-ingestion-and-live-sync`. It provides unambiguous behavioral rules, algorithmic data transformations, REST API contracts, state transition guarantees, and Given/When/Then acceptance scenarios across five core domains:
1. **`office-engine-dynamic`**: Ingestion, parsing, and high-fidelity cloning of institutional UNITEPC base files (`.docx`, `.xlsx`), powered by `DynamicRowShifter` supporting variable units (1..12), variable sessions (10..80), variable pedagogical moments (3..10), style/border/font preservation, merged header translation, and dynamic formula shifting.
2. **`rest-api-live-sync`**: End-to-end REST API specification covering `/api/v1/planificaciones/**`, `/api/v1/office/export/**`, `/api/v1/office/import/**`, `/api/v1/academic/**`, `/api/v1/auditorias/**` and dual-mapped `/api/v1/system/**` aliases wrapped in standard `ResourceBuilder<T>` and `ResourcesBuilder<T>` envelopes.
3. **`workflow-state-machine`**: Deterministic lifecycle state machine for academic planning (`BORRADOR` -> `ENVIADO_REVISION` -> `APROBADO` / `OBSERVADO` / `RECHAZADO`), persistent observation notes, and role-based execution guards.
4. **`in-situ-audit-scoring`**: Real-time active class radar matching, live PAC topic concordance scoring (`TOTAL` [100%], `PARCIAL` [75%], `DESVIADO` [50%], `NO_CORRESPONDE` [0%]), didactic checklist, SHA-256 cryptographic digital signature generation, and 3-strike disciplinary recurrence escalation.
5. **`frontend-live-binding`**: Angular 16+ architecture conforming to SEA conventions (`scu-` prefixes, command/HTTP pipeline separation, `_initialize()` / `_finalize()` lifecycle hooks, RxJS `takeUntil` memory leak prevention, and Nginx `/api/` reverse proxy live data synchronization).

---

## 3. Domain 1: `office-engine-dynamic` Specification

### 3.1 Requirements
- **REQ-OFF-001**: The system MUST ingest and parse institutional Microsoft Excel (`.xlsx`) and Word (`.docx`) files matching the structures found in `DOCUMENTOS BASE/`:
  - `PAC TALLER DE IDIOMAS.xlsx` (Matriz 7 curriculum planning)
  - `PLAN DE CLASES TALLER DE IDIOMAS.xlsx` (Micro-planning moments)
  - `Programa Analitico PROGRAMACION III.docx` (Competencies, units, and APA bibliography)
- **REQ-OFF-002**: The `DynamicRowShifter` engine MUST dynamically shift existing rows and replicate prototype rows in Excel worksheets when the dataset size $N$ exceeds the template's static placeholder row count $K$.
- **REQ-OFF-003**: When inserting $M = N - K$ rows at index $R_{start}$, `DynamicRowShifter` MUST execute `sheet.shiftRows(R_{start}, R_{last}, M, true, false)` and replicate:
  - Font family, size, bold/italic style, and color.
  - Cell background fill pattern and foreground RGB/indexed color.
  - Cell borders (Top, Bottom, Left, Right, Medium, Thin, Double) and border colors.
  - Cell vertical and horizontal alignments, text wrapping, and indentation.
  - Cell data formats (e.g. `@`, `0`, `0.00`, `YYYY-MM-DD`).
  - Row heights matching the prototype row.
- **REQ-OFF-004**: `DynamicRowShifter` MUST calculate and re-register merged cell regions (`CellRangeAddress`) for newly cloned rows whenever the prototype row spans multiple columns.
- **REQ-OFF-005**: `DynamicRowShifter` MUST adjust cell formula coordinates when shifting rows. Any Excel formula referencing shifted ranges (e.g. `=SUM(B15:B25)`) MUST be dynamically translated to reflect expanded ranges (e.g. `=SUM(B15:B75)`).
- **REQ-OFF-006**: The Word cloner (`DocxTemplateCloner`) MUST perform recursive placeholder replacement (`${KEY}`) across all document paragraphs, tables, table cells, headers, and footers without losing paragraph runs or font stylings.
- **REQ-OFF-007**: `DocxTemplateCloner` MUST dynamically inject table rows for learning units (1 to 12 units) and bibliography entries (basic and complementary) while maintaining table border styling and cell margins.
- **REQ-OFF-008**: The ingestion parsers (`PacExcelParser`, `PlanesClaseExcelParser`, `ProgramaAnaliticoDocxParser`) MUST support graceful degradation: if an optional cell is empty or contains whitespace, a valid default value MUST be supplied without throwing null pointer exceptions.

### 3.2 DynamicRowShifter Mathematical Model
Let $R_0$ be the prototype row index, $R_{start} = R_0 + 1$ the insertion point, and $M$ the number of rows to insert.
For each row index $r \in [R_{start}, R_{start} + M - 1]$:
1. $\text{Height}(r) \leftarrow \text{Height}(R_0)$
2. For each column $c \in [0, C_{max}-1]$:
   - $\text{Style}(r, c) \leftarrow \text{Style}(R_0, c)$
   - $\text{CellType}(r, c) \leftarrow \text{CellType}(R_0, c)$
3. For each merged region $A = (r_{top}, r_{bot}, c_{left}, c_{right})$ where $r_{top} = R_0$ and $r_{bot} = R_0$:
   - Register new merged region $A' = (r, r, c_{left}, c_{right})$ in $\text{Sheet}$.
4. For each formula cell in the worksheet containing a reference $Ref = (col, r_{target})$ where $r_{target} \ge R_{start}$:
   - Update $r_{target}' \leftarrow r_{target} + M$.

---

## 4. Domain 2: `rest-api-live-sync` Specification

### 4.1 Requirements
- **REQ-API-001**: All REST endpoints MUST return responses wrapped in the canonical SEA envelope structure:
  - Single Resource: `ResourceBuilder<T>` containing `data: T`, `message: String`, `status: int`, `timestamp: OffsetDateTime`.
  - Resource Collections: `ResourcesBuilder<T>` containing `data: List<T>`, `message: String`, `status: int`, `total: int`, `timestamp: OffsetDateTime`.
- **REQ-API-002**: The backend MUST expose the following canonical endpoints under `/api/v1/`:
  - Planning: `/api/v1/planificaciones/pac`, `/api/v1/planificaciones/pac/{id}`, `/api/v1/planificaciones/pac/by-assignment/{id}`, `/api/v1/planificaciones/pac/{id}/review`, `/api/v1/planificaciones/programa-analitico`, `/api/v1/planificaciones/programa-analitico/by-assignment/{id}`, `/api/v1/planificaciones/plan-clase`, `/api/v1/planificaciones/plan-clase/by-session/{id}`.
  - Office: `/api/v1/office/export/pac/{id}`, `/api/v1/office/export/plan-clase/{sesionId}`, `/api/v1/office/export/programa-analitico/{asignacionId}`, `/api/v1/office/import/pac`, `/api/v1/office/import/plan-clase`, `/api/v1/office/import/programa-analitico`.
  - Academic: `/api/v1/academic/assignments`, `/api/v1/academic/carreras`, `/api/v1/academic/gestiones`, `/api/v1/academic/sedes`.
  - Auditorías: `/api/v1/auditorias/in-situ/match`, `/api/v1/auditorias/in-situ/finalize`, `/api/v1/auditorias/in-situ/{id}/sign`, `/api/v1/auditorias/recurrence`.
- **REQ-API-003**: The backend MUST maintain backward-compatible dual routing mapping `/api/v1/system/**` aliases to prevent disruption to existing clients.
- **REQ-API-004**: All mutating requests (`POST`, `PUT`, `DELETE`) MUST validate request payloads with Jakarta `@Valid` annotations and reject invalid payloads with `400 BAD REQUEST` or `422 UNPROCESSABLE ENTITY`.
- **REQ-API-005**: All secure endpoints MUST require a valid JWT token via `Authorization: Bearer <token>` header. The token MUST contain `sub` (username), `userId`, `sedeId`, and `roles`.
- **REQ-API-006**: When `X-Tenant-Sede` header is present, JPA queries MUST automatically apply `SedeTenantSpecification` to restrict data access to the requested campus tenant.

---

## 5. Domain 3: `workflow-state-machine` Specification

### 5.1 Requirements
- **REQ-WFL-001**: Academic planning entities (`Pac`, `ProgramaAnalitico`, `PlanDeClase`) MUST adhere to the following finite state machine states:
  - `BORRADOR`: Editable by Docente; not visible on approval desk.
  - `ENVIADO_REVISION`: Locked for editing by Docente; visible on Career Director review desk.
  - `OBSERVADO`: Unlocked for correction by Docente; contains mandatory observation comments.
  - `APROBADO`: Read-only for all roles; eligible for in situ audit verification.
  - `RECHAZADO`: Terminal or rework state requiring explicit administrative re-initialization.
- **REQ-WFL-002**: Permitted state transitions MUST strictly follow the transition table:

| Current State | Target State | Triggering Action | Allowed Roles | Guard Conditions |
| :--- | :--- | :--- | :--- | :--- |
| `[*]` (None) | `BORRADOR` | Initial Save or Ingestion | `DOCENTE`, `DIR_CARRERA` | Active assignment exists |
| `BORRADOR` | `BORRADOR` | Update Draft | `DOCENTE` | Assignment matches logged user |
| `BORRADOR` | `ENVIADO_REVISION` | Submit for Review | `DOCENTE` | Matriz 7 has $\ge 1$ sessions |
| `OBSERVADO` | `ENVIADO_REVISION` | Re-submit Corrected Dossier | `DOCENTE` | Corrections addressed |
| `ENVIADO_REVISION` | `APROBADO` | Approve Planning | `DIR_CARRERA`, `DIR_ACADEMICA` | Syllabus verified |
| `ENVIADO_REVISION` | `OBSERVADO` | Request Observations | `DIR_CARRERA`, `DIR_ACADEMICA` | `observaciones` is not empty |
| `ENVIADO_REVISION` | `RECHAZADO` | Reject Planning | `DIR_CARRERA`, `DIR_ACADEMICA` | `observaciones` is not empty |
| `APROBADO` | `APROBADO` | In-Situ Audit Pass | System / `DIR_ACADEMICA` | Status remains immutable |

- **REQ-WFL-003**: When transitioning to `OBSERVADO` or `RECHAZADO`, the `observacionesRevision` property MUST NOT be null or blank (minimum 10 characters).
- **REQ-WFL-004**: The system MUST audit every state change by recording `revisadoPorId`, `revisadoEn` timestamp, and previous state.

---

## 6. Domain 4: `in-situ-audit-scoring` Specification

### 6.1 Requirements
- **REQ-AUD-001**: The Active Class Radar MUST locate scheduled classes dynamically by querying:
  - `campusId` (Long)
  - `aula` (String, e.g. "Aula 302", "Lab Redes")
  - `dia` (Day of week: `LUNES`, `MARTES`, `MIERCOLES`, `JUEVES`, `VIERNES`, `SABADO`)
  - `hora` (LocalTime, defaulting to server local time if omitted).
- **REQ-AUD-002**: When an active class is matched, the radar MUST retrieve:
  - Assigned Docente details and course name.
  - Approved PAC Matriz 7 session scheduled for the current date/week.
  - Scheduled thematic unit (`unidadTematica`), specific content (`contenidoEspecifico`), and didactic moment.
- **REQ-AUD-003**: The in situ audit evaluation MUST record:
  - `puntualidadDocente`: `PUNTUAL` (100%), `ATRASO_LEVE` (1..15 min, 80%), `ATRASO_GRAVE` (>15 min, 0%), `AUSENTE` (0%).
  - `concordanciaTema`:
    - `CONFORME_PAC` (Topic corresponds exactly to scheduled Matriz 7 session $\rightarrow$ 100% concordance).
    - `TEMA_ADELANTADO` (Topic is advanced by $\le 1$ session with pedagogical justification $\rightarrow$ 75% concordance).
    - `TEMA_ATRASADO` (Topic is delayed by $\le 1$ session with pacing justification $\rightarrow$ 75% concordance).
    - `TEMA_NO_PLANIFICADO` (Topic has no correlation with approved syllabus $\rightarrow$ 0% concordance / Non-conforming).
  - `momentoObservado`: `INICIO`, `DESARROLLO`, `CIERRE`.
  - `recursosVerificados`: Array of checked didactic resources.
  - `estudiantesPresentes` and `estudiantesInscritos`, automatically computing $\text{asistencia} = \frac{\text{presentes}}{\text{inscritos}} \times 100$.
- **REQ-AUD-004**: The audit completion engine MUST compute an immutable SHA-256 digital signature:
  $$\text{Hash} = \text{SHA256}(\text{asignacionId} \parallel \text{auditorId} \parallel \text{timestamp} \parallel \text{puntualidad} \parallel \text{concordancia} \parallel \text{momento})$$
  and persist the resulting hex digest in `hash_firma_digital`.
- **REQ-AUD-005**: The system MUST implement an automatic 3-Strike Disciplinary Recurrence Escalator whenever an audit concludes with non-conforming status (`AUSENTE`, `ATRASO_GRAVE`, or `TEMA_NO_PLANIFICADO`):
  - **Strike 1 (`NIVEL_1`)**: `nroInfraccion = 1`, `estado = 'NOTIFICADO'`. Issues an automated formal verbal warning notification.
  - **Strike 2 (`NIVEL_2`)**: `nroInfraccion = 2`, `estado = 'PLAN_ACCION_REQUERIDO'`. Issues a written reprimand requiring the teacher to submit a Remedial Action Plan (`PlanAccionMejora`) within 5 business days.
  - **Strike 3 (`NIVEL_3`)**: `nroInfraccion \ge 3`, `estado = 'ESCALADO_VICERRECTORADO'`. Automatically flags the teacher file and escalates disciplinary proceedings to Regional and National Vice-rectors.
- **REQ-AUD-006**: The Docente MUST be able to register digital acknowledgment and discharge via `POST /api/v1/auditorias/in-situ/{id}/sign` with `conformidadDocente` (`CONFORME` / `CON_OBSERVACIONES`) and optional `observacionesDocente`.

---

## 7. Domain 5: `frontend-live-binding` Specification

### 7.1 Requirements
- **REQ-FE-001**: All Angular 16+ modules, components, services, commands, directives, pipes, models, and enums MUST adhere to the SEA naming convention:
  - Class prefix: `Scu` (e.g. `ScuAuditHttpService`, `ScuPacSaveCmd`, `ScuHeaderComponent`).
  - File naming: `scu-<feature>.<type>.ts` (e.g. `scu-pac.model.ts`, `scu-audit.http.ts`, `scu-pac-save.cmd.ts`).
  - Component selector: `<scu-<name>>` (e.g. `<scu-active-classes-radar>`).
- **REQ-FE-002**: Every Angular component MUST encapsulate lifecycle logic into private methods:
  - `public ngOnInit(): void { this._initialize(); }`
  - `public ngOnDestroy(): void { this._finalize(); }`
  - Teardown of all active RxJS subscriptions MUST use `private readonly _destroy$ = new Subject<void>();` and `.pipe(takeUntil(this._destroy$))`.
- **REQ-FE-003**: The frontend architecture MUST maintain strict separation of concerns:
  - **HTTP Services (`*.http.ts`)**: Pure network transport returning raw RxJS `Observable<{ data: T }>`.
  - **Commands (`*.cmd.ts`)**: Encapsulates business logic, state mutations, validations, user notifications, and HTTP orchestration.
  - **Components (`*.component.ts`)**: Presentation and user interaction only; delegates mutating workflows to Commands.
- **REQ-FE-004**: Network communication with backend services in containerized environments MUST route through the Nginx reverse proxy prefix `/api/` (proxied to `http://backend:8080/api/`).
- **REQ-FE-005**: `ScuJwtInterceptor` MUST inject `Authorization: Bearer <token>` into every outgoing HTTP request and include `X-Tenant-Sede: <sedeId>` when a campus is selected.
- **REQ-FE-006**: When file upload operations occur (PAC, Plan de Clase, Programa Analítico), the UI MUST display a live upload progress bar and immediately populate reactive form controls upon successful response parsing without requiring a full page refresh.
