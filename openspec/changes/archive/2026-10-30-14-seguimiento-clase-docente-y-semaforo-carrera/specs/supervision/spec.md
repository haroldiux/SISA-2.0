# Specification: Career Director Curricular Supervision, Ingestion & Certification Module

## 1. Overview & Context

This specification establishes the official requirements and formal behavioral contracts for the **Career Director Curricular Supervision, Ingestion, and Certification Module** (`ROLE_DIR_CARRERA`) within the SISA platform shell (`view2`).

The system binds the persona **Lic. Mariana Rios Vargas** (`dir.carrera.sis`) to the career **Ingeniería de Sistemas** (`CARSIS`, SEA UUID `648febfd-dc79-4dd8-a8aa-dc7549ef649b`) at **Sede Central Cochabamba** (SEA Gateway Branch UUID `ea4fb26e-11a9-452f-9bae-4962de2dd931`).

This module replaces informal browser dialogs (`prompt()`) and volatile client-only reviews with institutional REST-driven digital governance, structured pedagogical evaluations, multi-career common subject auditing, teacher-director feedback loops, semester batch certification, and real-time curricular traffic-light tracking.

---

## 2. Requirements

### REQ-SUP-01: Career Director Identity & Dynamic Career Binding
- **REQ-SUP-01.1**: When a user authenticated as `ROLE_DIR_CARRERA` (specifically `dir.carrera.sis`) logs into SISA or is selected via the Persona switcher, the platform MUST automatically navigate to the supervision workspace (`view2`) as the active view.
- **REQ-SUP-01.2**: The workspace MUST bind by default to career `CARSIS` (**Ingeniería de Sistemas**) and Sede Central Cochabamba (`ea4fb26e-11a9-452f-9bae-4962de2dd931`), displaying the institutional career badge in the header.
- **REQ-SUP-01.3**: For supervisory roles with multi-career scope (`ROLE_DIR_ACADEMICA`, `ROLE_VICERRECTOR_SEDE`, `ROLE_VICERRECTOR_NACIONAL`, `ROLE_ADMIN`), the header MUST present an interactive career switcher allowing inspection of all active careers (e.g., `CARELE`, `CARMED`, `CARDER`).

### REQ-SUP-02: Curricular Ingestion & 0ms Cache-Aside Catalog Sync
- **REQ-SUP-02.1**: The system MUST consume the official curricular offering from the SEA Academic Gateway via `/api/v1/catalogo-academico/groups?term=2-2026&branchOfficeId={branchId}&careerId={careerId}`.
- **REQ-SUP-02.2**: The client MUST implement a **0ms Cache-Aside strategy** using browser LocalStorage (`sisa_cache_supervision_groups_{careerCode}`):
  - On view activation, any cached group data MUST be rendered immediately (0ms latency, zero layout shift, no empty spinner state).
  - In parallel, an asynchronous background HTTP fetch MUST query the SEA Gateway endpoint. Upon successful response, the local cache MUST be updated, and the UI refreshed without displacing user scroll position.
- **REQ-SUP-02.3**: Academic groups MUST be aggregated into unique curricular courses and mapped into 8 semester accordions (1º through 8º Semestre) based on course codes (`SIS-101` through `SIS-800` series) and official course titles via `window.getCourseSemester`.
- **REQ-SUP-02.4**: For each course, the ingestion MUST aggregate:
  - Unique assigned teachers with full name and CI.
  - Academic shifts (Mañana, Tarde, Nocturno) derived from schedule slots.
  - Assigned classrooms and total weekly hours.
  - Official course code and academic paralelos/groups.

### REQ-SUP-03: Real-Time KPI Toolbar & Metrics Computation
- **REQ-SUP-03.1**: The supervision view MUST calculate and display real-time aggregated metrics in the top KPI toolbar:
  - **Total Asignaturas** (`#supervision-count-all`): Total count of distinct curricular subjects in the active career curriculum.
  - **Completados / Aprobados** (`#supervision-count-approved`): Total subjects whose PAC is in `APROBADO` status.
  - **Pendientes** (`#supervision-count-pending`): Total subjects whose PAC is in `EN_REVISION` or `PENDIENTE` status.
  - **Con Observaciones** (`#supervision-count-observed`): Total subjects whose PAC is in `OBSERVADO` status.
  - **% Cumplimiento General** (`#supervision-compliance-pct`): Formula $\frac{\text{Aprobados}}{\text{Total}} \times 100$, formatted to 1 decimal place.
- **REQ-SUP-03.2**: Each semester accordion MUST compute its own progress: total subjects, approved count, compliance percentage, and overall status pill (`APROBADO`, `EN_REVISION`, `OBSERVADO`, `PENDIENTE`).
- **REQ-SUP-03.3**: The KPI tab buttons (`Todos`, `Completados`, `Pendientes`, `Con Observaciones`) MUST filter the courses rendered within each semester accordion, updating the active tab styling accordingly.

### REQ-SUP-04: Institutional Pedagogical Review Modal (`#modal-pac-review`)
- **REQ-SUP-04.1**: Clicking the *"Revisar"* action button on any subject row MUST open the native Tailwind CSS modal `#modal-pac-review`.
- **REQ-SUP-04.2**: The modal MUST display full course context:
  - Course Code and Course Title.
  - Assigned Teacher Name and CI.
  - Semester number, weekly hours, shifts, and classrooms.
- **REQ-SUP-04.3**: The modal MUST provide an institutional **Pedagogical Evaluation Checklist** covering 4 quality dimensions:
  1. *Competencias y Saberes*: Alineación de saberes conceptuales, procedimentales y actitudinales con el perfil de egreso.
  2. *Evidencias e Instrumentos*: Pertinencia de las evidencias de aprendizaje, criterios de desempeño y matrices de evaluación.
  3. *Calendario y Sesiones*: Cumplimiento del cronograma académico institucional de 20 semanas lectivas.
  4. *Estrategias y Recursos Didácticos*: Variedad metodológica y bibliografía actualizada.
- **REQ-SUP-04.4**: The modal MUST present two mutually exclusive formal decision choices:
  - `APROBADO` (Verde Esmeralda): Emite dictamen favorable y otorga visa digital institucional.
  - `OBSERVADO` (Ámbar / Rojo): Emite observaciones pedagógicas obligatorias y solicita correcciones al docente titular.
- **REQ-SUP-04.5**: The modal footer MUST render the official digital endorsement stamp:
  - *"Firmado electrónicamente por Lic. Mariana Rios Vargas - Director de Carrera"*.
  - Audit date and time stamp.

### REQ-SUP-05: Strict Review Validation ($\ge 10$ Characters on Observation)
- **REQ-SUP-05.1**: When the decision is set to `OBSERVADO`, the pedagogical observation textarea MUST be mandatory.
- **REQ-SUP-05.2**: The client MUST display a real-time character counter (e.g. `X / 10 caracteres mínimos`).
- **REQ-SUP-05.3**: While the trimmed content of the observation is under 10 characters:
  - The submit button MUST remain disabled (`disabled` attribute, dimmed opacity, `cursor-not-allowed`).
  - An inline validation alert MUST indicate that an explanatory remark of at least 10 characters is required.
- **REQ-SUP-05.4**: When the character count reaches 10 or more characters, the submit button MUST become active, and the counter MUST display a green confirmation indicator.
- **REQ-SUP-05.5**: When the decision is `APROBADO`, the observation field is optional, and the submit button MUST be immediately active.
- **REQ-SUP-05.6**: The backend command `ScuReviewPacCmd` MUST enforce this rule server-side, returning HTTP 400 `OBSERVATIONS_REQUIRED` if violated.

### REQ-SUP-06: Cross-Career Common Subjects Visual Governance (`isLead` vs Non-Lead)
- **REQ-SUP-06.1**: The system MUST inspect the `groupLinkId` and `isLead` fields returned by the SEA Gateway `GroupItemDto`.
- **REQ-SUP-06.2**: For subjects identified as common across careers (`groupLinkId != null`):
  - If `isLead === true`: The subject MUST display the badge `⚡ COMÚN (LÍDER: ING. SISTEMAS)`. The Director of Ingeniería de Sistemas holds primary review authority and CAN approve or observe the planning.
  - If `isLead === false`: The subject MUST display the badge `⚡ COMÚN (LÍDER: OTRA CARRERA)`.
- **REQ-SUP-06.3**: For Non-Lead subjects, the Director of Ingeniería de Sistemas MUST NOT have permissions to approve or alter the official visa status of the lead career. Instead, the UI MUST provide:
  - Action *"Ver Carpeta"* (Read access to inspect the shared documentation).
  - Action *"Nota Colaborativa"* (Submit non-blocking inter-departmental pedagogical suggestions).

### REQ-SUP-07: Bidirectional Teacher Feedback Loop & Inter-View Deep Linking
- **REQ-SUP-07.1**: Clicking *"Ver Carpeta"* (`window.openTeacherFolderFromSupervision`) MUST smoothly transition from `view2` to `view1` (Docente workspace).
- **REQ-SUP-07.2**: The navigation MUST automatically:
  - Select the target teacher by CI in the teacher selector dropdown.
  - Select the corresponding subject tab.
  - Render the teacher's PAC Matriz 7 and class planning documentation.
- **REQ-SUP-07.3**: When a PAC is transitioned to `OBSERVADO` by the Career Director, the teacher view in `view1` MUST immediately render the observation banner, displaying the Director's feedback and timestamp.
- **REQ-SUP-07.4**: Once the teacher modifies and resubmits the planning (`POST /api/v1/planificaciones/submit` or `/pac/{id}/submit`), the PAC state MUST return to `ENVIADO_REVISION`, re-appearing as pending in the Director's supervision dashboard.

### REQ-SUP-08: Semester-Level Batch Certification
- **REQ-SUP-08.1**: Each semester accordion and the top header MUST provide a batch certification action (*"Aprobar y Finalizar Planificación del Semestre"* / *"Aprobar Todo el Semestre"*).
- **REQ-SUP-08.2**: Clicking batch certification MUST open the institutional confirmation modal `#modal-batch-endorsement`.
- **REQ-SUP-08.3**: The confirmation modal MUST display:
  - Target semester designation (e.g. `3º Semestre - Gestión II-2026`).
  - Total number of pending PACs to be certified.
  - List of affected course codes and assigned teachers.
  - Mandatory acknowledgment checkbox: *"Confirmo haber auditado el cumplimiento pedagógico de las asignaturas del semestre"*.
- **REQ-SUP-08.4**: Upon confirmation, the client MUST execute a batch review against `POST /api/v1/planificaciones/pac/batch-review`.
- **REQ-SUP-08.5**: The backend MUST process all pending PACs for the semester in a single database transaction, updating states to `APROBADO`, assigning reviewer metadata, and committing audit timestamps.
- **REQ-SUP-08.6**: The client UI MUST update optimistically, transitioning all table row badges to `APROBADO` and recalculating the KPI counters to reflect 100% compliance for that semester.

### REQ-SUP-09: Persistent Career PAC Ingestion & Auto-Provisioning
- **REQ-SUP-09.1**: The backend MUST expose `GET /api/v1/planificaciones/pac/by-carrera/{carreraId}?gestionId={gestionId}` returning all PAC records for the career and academic term.
- **REQ-SUP-09.2**: If a course from the SEA Gateway catalog does not have a pre-existing PAC entity in PostgreSQL, the system MUST automatically link or provision a provisional PAC in `ENVIADO_REVISION` state so the Director can evaluate and endorse it seamlessly.

### REQ-SUP-10: Pestaña de Semáforo Curricular de Carrera y Ribbon de KPIs Tri-Color
- **REQ-SUP-10.1**: The supervision workspace (`view2`) MUST include the interactive tab button `#supervision-tab-semaforo` (*"Semáforo de Avance"*), activating the traffic light analytical view.
- **REQ-SUP-10.2**: When active, the view MUST display the top ribbon `#semaforo-kpi-ribbon` with real-time aggregated metrics:
  - `Total Asignaturas`: Conteo de todas las materias del pensum evaluadas.
  - `Al Día (🟢 Verde)`: Asignaturas con $\Delta\% \ge -10.0\%$.
  - `En Atención (🟡 Amarillo)`: Asignaturas con $-25.0\% \le \Delta\% < -10.0\%$.
  - `Riesgo Crítico (🔴 Rojo)`: Asignaturas con retraso grave ($\Delta\% < -25.0\%$) o penalizadas normativamente.
  - `Sin Plan de Clase`: Contador específico de materias con infracción normativa de microplanificación.
- **REQ-SUP-10.3**: Courses MUST be aggregated into semester accordions (1º to 8º Semestre), rendering interactive comparison tables contrasting the Planned Academic Progress (Week 13 cut-off over 20 weeks = 65.0%) against the Real Classroom Progress calculated from verified session execution scores.

### REQ-SUP-11: Algoritmo Tri-Color Ponderado y Penalización Normativa Estricta
- **REQ-SUP-11.1**: The traffic light engine (`ScuGetSemaforoCarreraCmd`) MUST compute the delta differential $\Delta\% = \text{Avance Real} - \text{Avance Planeado}$ and assign institutional status:
  - 🟢 **VERDE (Al Día)**: $\Delta\% \ge -10.0\%$ (variance $\le 2$ weeks behind schedule).
  - 🟡 **AMARILLO (En Atención)**: $-25.0\% \le \Delta\% < -10.0\%$ (variance between 2 and 5 weeks, requires syllabus rescheduling).
  - 🔴 **ROJO (Riesgo Crítico)**: $\Delta\% < -25.0\%$ (variance $> 5$ weeks behind schedule).
- **REQ-SUP-11.2**: **Strict Normative Penalty**: If any course lacks lesson planning (`tienePlanClase == false` or `totalPlanes == 0`), the engine MUST override the mathematical score and force the classification directly to 🔴 **ROJO**, with `motivoAlerta`: *"Penalización crítica: Asignatura sin Plan de Clase registrado"*.
- **REQ-SUP-11.3**: Penalized subjects MUST display a pulsating red warning badge in the supervision table to demand immediate departmental intervention.

### REQ-SUP-12: Modal Institucional de Auditoría y Detalle Pedagógico Longitudinal
- **REQ-SUP-12.1**: Each course row in the traffic light view MUST feature an action button *"Ver Auditoría"*.
- **REQ-SUP-12.2**: Clicking *"Ver Auditoría"* MUST open modal `#modal-supervision-seguimiento-detalle` and retrieve course telemetry from `GET /api/v1/seguimiento/materia/{materiaCodigo}`.
- **REQ-SUP-12.3**: The modal MUST render the longitudinal course dossier:
  - Didactic moment compliance percentages (Inicio 15', Desarrollo 60', Cierre 15').
  - Didactic resources frequency histogram (e.g. Proyector, IDE, Pizarra).
  - Chronological session execution log with dates, session numbers, topics, scores, and teacher classroom remarks.

---

## 3. Formal Scenarios (Given / When / Then)

### Scenario 1: Director Mariana Rios enters the Supervision Workspace
**Given** user `dir.carrera.sis` logs in with role `ROLE_DIR_CARRERA`  
**When** the platform shell initializes the workspace  
**Then** the active view is set to `#view2`  
**And** the career badge displays "Ingeniería de Sistemas (Sede Central Cochabamba)"  
**And** the active gestion indicates "GESTIÓN: II-2026 (Activa)".

### Scenario 2: Instant Cache-Aside render followed by live background sync
**Given** the user has previously loaded the curriculum for `CARSIS` in LocalStorage key `sisa_cache_supervision_groups_CARSIS`  
**When** the user accesses `view2`  
**Then** the 8 semester accordions and courses render within 0 milliseconds using the cached catalog  
**And** an asynchronous fetch is dispatched to `/api/v1/catalogo-academico/groups?term=2-2026&branchOfficeId=ea4fb26e-11a9-452f-9bae-4962de2dd931&careerId=648febfd-dc79-4dd8-a8aa-dc7549ef649b`  
**When** the SEA Gateway returns live updated groups  
**Then** the LocalStorage cache is silently updated  
**And** the UI table rows reflect the freshest teacher assignments without flickering.

### Scenario 3: Real-Time KPI Toolbar Calculation
**Given** the curriculum contains 40 courses across 8 semesters  
**And** 28 courses have PAC status `APROBADO`, 9 have `EN_REVISION`, and 3 have `OBSERVADO`  
**When** `window.processAndRenderSupervisionData` computes the summary  
**Then** `#supervision-count-all` displays `40`  
**And** `#supervision-count-approved` displays `28`  
**And** `#supervision-count-pending` displays `9`  
**And** `#supervision-count-observed` displays `3`  
**And** `#supervision-compliance-pct` displays `70.0%`.

### Scenario 4: Opening Institutional Review Modal for a subject
**Given** course `SIS-213` (Programación III) is in status `EN_REVISION`  
**When** the Director clicks the *"Revisar"* button on the `SIS-213` row  
**Then** the Tailwind modal `#modal-pac-review` opens  
**And** the modal displays course code `SIS-213`, name "Programación III", and teacher name with CI  
**And** the 4 pedagogical checklist criteria are visible  
**And** the digital signature footer shows *"Firmado electrónicamente por Lic. Mariana Rios Vargas - Director de Carrera"*.

### Scenario 5: Review validation blocks short observations (< 10 chars)
**Given** modal `#modal-pac-review` is open for course `SIS-214`  
**When** the Director selects the decision `OBSERVADO`  
**And** enters the text `"Corregir"` (8 characters) into the observation textarea  
**Then** the character counter displays `"8 / 10 caracteres mínimos"` with a warning style  
**And** the modal submit button remains disabled  
**When** the Director appends `" prácticas de laboratorio"` (total 34 characters)  
**Then** the character counter displays `"34 caracteres"` with a success indicator  
**And** the modal submit button becomes enabled.

### Scenario 6: Successful PAC Approval with REST persistence
**Given** modal `#modal-pac-review` is open for course `SIS-301` with PAC ID `142`  
**When** the Director selects `APROBADO` and clicks *"Emitir Dictamen"*  
**Then** the client sends a `POST` request to `/api/v1/planificaciones/pac/142/review` with payload:
  ```json
  {
    "nuevoEstado": "APROBADO",
    "observaciones": "Planificación cumple satisfactoriamente con la matriz de competencias y calendario."
  }
  ```
**And** the backend persists the record with `revisadoPor = dir.carrera.sis` and current UTC timestamp  
**And** the modal closes  
**And** the table row for `SIS-301` immediately displays the green badge `APROBADO`  
**And** the KPI toolbar increments the approved counter and recalibrates global compliance percentage.

### Scenario 7: Common Subject Governance - Lead Career Director Authority
**Given** course `SIS-214` is linked to group `groupLinkId = "grp-common-db-101"`  
**And** `isLead` is `true` for carrera `CARSIS`  
**When** the table renders `SIS-214`  
**Then** the subject displays the badge `⚡ COMÚN (LÍDER: ING. SISTEMAS)`  
**And** the Director sees the active *"Revisar"* action button with full authority to approve or observe.

### Scenario 8: Common Subject Governance - Non-Lead Career Director Restricted Permissions
**Given** course `SIS-105` (Álgebra Lineal) is shared with Ingeniería Electrónica (`CARELE`)  
**And** `isLead` is `false` for carrera `CARSIS` (lead is `CARELE`)  
**When** the Director of `CARSIS` inspects `SIS-105` in `view2`  
**Then** the subject displays the badge `⚡ COMÚN (LÍDER: ING. ELECTRÓNICA)`  
**And** the buttons *"Aprobar"* and *"Observar"* are hidden or disabled  
**And** an action *"Ver Carpeta"* and *"Nota Colaborativa"* are provided instead  
**And** the system prevents the non-lead director from overriding the lead career's visa.

### Scenario 9: Inter-View Deep Linking from Supervision to Docente Workspace
**Given** Director Mariana Rios is inspecting course `SIS-402` taught by teacher CI `4859201`  
**When** the Director clicks *"Ver Carpeta"* on the course row  
**Then** the platform switches view to `view1` (`switchView('view1')`)  
**And** teacher `4859201` is automatically selected in the Docente dropdown  
**And** tab `SIS-402` is activated  
**And** the PAC Matriz 7 and Plan de Clases for `SIS-402` are displayed  
**And** a feedback toast notification announces *"📂 Abriendo Carpeta Docente de SIS-402"*.

### Scenario 10: Teacher observes feedback and resubmits
**Given** course `SIS-214` was marked `OBSERVADO` with feedback `"Ajustar rúbricas de evaluación en semana 8"`  
**When** the teacher opens `view1` for `SIS-214`  
**Then** an amber notification banner displays the Director's observation remarks  
**When** the teacher updates the evaluation rubrics and clicks *"Enviar a Revisión"*  
**Then** the PAC status updates to `ENVIADO_REVISION`  
**And** the subject returns to the pending queue in the Career Director's supervision dashboard.

### Scenario 11: Semester Batch Certification
**Given** 3º Semestre has 4 pending courses and 1 already approved course  
**When** the Director clicks *"Aprobar y Finalizar Planificación del Semestre"* on the 3º Semestre accordion  
**Then** confirmation modal `#modal-batch-endorsement` opens  
**And** summarizes that 4 pending courses will be transitioned to `APROBADO`  
**When** the Director checks the confirmation box and clicks *"Certificar Semestre"*  
**Then** a `POST` request is sent to `/api/v1/planificaciones/pac/batch-review`  
**And** all 4 pending PACs are updated to `APROBADO` in a single transaction  
**And** the 3º Semestre compliance reaches `100%` with status badge `APROBADO`  
**And** a toast notification announces *"🎉 ¡Planificación del 3º Semestre aprobada y visada en su totalidad!"*.

### Scenario 12: Elevated Role Switches Career Scope
**Given** user `admin` or `dir.academica.cbba` accesses `view2`  
**When** the user selects "Ingeniería Electrónica (CARELE)" from the career switcher dropdown  
**Then** the supervision dashboard smoothly reloads offering groups for `CARELE`  
**And** the badge displays "Ingeniería Electrónica"  
**And** accordions render courses for `CARELE` (e.g. `ELC-101` series) with independent KPI metrics.

### Scenario 13: Tablero de Semáforo de Carrera con Ribbon Tri-Color
**Given** user `dir.carrera.sis` selects the tab *"Semáforo de Avance"* (`#supervision-tab-semaforo`)  
**When** the client issues `GET /api/v1/seguimiento/semaforo-carrera/CARSIS`  
**Then** `#semaforo-kpi-ribbon` displays the global counters: Total, Verde, Amarillo, Rojo y Sin Plan de Clase  
**And** the semester accordions render the comparative progress table displaying Planned Progress (65.00%), Real Progress %, Delta $\Delta\%$, and Traffic Light Badges (🟢, 🟡, 🔴).

### Scenario 14: Penalización Forzada a Semáforo Rojo por Ausencia de Plan de Clase
**Given** subject `SIS-412` has 0 lesson plans registered (`tienePlanClase == false`)  
**When** the traffic light endpoint processes the career subjects  
**Then** `SIS-412` is forced to `ColorSemaforo.ROJO` regardless of any session hours  
**And** the table row displays a pulsating badge `🔴 Falta Plan de Clase` with alert `motivoAlerta: "Penalización crítica: Asignatura sin Plan de Clase registrado"`  
**And** the counter `Sin Plan de Clase` in the KPI ribbon increments by 1.

### Scenario 15: Apertura del Modal de Auditoría Pedagógica Longitudinal
**Given** course `SIS-213` is listed in the Traffic Light table  
**When** the Director clicks the action button *"Ver Auditoría"*  
**Then** modal `#modal-supervision-seguimiento-detalle` opens  
**And** fetches longitudinal records from `GET /api/v1/seguimiento/materia/SIS-213`  
**And** renders didactic moment averages (Inicio: 100%, Desarrollo: 95.5%, Cierre: 90.9%)  
**And** displays the didactic resources frequency histogram alongside the full chronological session table.
