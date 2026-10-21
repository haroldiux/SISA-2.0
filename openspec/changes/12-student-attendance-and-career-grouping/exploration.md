## Exploration: Student Roster & Attendance Tracking Module with Career Grouping

### Current State

1. **Teacher Workspace & Document Structure (`view1`)**:
   - The teacher workspace in [`app.component.html`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L1100-L2370) is currently organized around 4 pedagogical documents represented as tabs:
     1. Tab 1: **Programa Analítico** (`#tab-analitico`, `.docx`)
     2. Tab 2: **PAC Pedagógico** (`#tab-pac-matrix`, Puntos 1-14)
     3. Tab 3: **Cronograma (20 Semanas)** (`#tab-cronograma-semanas`, Matriz 7)
     4. Tab 4: **Planes de Clase** (`#tab-cronograma-planes`, `.xlsx`)
   - Navigation across these tabs is orchestrated by [`window.switchDocMainTab(tabId)`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js#L277-L325), which controls active visual pills in the top segmented header, updates the contextual sidebar (`.sidebar-tab-nav` in lines 488-506), and displays/hides `.doc-tab-panel` elements.
   - There is currently **no tab or UI panel for student rosters or class-by-class attendance recording**. Teachers currently track attendance externally outside SISA.

2. **SEA Gateway Integration & Group Roster Capabilities**:
   - The backend service [`UnitepcGatewayClient.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/gateway/UnitepcGatewayClient.java#L270-L288) already integrates with the SEA Central Gateway endpoint `/api/v1/student/externals/research/students/byGroup?groupId={groupId}`.
   - The REST proxy endpoint [`GET /api/v1/catalogo-academico/students/byGroup`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/CatalogoAcademicoController.java#L432-L442) is exposed and declared in [`scu-api.constant.ts`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/shared/constants/scu-api.constant.ts#L58).
   - In [`StudentItemDto.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/dto/gateway/StudentItemDto.java#L15-L21), the data model captures student identity: `id` (UUID), `code` (institutional enrollment code), `firstName`, `firstLastName`, and `secondLastName`.
   - However, the frontend [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js) does not yet invoke `students/byGroup`, relying exclusively on group metadata without fetching or displaying enrolled student lists.

3. **Common Subjects Architecture (`groupLinkId`, `isLead`, and Career Clusters)**:
   - In SISA, academic offerings are clustered into synthesized course cards by [`processAndRenderSupervisionData`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js#L6150-L6330).
   - When a subject is shared across multiple careers (e.g. `SIS-213 Programación III` taken simultaneously by students of **Ingeniería de Sistemas** and **Ingeniería de Telecomunicaciones**), the cluster groups share the native SEA `groupLinkId` or a shared schedule slot.
   - The synthesized course object in `materiasData[mKey]` captures:
     - `groups`: All linked theory and practice groups.
     - `carrerasCodes` and `carrerasResolved`: Distinct careers enrolled in the cátedra.
     - `isCommon`: Boolean flag denoting cross-career delivery.
   - In the pedagogical document tabs, [`renderCarreraSubtabs`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js#L7210-L7340) renders sub-tabs for switching career contexts. But for attendance, there is no mechanism yet to group enrolled students by their career with sub-totals.

4. **Persistence & Data Schema (Gaps)**:
   - In PostgreSQL, Flyway migrations ([`V1__init_sisa_schema.sql`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/resources/db/migration/V1__init_sisa_schema.sql) through [`V6__user_management_and_academic_assignments.sql`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/resources/db/migration/V6__user_management_and_academic_assignments.sql)) provide tables for academic assignments (`asignaciones_docentes`), PAC, Cronograma, and in-situ audits (`auditorias_in_situ`), but **no attendance tables (`asistencias_sesiones` / `asistencias_estudiantes`) exist**.
   - No REST endpoints exist under `/api/v1/asistencias`.
   - No attendance export templates or commands exist in [`ScuOfficeController.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuOfficeController.java).

---

### Affected Areas

#### Backend
- **Database / Flyway**:
  - New migration [`V7__student_attendance_tracking.sql`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/resources/db/migration/V7__student_attendance_tracking.sql):
    - Table `asistencias_sesiones`: Stores class session date, subject code, academic term (`gestion_codigo`), class type (`tipo_clase`: TEORICA, PRACTICA), commission (`comision`), topic/observations, teacher username, and audit timestamps.
    - Table `asistencias_estudiantes`: Stores individual student status (`PRESENTE`, `FALTA`, `ATRASO`, `LICENCIA`), student code, full name, career code/name, and optional justification remarks.
    - Constraints: Unique session per `(materia_codigo, fecha, tipo_clase, comision)` and unique mark per `(sesion_id, estudiante_codigo)`.
- **Domain Entities & Enums**:
  - `AsistenciaSesion.java`: JPA entity with bidirectional or cascading relationship to student attendance marks.
  - `AsistenciaEstudiante.java`: JPA entity representing an individual mark.
  - `EstadoAsistencia.java`: Enum representing `PRESENTE` (P), `FALTA` (F), `ATRASO` (A), `LICENCIA` (L).
- **Repositories**:
  - `AsistenciaSesionRepository.java`: Queries sessions by `materiaCodigo`, `fecha`, `tipoClase`, and `gestionCodigo`.
  - `AsistenciaEstudianteRepository.java`: Queries marks by session ID and computes cumulative student attendance metrics.
- **DTOs & API Payloads**:
  - `AsistenciaSesionDto.java`: Complete session transfer object including list of student attendance entries.
  - `AsistenciaEstudianteDto.java`: Student attendance mark record.
  - `GuardarAsistenciaRequest.java`: Request body for atomic attendance submission.
  - `AsistenciaResumenDto.java`: Subject-level summary (total sessions held, student attendance percentages, alerts for students below 80% attendance).
- **Commands & Business Services**:
  - `ScuSaveAsistenciaCmd.java`: Atomic persistence/upsert of attendance sessions with validation and audit logging.
  - `ScuGetAsistenciaSesionCmd.java`: Retrieval of existing session attendance for a specific date/type/commission.
  - `ScuGetAsistenciaResumenCmd.java`: Cumulative attendance statistics calculation.
  - `ScuExportAsistenciaXlsxCmd.java`: Generates formatted institutional Excel attendance report using Apache POI.
- **Controllers**:
  - `ScuAsistenciaController.java`: Exposes `/api/v1/asistencias` endpoints secured with `@PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_DIR_CARRERA', 'ROLE_ADMIN')")`.
  - `ScuOfficeController.java`: Exposes `/api/v1/office/export/asistencia` for official `.xlsx` sheet downloads.

#### Frontend
- **Template Layout ([`app.component.html`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html))**:
  - **Tab 5 Navigation Button** in top bar (`#btn-tab-asistencia`): Styled with segmented pill aesthetics, `clipboard-check` icon, and badge `"5. Lista y Asistencia"`.
  - **Sidebar Contextual Sub-panel** (`#sidebar-tab-asistencia`): Placed under *"Documentos de la Carpeta"*.
  - **Direct Export Center**: Entry for downloading attendance spreadsheet (`.xlsx`).
  - **Tab 5 Panel Container** (`#tab-asistencia`):
    - **Header & Session Bar**: Date picker (defaults to current date within active term II-2026), class type toggle (*Teórica* / *Práctica*), commission selector (`TA-01`, `PL-01`), and optional topic input.
    - **Quick Action Toolbar**: Button `"⚡ Marcar Todos Presentes"`, button `"Guardar Asistencia"`, and sync status indicator.
    - **Real-Time KPI Ribbon**: Live count badges for *Total Inscritos*, *Presentes (P)*, *Faltas (F)*, *Atrasos (A)*, *Licencias (L)*, and *% Cumplimiento Global* (with color coding: $\ge 80\%$ green, $< 80\%$ red/amber alert).
    - **Career Cohort Filter Pills**: For common subjects, pills for `"Todas las Carreras"`, `"Ing. de Sistemas"`, `"Ing. de Telecomunicaciones"`, etc.
    - **Institutional Student Roster Table**: Grouped by career section with clear banner headers, sub-totals, student code, full names, 4-way segmented toggle buttons (P / F / A / L), and observation inputs.
    - **Historical Sessions Summary Drawer / Accordion**: Collapsible review of past dates taken during the term.
- **Controller Logic ([`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js))**:
  - Update `window.switchDocMainTab` to handle `tab-asistencia` with active ring styling (`ring-teal-500/20`), sidebar synchronization, and contextual label update.
  - Implement roster fetching pipeline:
    - Queries `/api/v1/catalogo-academico/students/byGroup` for each group in the active subject cluster.
    - Enriches each student record with their respective career metadata (`carreraCodigo`, `carreraNombre`).
    - Cache-Aside in `localStorage` (`sisa_roster_${mKey}`) with institutional offline fallback seed data (realistic Bolivian student rosters).
  - Implement interactive attendance taking methods:
    - `window.loadAttendanceForDate(mKey, date, classType, comision)`
    - `window.setStudentAttendanceStatus(studentCode, status)`
    - `window.markAllStudentsPresent()`
    - `window.updateAttendanceLiveKPIs()`
    - `window.filterAttendanceByCareer(careerCode)`
    - `window.saveAttendanceSession()` (hybrid online POST + `localStorage` backup).
  - Update export and print workflows:
    - `window.exportAttendanceExcel()`
    - Update `window.openPdfPrintModal()` to include *Nómina y Registro de Asistencia* in institutional PDF compilations.
- **Constants**:
  - [`scu-api.constant.ts`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/shared/constants/scu-api.constant.ts): Declare `/api/v1/asistencias` endpoints.

---

### Approaches

```
+---------------------------------------------------------------------------------------------------+
| APPROACH COMPARISON MATRIX                                                                        |
+--------------------------+-----------------------+-----------------------+------------------------+
| Criterion                | Approach 1: Client-   | Approach 2: Full-     | Approach 3: SEA Direct |
|                          | Only LocalStorage     | Stack Integrated      | Proxy (No SISA Tables) |
+--------------------------+-----------------------+-----------------------+------------------------+
| Persistence Scope        | Local browser only    | PostgreSQL + Hybrid   | SEA Gateway only       |
| Multi-device Sync        | ❌ No                 | ✅ Yes                | ⚠️ Dependent on SEA   |
| Career Director Audit    | ❌ Inaccessible       | ✅ Full visibility    | ⚠️ Limited             |
| Offline Resilience       | ✅ Native             | ✅ Cache-Aside        | ❌ Fails when offline  |
| Official Excel Export    | ⚠️ Basic client CSV   | ✅ Apache POI + Xlsx  | ❌ Not supported       |
| 80% Rule KPI Tracking    | ⚠️ Volatile           | ✅ Persistent History | ❌ Not available       |
| Effort & Architecture    | Low / Technical debt  | Balanced / Production | Blocked by SEA Gateway |
+--------------------------+-----------------------+-----------------------+------------------------+
```

#### Approach 1: Client-Only LocalStorage Attendance with Ad-Hoc Group Fetch
- **Description**: Implement Tab 5 entirely inside `app-controller.js`. The client fetches students from `/api/v1/catalogo-academico/students/byGroup` and saves attendance marks exclusively in browser `localStorage`.
- **Pros**: Minimal backend changes; fastest to prototype.
- **Cons**: Severe limitation: data is confined to a single browser. If a teacher logs in from another PC or classroom, attendance history is lost. Career Directors (`ROLE_DIR_CARRERA`) and Academic Direction (`ROLE_DIR_ACADEMICA`) cannot audit student attendance or verify the mandatory 80% habilitation threshold.

#### Approach 2: Full-Stack Integrated Module (JPA + Flyway V7 + REST Endpoints + Hybrid Offline Cache) [RECOMMENDED]
- **Description**:
  1. Create Flyway migration `V7__student_attendance_tracking.sql` with tables `asistencias_sesiones` and `asistencias_estudiantes`.
  2. Implement Spring Boot domain entities, repositories, commands, and controller `/api/v1/asistencias`.
  3. Support Apache POI official Excel generation in `ScuOfficeController.java`.
  4. Implement Tab 5 in `app.component.html` and `app-controller.js` with Cache-Aside local fallback for offline resilience, live KPI counters, career grouping headers, sub-totals, and quick marking button.
- **Pros**:
  - Institutional durability: attendance is preserved in PostgreSQL and auditable across roles.
  - Multi-device consistency for teachers moving between university classrooms and campus offices.
  - Seamless offline resilience: allows taking roll without active internet connection, auto-syncing upon reconnection.
  - Exact compliance with UNITEPC pedagogical regulations (80% attendance rule, career separation in common subjects, formal Excel reports).
- **Cons**: Requires coordinated backend and frontend changes (migration, Java commands, controller, and frontend UI logic).

#### Approach 3: Direct Live SEA Gateway Attendance Synching (No SISA Attendance Tables)
- **Description**: Treat SISA purely as an interface that immediately writes attendance into the central SEA Gateway database via remote endpoints.
- **Cons**: Unfeasible. The SEA Gateway documentation (`INTEGRACION_SERVICIOS_SEA_Y_MENU.md`) confirms that SEA only exposes read-only endpoints (`students/byGroup`) for research queries. It does not provide endpoints for logging daily attendance sessions or student marks. SISA must maintain attendance records.

---

### Recommendation

Adopt **Approach 2: Full-Stack Integrated Module (JPA + Flyway V7 + REST Endpoints + Hybrid Offline Cache)**.

**Rationale**:
1. **Curricular Alignment**: The UNITEPC Academic Regulations mandate an 80% minimum attendance threshold for students to be eligible for final evaluation. This requires persistent, historical record-keeping across the semester, accessible to both teachers and Career Directors during audits.
2. **Pedagogical Tab Integration**: Placing Tab 5 alongside the 4 existing documents (Programa Analítico, PAC, Cronograma, Planes de Clase) seamlessly completes the teacher's Carpeta Docente lifecycle: planning (Tabs 1-4) followed by execution & verification (Tab 5).
3. **Common Subject Clarity**: Common cátedras (shared between 2 or more careers) frequently cause administrative confusion regarding which career an enrolled student belongs to. Partitioning the roster into distinct career cohorts with dedicated sub-totals and badges eliminates roster ambiguity.
4. **Resilient UX**: Combining live API persistence with Cache-Aside local caching ensures instantaneous UI responses and complete immunity to transient network or Gateway outages.

---

### Risks

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **SEA Gateway Unreachable or Empty Group Roster** | High | Implement a robust 3-tier fallback in the frontend and backend: (1) Live Gateway fetch $\rightarrow$ (2) `localStorage` cache $\rightarrow$ (3) Seeded institutional mock student roster with authentic Bolivian names and career tags. Teachers can continue taking roll uninterrupted. |
| **Subject Multi-Commission Complexity** | Medium | A single subject card may cluster multiple practical commissions (`PL-01`, `PL-02`) and theory (`TA-01`). The UI will feature a Commission selector to take attendance either per practical group or unified for theoretical lectures. |
| **Concurrent Attendance Modification** | Low | Session records enforce a PostgreSQL unique constraint on `(materia_codigo, fecha, tipo_clase, comision)`. Upsert logic in `ScuSaveAsistenciaCmd` updates existing student marks atomically, avoiding duplicate entries. |
| **Common Subject Cross-Career Student Misattribution** | Medium | Associate each student with the `careerCode` and `careerName` of the specific SEA group they are enrolled in. The UI will prominently group rows by career with distinct visual banners and sub-totals. |
| **Printing & PDF Layout Clutter** | Low | Use dedicated `@media print` rules: suppress interactive buttons and segmented toggles, replacing them with a crisp institutional grid containing signatures for teacher and career direction. |

---

### Ready for Proposal

The exploration confirms full technical feasibility. The implementation scope is well-defined and ready for the formal proposal and task specification:
- Change Name: `12-student-attendance-and-career-grouping`
- Artifact Directory: `openspec/changes/12-student-attendance-and-career-grouping/`
- Target deliverables:
  1. Proposal (`proposal.md`)
  2. Technical Specification (`specs/student-attendance-spec.md`)
  3. Tasks breakdown (`tasks.md`)
