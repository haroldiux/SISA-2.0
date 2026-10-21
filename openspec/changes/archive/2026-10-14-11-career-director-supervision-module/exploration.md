## Exploration: Career Director Module (ROLE_DIR_CARRERA) & Curricular Supervision

### Current State

1. **User Identity & Role Persona Binding**:
   - The user [`dir.carrera.sis`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/resources/db/migration/V1__init_sisa_schema.sql#L118) is seeded in PostgreSQL as a `ROLE_DIR_CARRERA` user named **Lic. Mariana Rios Vargas**, associated with Sede Central Cochabamba (`sede_id = 1`).
   - In [`scu-auth.service.ts`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app-core/services/scu-auth.service.ts#L107-L118), the client persona defines `dir.carrera.sis` (`ROLE_DIR_CARRERA`, Sede Central Cochabamba, ID 2).
   - In [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js#L6990-L6999), [`__SUPERVISION_CAREER_MAP__`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js#L6990-L7000) maps the career code `CARSIS` to:
     - SEA Central Career UUID: `648febfd-dc79-4dd8-a8aa-dc7549ef649b`
     - Career Name: **Ingeniería de Sistemas**
     - Sede Cochabamba Gateway Branch Office UUID: `ea4fb26e-11a9-452f-9bae-4962de2dd931`
   - When logging in or switching persona to `ROLE_DIR_CARRERA`, the application automatically activates [`view2`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L2302-L2350) as the initial workspace via [`switchView('view2')`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js#L7799-L7801).

2. **Workspace Scope & Curricular Hierarchy (`view2`)**:
   - The view container [`#view2`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L2302-L2350) renders the **Supervisión y Aprobación Curricular por Semestre** dashboard.
   - It contains:
     - **Header**: Career badge (`#supervision-career-badge`), active term indicator (`GESTIÓN: II-2026 (Activa)`), and batch action button (*"Aprobar Todo el Semestre"*).
     - **KPI Toolbar**: Aggregated counters for *Todos* (`#supervision-count-all`), *Completados* (`#supervision-count-approved`), *Pendientes* (`#supervision-count-pending`), *Con Observaciones* (`#supervision-count-observed`), and *Cumplimiento General* (`#supervision-compliance-pct`).
     - **Accordion Container** (`#supervision-semesters-container`): Houses 8 accordion cards representing **1º through 8º Semestre** of the Ingeniería de Sistemas curriculum.
   - The semester classification is performed by [`window.getCourseSemester`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js#L7005-L7087), analyzing course titles and codes (e.g., SIS-101, SIS-213, SIS-301 up to 8º semester thesis/practicum).

3. **SEA Gateway Integration**:
   - Curricular offerings are retrieved live via [`/api/v1/catalogo-academico/groups?term=2-2026&branchOfficeId=ea4fb26e-11a9-452f-9bae-4962de2dd931&careerId=648febfd-dc79-4dd8-a8aa-dc7549ef649b`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js#L7129-L7137) handled by [`CatalogoAcademicoController.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/CatalogoAcademicoController.java#L166-L206).
   - Uses a Cache-Aside strategy (`sisa_cache_supervision_groups_CARSIS` in LocalStorage) ensuring instantaneous (0ms) render with no mock flash, updating in the background once the Gateway responds.
   - Raw groups are synthesized into curriculum courses by [`processAndRenderSupervisionData`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js#L7143-L7202).

4. **Common Subjects Architecture (`groupLinkId` & `isLead`)**:
   - The backend DTO [`GroupItemDto.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/dto/gateway/GroupItemDto.java#L53-L58) natively supports `groupLinkId` and `isLead`.
   - In [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js#L7184-L7190), groups with `groupLinkId` are recognized as `course.isCommon = true`.
   - If `isLead === false`, the course is marked as non-lead (`course.isLead = false; course.leadTag = 'OTRA CARRERA'`).
   - The UI table renders badges: `⚡ COMÚN (LÍDER: ING. SISTEMAS)` or `⚡ COMÚN (LÍDER: OTRA CARRERA)`.

5. **Current Review & Endorsement Workflow (Gaps & Limitations)**:
   - In [`ScuPlanningController.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuPlanningController.java#L128-L140), the real backend endpoint `POST /api/v1/planificaciones/pac/{id}/review` is fully implemented and secured for `ROLE_DIR_CARRERA`, delegating to [`ScuReviewPacCmd.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuReviewPacCmd.java#L41-L107).
   - In the frontend, however, [`window.approveSubjectSupervision`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js#L7541-L7549) and [`window.observeSubjectSupervision`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js#L7551-L7567) currently only persist state in LocalStorage (`sisa_supervision_status_*`) and invoke a native browser `prompt()`. They do **not** invoke the backend review endpoint.
   - An Angular module [`CareerOversightModule`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/modules/secure/career-oversight/career-oversight.module.ts#L1-L30) with [`ScuPacReviewModalComponent`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/modules/secure/career-oversight/components/scu-pac-review-modal/scu-pac-review-modal.component.ts#L10-L77) and command [`ScuPacReviewCmd`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/modules/secure/career-oversight/commands/scu-pac-review.cmd.ts#L12-L24) was prototyped, but is disconnected from [`#view2`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L2302-L2350).

---

### Affected Areas

#### Backend
- [`ScuPlanningController.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuPlanningController.java):
  - Ensure `POST /api/v1/planificaciones/pac/{id}/review` handles single-subject and batch review operations.
  - Expose a career-level PAC status retrieval endpoint (`GET /api/v1/planificaciones/pac/by-carrera/{carreraId}?gestionId={gestionId}`) so the frontend can populate real PAC statuses across all courses in a single request.
- [`ScuReviewPacCmd.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuReviewPacCmd.java):
  - Validates transitions to [`EstadoPlanificacion.APROBADO`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/enums/EstadoPlanificacion.java#L12) and [`EstadoPlanificacion.OBSERVADO`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/enums/EstadoPlanificacion.java#L11).
  - Enforces mandatory pedagogical feedback ($\ge 10$ characters) for `OBSERVADO`.
  - Captures reviewer ID and audit timestamp (`revisadoPor`, `revisadoEn`).
- [`PacRepository.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/repository/PacRepository.java):
  - Leverage [`findByCarreraAndGestion`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/repository/PacRepository.java#L29-L30) to query all PACs for CARSIS in gestion II-2026.
- [`CatalogoAcademicoController.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/CatalogoAcademicoController.java):
  - Serves `/api/v1/catalogo-academico/groups` with `groupLinkId` and `isLead`.

#### Frontend
- [`sisa-frontend/src/app/app.component.html`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html):
  - Shell container [`#view2`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html#L2302-L2350) enhancements:
    - Pedagogical Review Modal (`#modal-pac-review`): Replaces browser `prompt()` with an institutional dialog featuring structured feedback criteria (competencies, learning evidence, evaluation rubrics, schedule compliance).
    - Real-time character counter and validation indicator for the 10-character minimum.
    - Semester batch endorsement confirmation modal.
- [`sisa-frontend/src/assets/app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js):
  - Identity binding: Ensure `dir.carrera.sis` binds strictly to CARSIS (`Ingeniería de Sistemas`) and Sede Cochabamba (`ea4fb26e-11a9-452f-9bae-4962de2dd931`).
  - Wire review actions: Replace `localStorage`-only writes with asynchronous API calls to `/api/v1/planificaciones/pac/{id}/review` with JWT Authorization headers.
  - Implement dynamic fallback for demo/offline resiliency.
  - Common Subjects handling:
    - If `isLead === true`: Career Director has full review authority (`Aprobar`, `Observar`).
    - If `isLead === false`: Non-lead Director has cross-career read access (`Ver Carpeta`) and collaborative feedback submission, with visual distinction of the lead career.
  - Seamless navigation to Carpeta Docente: [`openTeacherFolderFromSupervision`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js#L7523-L7539) pre-selects the subject and teacher in `view1`.
- [`sisa-frontend/src/app/modules/secure/career-oversight/`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/modules/secure/career-oversight/):
  - Synchronize TypeScript models and HTTP services ([`scu-career-oversight.http.ts`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/modules/secure/career-oversight/http/scu-career-oversight.http.ts), [`scu-pac-review.cmd.ts`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/modules/secure/career-oversight/commands/scu-pac-review.cmd.ts)) to match backend contracts and schemas.

---

### Approaches

#### Approach 1: Integrated Shell & Native Institutional Modal (Direct Enhancement in `view2`)
- **Description**:
  Keep `#view2` inside `app.component.html` and enhance `app-controller.js` to integrate directly with backend endpoints (`/api/v1/planificaciones/pac/{id}/review` and career PAC status sync). Replace browser `prompt()` with an institutional dialog (`#modal-pac-review`) embedded in the shell.
- **Pros**:
  - Consistent with the architecture adopted in changes 08, 09, and 10 (Portal Shell Restructure, Institutional Login, Role-Based Access).
  - Preserves sub-millisecond tab switching and live Cache-Aside behavior.
  - Eliminates external dependencies or CSS/theme mismatches between PrimeNG and Tailwind CSS.
  - Directly testable in existing end-to-end user journeys without breaking `view1` inter-navigation.
- **Cons**:
  - Script logic in `app-controller.js` expands (though cleanly modularized under a dedicated supervision section).

#### Approach 2: Complete Angular Componentization (Mount `<scu-career-oversight>` into `#view2`)
- **Description**:
  Replace `#view2` inner HTML with `<scu-career-oversight></scu-career-oversight>`. Refactor [`ScuCareerOversightComponent`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/modules/secure/career-oversight/components/scu-career-oversight/scu-career-oversight.component.ts) to call SEA Gateway `/api/v1/catalogo-academico/groups` and replace PrimeNG elements with Tailwind.
- **Pros**:
  - Pure Angular reactive component architecture.
  - Encapsulated lifecycle within Angular zones.
- **Cons**:
  - High risk of regression: `view1` (Docente), `view3` (Auditoría), and `view6` (Admin) are managed by the unified shell in `app.component.html` and `app-controller.js`. Introducing an Angular routing/component island inside `#view2` creates split state management and breaks seamless inter-view navigation (`openTeacherFolderFromSupervision`).
  - PrimeNG table and dialog styles conflict with the custom Tailwind theme, dark mode variables, and layout shell heights.

#### Approach 3: Hybrid Cohesive Pattern (Architectural Parity & Dual Support)
- **Description**:
  Implement the full functional review flow in `#view2` and `app-controller.js` (Approach 1) using modern Tailwind institutional dialogs and real REST integration, while updating the Angular module [`career-oversight`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/modules/secure/career-oversight/) to match the exact same DTOs, endpoints, and validation contracts.
- **Pros**:
  - Immediate, flawless functionality for `ROLE_DIR_CARRERA` in the active portal shell.
  - Preserves full architectural documentation, Angular command pattern ([`ScuPacReviewCmd`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/modules/secure/career-oversight/commands/scu-pac-review.cmd.ts)), and unit testability.
  - Guarantees backward compatibility with offline mock scenarios and live Gateway data.
- **Cons**:
  - Requires updating both `app-controller.js` and the Angular module files.

---

### Recommendation

**Adopt Approach 3 (Hybrid Cohesive Pattern with Native Institutional Review Modal)**:

1. **Career Identity & Sede Binding**:
   - Strictly bind `dir.carrera.sis` to **Ingeniería de Sistemas** (`CARSIS` / `648febfd-dc79-4dd8-a8aa-dc7549ef649b`) and **Sede Central Cochabamba** (`ea4fb26e-11a9-452f-9bae-4962de2dd931`).
   - If accessed by higher roles (`ROLE_DIR_ACADEMICA`, `ROLE_VICERRECTOR_SEDE`, `ROLE_ADMIN`), provide a career switcher dropdown in the `view2` header allowing supervision of other careers (e.g. `CARELE`, `CARMED`).

2. **Full Review & Endorsement REST Flow**:
   - Wire `approveSubjectSupervision` and `observeSubjectSupervision` to `POST /api/v1/planificaciones/pac/{id}/review`.
   - Provide a backend query endpoint `GET /api/v1/planificaciones/pac/by-carrera/{carreraId}?gestionId={gestionId}` in [`ScuPlanningController.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuPlanningController.java) to fetch real PAC records and states, mapping them to the SEA catalog course codes.
   - Maintain resilient fallback: if no backend PAC exists yet for a course, synthesize a provisional PAC in `ENVIADO_REVISION` state so the director can review it.

3. **Pedagogical Review Modal**:
   - Build a Tailwind-styled modal `#modal-pac-review` in `app.component.html`:
     - Subject information header: Code, Name, Teacher, Semester, Shifts, and Classrooms.
     - Decision selector: `APROBADO` (green) vs `OBSERVADO` (amber/red).
     - Required pedagogical feedback textarea with live character counter, placeholder hints (*"Ajustar saberes procedimentales de semana 4..."*), and validation blocking submission if under 10 characters.
     - Official digital endorsement footer: *"Firmado electrónicamente por Lic. Mariana Rios Vargas - Director de Carrera"*.

4. **Common Subjects Governance**:
   - Parse `groupLinkId` and `isLead` from SEA Gateway.
   - For Lead subjects (`isLead === true`): Full endorsement actions (`Aprobar`, `Observar`).
   - For Non-Lead subjects (`isLead === false`): Clear badge `⚡ COMÚN (LÍDER: [CARRERA])`, view-only or collaborative feedback note action, preventing unauthorized state overrides over the lead career.

5. **Cross-View Integration**:
   - Ensure clicking *"Ver Carpeta"* (`openTeacherFolderFromSupervision`) smoothly activates `view1`, selects the teacher by CI, sets the subject tab, and displays the PAC Matriz 7.

---

### Risks

1. **Risk: Backend Offline or Gateway Timeout**:
   - *Impact*: Director cannot load the curricular list or review PACs if the network connection drops.
   - *Mitigation*: Cache-Aside in LocalStorage ensures instant UI rendering; review decisions are optimistically updated locally and queued for synchronization if the network fails.

2. **Risk: Discrepancy between SEA Group Codes and SISA Assignments**:
   - *Impact*: A course code in SEA (e.g. `SIS-101`) might not have a matching `AsignacionDocente` ID in PostgreSQL.
   - *Mitigation*: Implement automatic assignment linking / on-demand provisioning in [`ScuPlanningController`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuPlanningController.java) when querying by course code and teacher CI.

3. **Risk: Observation Feedback Validation Bypass**:
   - *Impact*: An empty or meaningless observation submitted from the frontend causes a 400 Bad Request error from [`ScuReviewPacCmd`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuReviewPacCmd.java#L50-L56).
   - *Mitigation*: Client-side button disabling and validation message requiring $\ge 10$ characters before allowing submit.

4. **Risk: Permission Escalation or Non-Lead Overwrite on Common Subjects**:
   - *Impact*: Non-lead career director accidentally overwriting the lead director's endorsement.
   - *Mitigation*: Restrict primary approval button to lead groups; provide an "Observación Inter-Carrera" mode for non-lead directors.

---

### Ready for Proposal

The exploration confirms that all required backend infrastructure exists (`ScuReviewPacCmd`, `GroupItemDto`, `PacRepository`, `CatalogoAcademicoController`), while the frontend (`view2` in `app.component.html` and `app-controller.js`) requires completing the REST wiring, integrating the pedagogical feedback modal, and formalizing common subject permissions. We are ready to proceed with generating the change proposal, specification, and execution tasks.
