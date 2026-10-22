## Exploration: Curriculum Governance, Shared vs Personal Documentation, Cascading Inheritance, and Practical Plan Alignment

### Current State

1. **Governance & Role Permissions Discrepancies**:
   - In [`ScuOfficeController.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuOfficeController.java#L290-L390), the document import endpoints for official subject documentation:
     - `/import/programa-analitico` (Documento 1)
     - `/import/pac` (Documento 2)
     - `/import/cronograma` (Documento 3)
     are currently secured with `@PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_ADMIN')")`. This inadvertently grants individual teachers upload and overwrite authority over cátedra-wide curricular definitions, while omitting `ROLE_DIR_CARRERA` and `ROLE_DIR_ACADEMICA`.
   - In [`SecurityConfig.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/security/SecurityConfig.java#L53-L65), the route `/api/v1/office/export/**` is listed under `permitAll()`, meaning unauthenticated access is permitted and role restrictions are not enforced on compiled official exports.
   - In [`ScuPlanningController.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuPlanningController.java#L81-L188), `POST /pac`, `POST /submit`, and `POST /programa-analitico` also permit `ROLE_DOCENTE`, rather than reserving master planning authority to Career Directors.
   - On the frontend in [`app.component.html`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html) and [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js):
     - The top banner contains an unconditional `"Subir Documentación"` button calling `window.triggerAutoCapture()`.
     - Inside Tabs 1, 2, and 3, upload/import buttons (`importProgramaDocx`, `importPacExcel`) and all input/textarea fields remain editable regardless of whether the authenticated user is a teacher (`ROLE_DOCENTE`) or a director (`ROLE_DIR_CARRERA`).
     - The sidebar `"Centro de Descargas y Exportación Oficial"` displays download buttons for all documents to any logged-in user.

2. **Absence of Cascading Data Inheritance into Plan de Clase**:
   - In [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js#L4968-L4975), `window.generateDefaultPlanesList = function(mKey) { return []; };` returns an empty array.
   - When a teacher views or creates a Plan de Clase sheet, master subject fields defined at the subject level by the Director (Unidades de Aprendizaje, Tema específico, Elemento de Competencia, Resultados de Aprendizaje, Logros esperados, Indicadores, Saberes, Bibliografías) do not auto-populate from the master subject state (`activeAnaliticoUnidades`, `activePacElementosCompetencia`, or `matriz7`).
   - If the Director updates the master cronograma or PAC, the existing plan sheets remain static or blank, forcing teachers into redundant manual data entry.

3. **Gaps in Practical Class Plan (Plan de Clases Práctico) Alignment**:
   - Direct cell analysis of [`PLAN DE CLASES PRÁCTICO.xlsx`](file:///c:/PROYECTOS/SISA/DOCUMENTOS%20BASE/DOCUMENTOS%20PARA%20CARPETA%20DOCENTE%20BASE/BLANCOS/PLAN%20DE%20CLASES%20PRÁCTICO.xlsx) reveals an institutional 7-section structure:
     1. **1. DATOS GENERALES** (Rows 10-16): Docente (B12), Asignatura (F12), Fecha (B13), Carrera (F13), Unidad de Aprendizaje 1 (B15), Elemento de Competencia 1 (B16).
     2. **2. DATOS DE LA PRÁCTICA** (Rows 18-21): Título (B20), Fecha (D20), Duración (F20), Semestre (H20), Ambiente (B21), N° de estudiantes (D21), Docente (F21).
     3. **3. ALINEACIÓN Y RECURSOS** (Rows 23-29): Objetivo de aprendizaje (B25), Resultados de aprendizaje - taxonomía de Bloom (B26), Preparación de materiales de aprendizaje previo a la sesión (B27), Equipamiento entorno (B28), Equipo para la práctica (B29).
     4. **4. MODELO METODOLÓGICO** (Rows 31-37): Table with 4 institutional phases (*Preparación*, *Ejecución guiada*, *Ejecución autónoma*, *Cierre*), each requiring 3 distinct columns: *Finalidad* (C:E), *Actividad del Docente* (F:G), and *Actividad del Estudiante* (H:I).
     5. **5. EVALUACIÓN DE LOS APRENDIZAJES** (Rows 39-43): Table with 2 rows (*Formativa*, *Sumativa*) and 3 columns: *Actividades y Técnicas* (C:E), *Instrumentos* (F:G), and *Evidencias* (H:I).
     6. **6. DESARROLLO** (Rows 45-55): Step-by-step matrix with 5 columns: *Fase común* (B), *Tiempo* (C), *Actividad* (D:E), *Recursos* (F:G), and *Otra información* (H:I).
     7. **7. NOTAS DEL DOCENTE** (Rows 56-77): Longitudinal log for sessions 1.0 through 19.0 (B59:B77) with dedicated teacher reflective notes (C:I).
   - In [`app.component.html`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L2123-L2376), the current practical plan section only features basic inputs for ambiente, estudiantes, and 4 phase textareas. It lacks the 3-column methodological table, lacks Section 6 (Desarrollo table), and completely omits Section 7 (Notas del Docente).
   - In the backend parser [`PlanClasePracticoParser.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/office/strategy/impl/PlanClasePracticoParser.java#L305-L343) and [`OfficeTemplateService.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/office/OfficeTemplateService.java#L242-L272), POI export leaves Sections 4, 6, and 7 blank in generated workbooks.

4. **Class Type Segmentation (Teórica vs Práctica)**:
   - While [`detectComponentTypes`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js#L577-L682) identifies whether course groups belong to `TA`, `PA`, `PL`, or `PS`, Tab 4 does not cleanly segregate tabs based on teacher assignment:
     - Teachers assigned solely to theoretical commissions (`TA`) still see practical fields or mixed templates.
     - Teachers assigned solely to practical commissions (`PL`, `PA`, `PS`) still see theoretical 5-moment inputs.
     - Dual-assignment teachers (`TA` + `PL`) need a dedicated, frictionless switcher to toggle between their theoretical lesson plan and laboratory practical guide.

---

### Affected Areas

#### Backend
- **Security & Authorization ([`SecurityConfig.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/security/SecurityConfig.java))**:
  - Restrict `/api/v1/office/export/**` to authenticated requests with role-based checks.
- **Office Controller ([`ScuOfficeController.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuOfficeController.java))**:
  - Secure `/import/programa-analitico`, `/import/pac`, `/import/cronograma` with `@PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_ADMIN')")`.
  - Secure `/export/programa-analitico`, `/export/pac`, `/export/cronograma` with `@PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_VICERRECTOR_SEDE', 'ROLE_VICERRECTOR_NACIONAL', 'ROLE_ADMIN')")`.
  - Preserve `/import/plan-clase` and personal exports for `@PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_DIR_CARRERA', 'ROLE_ADMIN')")`.
- **Planning Controller ([`ScuPlanningController.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuPlanningController.java))**:
  - Restrict `POST /pac`, `POST /submit`, and `POST /programa-analitico` to Director and Academic Direction roles.
- **DTOs & Data Structures ([`ScuPlanClaseDto.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/request/ScuPlanClaseDto.java))**:
  - Expand `PersonalPlanData` and practical fields to capture:
    - Structured 4-phase methodology (`finalidad`, `actividadesDocente`, `actividadesEstudiante`).
    - Section 6 Desarrollo step items (`faseComun`, `tiempoMin`, `actividad`, `recursos`, `otraInformacion`).
    - Section 7 Notas del Docente (session map/list).
- **POI Strategy & Exporters ([`PlanClasePracticoParser.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/office/strategy/impl/PlanClasePracticoParser.java), [`OfficeTemplateService.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/office/OfficeTemplateService.java), [`ScuExportPlanClasesXlsxCmd.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuExportPlanClasesXlsxCmd.java))**:
  - Read and write all 7 official sections into `PLAN DE CLASES PRÁCTICO.xlsx`. Correct template path resolution.

#### Frontend
- **Main Template ([`app.component.html`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html))**:
  - **Governance & Role-Based UI Controls**:
    - Conditional display / disabling of top banner `"Subir Documentación"`.
    - Tab 1, 2, 3: Replace interactive upload buttons with read-only badges for `ROLE_DOCENTE`. Lock form inputs (`readonly`, muted backgrounds).
    - Sidebar download center: Hide official compiled exports for `ROLE_DOCENTE` while displaying a clear notice; preserve personal exports for Docente.
  - **Plan de Clase UI ([`#tab-cronograma-planes`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L1975-L2380))**:
    - Render faithful 7-section practical layout when active plan type is `PRACTICO`.
    - Distinct presentation for Section 1 (Datos Generales - locked/cascaded), Section 2 (Datos de la Práctica), Section 3 (Alineación y Recursos), Section 4 (Modelo Metodológico 4 Fases con Finalidad, Actividad Docente, Actividad Estudiante), Section 5 (Evaluación Formativa / Sumativa), Section 6 (Desarrollo - dynamic steps table), Section 7 (Notas del Docente - session log table).
    - Class Type Switcher: Displayed only when the course contains both theory (`TA`) and practical (`PL`/`PA`/`PS`) components. For pure theory or pure practice, render only the corresponding view.
- **Controller Logic ([`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js))**:
  - `window.applyUserRolePermissions(role)`: Centralized RBAC enforcement on view elements, locking Documentos 1-3 for `ROLE_DOCENTE` and enabling full controls for `ROLE_DIR_CARRERA` / `ROLE_ADMIN`.
  - `window.cascadeMasterDataToPlanSheet(sheetIndex, sessionOrTopicIndex)`: Pipeline populating plan sheets from master subject data (`activeAnaliticoUnidades`, `activePacElementosCompetencia`, `matriz7`, `bibliografias`).
  - Practical Plan 7-Section Controller: State synchronization, dynamic row adding for Desarrollo, and auto-saving for practical plans.
  - Segmented View Handling: Mute or isolate theoretical vs practical tabs based on detected group components.

---

### Approaches

```
+---------------------------------------------------------------------------------------------------------+
| APPROACH COMPARISON MATRIX                                                                              |
+--------------------------+-----------------------------+-----------------------+------------------------+
| Criterion                | Approach 1: Client-Side     | Approach 2: Full-     | Approach 3: Database   |
|                          | Masking Only                | Stack Governance &    | Schema Fork            |
|                          |                             | Template Alignment    | (Separate Tables)      |
+--------------------------+-----------------------------+-----------------------+------------------------+
| Security Integrity       | ❌ Vulnerable (API unsealed)| ✅ Sealed (RBAC + API)| ✅ Sealed              |
| Excel Export Fidelity    | ❌ Incomplete / Blank rows  | ✅ 100% (7 Sections)  | ✅ 100% (7 Sections)   |
| Master-to-Micro Cascade  | ⚠️ Partial / Fragile        | ✅ Automatic & Robust | ⚠️ Complex joins       |
| Role Clarity (Dir vs Doc)| ⚠️ Visual only              | ✅ Structural & Strict| ✅ Structural          |
| Implementation Effort    | Low / Technical debt        | Balanced / Production | High / Schema bloat    |
+--------------------------+-----------------------------+-----------------------+------------------------+
```

#### Approach 1: Client-Side Masking Only
- **Description**: Add CSS/JS checks to hide buttons and make inputs readonly for `ROLE_DOCENTE` on the frontend, without updating backend `@PreAuthorize`, `SecurityConfig`, or expanding the Excel POI parser.
- **Pros**: Quickest to implement.
- **Cons**: Severe security flaw: REST endpoints remain open to `ROLE_DOCENTE`. Exported Excel files for practical plans continue to lack Sections 4, 6, and 7. Master data is not reliably inherited.

#### Approach 2: Full-Stack Governance & Strict Template Alignment [RECOMMENDED]
- **Description**:
  1. **Strict RBAC Enforcement**: Tighten backend annotations in `ScuOfficeController` and `ScuPlanningController`. Seal `/api/v1/office/export/**` in `SecurityConfig`. Implement `applyUserRolePermissions(role)` on the frontend to lock Tabs 1-3 for teachers while giving Directors sole upload and compiled export authority.
  2. **Automated Cascading Inheritance Engine**: Map master subject data from Programa Analítico (learning units, bibliographies) and PAC/Cronograma (competence elements, specific topics, Bloom outcomes, saberes, performance criteria) directly into the Plan de Clase sheet upon view and generation.
  3. **Strict 7-Section Practical Plan Alignment**: Align the UI in `app.component.html` and the POI parsing/exporting logic in `PlanClasePracticoParser` and `OfficeTemplateService` with the official UNITEPC template `PLAN DE CLASES PRÁCTICO.xlsx`.
  4. **Component-Driven Class Type Segmentation**: Automatically isolate theoretical vs practical views based on teacher assignments, displaying the dual toggle only when both modalities exist.
- **Pros**:
  - Complies fully with UNITEPC institutional hierarchy and pedagogical quality standards.
  - Zero data desynchronization between master cátedra definitions and teacher classroom micro-planning.
  - Generates flawless institutional Excel files across all 7 practical sections.
  - Clean separation of concerns between cátedra-wide shared consensus and individual teacher classroom autonomy.
- **Cons**: Requires coordinated changes across backend controllers, parser strategies, frontend templates, and state controller.

#### Approach 3: Database Schema Fork (Separate Entity & Table for Practical Plans)
- **Description**: Create new PostgreSQL tables (`planes_clase_practicos`, `fases_metodologicas`, `desarrollo_practico`) via Flyway migration V8.
- **Pros**: Highly normalized relational database structure.
- **Cons**: Over-engineering. `PlanDeClase` already contains `plan_type` and JSONB fields (`recursos_didacticos`), and `ScuPlanClaseDto` cleanly supports hierarchical `SharedPlanData` and `PersonalPlanData`. Forking the table introduces migration risk and duplicate queries without tangible benefit.

---

### Recommendation

Adopt **Approach 2: Full-Stack Governance & Strict Template Alignment**.

**Rationale**:
1. **Institutional Governance**: In university governance, syllabus design (Programa Analítico, PAC, and Cronograma) belongs to Career Direction and academic consensus. Class plans belong to teacher execution. Aligning permissions prevents accidental curriculum overwrites.
2. **Pedagogical Integrity through Cascading**: By inheriting master elements (Unidades, Elementos de Competencia, Temas, Saberes) directly into the Plan de Clase, SISA guarantees that what the teacher delivers in the classroom directly fulfills the institutional curriculum.
3. **Audit Readiness**: Official evaluations by Vicerrectorado require exact conformity to institutional Excel templates. Implementing all 7 sections of `PLAN DE CLASES PRÁCTICO.xlsx` ensures audit compliance.
4. **Teacher Ergonomics**: Teachers only see what they teach: theory teachers see theory plans; lab teachers see practical guides; dual teachers easily switch between both.

---

### Risks

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Teacher attempts to modify Master Subject data** | Medium | Render master fields in Plan de Clase as read-only cards marked with a `"🤝 Definido por Dirección de Carrera"` badge. Keep personal fields (Ambiente, Estudiantes, Metodología, Secuencia, Desarrollo, Notas) fully editable. |
| **Desynchronization after Director updates Master PAC** | Medium | The cascading inheritance engine refreshes shared fields upon opening or switching plan sheets, ensuring the latest master topics and competence elements are always displayed. |
| **POI Merged Cells Misalignment in Practical Plan** | High | Strictly map cells to the verified coordinates from `PLAN DE CLASES PRÁCTICO.xlsx` (Section 1: R11-R15, Section 2: R19-R20, Section 3: R24-R28, Section 4: R33-R36, Section 5: R41-R42, Section 6: R47-R54, Section 7: R58-R76). |
| **Role Switching Glitches in Portal Shell** | Low | Centralize permission application in `applyUserRolePermissions(role)` and trigger it whenever `window.setAuthSession` or the layout role switcher emits an update. |

---

### Ready for Proposal

The exploration confirms technical feasibility and provides clear specifications for implementation:
- Change Name: `13-curriculum-governance-and-practical-plan-alignment`
- Artifact Directory: `openspec/changes/13-curriculum-governance-and-practical-plan-alignment/`
- Target Deliverables:
  1. Proposal (`proposal.md`)
  2. Technical Specification (`specs/curriculum-governance-and-practical-plan-spec.md`)
  3. Tasks Breakdown (`tasks.md`)
