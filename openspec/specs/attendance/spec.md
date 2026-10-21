# Specification: Student Roster & Attendance Tracking Module with Cross-Career Grouping

## 1. Overview & Context

This specification establishes the official requirements and formal behavioral contracts for the **Student Roster & Attendance Tracking Module** within the SISA platform teacher workspace ([`view1`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L1100-L2370)).

Under Universidad Técnica Privada Cosmos (UNITEPC) Academic Regulations, students must maintain a minimum of **80% class attendance** to qualify for final evaluations and examinations. Currently, teachers record class attendance externally on paper or spreadsheets, which leaves academic authorities, Career Directors (`ROLE_DIR_CARRERA`), and Academic Direction (`ROLE_DIR_ACADEMICA`) without centralized, timely visibility into student absenteeism, drop-out risk, and cross-career compliance.

This module completes the academic folder lifecycle as **Tab 5: "5. Lista y Asistencia"**, functioning alongside the four existing pedagogical planning documents:
1. Tab 1: **Programa Analítico** (`#tab-analitico`, `.docx`)
2. Tab 2: **PAC Pedagógico** (`#tab-pac-matrix`, Puntos 1-14)
3. Tab 3: **Cronograma (20 Semanas)** (`#tab-cronograma-semanas`, Matriz 7)
4. Tab 4: **Planes de Clase** (`#tab-cronograma-planes`, `.xlsx`)
5. Tab 5: **Lista y Asistencia** (`#tab-asistencia`, Registro Institucional & `.xlsx`)

### Key Capabilities
- **Institutional Alignment**: Automatic calculation of the 80% attendance rule with instant visual risk alerts.
- **Cross-Career Grouping**: In cátedras shared across multiple degree programs (`isCommon` / `groupLinkId`), enrolled students are segregated into distinct career cohorts with individual sub-totals and filter pills.
- **4-State Marking**: Segmented marking per student: `PRESENTE` (P), `FALTA` (F), `ATRASO` (A), `LICENCIA` (L).
- **Live KPI Ribbon**: Real-time computation of Enrolled, Present, Absent, Tardy, Excused counts, and % compliance.
- **3-Tier Offline Resilience**: Cache-Aside architecture ensuring 0ms initial render, local offline operation, and automatic fallback to authentic Bolivian student seed data if the SEA Gateway is unreachable.
- **Institutional Reporting**: Official UNITEPC Excel (`.xlsx`) export via Apache POI and print-ready PDF grid with formal teacher and director signature blocks.

---

## 2. Requirements

### REQ-ATT-01: Tab 5 Workspace Navigation & Shell Integration
- **REQ-ATT-01.1**: The platform shell top tab navigation bar in [`view1`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L1321-L1365) MUST display the fifth segmented button `#btn-tab-asistencia` titled `"5. Lista y Asistencia"`, featuring a `clipboard-check` icon and a badge indicating `"Nómina Oficial"`.
- **REQ-ATT-01.2**: Clicking `#btn-tab-asistencia` MUST invoke [`window.switchDocMainTab('tab-asistencia')`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js#L277-L325), which MUST:
  - Hide all other `.doc-tab-panel` elements and display `#tab-asistencia`.
  - Apply active segmented pill styling to `#btn-tab-asistencia` including a teal glow ring (`ring-teal-500/20`), active background, and bold text.
  - Synchronize the contextual sidebar navigation item `#sidebar-tab-asistencia` under *"Documentos de la Carpeta"*, applying active highlight styling.
  - Update the contextual clear action button `#btn-vaciar-pestana-label` to display `"Reiniciar Asistencia de Sesión"`.
  - Dispatch [`window.loadAttendanceForCurrentSelection()`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js) to load or restore student attendance records.
- **REQ-ATT-01.3**: The contextual sidebar Direct Export Center MUST include a direct action button to trigger the official Excel attendance sheet download.

### REQ-ATT-02: Session Parameters & Class Configuration (Smart SEA Schedule Integration)
- **REQ-ATT-02.1**: The top of `#tab-asistencia` MUST render an intelligent **Session Parameters Toolbar** derived directly from the course's SEA schedule:
  - **Official SEA Session Selector** (`#asistencia-sesion-select`): Dropdown listing ONLY the valid instructional sessions of the semester determined strictly by the days and time slots assigned in the SEA schedule (e.g. if a course has classes on Mondays and Wednesdays, only Mondays and Wednesdays of the 20-week term are generated).
  - **Automated "Today" Class Detection**: When opening the tab, the system MUST inspect the current date and time. If today is a scheduled class day, the system MUST automatically preselect today's active session (`• ⭐ HOY`). If today is not a class day, it MUST automatically default to the closest past or upcoming session.
  - **Read-Only Metadata Badges**: Displays auto-recognized class type (`Teórica` vs `Práctica`), commission (`TA-01`, `PL-01`), scheduled time slot (`08:00 - 10:15`), and official classroom (`Aula 204`).
  - **Session Topic / Content** (`#asistencia-tema-input`): Pre-populated with the planned pedagogical topic from the Cronograma (Matriz 7) for that session's academic week, remaining editable by the teacher for adjustments.
- **REQ-ATT-02.2**: Selecting any session from the dropdown MUST automatically hydrate the date, class type, commission, and topic, and immediately check for previously saved attendance marks in PostgreSQL or `localStorage`.

### REQ-ATT-03: Student Roster Ingestion & 3-Tier Offline Resilience
- **REQ-ATT-03.1**: The client MUST resolve the student roster for the active subject by querying the SEA Gateway endpoint `/api/v1/catalogo-academico/students/byGroup?groupId={groupId}` for all groups clustered under `materiasData[activeMateriaKey].groups`.
- **REQ-ATT-03.2**: The client MUST execute a **3-tier offline-resilient Cache-Aside ingestion strategy**:
  1. **Tier 1 (Instant Local Render)**: Inspect `localStorage` for cached roster data under key `sisa_roster_${mKey}`. If present, parse and render students immediately with 0ms latency.
  2. **Tier 2 (Live Gateway Ingestion)**: In the background, perform asynchronous HTTP requests to `/api/v1/catalogo-academico/students/byGroup`. Upon successful arrival with non-empty results, update the cache and smoothly merge/refresh the student roster.
  3. **Tier 3 (Bolivian Institutional Seed Fallback)**: If the SEA Gateway is unreachable (network failure, HTTP 500, or empty array returned), the system MUST generate an authentic institutional Bolivian student roster using predefined student seeds (authentic Bolivian surnames, valid institutional codes, and proportional career distribution) so the teacher is NEVER blocked from taking roll.
- **REQ-ATT-03.3**: The UI MUST display a subtle sync badge indicating the current data source: `"En línea (SEA Gateway)"`, `"Caché local sincronizado"`, or `"Modo desconectado (Semilla institucional)"`.

### REQ-ATT-04: Cross-Career Grouping for Common Subjects
- **REQ-ATT-04.1**: When a cátedra is common across multiple careers (`isCommon === true` or multiple `careerCode` entries in the group cluster), the student roster MUST NOT be rendered as an undifferentiated flat list.
- **REQ-ATT-04.2**: The student roster MUST be partitioned into **distinct Career Cohort Sections**:
  - Each career cohort MUST feature an institutional section header banner displaying:
    - Career badge with official institutional colors (e.g., Indigo for *Ingeniería de Sistemas*, Violet for *Ingeniería de Telecomunicaciones*, Teal for *Ingeniería Biomédica*).
    - Full career title (e.g., *"Carrera: Licenciatura en Ingeniería de Sistemas"*).
    - Enrolled student count for that specific career (e.g., *"24 estudiantes inscritos"*).
    - Career-specific attendance sub-totals (Presentes, Faltas, Atrasos, Licencias, and % Cumplimiento de Carrera).
- **REQ-ATT-04.3**: The toolbar MUST provide **Career Cohort Filter Pills**:
  - A pill for `"Todas las Carreras (Consolidado)"` showing the unified cátedra roster.
  - Individual pills for each enrolled career (e.g., `"Ing. de Sistemas (24)"`, `"Ing. de Telecomunicaciones (12)"`).
  - Clicking a career pill MUST smoothly filter the table to display only students belonging to that career, while preserving the overall session state and KPI calculations.

### REQ-ATT-05: 4-State Attendance Marking & Quick Batch Operations
- **REQ-ATT-05.1**: Each student row in the roster table MUST provide a **4-way segmented toggle button group** with mutually exclusive states conforming to [`EstadoAsistencia`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/enums/EstadoAsistencia.java):
  1. `PRESENTE` (P): Emerald green pill (`bg-emerald-600 text-white` when active). Denotes on-time class attendance.
  2. `FALTA` (F): Rose red pill (`bg-rose-600 text-white` when active). Denotes unexcused absence.
  3. `ATRASO` (A): Amber orange pill (`bg-amber-500 text-white` when active). Denotes late arrival.
  4. `LICENCIA` (L): Sky blue pill (`bg-sky-600 text-white` when active). Denotes officially justified leave.
- **REQ-ATT-05.2**: Clicking any state button MUST immediately update the student's status, apply active visual styles, and update live KPI counters with 0ms latency (optimistic UI).
- **REQ-ATT-05.3**: **Conditional Justification/Remarks Field**:
  - When student status is `PRESENTE` or `FALTA`, the input field `obs-${studentCode}` MUST be **disabled**, display placeholder `"—"`, and have its value cleared.
  - When student status is switched to `ATRASO` or `LICENCIA`, the input field MUST be **automatically enabled**, receive active focus, and display placeholder *"Motivo de atraso..."* or *"Nro. justificación médica / permiso..."*.
- **REQ-ATT-05.4**: The toolbar MUST provide a prominent `"⚡ Marcar Todos Presentes"` button. Clicking this button MUST:
  - Set all currently displayed students to `PRESENTE`.
  - Disable all justification/remark inputs and clear their contents.
  - Recalculate all session and career sub-totals immediately.

### REQ-ATT-06: Live Compliance KPIs & 80% Rule Early Warning
- **REQ-ATT-06.1**: The module MUST display a **Real-Time KPI Ribbon** above the roster table containing:
  - **Total Inscritos**: Total number of enrolled students.
  - **Presentes (P)**: Count of students marked `PRESENTE`.
  - **Faltas (F)**: Count of students marked `FALTA`.
  - **Atrasos (A)**: Count of students marked `ATRASO`.
  - **Licencias (L)**: Count of students marked `LICENCIA`.
  - **% Asistencia de Sesión**: Formula:
    $$\text{\% Asistencia} = \frac{\text{Presentes} + (0.5 \times \text{Atrasos}) + \text{Licencias}}{\text{Total Marcados}} \times 100$$
    *(Note: Per UNITEPC guidelines, Licencia does not penalize attendance, and Atraso counts as 0.5 attendance weight).*
- **REQ-ATT-06.2**: The system MUST evaluate the **80% Minimum Attendance Rule**:
  - If overall session compliance is $\ge 80\%$, the KPI pill MUST display emerald green styling with a `check-circle` icon and text `"Cumple Normativa (>= 80%)"`.
  - If overall session compliance is $< 80\%$, the KPI pill MUST display an amber/red warning badge with an `alert-triangle` icon and text `"Alerta: Asistencia < 80%"`.
- **REQ-ATT-06.3**: For each student row, the system MUST compute cumulative attendance across all recorded sessions in the semester:
  - Students with cumulative attendance $< 80\%$ MUST display an inline warning badge `"En Riesgo (<80%)"` alerting the teacher that the student is nearing ineligibility for final evaluation.

### REQ-ATT-07: Persistent Session Storage & Idempotent Upsert
- **REQ-ATT-07.1**: The toolbar MUST provide a `"Guardar Asistencia"` button with a `save` icon.
- **REQ-ATT-07.2**: Clicking `"Guardar Asistencia"` MUST submit the payload to `POST /api/v1/asistencias/sesion` containing:
  - Subject code (`materiaCodigo`), academic term (`gestionCodigo`), date (`fecha`), class type (`tipoClase`), commission (`comision`), pedagogical topic (`tema`).
  - List of student marks: student code, full name, career code, career name, attendance status, observation.
- **REQ-ATT-07.3**: The backend command [`ScuSaveAsistenciaCmd`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuSaveAsistenciaCmd.java) MUST execute an **idempotent upsert**:
  - Enforce database uniqueness on `(materia_codigo, fecha, tipo_clase, comision)`.
  - If a session record already exists for the given date, type, and commission, the command MUST update the session topic and update/upsert existing student marks without creating orphan duplicate sessions.
- **REQ-ATT-07.4**: Simultaneously, the client MUST mirror the saved session in browser `localStorage` under key `sisa_attendance_${mKey}_${fecha}_${tipoClase}_${comision}` for instant offline availability.
- **REQ-ATT-07.5**: The UI MUST display a transient success toast notification (*"✓ Asistencia guardada correctamente en el sistema institucional"*) and update the autosave indicator.

### REQ-ATT-08: Historical Class Sessions Audit & Review
- **REQ-ATT-08.1**: Tab 5 MUST feature a collapsible **Historical Sessions Drawer / Accordion** (`#asistencia-historial-accordion`).
- **REQ-ATT-08.2**: The history drawer MUST list all past class sessions recorded for the active subject in the active term:
  - Session date formatted as `DD/MM/YYYY`.
  - Class type badge (`TEÓRICA` / `PRÁCTICA`).
  - Commission designation (e.g., `TA-01`, `PL-01`).
  - Pedagogical topic covered.
  - Attendance tally: Presentes / Total, and compliance percentage.
- **REQ-ATT-08.3**: Clicking any historical session row in the accordion MUST load that session's date, type, and commission into the active editor, enabling the teacher or Career Director to review or modify the recorded roll.

### REQ-ATT-09: Official UNITEPC Excel (.xlsx) Export & PDF Dossier Integration
- **REQ-ATT-09.1**: Tab 5 and the Direct Export Center MUST provide a button `"Exportar Asistencia (.xlsx)"`.
- **REQ-ATT-09.2**: Clicking the export button MUST request `GET /api/v1/office/export/asistencia?materiaCodigo={code}&gestionCodigo={term}` from [`ScuOfficeController`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuOfficeController.java).
- **REQ-ATT-09.3**: The generated Excel file MUST conform to UNITEPC institutional standards:
  - Header block with UNITEPC institutional logo, subject code and name, teacher name, academic term, and date of issue.
  - Cohort section headers separating students by degree program.
  - Attendance matrix columns for each session date held, with cells displaying P, F, A, or L.
  - Summary statistical columns: Total Asistencias, Total Faltas, % Cumplimiento, and Habilitación Status (`HABILITADO` $\ge 80\%$, `INHABILITADO` $< 80\%$).
  - Official signature lines at the bottom for the Docente Titular and the Director de Carrera.
- **REQ-ATT-09.4**: The system MUST integrate the attendance roster into the PDF print modal (`window.openPdfPrintModal`). Dedicated `@media print` styles MUST:
  - Hide interactive buttons, segmented pills, date inputs, and filters.
  - Render a crisp, high-contrast institutional table with borders suitable for physical printing on standard Letter/A4 paper.
  - Include official signature endorsement blocks.

### REQ-ATT-10: Security, Authorization & Auditability
- **REQ-ATT-10.1**: All attendance endpoints under `/api/v1/asistencias` MUST be secured with Spring Security:
  `@PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_VICERRECTOR_SEDE', 'ROLE_VICERRECTOR_NACIONAL', 'ROLE_ADMIN')")`.
- **REQ-ATT-10.2**: Teachers (`ROLE_DOCENTE`) CAN view and record attendance only for their assigned subjects.
- **REQ-ATT-10.3**: Career Directors (`ROLE_DIR_CARRERA`) and Academic Directors CAN inspect attendance across all subjects within their jurisdiction for curricular audit and student certification.
- **REQ-ATT-10.4**: All database modifications MUST store audit metadata: `registrado_por` (username of the teacher or administrator), `creado_en`, and `actualizado_en` timestamps.

---

## 3. Formal Scenarios (Given / When / Then)

### Scenario 1: Teacher Navigates to Tab 5 (Lista y Asistencia)
**Given** the teacher is logged into SISA and viewing subject `SIS-213 Programación III` in `view1`  
**When** the teacher clicks the navigation pill `#btn-tab-asistencia`  
**Then** `#tab-asistencia` becomes visible and other document panels are hidden  
**And** `#btn-tab-asistencia` receives the active teal glow ring styling (`ring-teal-500/20`)  
**And** `#sidebar-tab-asistencia` is highlighted in the contextual sidebar  
**And** the session date picker defaults to the current date (e.g., `2026-10-21`)  
**And** the roster table displays enrolled students for the cátedra.

### Scenario 2: Instant Cache-Aside Roster Render with Live Background Sync
**Given** the browser has cached roster data for `SIS-213` in `sisa_roster_SIS-213`  
**When** the teacher opens Tab 5  
**Then** the student roster table renders within 0 milliseconds using the local cache  
**And** an asynchronous fetch is dispatched to `/api/v1/catalogo-academico/students/byGroup?groupId=...`  
**When** the remote response arrives with updated student records  
**Then** the local cache is updated and the roster table refreshes smoothly without displacement.

### Scenario 3: Gateway Unreachable Triggers Authentic Bolivian Seed Fallback
**Given** the teacher is offline or the SEA Gateway returns an error/empty array  
**When** the system attempts to fetch the student roster for `SIS-213`  
**And** no previous local cache exists in `localStorage`  
**Then** the system automatically generates high-fidelity Bolivian student seed records  
**And** the roster displays authentic Bolivian student names (e.g., *"Mamani Flores Kevin"*, *"Condori Quispe Marisol"*, *"Vargas Torrico Alejandro"*)  
**And** a sync status pill displays `"Modo desconectado (Semilla institucional)"`  
**And** the teacher can proceed to take attendance without interruption.

### Scenario 4: Cross-Career Common Subject Displays Segregated Cohorts
**Given** subject `SIS-213 Programación III` is a common cátedra shared between `Ingeniería de Sistemas` and `Ingeniería de Telecomunicaciones`  
**When** the roster table renders in Tab 5  
**Then** students are visually partitioned into two distinct career sections with banners  
**And** the first banner displays `"Carrera: Ingeniería de Sistemas"` with its student count and sub-totals  
**And** the second banner displays `"Carrera: Ingeniería de Telecomunicaciones"` with its student count and sub-totals  
**And** the filter pills `"Todas las Carreras"`, `"Ing. de Sistemas"`, and `"Ing. de Telecomunicaciones"` are visible in the toolbar.

### Scenario 5: Filtering Roster by Career Cohort
**Given** the unified roster displays students from both *Ingeniería de Sistemas* (20 students) and *Ingeniería de Telecomunicaciones* (10 students)  
**When** the teacher clicks the filter pill `"Ing. de Telecomunicaciones"`  
**Then** the table hides the *Ingeniería de Sistemas* section and displays only the 10 students of *Ingeniería de Telecomunicaciones*  
**And** the active filter pill receives highlighted background styling  
**When** the teacher clicks `"Todas las Carreras"`  
**Then** both career sections are restored to the table view.

### Scenario 6: Batch Marking All Students Present
**Given** 30 students are displayed in the roster table with uncommitted attendance  
**When** the teacher clicks the button `"⚡ Marcar Todos Presentes"`  
**Then** all 30 students have their status set to `PRESENTE`  
**And** all segmented toggle buttons update to active green (`P`)  
**And** the KPI ribbon updates: Total Presentes = 30, Faltas = 0, Atrasos = 0, Licencias = 0  
**And** the % Asistencia badge displays `100%` with the green compliance pill `"Cumple Normativa (>= 80%)"`.

### Scenario 7: Individual 4-State Marking and Observation Entry
**Given** student `Mamani Flores Kevin` is currently marked `PRESENTE`  
**When** the teacher clicks the red button `F` (Falta) on Kevin's row  
**And** types `"Sin justificativo médico"` into the observation input  
**Then** Kevin's status transitions to `FALTA`  
**And** the red button `F` becomes highlighted while `P`, `A`, and `L` become inactive  
**And** the KPI ribbon recalculates instantly, incrementing Faltas by 1 and updating % Asistencia.

### Scenario 8: 80% Rule Early Warning Alert Triggered
**Given** a class of 20 students where 5 students are marked `FALTA` (25% absenteeism)  
**When** the live KPI calculation executes  
**Then** the session attendance percentage is computed as $75.0\%$  
**And** the KPI badge transitions from green to amber/red with an `alert-triangle` icon  
**And** the badge text reads `"Alerta: Asistencia < 80% (75.0%)"`.

### Scenario 9: Idempotent Attendance Save to PostgreSQL and LocalStorage
**Given** the teacher has marked attendance for date `2026-10-21`, class type `TEORICA`, and commission `TA-01`  
**When** the teacher clicks `"Guardar Asistencia"`  
**Then** the client sends a `POST` request to `/api/v1/asistencias/sesion` with the complete session payload  
**And** the backend executes an atomic upsert on table `asistencias_sesiones` and `asistencias_estudiantes`  
**And** the client caches the session in `localStorage` under `sisa_attendance_SIS-213_2026-10-21_TEORICA_TA-01`  
**And** a toast notification displays `"✓ Asistencia guardada correctamente en el sistema institucional"`.

### Scenario 10: Date Picker Change Loads Previously Saved Attendance
**Given** attendance for `2026-10-14` was previously saved with 25 Presentes and 5 Faltas  
**When** the teacher changes the date picker `#asistencia-fecha-input` to `2026-10-14`  
**Then** the client loads the saved session data from local cache or `/api/v1/asistencias/sesion`  
**And** the student rows reflect the exact 25 Presentes and 5 Faltas previously recorded  
**And** the KPI ribbon updates to reflect the historical session metrics.

### Scenario 11: Historical Sessions Accordion Inspection
**Given** 8 class sessions have been saved during the semester for `SIS-213`  
**When** the teacher expands the Historical Sessions Accordion (`#asistencia-historial-accordion`)  
**Then** 8 session summary cards are displayed in chronological order  
**And** each card shows the date, class type, commission, topic covered, and attendance percentage  
**When** the teacher clicks on a historical session card from `2026-09-30`  
**Then** the main editor switches its date to `2026-09-30` and displays that day's roll call.

### Scenario 12: Exporting Official UNITEPC Excel (.xlsx) Report
**Given** attendance has been recorded across multiple sessions for `SIS-213`  
**When** the teacher clicks `"Exportar Asistencia (.xlsx)"` in Tab 5 or the Direct Export Center  
**Then** a `GET` request is dispatched to `/api/v1/office/export/asistencia?materiaCodigo=SIS-213&gestionCodigo=2-2026`  
**And** the backend generates a styled `.xlsx` workbook using Apache POI  
**And** the browser triggers the download of `Asistencia_SIS-213_II-2026.xlsx` containing institutional headers, career cohort sections, session matrix, 80% rule compliance status, and signature lines.

### Scenario 13: Print Dossier and PDF Compilation Format
**Given** the user triggers the browser print dialog or opens the institutional PDF compilation modal  
**When** `@media print` rules are applied  
**Then** interactive buttons, segmented pills, date pickers, and filter controls are hidden  
**And** the attendance list prints as a clean institutional grid with student codes, full names, career tags, attendance states, and summary statistics  
**And** formal endorsement signature lines for *"Docente Titular"* and *"Director de Carrera"* are rendered at the bottom.

### Scenario 14: Career Director Curricular Audit of Attendance
**Given** user `dir.carrera.sis` (Lic. Mariana Rios Vargas) is reviewing course `SIS-213`  
**When** the Director inspects the student attendance records via `view1` or `/api/v1/asistencias/resumen/SIS-213`  
**Then** the Director can view cumulative attendance rates for both *Ingeniería de Sistemas* and *Ingeniería de Telecomunicaciones* students  
**And** the list of students with $< 80\%$ attendance is clearly flagged for pre-exam habilitation audit.
