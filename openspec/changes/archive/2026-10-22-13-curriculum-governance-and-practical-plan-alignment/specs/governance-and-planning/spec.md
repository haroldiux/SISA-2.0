# Specification: Curriculum Governance, Shared vs Personal Documentation, Cascading Inheritance, and Practical Plan Alignment

## 1. Overview & Context

This specification establishes the official requirements and formal behavioral contracts for **Curriculum Governance, Cascading Inheritance, and Practical Lesson Plan Alignment** within the SISA platform for Universidad Técnica Privada Cosmos (UNITEPC).

Under UNITEPC Academic Regulations and Bolivian University System quality accreditation norms, university syllabus design constitutes cátedra-wide institutional policy:
1. **Documento 1: Programa Analítico** ([`#tab-analitico`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L1440-L1580), `.docx`)
2. **Documento 2: PAC Pedagógico** ([`#tab-pac-matrix`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L1583-L1880), Puntos 1-14)
3. **Documento 3: Cronograma de 20 Semanas** ([`#tab-cronograma-semanas`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L1883-L1974), Matriz 7)

These master documents define the institutional contract of the subject. They are formulated by Career Direction (`ROLE_DIR_CARRERA`, `ROLE_DIR_ACADEMICA`, `ROLE_ADMIN`) in academic consensus with the cátedra faculty. Individual teachers (`ROLE_DOCENTE`) are executors who must NOT have unilateral authority to upload, overwrite, or mutate master curricular definitions.

In contrast, teacher classroom execution belongs to:
4. **Documento 4: Planes de Clase** ([`#tab-cronograma-planes`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L1977-L2380), `.xlsx`)
5. **Documento 5: Lista y Asistencia** ([`#tab-asistencia`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L2383-L2700), Registro Institucional & `.xlsx`)

This change establishes a sealed governance boundary, an automated cascading data pipeline from master documents to micro-planning, strict alignment with the 7 official sections of [`PLAN DE CLASES PRÁCTICO.xlsx`](file:///c:/PROYECTOS/SISA/DOCUMENTOS%20BASE/DOCUMENTOS%20PARA%20CARPETA%20DOCENTE%20BASE/BLANCOS/PLAN%20DE%20CLASES%20PRÁCTICO.xlsx), and component-driven modality segmentation.

---

## 2. Requirements

### REQ-GOV-01: Backend RBAC on Master Document Ingestion (Director Only)
- **REQ-GOV-01.1**: The master document ingestion endpoints in [`ScuOfficeController.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuOfficeController.java#L289-L417):
  - `POST /api/v1/office/import/cronograma` (and `/cronograma/import`)
  - `POST /api/v1/office/import/pac` (and `/pac/import`)
  - `POST /api/v1/office/import/programa-analitico` (and `/programa-analitico/import`)
  MUST be restricted with `@PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_ADMIN')")`.
- **REQ-GOV-01.2**: If an authenticated user with `ROLE_DOCENTE` attempts to invoke any of the endpoints in REQ-GOV-01.1, the Spring Security authorization interceptor MUST abort execution immediately and respond with HTTP `403 Forbidden`.
- **REQ-GOV-01.3**: The planning lifecycle endpoints in [`ScuPlanningController.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuPlanningController.java#L81-L190):
  - `POST /api/v1/planificaciones/pac` (`savePac`)
  - `POST /api/v1/planificaciones/pac/{id}/submit` (`submitPacById`)
  - `POST /api/v1/planificaciones/submit` (`submitPacByAssignment`)
  - `POST /api/v1/planificaciones/programa-analitico` (`saveProgramaAnalitico`)
  MUST be restricted with `@PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_ADMIN')")`.
- **REQ-GOV-01.4**: Ingestion and saving of personal execution documents:
  - `POST /api/v1/office/import/plan-clase` (and `/plan-clase/import`)
  - `POST /api/v1/planificaciones/plan-clase` (`savePlanClase`)
  MUST remain accessible to teachers under `@PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_DIR_CARRERA', 'ROLE_ADMIN')")`.

### REQ-GOV-02: Backend RBAC on Official Document Exports (Director Only)
- **REQ-GOV-02.1**: In [`SecurityConfig.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/security/SecurityConfig.java#L53-L73), the route `/api/v1/office/export/**` MUST be removed from `permitAll()` and routed through authenticated access control.
- **REQ-GOV-02.2**: The official compiled cátedra export endpoints in [`ScuOfficeController.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuOfficeController.java#L72-L287):
  - `GET / POST /api/v1/office/export/pac` (and `/export/pac/{id}`)
  - `GET / POST /api/v1/office/export/cronograma` (and `/export/cronograma/{id}`)
  - `GET / POST /api/v1/office/export/programa-analitico` (and `/export/programa-analitico/{id}`)
  MUST be secured with `@PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_VICERRECTOR_SEDE', 'ROLE_VICERRECTOR_NACIONAL', 'ROLE_ADMIN')")`.
- **REQ-GOV-02.3**: Unauthenticated requests to `/api/v1/office/export/**` MUST return HTTP `401 Unauthorized`.
- **REQ-GOV-02.4**: Authenticated requests from users with `ROLE_DOCENTE` targeting official cátedra export endpoints MUST return HTTP `403 Forbidden`.
- **REQ-GOV-02.5**: Teacher personal export endpoints:
  - `GET / POST /api/v1/office/export/plan-clase` (and `/export/plan-clase/{sesionId}`)
  - `GET /api/v1/office/export/asistencia`
  MUST remain authorized for `@PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_DIR_CARRERA', 'ROLE_ADMIN')")`.

### REQ-GOV-03: Frontend Read-Only Locking of Documentos 1, 2, 3 for Docente
- **REQ-GOV-03.1**: The client state controller in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js) MUST provide a centralized function `window.applyUserRolePermissions(role)` invoked on application initialization, session assignment change, and role switching.
- **REQ-GOV-03.2**: When the active authenticated user has `ROLE_DOCENTE`:
  - The top banner action button `"Subir Documentación"` ([`app.component.html#L1223`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L1223)) calling `window.triggerAutoCapture()` MUST be hidden or set to `disabled` with an informative tooltip `"Acción exclusiva para Dirección de Carrera"`.
  - In Tab 1 (`#tab-analitico`), Tab 2 (`#tab-pac-matrix`), and Tab 3 (`#tab-cronograma-semanas`), the file upload buttons (`#btn-import-programa`, `#btn-import-pac`, `#btn-import-cronograma`) MUST be hidden.
  - Tabs 1, 2, and 3 MUST display a prominent institutional banner badge: `"🤝 Definido por Dirección de Carrera"` with an explanatory subtitle: *"Documento oficial aprobado por consenso de cátedra. Modo de solo lectura para el cuerpo docente."*
  - All input fields, textareas, selects, and row addition/deletion buttons within Tabs 1, 2, and 3 MUST have `readonly` / `disabled` attributes applied, accompanied by visual styling (`bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300`).
- **REQ-GOV-03.3**: In the contextual sidebar *"Centro de Descargas y Exportación Oficial"* ([`app.component.html#L515-L542`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L515-L542)):
  - For `ROLE_DOCENTE`: Master compiled document downloads (`programa_docx`, `pac_gral_xlsx`, `pac_prac_xlsx`) MUST be visually locked or disabled, rendering an advisory badge `"Exclusivo Dirección"`. Direct personal exports (`planes_teorico_xlsx`, `planes_prac_xlsx`, `asistencia`) MUST remain fully active.
  - For `ROLE_DIR_CARRERA`, `ROLE_DIR_ACADEMICA`, and `ROLE_ADMIN`: All download buttons MUST remain unlocked.

### REQ-GOV-04: Automated Cascading Data Inheritance into Lesson Plan Sheets
- **REQ-GOV-04.1**: In [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js), the system MUST implement `window.cascadeMasterDataToPlanSheet(sheetIndex, sessionOrTopicIndex)` and update `window.generateDefaultPlanesList(mKey)` so that plan sheets are never created empty.
- **REQ-GOV-04.2**: The cascading inheritance pipeline MUST automatically extract:
  - From **Programa Analítico** (`activeAnaliticoUnidades`):
    - Learning unit title (`unidadTitulo`) corresponding to the current topic.
    - Official APA Bibliographies (`bibliografias`) assigned to the unit.
  - From **PAC Pedagógico** (`activePacElementosCompetencia`):
    - Elemento de Competencia articulated with the unit.
  - From **Cronograma de 20 Semanas** (`matriz7`):
    - Specific topic title (`contenidoTema`).
    - The three saberes: Conceptual (`saberConceptual`), Procedimental (`saberProcedimental`), and Actitudinal (`saberActitudinal`).
    - Expected learning outcomes and Bloom taxonomy level (`objetivoSesion`, `logrosEsperados`).
    - Suggested performance criteria and evidence indicators.
- **REQ-GOV-04.3**: Inside Tab 4 (`#tab-cronograma-planes`), cascaded master data MUST populate into the `"🤝 Sección Compartida (Cátedra)"` container ([`app.component.html#L2018-L2100`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L2018-L2100)).
- **REQ-GOV-04.4**: Master fields in the shared section (`#plan-unidad-input`, `#plan-tema-input`, `#plan-elemento-input`, `#plan-conceptual-input`, `#plan-procedimental-input`, `#plan-actitudinal-input`) MUST be rendered as **read-only** elements with institutional badges for all teachers, guaranteeing that micro-planning remains aligned with institutional policy.
- **REQ-GOV-04.5**: Personal execution fields in the `"👤 Sección Personal (Docente / Comisión)"` container ([`app.component.html#L2105-L2376`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L2105-L2376))—including teacher name, execution date, commission code, laboratory environment, student count, teaching strategies, assessment instruments, step durations, and reflection notes—MUST remain 100% editable by the teacher.

### REQ-GOV-05: 7-Section Practical Lesson Plan Form Structure
- **REQ-GOV-05.1**: When the active plan type is `PRACTICO` (`activePlanType === 'PRACTICO'`), Tab 4 (`#tab-cronograma-planes`) MUST render the complete institutional 7-section form corresponding strictly to [`PLAN DE CLASES PRÁCTICO.xlsx`](file:///c:/PROYECTOS/SISA/DOCUMENTOS%20BASE/DOCUMENTOS%20PARA%20CARPETA%20DOCENTE%20BASE/BLANCOS/PLAN%20DE%20CLASES%20PRÁCTICO.xlsx):
  - **Section 1: 1. DATOS GENERALES**:
    - Docente (`#plan-docente-input`), Asignatura (`#plan-asig-input`), Fecha (`#plan-fecha-input`), Carrera (`#plan-carrera-input`), Unidad de Aprendizaje (`#plan-unidad-input`), Elemento de Competencia (`#plan-elemento-input`). Cascaded and locked.
  - **Section 2: 2. DATOS DE LA PRÁCTICA**:
    - Título de la práctica (`#plan-prac-titulo`), Fecha (`#plan-prac-fecha`), Duración (`#plan-prac-duracion`), Semestre (`#plan-prac-semestre`), Ambiente / Escenario (`#plan-prac-ambiente`), N° estudiantes (`#plan-prac-estudiantes`), Docente responsable (`#plan-prac-docente-resp`).
  - **Section 3: 3. ALINEACIÓN Y RECURSOS**:
    - Objetivo de aprendizaje (`#plan-prac-objetivo`), Resultados de aprendizaje con taxonomía de Bloom (`#plan-prac-bloom-res`), Preparación de materiales previos (`#plan-prac-materiales-previos`), Equipamiento de entorno (`#plan-prac-equipamiento`), Equipos específicos (`#plan-prac-equipo-especifico`).
  - **Section 4: 4. MODELO METODOLÓGICO**:
    - Form table with 4 institutional phases:
      1. *Preparación*
      2. *Ejecución guiada*
      3. *Ejecución autónoma*
      4. *Cierre*
    - Each phase MUST render 3 dedicated columns:
      - *Finalidad* (`#plan-prac-fase[N]-finalidad`)
      - *Actividad del Docente* (`#plan-prac-fase[N]-act-docente`)
      - *Actividad del Estudiante* (`#plan-prac-fase[N]-act-estudiante`)
  - **Section 5: 5. EVALUACIÓN DE LOS APRENDIZAJES**:
    - Table with 2 evaluation rows: *Formativa* and *Sumativa*, each providing:
      - *Actividades y Técnicas*
      - *Instrumentos*
      - *Evidencias*
  - **Section 6: 6. DESARROLLO**:
    - Step-by-step matrix with dynamic rows containing:
      - *Fase común* dropdown (`Preparación`, `Ejecución guiada`, `Ejecución autónoma`, `Cierre`)
      - *Tiempo (min)* numeric input with dynamic sum calculation
      - *Actividad* textarea
      - *Recursos* textarea
      - *Otra información* textarea
    - Toolbar with `"[+] Agregar Paso"` and `"[x] Eliminar"` buttons per row.
  - **Section 7: 7. NOTAS DEL DOCENTE**:
    - Longitudinal reflection log covering Sessions 1 through 19:
      - Session number identifier (1.0 to 19.0)
      - Teacher reflection observation textarea per session.
- **REQ-GOV-05.2**: The dynamic time sum in Section 6 MUST recalculate live on any duration input and synchronize with the total practice duration indicator.

### REQ-GOV-06: Apache POI Exporter & Parser Parity for 7 Practical Plan Sections
- **REQ-GOV-06.1**: The backend parser strategy [`PlanClasePracticoParser.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/office/strategy/impl/PlanClasePracticoParser.java) and [`OfficeTemplateService.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/office/OfficeTemplateService.java) MUST target the institutional template [`PLAN DE CLASES PRÁCTICO.xlsx`](file:///c:/PROYECTOS/SISA/DOCUMENTOS%20BASE/DOCUMENTOS%20PARA%20CARPETA%20DOCENTE%20BASE/BLANCOS/PLAN%20DE%20CLASES%20PRÁCTICO.xlsx) with zero cell coordinate drift.
- **REQ-GOV-06.2**: Cell writing in `populatePracticoSheet` MUST strictly write to top-left anchor cells of merged ranges:
  - **Section 1**: C12 (Docente), G12 (Asignatura), C13 (Fecha), G13 (Carrera), C15 (Unidad de aprendizaje 1), C16 (Elemento de Competencia 1).
  - **Section 2**: C20 (Título), E20 (Fecha), G20 (Duración), I20 (Semestre), C21 (Ambiente), E21 (N° estudiantes), G21 (Docente).
  - **Section 3**: D25 (Objetivo de aprendizaje), D26 (Resultados Bloom), D27 (Preparación materiales), D28 (Equipamiento entorno), D29 (Equipo práctica).
  - **Section 4**:
    - Row 34 (*Preparación*): C34 (Finalidad), F34 (Actividad Docente), H34 (Actividad Estudiante).
    - Row 35 (*Ejecución guiada*): C35 (Finalidad), F35 (Actividad Docente), H35 (Actividad Estudiante).
    - Row 36 (*Ejecución autónoma*): C36 (Finalidad), F36 (Actividad Docente), H36 (Actividad Estudiante).
    - Row 37 (*Cierre*): C37 (Finalidad), F37 (Actividad Docente), H37 (Actividad Estudiante).
  - **Section 5**:
    - Row 42 (*Formativa*): C42 (Actividades y Técnicas), F42 (Instrumentos), H42 (Evidencias).
    - Row 43 (*Sumativa*): C43 (Actividades y Técnicas), F43 (Instrumentos), H43 (Evidencias).
  - **Section 6**:
    - Rows 48 to 54 (up to 7 steps): Col B (Fase común), Col C (Tiempo), Col D (Actividad), Col F (Recursos), Col H (Otra información).
  - **Section 7**:
    - Rows 59 to 77 (Sessions 1.0 to 19.0): Col B (Session Nro), Col C (Notas del docente).
- **REQ-GOV-06.3**: In `parsePracticoSheet`, the parser MUST parse and restore all 7 sections from an uploaded `.xlsx` file into typed fields of [`ScuPlanClaseDto`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/request/ScuPlanClaseDto.java).
- **REQ-GOV-06.4**: Template file lookup in `openTemplateStream()` MUST prioritize `classpath:templates/template_plan_practico.xlsx`, then relative and absolute filesystem paths to `PLAN DE CLASES PRÁCTICO.xlsx` and `Copia de PLAN DE CLASES PRÁCTICO.xlsx`.

### REQ-GOV-07: Component Type Modality Segmentation (TA vs PL/PA)
- **REQ-GOV-07.1**: The client state controller MUST inspect commission component types via `detectComponentTypes(groups)`:
  - If teacher's assigned groups contain ONLY theoretical components (`TA` with no `PL`, `PA`, or `PS`):
    - Tab 4 MUST automatically activate `TEORICO` mode.
    - Theoretical 5-moment sequence (`#plan-secuencia-standard`) MUST be visible.
    - Practical fields (`#plan-practico-fields`, `#plan-secuencia-practica`, Section 6 Desarrollo, Section 7 Notas) MUST be hidden.
    - The modality toggle button group MUST be hidden.
  - If teacher's assigned groups contain ONLY practical components (`PL`, `PA`, or `PS` with no `TA`):
    - Tab 4 MUST automatically activate `PRACTICO` mode.
    - Full 7-section practical form MUST be visible.
    - Theoretical 5-moment sequence MUST be hidden.
    - The modality toggle button group MUST be hidden.
  - If teacher is assigned to BOTH theoretical and practical components (`TA` + `PL`/`PA`/`PS`):
    - Tab 4 MUST render a prominent segmented toggle button group in `#plan-type-switcher-container`:
      - `[ 📘 Plan Teórico (TA) ]`
      - `[ 🔬 Guía Práctica (PL/PA) ]`
    - Clicking either button MUST switch between theoretical 5-moment planning and 7-section practical planning seamlessly, preserving form state for each modality without data loss.

---

## 3. Formal Scenarios (Given / When / Then)

### Scenario 1: Teacher Attempts Unauthorized Master PAC Import (REQ-GOV-01)
**Given** an authenticated user with role `ROLE_DOCENTE`  
**When** the user sends a `POST` request to `/api/v1/office/import/pac` with a valid multipart `.xlsx` file  
**Then** the Spring Security filter chain intercepts the request  
**And** the server responds with HTTP status `403 Forbidden`  
**And** no master PAC data is modified or overwritten in PostgreSQL.

### Scenario 2: Career Director Successfully Imports Master Programa Analítico (REQ-GOV-01)
**Given** an authenticated user with role `ROLE_DIR_CARRERA`  
**When** the user sends a `POST` request to `/api/v1/office/import/programa-analitico` with a valid `.docx` file  
**Then** the server responds with HTTP status `200 OK`  
**And** the parsed learning units and themes are saved and broadcast to the cátedra.

### Scenario 3: Anonymous User Attempts Official Master Export (REQ-GOV-02)
**Given** an unauthenticated client request  
**When** the client sends a `GET` request to `/api/v1/office/export/pac?carreraId=1`  
**Then** the security filter chain rejects the request  
**And** the server responds with HTTP status `401 Unauthorized`.

### Scenario 4: Teacher Attempts Official Master Export (REQ-GOV-02)
**Given** an authenticated user with role `ROLE_DOCENTE`  
**When** the user sends a `GET` request to `/api/v1/office/export/programa-analitico?carreraId=1`  
**Then** the `@PreAuthorize` authorization rule detects insufficient permissions  
**And** the server responds with HTTP status `403 Forbidden`.

### Scenario 5: Teacher Views Documentos 1, 2, 3 in Portal Shell (REQ-GOV-03)
**Given** a teacher is logged into SISA with `ROLE_DOCENTE` and views subject `SIS-213`  
**When** the teacher navigates to Tab 1 (`#tab-analitico`), Tab 2 (`#tab-pac-matrix`), or Tab 3 (`#tab-cronograma-semanas`)  
**Then** the header displays the institutional badge `"🤝 Definido por Dirección de Carrera"`  
**And** the file upload buttons for `.docx` and `.xlsx` are not rendered  
**And** all form fields, textareas, and row-manipulation buttons are `disabled` / `readonly` with muted background styling  
**And** the top banner `"Subir Documentación"` button is disabled or hidden.

### Scenario 6: Automatic Cascading of Master Subject Data into Lesson Plan Sheet (REQ-GOV-04)
**Given** the Career Director has established learning units in Programa Analítico and topics in Cronograma  
**When** a teacher opens Tab 4 (`#tab-cronograma-planes`) or switches to sheet `UA-1 Tema 1`  
**Then** `window.cascadeMasterDataToPlanSheet(0, 0)` executes automatically  
**And** `#plan-unidad-input` is populated with the Unidad 1 title  
**And** `#plan-tema-input` is populated with the Tema 1 name  
**And** `#plan-elemento-input` is populated with the Elemento de Competencia from PAC  
**And** `#plan-conceptual-input`, `#plan-procedimental-input`, and `#plan-actitudinal-input` are populated with the 3 Saberes from Matriz 7  
**And** these fields are locked with the badge `"🤝 Definido por Dirección de Carrera"`  
**And** the teacher's personal fields (docente, fecha, estrategias, evaluación, momentos) remain fully editable.

### Scenario 7: Teacher Edits 7-Section Practical Lesson Plan (REQ-GOV-05)
**Given** the teacher is viewing a practical lesson plan sheet (`activePlanType === 'PRACTICO'`)  
**When** the teacher enters the laboratory data, fills out the 4-phase table (Finalidad, Actividad Docente, Actividad Estudiante), and adds 3 step rows to Section 6 Desarrollo  
**Then** the total duration in Section 6 updates dynamically to reflect the sum of step minutes  
**And** entering a reflection note in Section 7 for Session 1 stores the note under `notasDocente[1.0]`  
**And** saving the plan persists the complete 7-section structure to `ScuPlanClaseDto` without data loss.

### Scenario 8: Practical Class Plan POI Export Roundtrip Fidelity (REQ-GOV-06)
**Given** a populated practical class plan with all 7 sections in SISA  
**When** the teacher clicks `"Exportar Planes de Clase (.xlsx)"`  
**Then** `OfficeTemplateService` clones `PLAN DE CLASES PRÁCTICO.xlsx`  
**And** Section 4 phases are written to rows 34-37 across cols C:E, F:G, and H:I  
**And** Section 5 evaluations are written to rows 42-43  
**And** Section 6 steps are written to rows 48-54  
**And** Section 7 notes are written to rows 59-77  
**And** re-importing the exported workbook through `PlanClasePracticoParser` accurately restores all 7 sections into the client form state.

### Scenario 9: Teacher Assigned Purely to Theoretical Modality (REQ-GOV-07)
**Given** a teacher assigned to commission `TA-01` with no laboratory groups  
**When** the teacher opens Tab 4 (`#tab-cronograma-planes`)  
**Then** the interface automatically renders the theoretical 5-moment sequence  
**And** practical laboratory fields and the modality switcher are hidden.

### Scenario 10: Teacher Assigned to Dual Theoretical and Practical Commissions (REQ-GOV-07)
**Given** a teacher assigned to both theoretical `TA-01` and laboratory `PL-01`  
**When** the teacher opens Tab 4 (`#tab-cronograma-planes`)  
**Then** the modality switcher displays `[ 📘 Plan Teórico (TA) ]` and `[ 🔬 Guía Práctica (PL/PA) ]`  
**When** the teacher clicks `[ 🔬 Guía Práctica (PL/PA) ]`  
**Then** the view transitions smoothly to the 7-section practical lesson plan without losing changes entered in the theoretical plan.
