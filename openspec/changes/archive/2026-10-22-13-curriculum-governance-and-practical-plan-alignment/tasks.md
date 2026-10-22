# Tasks: 13 Curriculum Governance, Cascading Inheritance, and Practical Plan Alignment

**Change ID**: `13-curriculum-governance-and-practical-plan-alignment`  
**Topic**: Role-Based Curriculum Governance, Automated Master-to-Micro Cascading Inheritance Engine, 7-Section Practical Lesson Plan Alignment (`PLAN DE CLASES PRÁCTICO.xlsx`), and Modality-Driven Workspace Segmentation in SISA Platform Shell  
**Status**: Ready for Implementation  
**Artifact Mode**: `openspec` markdown persistence  
**Pilot Context & Cátedra Configuration**:
- **Subject / Cátedra**: `SIS-213 Programación III` (Common subject: Carrera de Ingeniería de Sistemas + Ingeniería de Telecomunicaciones)
- **Career 1**: Ingeniería de Sistemas (`CARSIS`, SEA UUID `648febfd-dc79-4dd8-a8aa-dc7549ef649b`)
- **Career 2**: Ingeniería de Telecomunicaciones (`CARELE`, SEA UUID `a91b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d`)
- **Campus**: Sede Central Cochabamba (SEA Gateway Branch UUID `ea4fb26e-11a9-452f-9bae-4962de2dd931`)
- **Teacher Persona**: `docente.1001` (**Ing. Carlos Alberto Morales Siles** - `ROLE_DOCENTE`)
- **Director Persona**: `dir.carrera.sis` (**Lic. Mariana Rios Vargas** - `ROLE_DIR_CARRERA`, `ROLE_DIR_ACADEMICA`)
- **Admin Persona**: `admin` (**Administrador SISA** - `ROLE_ADMIN`)
- **Academic Term**: Gestión `II-2026` / `2-2026` (Activa)
- **Institutional Reference Template**: [`DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/PLAN DE CLASES PRÁCTICO.xlsx`](file:///c:/PROYECTOS/SISA/DOCUMENTOS%20BASE/DOCUMENTOS%20PARA%20CARPETA%20DOCENTE%20BASE/BLANCOS/PLAN%20DE%20CLASES%20PRÁCTICO.xlsx)

**Target Files**:
- Backend:
  - [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/security/SecurityConfig.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/security/SecurityConfig.java)
  - [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuOfficeController.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuOfficeController.java)
  - [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuPlanningController.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuPlanningController.java)
  - [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/request/ScuPlanClaseDto.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/request/ScuPlanClaseDto.java)
  - [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/office/strategy/impl/PlanClasePracticoParser.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/office/strategy/impl/PlanClasePracticoParser.java)
  - [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/office/OfficeTemplateService.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/office/OfficeTemplateService.java)
  - [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuExportPlanClasesXlsxCmd.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuExportPlanClasesXlsxCmd.java)
  - [`sisa-backend/src/test/java/bo/edu/unitepc/sisa/infrastructure/security/SecurityEndpointAccessTest.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/test/java/bo/edu/unitepc/sisa/infrastructure/security/SecurityEndpointAccessTest.java)
  - [`sisa-backend/src/test/java/bo/edu/unitepc/sisa/infrastructure/office/PlanClasePracticoParserTest.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/test/java/bo/edu/unitepc/sisa/infrastructure/office/PlanClasePracticoParserTest.java) *(New)*
- Frontend:
  - [`sisa-frontend/src/app/app.component.html`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html)
  - [`sisa-frontend/src/assets/app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js)
  - [`sisa-frontend/src/app/shared/constants/scu-api.constant.ts`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/shared/constants/scu-api.constant.ts)

---

## Phase 1: Backend Security & RBAC Sealing

- [x] 1.1 Master and Personal Document Import Authorization in [`ScuOfficeController.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuOfficeController.java)
  - [x] 1.1.1 Update `@PreAuthorize` annotation on `importCronograma` (`POST /api/v1/office/import/cronograma` and `/cronograma/import` at [#L289-L318](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuOfficeController.java#L289-L318)):
    - Replace existing `hasAnyRole('ROLE_DOCENTE', 'ROLE_ADMIN')` with `@PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_ADMIN')")`.
    - Ensure requests with `ROLE_DOCENTE` are intercepted and rejected with HTTP 403 Forbidden.
  - [x] 1.1.2 Update `@PreAuthorize` annotation on `importPac` (`POST /api/v1/office/import/pac` and `/pac/import` at [#L320-L349](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuOfficeController.java#L320-L349)):
    - Replace existing `hasAnyRole('ROLE_DOCENTE', 'ROLE_ADMIN')` with `@PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_ADMIN')")`.
    - Ensure requests with `ROLE_DOCENTE` are rejected with HTTP 403 Forbidden.
  - [x] 1.1.3 Update `@PreAuthorize` annotation on `importPrograma` (`POST /api/v1/office/import/programa-analitico` and `/programa-analitico/import` at [#L387-L417](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuOfficeController.java#L387-L417)):
    - Replace existing `hasAnyRole('ROLE_DOCENTE', 'ROLE_ADMIN')` with `@PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_ADMIN')")`.
    - Ensure requests with `ROLE_DOCENTE` are rejected with HTTP 403 Forbidden.
  - [x] 1.1.4 Verify and maintain personal micro-planning import on `importPlanesClase` (`POST /api/v1/office/import/plan-clase` and `/plan-clase/import` at [#L351-L385](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuOfficeController.java#L351-L385)):
    - Ensure `@PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_DIR_CARRERA', 'ROLE_ADMIN')")` remains active, allowing teachers to import personal class plans.

- [x] 1.2 Official Compiled and Personal Export Authorization in [`ScuOfficeController.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuOfficeController.java)
  - [x] 1.2.1 Add `@PreAuthorize` on `exportPac` (`GET / POST /api/v1/office/export/pac` and `/export/pac/{id}` at [#L72-L141](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuOfficeController.java#L72-L141)):
    - Annotate with `@PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_VICERRECTOR_SEDE', 'ROLE_VICERRECTOR_NACIONAL', 'ROLE_ADMIN')")`.
    - Reject requests from `ROLE_DOCENTE` with HTTP 403 Forbidden.
  - [x] 1.2.2 Add `@PreAuthorize` on `exportProgramaDocx` (`GET / POST /api/v1/office/export/programa-analitico` and `/export/programa-analitico/{asignacionId}` at [#L194-L267](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuOfficeController.java#L194-L267)):
    - Annotate with `@PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_VICERRECTOR_SEDE', 'ROLE_VICERRECTOR_NACIONAL', 'ROLE_ADMIN')")`.
    - Reject requests from `ROLE_DOCENTE` with HTTP 403 Forbidden.
  - [x] 1.2.3 Ensure `/export/cronograma` routing is covered:
    - If dedicated `/export/cronograma` mapping is exposed or routed through `exportPac`, ensure it requires `@PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_VICERRECTOR_SEDE', 'ROLE_VICERRECTOR_NACIONAL', 'ROLE_ADMIN')")`.
  - [x] 1.2.4 Add `@PreAuthorize` on `exportPlanClases` (`GET / POST /api/v1/office/export/plan-clase` and `/export/plan-clase/{sesionId}` at [#L143-L192](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuOfficeController.java#L143-L192)):
    - Annotate with `@PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_DIR_CARRERA', 'ROLE_ADMIN')")`.
    - Guarantee teachers retain access to export their personal theoretical and practical plans.
  - [x] 1.2.5 Verify `exportAsistencia` (`GET /api/v1/office/export/asistencia` at [#L269-L287](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuOfficeController.java#L269-L287)):
    - Confirm existing `@PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_DIR_CARRERA', 'ROLE_ADMIN')")` remains in effect.

- [x] 1.3 Seal `/api/v1/office/export/**` Filter Chain in [`SecurityConfig.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/security/SecurityConfig.java)
  - [x] 1.3.1 Remove `/api/v1/office/export/**` from the `permitAll()` list at [#L59](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/security/SecurityConfig.java#L59).
  - [x] 1.3.2 Verify that all requests to `/api/v1/office/**` and `/api/v1/system/office/**` are intercepted by the `.authenticated()` matcher at [#L66-L71](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/security/SecurityConfig.java#L66-L71).
  - [x] 1.3.3 Confirm that unauthenticated requests to any export route return HTTP 401 Unauthorized instead of bypassing authentication.

- [x] 1.4 Secure Master Planning Lifecycle Endpoints in [`ScuPlanningController.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuPlanningController.java)
  - [x] 1.4.1 Secure `POST /api/v1/planificaciones/pac` (`savePac` at [#L81-L92](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuPlanningController.java#L81-L92)):
    - Update `@PreAuthorize` from `hasAnyRole('ROLE_DOCENTE', 'ROLE_ADMIN')` to `@PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_ADMIN')")`.
  - [x] 1.4.2 Secure `POST /api/v1/planificaciones/pac/{id}/submit` (`submitPacById` at [#L94-L103](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuPlanningController.java#L94-L103)) and `POST /api/v1/planificaciones/submit` (`submitPacByAssignment` at [#L105-L115](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuPlanningController.java#L105-L115)):
    - Update `@PreAuthorize` to `@PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_ADMIN')")`.
  - [x] 1.4.3 Secure `POST /api/v1/planificaciones/programa-analitico` (`saveProgramaAnalitico` at [#L177-L189](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuPlanningController.java#L177-L189)):
    - Update `@PreAuthorize` from `hasAnyRole('ROLE_DOCENTE', 'ROLE_ADMIN')` to `@PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_ADMIN')")`.
  - [x] 1.4.4 Confirm `POST /api/v1/planificaciones/plan-clase` (`savePlanClase` at [#L201-L213](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuPlanningController.java#L201-L213)):
    - Maintain `@PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_DIR_CARRERA', 'ROLE_ADMIN')")` so teachers can persist classroom execution plans.

- [x] 1.5 Security Integration Tests in [`SecurityEndpointAccessTest.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/test/java/bo/edu/unitepc/sisa/infrastructure/security/SecurityEndpointAccessTest.java)
  - [x] 1.5.1 Update reflection test `shouldRestrictPlanningWritesAndOfficeImportsToDocenteOrAdmin`:
    - Refactor into `shouldRestrictMasterPlanningWritesAndOfficeImportsToDirectorOrAdmin` asserting that `savePac`, `submitPacById`, `saveProgramaAnalitico`, `importCronograma`, `importPac`, and `importPrograma` require `ROLE_DIR_CARRERA` and `ROLE_ADMIN`, and DO NOT contain `ROLE_DOCENTE`.
    - Create `shouldAuthorizeDocenteToManagePersonalPlanes` asserting `savePlanClase`, `importPlanesClase`, and `exportPlanClases` include `ROLE_DOCENTE`.
  - [x] 1.5.2 Add reflection test `shouldRestrictMasterExportsToDirectorOrAdmin`:
    - Assert that `exportPac` and `exportProgramaDocx` contain `ROLE_DIR_CARRERA`, `ROLE_DIR_ACADEMICA`, `ROLE_ADMIN`, and DO NOT contain `ROLE_DOCENTE`.
  - [x] 1.5.3 Add MockMvc integration test with `@WithMockUser(roles = "DOCENTE")`:
    - Verify that `POST /api/v1/office/import/pac`, `POST /api/v1/office/import/cronograma`, and `POST /api/v1/office/import/programa-analitico` respond with HTTP 403 Forbidden.
    - Verify that `GET /api/v1/office/export/pac` and `GET /api/v1/office/export/programa-analitico` respond with HTTP 403 Forbidden.
  - [x] 1.5.4 Add MockMvc integration test with unauthenticated request:
    - Verify that `GET /api/v1/office/export/pac` returns HTTP 401 Unauthorized or HTTP 403 Forbidden (sealed endpoint).

---

## Phase 2: Cascading Data Engine & Read-Only Governance UI for Master Documents

- [x] 2.1 Centralized Role Permissions Manager in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js)
  - [x] 2.1.1 Implement `window.applyUserRolePermissions(role)` function:
    - Determine boolean `const isDocente = (role === 'ROLE_DOCENTE')`.
    - Target container IDs: `#tab-analitico`, `#tab-pac-matrix`, `#tab-cronograma-semanas`.
    - When `isDocente` is true:
      - Set `readonly = true` on all `<input>` and `<textarea>` elements within master tabs.
      - Set `disabled = true` on all `<select>`, `<button>`, and file upload triggers within master tabs (e.g. `#btn-import-programa`, `#btn-import-pac`, `#btn-import-cronograma`).
      - Apply CSS classes: `bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300` to locked inputs.
      - Display the institutional governance badge `#tab-governance-badge-[1|2|3]`.
    - When `isDocente` is false (Director or Admin):
      - Remove `readonly` and `disabled` attributes.
      - Restore active input styling (`bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white cursor-text`).
      - Display upload and modification buttons.
  - [x] 2.1.2 Register `applyUserRolePermissions(role)` invocations in:
    - Application boot sequence (`initApp`).
    - Subject selection handler (`onSelectCourse` / `selectAsignatura`).
    - Role switcher dropdown in header shell (`setAuthSession` / `switchUserRole`).

- [x] 2.2 Institutional Badges for Master Documents in [`app.component.html`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html)
  - [x] 2.2.1 Add institutional governance banner `#tab-governance-badge-1` at top of Tab 1 (`#tab-analitico` around [#L1440](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L1440)):
    - Lucide `shield-check` icon with blue styling (`bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200`).
    - Banner text: `🤝 Definido por Dirección de Carrera: Contenido curricular oficial aprobado por consenso de cátedra. Modo de solo lectura para el cuerpo docente.`
    - Pill tag: `Oficial Cátedra` (`bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-[10px] font-bold`).
  - [x] 2.2.2 Add institutional governance banner `#tab-governance-badge-2` at top of Tab 2 (`#tab-pac-matrix` around [#L1583](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L1583)).
  - [x] 2.2.3 Add institutional governance banner `#tab-governance-badge-3` at top of Tab 3 (`#tab-cronograma-semanas` around [#L1883](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L1883)).
  - [x] 2.2.4 Conditionally hide file inputs `#analitico-file-input`, `#pac-file-input`, and `#cronograma-file-input` when active role is `ROLE_DOCENTE`.

- [x] 2.3 Top Banner "Subir Documentación" Action Gating in [`app.component.html`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html) and [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js)
  - [x] 2.3.1 In [`app.component.html#L1223`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L1223), add `id="btn-top-upload-doc"` and `data-roles="ROLE_DIR_CARRERA,ROLE_DIR_ACADEMICA,ROLE_ADMIN"` to the `"Subir Documentación"` button calling `window.triggerAutoCapture()`.
  - [x] 2.3.2 In [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js), update `applyUserRolePermissions`:
    - When `ROLE_DOCENTE`: hide or disable `#btn-top-upload-doc`, adding tooltip `"Acción exclusiva para Dirección de Carrera"`.
    - When `ROLE_DIR_CARRERA` or `ROLE_ADMIN`: show and enable `#btn-top-upload-doc`.
  - [x] 2.3.3 In `window.triggerAutoCapture()`: add guard condition:
    - If active user role is `ROLE_DOCENTE`, abort execution and display notification: `"La subida y reemplazo de documentos de cátedra está reservada para Dirección de Carrera."`.

- [x] 2.4 Automated Cascading Data Inheritance Engine in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js)
  - [x] 2.4.1 Implement `window.cascadeMasterDataToPlanSheet(sheetIndex, isPractical)`:
    - Inspect authoritative master state: `activeAnaliticoUnidades`, `activePacElementosCompetencia`, `matriz7`, and `bibliografias`.
    - Resolve target learning unit: title (`unidadTitulo`) and associated APA bibliography citations.
    - Resolve target competence element: `elementoCompetencia` and Bloom taxonomy level from PAC.
    - Resolve target topic & saberes from Matriz 7: specific topic (`contenidoTema`), conceptual saber (`saberConceptual`), procedural saber (`saberProcedimental`), and attitudinal saber (`saberActitudinal`).
    - Resolve expected session outcomes: `objetivoSesion` and `logrosEsperados`.
    - Assign resolved values into target plan sheet state: `activePlanesList[sheetIndex]`.
  - [x] 2.4.2 Update `window.generateDefaultPlanesList(mKey)`:
    - For every generated sheet index (from 0 to $N-1$), automatically invoke `cascadeMasterDataToPlanSheet(i, isPractical)` so default sheets are initialized pre-populated with cátedra data instead of blank placeholders.
  - [x] 2.4.3 Update Plan de Clase sheet switch handler (`window.switchPlanSheet` / `selectPlanSheet`):
    - Automatically execute `cascadeMasterDataToPlanSheet(sheetIndex)` when opening a sheet, ensuring changes made to master PAC or Cronograma by Director propagate dynamically into the view.
  - [x] 2.4.4 Render shared fields in Tab 4 (`#tab-cronograma-planes` at [#L2018-L2100](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L2018-L2100)):
    - Render `#plan-unidad-input`, `#plan-tema-input`, `#plan-elemento-input`, `#plan-conceptual-input`, `#plan-procedimental-input`, and `#plan-actitudinal-input` as read-only cards with institutional badge `"🤝 Definido por Dirección de Carrera"`.
    - Ensure personal execution fields (`#plan-docente-input`, `#plan-fecha-input`, `#plan-grupo-input`, `#plan-est-ensenanza`, `#plan-est-aprendizaje`, `#plan-eval-formativa`, `#plan-eval-sumativa`, step durations) remain fully editable for teachers.

---

## Phase 3: 7-Section Practical Lesson Plan Form Engine

- [x] 3.1 Expand Practical Plan DOM in [`app.component.html`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html) Matching [`PLAN DE CLASES PRÁCTICO.xlsx`](file:///c:/PROYECTOS/SISA/DOCUMENTOS%20BASE/DOCUMENTOS%20PARA%20CARPETA%20DOCENTE%20BASE/BLANCOS/PLAN%20DE%20CLASES%20PRÁCTICO.xlsx)
  - [x] 3.1.1 **Section 1: 1. DATOS GENERALES** ([#L2018-L2122](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L2018-L2122)):
    - Verify inputs: Docente (`#plan-docente-input`), Asignatura (`#plan-asig-input`), Fecha (`#plan-fecha-input`), Carrera (`#plan-carrera-input`), Unidad de Aprendizaje 1 (`#plan-unidad-input`), Elemento de Competencia 1 (`#plan-elemento-input`). Cascaded and locked with governance badge.
  - [x] 3.1.2 **Section 2: 2. DATOS DE LA PRÁCTICA** ([#L2123-L2154](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L2123-L2154)):
    - Render grid with fields:
      - Título de la práctica: `<input id="plan-prac-titulo" type="text" placeholder="ej. Práctica N° 1: Configuración de Router OSPF">`
      - Fecha de la práctica: `<input id="plan-prac-fecha" type="date">`
      - Duración: `<input id="plan-prac-duracion" type="text" placeholder="180 min" readonly>`
      - Semestre: `<input id="plan-prac-semestre" type="text" placeholder="5° Semestre">`
      - Ambiente / Escenario: `<input id="plan-prac-ambiente" type="text" placeholder="ej. Lab de Redes / Gabinete 2">`
      - N° de estudiantes: `<input id="plan-prac-estudiantes" type="number" min="1" max="100" placeholder="25">`
      - Docente responsable: `<input id="plan-prac-docente-resp" type="text" placeholder="Nombre del docente responsable">`
  - [x] 3.1.3 **Section 3: 3. ALINEACIÓN Y RECURSOS**:
    - Render card `#plan-sec-3-alineacion` with fields:
      - Objetivo de aprendizaje: `<textarea id="plan-prac-objetivo" rows="2" placeholder="Objetivo de la práctica de laboratorio..."></textarea>`
      - Resultados de aprendizaje (Bloom): `<textarea id="plan-prac-bloom-res" rows="2" placeholder="Resultados esperados con nivel taxonómico Bloom..."></textarea>`
      - Preparación de materiales previos: `<textarea id="plan-prac-materiales-previos" rows="2" placeholder="Guía de práctica previa, lectura de normas de bioseguridad, cuestionario previo..."></textarea>`
      - Equipamiento (entorno): `<textarea id="plan-prac-equipamiento" rows="2" placeholder="Mesas de trabajo, tomas de corriente regulada, extractores de aire..."></textarea>`
      - Equipos (para la práctica): `<textarea id="plan-prac-equipo-especifico" rows="2" placeholder="Routers Cisco 2901, switches 2960, cables de consola, multímetros digitales..."></textarea>`
  - [x] 3.1.4 **Section 4: 4. MODELO METODOLÓGICO (4 Fases x 3 Columns)**:
    - Replace existing single textarea sequence with responsive 3-column table container `#plan-sec-4-metodologia`:
      - Table header: `Fase / Momento` | `Finalidad (cols C:E)` | `Actividad del Docente (cols F:G)` | `Actividad del Estudiante (cols H:I)`
      - Phase 1: *1. Preparación*: inputs `#plan-prac-fase1-finalidad`, `#plan-prac-fase1-act-docente`, `#plan-prac-fase1-act-estudiante`
      - Phase 2: *2. Ejecución guiada*: inputs `#plan-prac-fase2-finalidad`, `#plan-prac-fase2-act-docente`, `#plan-prac-fase2-act-estudiante`
      - Phase 3: *3. Ejecución autónoma*: inputs `#plan-prac-fase3-finalidad`, `#plan-prac-fase3-act-docente`, `#plan-prac-fase3-act-estudiante`
      - Phase 4: *4. Cierre*: inputs `#plan-prac-fase4-finalidad`, `#plan-prac-fase4-act-docente`, `#plan-prac-fase4-act-estudiante`
  - [x] 3.1.5 **Section 5: 5. EVALUACIÓN DE LOS APRENDIZAJES**:
    - Render table `#plan-sec-5-evaluacion` with 2 rows (*Formativa* and *Sumativa*) and 3 columns:
      - Formativa: Actividades y Técnicas (`#plan-eval-formativa-act`), Instrumentos (`#plan-eval-formativa-inst`), Evidencias (`#plan-eval-formativa-evid`)
      - Sumativa: Actividades y Técnicas (`#plan-eval-sumativa-act`), Instrumentos (`#plan-eval-sumativa-inst`), Evidencias (`#plan-eval-sumativa-evid`)
  - [x] 3.1.6 **Section 6: 6. DESARROLLO (Dynamic Step Matrix)**:
    - Render dynamic container `#plan-sec-6-desarrollo`:
      - Header title with Lucide `list-ordered` icon: `6. DESARROLLO (Pasos de Ejecución en Práctica)`
      - Table structure: Col B (*Fase común* dropdown: Preparación, Ejecución guiada, Ejecución autónoma, Cierre), Col C (*Tiempo min* numeric input), Col D (*Actividad* textarea), Col F (*Recursos* textarea), Col H (*Otra información* textarea), Col Actions (*Eliminar paso* button).
      - Step rows container `#plan-desarrollo-rows-container`.
      - Footer toolbar: `[+] Agregar Paso` button (`#btn-add-desarrollo-paso`), and total duration badge `#plan-desarrollo-total-min` showing cumulative sum.
  - [x] 3.1.7 **Section 7: 7. NOTAS DEL DOCENTE (Longitudinal Reflection Log)**:
    - Render collapsible container `#plan-sec-7-notas`:
      - Header title with Lucide `notebook-pen` icon: `7. NOTAS DEL DOCENTE (Bitácora Longitudinal de Sesiones 1 a 19)`
      - Grid or accordion mapping Sessions 1.0 to 19.0:
        - For each session $k \in \{1 \dots 19\}$: session badge `Sesión k.0` and observation textarea `#plan-prac-nota-sesion-k` mapped to Excel rows 59 to 77 (C59:I77).

- [x] 3.2 Reactive Helpers in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js)
  - [x] 3.2.1 Implement `window.addDesarrolloPaso(stepData)`:
    - Append step object `{ pasoNro: steps.length + 1, faseComun: 'Preparación', tiempoMin: 15, actividad: '', recursos: '', otraInformacion: '' }` to `currentPlanPractico.pasosDesarrollo`.
    - Render new DOM row inside `#plan-desarrollo-rows-container`.
    - Recalculate duration via `updateDesarrolloTimeSum()`.
  - [x] 3.2.2 Implement `window.removeDesarrolloPaso(stepIndex)`:
    - Remove element at `stepIndex` from `currentPlanPractico.pasosDesarrollo`.
    - Re-index step numbers (`pasoNro = 1, 2, ...`).
    - Re-render step rows and update duration sum.
  - [x] 3.2.3 Implement `window.updateDesarrolloTimeSum()`:
    - Iterate through all step time inputs in Section 6.
    - Sum valid integers; update text and attribute on `#plan-desarrollo-total-min`.
    - Update `#plan-prac-duracion` with formatted string: `${total} min (${(total/60).toFixed(1)} hrs)`.
  - [x] 3.2.4 Implement two-way synchronization:
    - On input in Section 4 (4 phases x 3 cols), Section 5 (Evaluación), Section 6 (Desarrollo), or Section 7 (Notas): sync values into `activePlanesList[currentSheetIndex].personalData`.

- [x] 3.3 Storage Persistence and Save Interceptor in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js)
  - [x] 3.3.1 Local storage backup:
    - Persist serialized practical plan state under `sisa_plan_practico_${materiaCodigo}_${sheetIdx}` on blur or debounce.
  - [x] 3.3.2 Wire `window.savePlanClase()` to serialize 7-section practical payload:
    - Populate `fasesMetodologicas`, `pasosDesarrollo`, and `notasDocente` in request payload matching `ScuPlanClaseDto`.
    - Send `POST` to `/api/v1/planificaciones/plan-clase`.
    - Display success toast upon confirmation.

---

## Phase 4: Apache POI Practical Plan Exporter & Parser Parity

- [x] 4.1 Expand DTO Models in [`ScuPlanClaseDto.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/request/ScuPlanClaseDto.java)
  - [x] 4.1.1 Create nested class `FaseMetodologicaDto`:
    - Fields: `String fase`, `String finalidad`, `String actividadDocente`, `String actividadEstudiante`, `Integer duracionMin`.
    - Annotate with `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`.
  - [x] 4.1.2 Create nested class `DesarrolloPasoDto`:
    - Fields: `Integer pasoNro`, `String faseComun`, `Integer tiempoMin`, `String actividad`, `String recursos`, `String otraInformacion`.
    - Annotate with `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`.
  - [x] 4.1.3 Create nested class `NotaDocenteSesionDto`:
    - Fields: `Double sesionNro`, `String nota`.
    - Annotate with `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`.
  - [x] 4.1.4 Update `PersonalPlanData` at [#L781-L807](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/request/ScuPlanClaseDto.java#L781-L807):
    - Add fields:
      - `private List<FaseMetodologicaDto> fasesMetodologicas = new ArrayList<>();`
      - `private List<DesarrolloPasoDto> pasosDesarrollo = new ArrayList<>();`
      - `private List<NotaDocenteSesionDto> notasDocente = new ArrayList<>();`
    - Retain legacy fields (`modeloMetodologico`, `desarrollo`, `observaciones`) for full backward compatibility.
  - [x] 4.1.5 Add delegate getters and setters in `ScuPlanClaseDto` root class forwarding to `personalData`.

- [x] 4.2 Strict 7-Section Extraction in [`PlanClasePracticoParser.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/office/strategy/impl/PlanClasePracticoParser.java)
  - [x] 4.2.1 Update `parsePracticoSheet` ([#L100-L245](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/office/strategy/impl/PlanClasePracticoParser.java#L100-L245)):
    - Section 1 (Datos Generales): Extract C12, G12, C13, G13, C15, C16 (0-indexed rows 11, 12, 14, 15).
    - Section 2 (Datos Práctica): Extract C20 (Título), E20 (Fecha), G20 (Duración), I20 (Semestre), C21 (Ambiente), E21 (N° estudiantes), G21 (Docente) (0-indexed rows 19, 20).
    - Section 3 (Alineación y Recursos): Extract D25 (Objetivo), D26 (Bloom), D27 (Materiales previos), D28 (Equipamiento entorno), D29 (Equipo práctica) (0-indexed rows 24-28).
    - Section 4 (Modelo Metodológico): Read rows 34 to 37 (0-indexed 33 to 36). Parse Finalidad (col C / 2), Actividad Docente (col F / 5), and Actividad Estudiante (col H / 7) into structured `FaseMetodologicaDto` items for `fasesMetodologicas`.
    - Section 5 (Evaluación): Read rows 42 (Formativa) and 43 (Sumativa) (0-indexed 41, 42). Extract cols C, F, H into `evaluacionFormativa*` and `evaluacionSumativa*`.
    - Section 6 (Desarrollo): Read rows 48 to 54 (0-indexed 47 to 53). Extract col B (Fase común), col C (Tiempo), col D (Actividad), col F (Recursos), col H (Otra información) into `DesarrolloPasoDto` items for `pasosDesarrollo`.
    - Section 7 (Notas del Docente): Read rows 59 to 77 (0-indexed 58 to 76). Extract col B (Sesión 1.0 to 19.0) and col C (Nota) into `NotaDocenteSesionDto` items for `notasDocente`.
  - [x] 4.2.2 Implement `populatePracticoSheet` ([#L305-L343](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/office/strategy/impl/PlanClasePracticoParser.java#L305-L343)) targeting top-left anchor coordinates:
    - Write Section 1: C12, G12, C13, G13, C15, C16.
    - Write Section 2: C20, E20, G20, I20, C21, E21, G21.
    - Write Section 3: D25, D26, D27, D28, D29.
    - Write Section 4: Rows 34-37 across cols C, F, H.
    - Write Section 5: Row 42 (Formativa: C42, F42, H42) and Row 43 (Sumativa: C43, F43, H43).
    - Write Section 6: Rows 48-54 across cols B, C, D, F, H.
    - Write Section 7: Rows 59-77 across col B and col C.
  - [x] 4.2.3 Ensure template lookup in `openTemplateStream()` resolves `classpath:templates/template_plan_practico.xlsx` with fallbacks to `PLAN DE CLASES PRÁCTICO.xlsx` and `Copia de PLAN DE CLASES PRÁCTICO.xlsx`.

- [x] 4.3 Apache POI Template Populator Updates in [`OfficeTemplateService.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/office/OfficeTemplateService.java) and [`ScuExportPlanClasesXlsxCmd.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuExportPlanClasesXlsxCmd.java)
  - [x] 4.3.1 In [`OfficeTemplateService.java#L242-L272`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/office/OfficeTemplateService.java#L242-L272), expand `if (isPractico)` block:
    - Populate Section 4: If `plan.getPersonalData().getFasesMetodologicas()` is populated, write Finalidad (col 2), Actividad Docente (col 5), and Actividad Estudiante (col 7) to rows 33-36 (0-indexed). Fall back to `plan.getMomentos()` if legacy data.
    - Populate Section 5: Write Formativa (row 41) and Sumativa (row 42) across cols 2, 5, 7.
    - Populate Section 6: If `pasosDesarrollo` is present, write up to 7 steps into rows 47-53 across cols 1, 2, 3, 5, 7.
    - Populate Section 7: If `notasDocente` is present, write notes into rows 58-76 (cols 1, 2).
  - [x] 4.3.2 In [`ScuExportPlanClasesXlsxCmd.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuExportPlanClasesXlsxCmd.java):
    - Verify that practical plan export passes all 7 practical sections to the template service without truncation.

- [x] 4.4 POI Exporter & Parser Roundtrip Unit Tests
  - [x] 4.4.1 Create test class [`PlanClasePracticoParserTest.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/test/java/bo/edu/unitepc/sisa/infrastructure/office/PlanClasePracticoParserTest.java):
    - Build a full `ScuPlanClaseDto` with Section 1 (metadata), Section 2 (practice info), Section 3 (Bloom & resources), Section 4 (4 phases with 3 columns each), Section 5 (Formativa & Sumativa), Section 6 (5 steps with durations), and Section 7 (notes for Sessions 1.0, 2.0, 3.0).
  - [x] 4.4.2 Test export to Excel byte array via `PlanClasePracticoParser` / `OfficeTemplateService`.
  - [x] 4.4.3 Test re-parsing generated byte array back into `ScuPlanClaseDto`:
    - Assert that `getFasesMetodologicas()` size is 4 and content matches.
    - Assert that `getPasosDesarrollo()` size is 5 and step times sum correctly.
    - Assert that `getNotasDocente()` contains notes for session 1.0, 2.0, 3.0.
    - Assert zero cell overlap, zero null pointer exceptions, and zero formatting corruption.

---

## Phase 5: Component Type Segmentation & Direct Export Center Segregation

- [x] 5.1 Component Type Modality Detection in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js)
  - [x] 5.1.1 Implement `window.evaluateTeacherComponentModality(groups)`:
    - Call `detectComponentTypes(groups)` ([#L577-L682](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js#L577-L682)) to classify assigned commission codes.
    - If commission codes contain ONLY `TA`: return `'TEORICO_ONLY'`.
    - If commission codes contain ONLY `PL`, `PA`, or `PS`: return `'PRACTICO_ONLY'`.
    - If commission codes contain BOTH `TA` and (`PL`, `PA`, or `PS`): return `'DUAL_MODALITY'`.
  - [x] 5.1.2 Set `window.activeTeacherModalityMode` when a course offering is selected in the platform shell.

- [x] 5.2 Dynamic Modality Switcher UI in [`app.component.html`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html) and [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js)
  - [x] 5.2.1 In [`app.component.html`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html), add `#plan-type-switcher-container` above the Plan de Clase sheet tabs in Tab 4:
    - Button `#btn-toggle-modality-teorico` with Lucide `book-open`: `📘 Plan Teórico (TA)`
    - Button `#btn-toggle-modality-practico` with Lucide `flask-conical`: `🔬 Guía Práctica (PL/PA)`
  - [x] 5.2.2 Implement `window.switchPlanModalityView(modality)` in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js):
    - When modality is `'TEORICO'`:
      - Highlight theoretical pill button; un-highlight practical pill button.
      - Display `#plan-secuencia-standard` (5-moment pedagogical sequence).
      - Hide `#plan-practico-fields`, `#plan-sec-3-alineacion`, `#plan-sec-4-metodologia`, `#plan-sec-6-desarrollo`, and `#plan-sec-7-notas`.
    - When modality is `'PRACTICO'`:
      - Highlight practical pill button; un-highlight theoretical pill button.
      - Display full 7-section practical form structure.
      - Hide `#plan-secuencia-standard`.
    - Preserve unsaved form input values in memory across toggles.
  - [x] 5.2.3 Enforce single-modality views:
    - If `activeTeacherModalityMode === 'TEORICO_ONLY'`: hide `#plan-type-switcher-container`, automatically render theoretical 5-moment view.
    - If `activeTeacherModalityMode === 'PRACTICO_ONLY'`: hide `#plan-type-switcher-container`, automatically render 7-section practical view.
    - If `activeTeacherModalityMode === 'DUAL_MODALITY'`: show `#plan-type-switcher-container`, default to `'TEORICO'`.

- [x] 5.3 Segregate Direct Export Center in Sidebar ([`app.component.html#L514-L542`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L514-L542))
  - [x] 5.3.1 In [`app.component.html`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html), add role attributes to sidebar export buttons:
    - `#btn-export-programa-docx`: `data-roles="ROLE_DIR_CARRERA,ROLE_DIR_ACADEMICA,ROLE_ADMIN"`
    - `#btn-export-pac-gral-xlsx`: `data-roles="ROLE_DIR_CARRERA,ROLE_DIR_ACADEMICA,ROLE_ADMIN"`
    - `#btn-export-pac-prac-xlsx`: `data-roles="ROLE_DIR_CARRERA,ROLE_DIR_ACADEMICA,ROLE_ADMIN"`
    - Personal export buttons (`#btn-export-planes-teorico`, `#btn-export-planes-prac`, `#btn-export-asistencia`) remain accessible to `ROLE_DOCENTE`.
  - [x] 5.3.2 In `applyUserRolePermissions(role)` in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js):
    - When `ROLE_DOCENTE`: disable master download buttons and append an advisory badge `"Exclusivo Dirección"`.
    - When `ROLE_DIR_CARRERA` or `ROLE_ADMIN`: enable all master and personal download buttons.

- [x] 5.4 Build, Container Deployment & End-to-End Verification
  - [x] 5.4.1 Compile backend and execute test suite:
    - Run `mvn clean test` in `sisa-backend` to ensure 0 compilation errors and all tests pass (including `SecurityEndpointAccessTest` and `PlanClasePracticoParserTest`).
  - [x] 5.4.2 Validate frontend:
    - Run frontend build/lint check to ensure 0 syntax errors in `app-controller.js` and `app.component.html`.
  - [x] 5.4.3 End-to-End Verification across all 10 Scenarios in [`specs/governance-and-planning/spec.md`](file:///c:/PROYECTOS/SISA/openspec/changes/13-curriculum-governance-and-practical-plan-alignment/specs/governance-and-planning/spec.md):
    - **Scenario 1**: Teacher (`ROLE_DOCENTE`) receives HTTP 403 when posting to `/import/pac`.
    - **Scenario 2**: Director (`ROLE_DIR_CARRERA`) successfully imports master Programa Analítico via `/import/programa-analitico`.
    - **Scenario 3**: Anonymous user receives HTTP 401 on `/export/pac`.
    - **Scenario 4**: Teacher receives HTTP 403 on `/export/programa-analitico`.
    - **Scenario 5**: Teacher sees `"🤝 Definido por Dirección de Carrera"` badge and locked fields in Tabs 1, 2, and 3; `"Subir Documentación"` button is hidden.
    - **Scenario 6**: Opening Tab 4 automatically cascades unit title, topic, competence element, and 3 saberes into read-only shared cards.
    - **Scenario 7**: Teacher edits 7-section practical plan; Section 6 time recalculates live; Section 7 notes store reflections.
    - **Scenario 8**: Exporting practical plan produces valid `.xlsx` with all 7 sections mapped to authentic coordinates in [`PLAN DE CLASES PRÁCTICO.xlsx`](file:///c:/PROYECTOS/SISA/DOCUMENTOS%20BASE/DOCUMENTOS%20PARA%20CARPETA%20DOCENTE%20BASE/BLANCOS/PLAN%20DE%20CLASES%20PRÁCTICO.xlsx); re-import restores state.
    - **Scenario 9**: Pure theoretical teacher (`TA-01`) sees only 5 moments; practical fields and switcher are hidden.
    - **Scenario 10**: Dual teacher (`TA-01` + `PL-01`) sees switcher and transitions smoothly between theoretical and practical modes without data loss.
