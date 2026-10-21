# Tasks: 11 Career Director Curricular Supervision, Ingestion & Certification Module

**Change ID**: `11-career-director-supervision-module`  
**Topic**: Curricular Supervision and Endorsement Module for Career Directors (`ROLE_DIR_CARRERA`) in SISA Platform Shell (`view2`)  
**Status**: Ready for Implementation  
**Artifact Mode**: `openspec` markdown persistence  
**Pilot Configuration**:
- **Career**: Ingeniería de Sistemas (`CARSIS`, SEA UUID `648febfd-dc79-4dd8-a8aa-dc7549ef649b`)
- **Campus**: Sede Central Cochabamba (SEA Gateway Branch UUID `ea4fb26e-11a9-452f-9bae-4962de2dd931`)
- **Persona**: `dir.carrera.sis` (**Lic. Mariana Rios Vargas**)
- **Academic Term**: Gestión `II-2026` / `2-2026` (Activa)

**Target Files**:
- Backend:
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuPlanningController.java`
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuReviewPacCmd.java`
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuGetPacByCarreraCmd.java` *(New)*
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuBatchReviewPacCmd.java` *(New)*
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/request/ScuPacBatchReviewRequest.java` *(New)*
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/response/ScuPacBatchReviewResponse.java` *(New)*
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/repository/PacRepository.java`
- Frontend:
  - `sisa-frontend/src/app/app.component.html`
  - `sisa-frontend/src/assets/app-controller.js`
  - `sisa-frontend/src/app/modules/secure/career-oversight/http/scu-career-oversight.http.ts`
  - `sisa-frontend/src/app/modules/secure/career-oversight/commands/scu-pac-review.cmd.ts`
  - `sisa-frontend/src/app/modules/secure/career-oversight/commands/scu-pac-review.cmd.spec.ts`
  - `sisa-frontend/src/app/modules/secure/career-oversight/components/scu-pac-review-modal/scu-pac-review-modal.component.ts`

---

## Phase 1: Career-Scoped Catalog & Semester Ingestion in view2

- [x] 1.1 Backend: Expose Career PAC Status Query Endpoint
  - [x] 1.1.1 Create command [`ScuGetPacByCarreraCmd.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuGetPacByCarreraCmd.java) querying persistent PAC records via [`PacRepository.findByCarreraAndGestion`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/repository/PacRepository.java#L29-L30).
  - [x] 1.1.2 Expose `GET /api/v1/planificaciones/pac/by-carrera/{carreraId}?gestionId={gestionId}` in [`ScuPlanningController.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuPlanningController.java) secured with `@PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_VICERRECTOR_SEDE', 'ROLE_VICERRECTOR_NACIONAL', 'ROLE_ADMIN')")`.
  - [x] 1.1.3 Implement resilient auto-provisioning fallback in `ScuGetPacByCarreraCmd`: if a course code returned by SEA Gateway lacks an existing PAC entity, link or initialize a provisional PAC in `ENVIADO_REVISION` state so the director can review without error.
  - [x] 1.1.4 Map PAC review audit metadata into response DTO (`revisadoPorId`, `revisadoPorNombre`, `revisadoEn`, `observacionesRevision`, `estado`, `matriz7Count`).

- [x] 1.2 Frontend: Identity Binding & Career Switcher in Portal Shell
  - [x] 1.2.1 Enforce default identity binding for persona `dir.carrera.sis` (`ROLE_DIR_CARRERA`) to `CARSIS` (**Ingeniería de Sistemas**, UUID `648febfd-dc79-4dd8-a8aa-dc7549ef649b`) and Sede Central Cochabamba (`ea4fb26e-11a9-452f-9bae-4962de2dd931`) upon login or persona selection in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js#L7093-L7105).
  - [x] 1.2.2 Add dynamic career switcher dropdown in `#view2` header in [`app.component.html`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L2306-L2320) visible exclusively for elevated multi-career roles (`ROLE_DIR_ACADEMICA`, `ROLE_VICERRECTOR_SEDE`, `ROLE_VICERRECTOR_NACIONAL`, `ROLE_ADMIN`).
  - [x] 1.2.3 Implement switcher handler `window.onSupervisionCareerChange(careerCode)` in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js) allowing seamless switching between `CARSIS` (Sistemas), `CARELE` (Electrónica), `CARMED` (Medicina), and `CARDER` (Derecho).

- [x] 1.3 Frontend: Curricular Ingestion & 0ms Cache-Aside Engine
  - [x] 1.3.1 Maintain 0ms Cache-Aside strategy using browser LocalStorage key `sisa_cache_supervision_groups_{careerCode}` in `window.renderSupervisionCurricular` to immediately render cached groups with zero layout shift.
  - [x] 1.3.2 Dispatch parallel asynchronous background fetch to SEA Gateway `/api/v1/catalogo-academico/groups?term=2-2026&branchOfficeId={branchId}&careerId={careerId}` to synchronize live academic offerings and silently update local cache.
  - [x] 1.3.3 Fetch persistent PAC statuses from backend REST endpoint `GET /api/v1/planificaciones/pac/by-carrera/{careerId}?gestionId=1` to hydrate course states (`APROBADO`, `EN_REVISION`, `OBSERVADO`, `PENDIENTE`) directly from PostgreSQL.

- [x] 1.4 Frontend: 8-Semester Accordion Hierarchy & Real-Time KPI Toolbar
  - [x] 1.4.1 Group ingested courses into 8 semester accordions (1º through 8º Semestre) using [`window.getCourseSemester`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js#L7005-L7087) mapping codes `SIS-101` through `SIS-800` series.
  - [x] 1.4.2 Compute and bind real-time aggregate KPI metrics in `#view2` toolbar:
    - `#supervision-count-all`: Total distinct curricular subjects.
    - `#supervision-count-approved`: Count of subjects in `APROBADO` status.
    - `#supervision-count-pending`: Count of subjects in `EN_REVISION` or `PENDIENTE` status.
    - `#supervision-count-observed`: Count of subjects in `OBSERVADO` status.
    - `#supervision-compliance-pct`: Calculated as $\frac{\text{Aprobados}}{\text{Total}} \times 100$ formatted to 1 decimal place.
  - [x] 1.4.3 Wire filter tab buttons (`#supervision-btn-all`, `#supervision-btn-approved`, `#supervision-btn-pending`, `#supervision-btn-observed`) with active button styling and smooth accordion item filtering.
  - [x] 1.4.4 Render per-semester progress badge in accordion header showing validated count (e.g. *“4 de 5 validadas”*), compliance percentage pill, and overall semester status tag (`APROBADO`, `CON OBSERVACIONES`, `EN REVISIÓN`, `PENDIENTE`).

---

## Phase 2: Institutional Pedagogical Review Modal & REST Visa Wiring

- [x] 2.1 Frontend: Build Institutional Modal `#modal-pac-review` in `app.component.html`
  - [x] 2.1.1 Construct modal dialog `#modal-pac-review` in [`sisa-frontend/src/app/app.component.html`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html) using Tailwind CSS and dark-mode styling (`bg-slate-950/70 backdrop-blur-sm`, `max-w-2xl w-full`).
  - [x] 2.1.2 Render modal header with institutional typography: eyebrow tag `"DIRECCIÓN DE CARRERA • DICTAMEN PEDAGÓGICO"`, dynamic course title `#modal-pac-review-title`, and close button (`window.closePacReviewModal()`).
  - [x] 2.1.3 Construct Course Metadata Card:
    - Course code badge (`#modal-pac-review-code`, e.g. `SIS-213`) and course name (`#modal-pac-review-name`).
    - Semester indicator (`#modal-pac-review-semester`).
    - Assigned teacher name (`#modal-pac-review-teacher`) with CI (`#modal-pac-review-ci`).
    - Schedule shift and classroom info (`#modal-pac-review-schedule`).
  - [x] 2.1.4 Build Pedagogical Evaluation Checklist covering the 4 quality dimensions with interactive checkboxes:
    - Dimension 1: *Competencias y Saberes* (Alineación con perfil de egreso).
    - Dimension 2: *Evidencias e Instrumentos* (Pertinencia de criterios y matrices de evaluación).
    - Dimension 3: *Calendario y Sesiones* (Cumplimiento de 20 semanas lectivas).
    - Dimension 4: *Estrategias y Bibliografía* (Variedad metodológica y textos de referencia).
  - [x] 2.1.5 Build Decision Toggle Selector with two mutually exclusive buttons:
    - `#btn-decision-approve`: `APROBADO (Visa Institucional)` with emerald active styling.
    - `#btn-decision-observe`: `OBSERVADO (Solicitar Corrección)` with amber/rose active styling.
  - [x] 2.1.6 Add pedagogical observation textarea (`#modal-pac-obs-input`) with required indicator (`#modal-pac-obs-required`), live character counter (`#modal-pac-char-counter`), and contextual validation hint.
  - [x] 2.1.7 Add official digital signature footer stamp:
    - Lucide `shield-check` badge with label *"Firmado por: Lic. Mariana Rios Vargas (Dir. de Carrera)"*.
    - Action buttons: *Cancelar* and *Emitir Dictamen* (`#modal-pac-submit-btn`).

- [x] 2.2 Frontend: Modal Logic & Strict Character Count Validation ($\ge 10$ chars)
  - [x] 2.2.1 Implement `window.openPacReviewModal(courseCode, semNum)` in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js): resolves course data, unhides modal, sets default decision to `APROBADO`, resets observation textarea, and updates character counter.
  - [x] 2.2.2 Implement `window.closePacReviewModal()` in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js) resetting input state and closing dialog.
  - [x] 2.2.3 Implement `window.setPacReviewDecision(decision)` in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js):
    - When `decision === 'APROBADO'`: activate emerald button styling, make observation field optional, hide required asterisk, and enable submit button.
    - When `decision === 'OBSERVADO'`: activate amber/rose styling, show required asterisk, and validate character count.
  - [x] 2.2.4 Implement `window.handlePacReviewCharCount(val)` in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js):
    - If decision is `OBSERVADO`: check `val.trim().length`. If $< 10$, display `"X / 10 mín."` with warning styling and keep `#modal-pac-submit-btn` disabled (`disabled` attribute, dimmed opacity, `cursor-not-allowed`).
    - When length $\ge 10$: display `"X caracteres"` with emerald badge and enable `#modal-pac-submit-btn`.

- [x] 2.3 Backend: Review Command Validation Enforcement
  - [x] 2.3.1 In [`ScuReviewPacCmd.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuReviewPacCmd.java#L47-L57), verify server-side validation rejecting requests where `nuevoEstado == OBSERVADO` and `observaciones.trim().length() < 10` with HTTP 400 and error code `OBSERVATIONS_REQUIRED`.
  - [x] 2.3.2 Persist reviewer identity from `TenantContext.getTenantInfo().getUserId()` into `pac.revisadoPor` and record UTC timestamp in `pac.revisadoEn`.

- [x] 2.4 Frontend: REST Visa Wiring & Optimistic UI Update
  - [x] 2.4.1 Replace legacy browser `prompt()` and LocalStorage-only reviews in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js#L7540-L7567) with `window.submitPacReviewModal()`.
  - [x] 2.4.2 In `window.submitPacReviewModal()`, perform `fetch('POST', '/api/v1/planificaciones/pac/{id}/review')` passing Authorization JWT and payload `{ nuevoEstado, observaciones }`.
  - [x] 2.4.3 Upon HTTP 200 OK: close modal, update table row status badge optimistically (`APROBADO` or `OBSERVADO`), show institutional toast, and recalculate KPI toolbar metrics.
  - [x] 2.4.4 In case of network interruption, record review in LocalStorage buffer (`sisa_supervision_status_{code}`) with optimistic feedback and retry queue.

---

## Phase 3: Cross-Career Common Subjects Visual Governance

- [x] 3.1 Data Parsing & Gateway Ingestion
  - [x] 3.1.1 Verify SEA Gateway groups parsing in `processAndRenderSupervisionData` captures `groupLinkId` and `isLead` fields from [`GroupItemDto`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/dto/gateway/GroupItemDto.java#L53-L58).
  - [x] 3.1.2 Set `course.isCommon = true` when `groupLinkId != null`.
  - [x] 3.1.3 Set `course.isLead = (g.isLead !== false)` and resolve owning department tag (`leadTag`).

- [x] 3.2 Visual Badge Representation
  - [x] 3.2.1 For Lead courses (`isCommon === true && isLead === true`): render badge `⚡ COMÚN (LÍDER: ING. SISTEMAS)` using styling `bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700`.
  - [x] 3.2.2 For Non-Lead courses (`isCommon === true && isLead === false`): render badge `⚡ COMÚN (LÍDER: [CARRERA EXTERNA])` using styling `bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700`.

- [x] 3.3 Authorization & Governance Permissions
  - [x] 3.3.1 Enforce governance rules in table action buttons in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js#L7452-L7466):
    - If `isLead === true`: Career Director has full endorsement authority; render *"Revisar"* (`window.openPacReviewModal`).
    - If `isLead === false`: Career Director MUST NOT alter the lead career's visa status; hide *"Aprobar"* / *"Observar"* buttons and render *"Ver Carpeta"* and *"Nota Colaborativa"*.
  - [x] 3.3.2 Implement `window.openCollaborativeNoteModal(courseCode)` allowing non-lead directors to submit pedagogical suggestions without modifying official PAC state.
  - [x] 3.3.3 Backend validation: in [`ScuReviewPacCmd.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuReviewPacCmd.java), verify user has authority over the lead career when modifying common subjects.

---

## Phase 4: Teacher Feedback Loop & Deep Linking

- [x] 4.1 Inter-View Deep Linking Navigation
  - [x] 4.1.1 Refactor `window.openTeacherFolderFromSupervision(courseCode, teacherCi)` in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js#L7523-L7539):
    - Select target teacher via `window.selectDocenteFromApi(teacherCi, true)`.
    - Switch view from `view2` to `view1` via `window.switchView('view1')`.
    - Activate the corresponding course tab matching `courseCode`.
    - Ensure PAC Matriz 7 and class planning documentation for `courseCode` are rendered.
    - Display navigation toast notification: *"📂 Abriendo Carpeta Docente de [courseCode]"*.

- [x] 4.2 Observation Alert Banner in Teacher Workspace (`view1`)
  - [x] 4.2.1 Add persistent observation alert banner container (`#teacher-observation-banner`) in [`app.component.html`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html) within `view1` above the tab navigation bar.
  - [x] 4.2.2 When the active subject's PAC is in `OBSERVADO` status:
    - Display amber banner (`bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 rounded-xl p-4`).
    - Show Director's observation remarks text, reviewer attribution (*"Lic. Mariana Rios Vargas - Director de Carrera"*), and timestamp.
    - Provide actionable prompt: *"Por favor ajuste los contenidos observados y reenvíe la planificación para su visado institucional."*
  - [x] 4.2.3 When the active subject's PAC is in `APROBADO` status:
    - Display emerald certified visa banner (`bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 rounded-xl p-3`).
    - Render official digital visa seal and validation date.

- [x] 4.3 Resubmission Workflow & Closed Loop
  - [x] 4.3.1 Ensure teacher submission action (`POST /api/v1/planificaciones/submit` or `/pac/{id}/submit`) transitions PAC status back to `ENVIADO_REVISION`.
  - [x] 4.3.2 Clear the observation alert in `view1` and update the Career Director's supervision dashboard in `view2`, returning the subject to the pending review queue.

---

## Phase 5: Semester Batch Certification & Angular Parity

- [x] 5.1 Frontend: Semester Batch Confirmation Modal (`#modal-batch-endorsement`)
  - [x] 5.1.1 Construct modal dialog `#modal-batch-endorsement` in [`sisa-frontend/src/app/app.component.html`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html) using Tailwind CSS.
  - [x] 5.1.2 Display target semester designation (`#modal-batch-sem-title`, e.g. *“3º Semestre - Gestión II-2026”*).
  - [x] 5.1.3 Render summary card with total count of pending PACs to be certified and dynamic list of affected course codes with assigned teacher names.
  - [x] 5.1.4 Add mandatory acknowledgment checkbox (`#modal-batch-acknowledge-cb`): *"Confirmo haber auditado el cumplimiento pedagógico de las asignaturas del semestre"*.
  - [x] 5.1.5 Enforce button state: `#modal-batch-submit-btn` remains disabled until acknowledgment checkbox is checked.

- [x] 5.2 Backend: Atomic Transactional Batch Review Endpoint
  - [x] 5.2.1 Create request DTO [`ScuPacBatchReviewRequest.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/request/ScuPacBatchReviewRequest.java) with fields `carreraId`, `gestionId`, `semestre`, `pacIds`, and `observaciones`.
  - [x] 5.2.2 Create response DTO [`ScuPacBatchReviewResponse.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/response/ScuPacBatchReviewResponse.java) returning `totalReviewed`, `approvedIds`, `revisadoPor`, and `revisadoEn`.
  - [x] 5.2.3 Create command [`ScuBatchReviewPacCmd.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuBatchReviewPacCmd.java) annotated with `@Transactional`:
    - Lookup all pending PACs for the requested IDs and semester.
    - Atomically update status to `APROBADO`.
    - Stamp `revisadoPor` (authenticated director user) and `revisadoEn` (UTC timestamp).
    - Commit all updates within a single database transaction.
  - [x] 5.2.4 Expose endpoint `POST /api/v1/planificaciones/pac/batch-review` in [`ScuPlanningController.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuPlanningController.java) secured with `@PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_VICERRECTOR_SEDE', 'ROLE_ADMIN')")`.

- [x] 5.3 Frontend: Batch Orchestration & Optimistic Recalibration
  - [x] 5.3.1 Wire accordion button *"Aprobar y Finalizar Planificación del Semestre"* and top header button *"Aprobar Todo el Semestre"* to open `#modal-batch-endorsement`.
  - [x] 5.3.2 Implement `window.openBatchEndorsementModal(semNum)` and `window.closeBatchEndorsementModal()` in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js).
  - [x] 5.3.3 Implement `window.submitBatchEndorsement(semNum)` in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js):
    - Dispatch `POST /api/v1/planificaciones/pac/batch-review` with semester and career identifiers.
    - On success: optimistically update all semester course rows to `APROBADO`.
    - Recalibrate semester progress to 100% and update semester status pill to `APROBADO`.
    - Recalculate global KPI toolbar counts and compliance percentage.
    - Show celebratory toast notification: *"🎉 ¡Planificación del [Semestre] aprobada y visada en su totalidad!"*.

- [x] 5.4 Angular Module Contract Parity (`career-oversight`)
  - [x] 5.4.1 In [`scu-career-oversight.http.ts`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/modules/secure/career-oversight/http/scu-career-oversight.http.ts), add methods:
    - `getPacsByCareer(careerId, gestionId): Observable<{ data: ScuPacModel[] }>` invoking `GET /api/v1/planificaciones/pac/by-carrera/{careerId}?gestionId={gestionId}`.
    - `batchReviewPacs(batchCmd): Observable<{ data: ScuPacBatchReviewResponse }>` invoking `POST /api/v1/planificaciones/pac/batch-review`.
  - [x] 5.4.2 In [`scu-pac-review.cmd.ts`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/modules/secure/career-oversight/commands/scu-pac-review.cmd.ts), enforce validation asserting `observaciones.trim().length >= 10` when `nuevoEstado === 'OBSERVADO'`.
  - [x] 5.4.3 In [`scu-pac-review-modal.component.ts`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/modules/secure/career-oversight/components/scu-pac-review-modal/scu-pac-review-modal.component.ts), add live character counter property and disable submit button when observations are $< 10$ characters for `OBSERVADO`.
  - [x] 5.4.4 Update unit test [`scu-pac-review.cmd.spec.ts`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/modules/secure/career-oversight/commands/scu-pac-review.cmd.spec.ts) verifying character validation rules, rejection of short observations, and successful batch endorsement dispatch.

---

## Verification & Acceptance Criteria

1. **Persona & Initial Workspace Activation**:
   - Selecting `dir.carrera.sis` opens `#view2` with badge **Ingeniería de Sistemas (Sede Central Cochabamba)** and active term **GESTIÓN: II-2026 (Activa)**.
2. **0ms Ingestion & 8 Accordions**:
   - 8 semester accordions render immediately from cache and refresh with live offerings from SEA Gateway `/api/v1/catalogo-academico/groups`.
3. **KPI Toolbar Precision**:
   - Toolbar counters (`#supervision-count-all`, `#supervision-count-approved`, `#supervision-count-pending`, `#supervision-count-observed`, `#supervision-compliance-pct`) dynamically calculate exact metrics based on database-backed PAC states.
4. **Institutional Review Modal & Pedagogical Rules**:
   - Clicking *"Revisar"* opens `#modal-pac-review`.
   - Selecting `OBSERVADO` enforces $\ge 10$ characters of observations before enabling the submit button.
   - Emitting a review sends `POST /api/v1/planificaciones/pac/{id}/review`, persists the state in PostgreSQL, updates the table row immediately, and stamps the reviewer metadata.
5. **Common Subjects Governance**:
   - `isLead === true` displays `⚡ COMÚN (LÍDER: ING. SISTEMAS)` and allows approval/observation.
   - `isLead === false` displays `⚡ COMÚN (LÍDER: OTRA CARRERA)` with approval buttons disabled, offering read-only inspection and collaborative notes.
6. **Teacher Feedback Loop**:
   - Clicking *"Ver Carpeta"* deep-links to `view1`, selecting the teacher by CI, opening the subject tab, and displaying the PAC Matriz 7.
   - Observed PACs render the feedback banner in `view1`; teacher resubmissions return the subject to `ENVIADO_REVISION` in the Director's queue.
7. **Semester Batch Certification**:
   - Clicking *"Aprobar y Finalizar Planificación del Semestre"* triggers `#modal-batch-endorsement`.
   - After checking the acknowledgment checkbox and submitting, `POST /api/v1/planificaciones/pac/batch-review` updates all eligible semester PACs atomically to `APROBADO` in a single transaction.
8. **Angular Module Contract Parity**:
   - `scu-career-oversight.http.ts`, `scu-pac-review.cmd.ts`, and `scu-pac-review-modal.component.ts` mirror backend contracts, pass compilation, and satisfy unit tests in `scu-pac-review.cmd.spec.ts`.
