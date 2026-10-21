# Tasks: 12 Student Roster and Attendance Tracking Module with Cross-Career Grouping

**Change ID**: `12-student-attendance-and-career-grouping`  
**Topic**: Student Roster and Attendance Tracking Module with Cross-Career Grouping and 80% Compliance Rule in SISA Platform Shell (`view1`) as Tab 5: "5. Lista y Asistencia"  
**Status**: Ready for Implementation  
**Artifact Mode**: `openspec` markdown persistence  
**Pilot Configuration**:
- **Subject / Cátedra**: `SIS-213 Programación III` (Common subject: Ingeniería de Sistemas + Ingeniería de Telecomunicaciones)
- **Career 1**: Ingeniería de Sistemas (`CARSIS`, SEA UUID `648febfd-dc79-4dd8-a8aa-dc7549ef649b`)
- **Career 2**: Ingeniería de Telecomunicaciones (`CARELE`, SEA UUID `a91b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d`)
- **Campus**: Sede Central Cochabamba (SEA Gateway Branch UUID `ea4fb26e-11a9-452f-9bae-4962de2dd931`)
- **Teacher Persona**: `docente.1001` (**Ing. Carlos Alberto Morales Siles**)
- **Director Persona**: `dir.carrera.sis` (**Lic. Mariana Rios Vargas**)
- **Academic Term**: Gestión `II-2026` / `2-2026` (Activa)

**Target Files**:
- Backend:
  - `sisa-backend/src/main/resources/db/migration/V7__student_attendance_tracking.sql` *(New)*
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/enums/EstadoAsistencia.java` *(New)*
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/model/AsistenciaSesion.java` *(New)*
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/model/AsistenciaEstudiante.java` *(New)*
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/repository/AsistenciaSesionRepository.java` *(New)*
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/repository/AsistenciaEstudianteRepository.java` *(New)*
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/request/GuardarAsistenciaRequest.java` *(New)*
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/request/AsistenciaEstudianteRequest.java` *(New)*
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/dto/AsistenciaSesionDto.java` *(New)*
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/dto/AsistenciaEstudianteDto.java` *(New)*
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/dto/AsistenciaResumenDto.java` *(New)*
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/dto/AsistenciaEstudianteResumenDto.java` *(New)*
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuSaveAsistenciaCmd.java` *(New)*
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuGetAsistenciaSesionCmd.java` *(New)*
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuGetAsistenciaResumenCmd.java` *(New)*
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuExportAsistenciaXlsxCmd.java` *(New)*
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuAsistenciaController.java` *(New)*
  - `sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuOfficeController.java`
- Frontend:
  - `sisa-frontend/src/app/app.component.html`
  - `sisa-frontend/src/assets/app-controller.js`
  - `sisa-frontend/src/app/shared/constants/scu-api.constant.ts`

---

## Phase 1: Database Migration (Flyway V7), JPA Entities, Repositories, Command Services, and REST Controller (`/api/v1/asistencias`)

- [x] 1.1 Database Migration: Author Flyway Migration V7
  - [x] 1.1.1 Create migration file [`V7__student_attendance_tracking.sql`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/resources/db/migration/V7__student_attendance_tracking.sql).
  - [x] 1.1.2 Define table `asistencias_sesiones`:
    - Columns: `id` (BIGSERIAL PK), `materia_codigo` (VARCHAR(30) NOT NULL), `materia_nombre` (VARCHAR(255) NOT NULL), `gestion_codigo` (VARCHAR(20) NOT NULL DEFAULT '2-2026'), `fecha` (DATE NOT NULL), `tipo_clase` (VARCHAR(20) NOT NULL DEFAULT 'TEORICA'), `comision` (VARCHAR(20) NOT NULL DEFAULT 'TA-01'), `tema` (VARCHAR(500)), `observaciones` (TEXT), `registrado_por` (VARCHAR(100) NOT NULL), `creado_en` (TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP), `actualizado_en` (TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP).
    - Constraints: `chk_tipo_clase` asserting `tipo_clase IN ('TEORICA', 'PRACTICA', 'LABORATORIO', 'CLINICA')`, and unique constraint `uq_sesion_asistencia` on `(materia_codigo, fecha, tipo_clase, comision)` for session idempotency.
    - Indexes: `idx_asistencias_sesiones_materia`, `idx_asistencias_sesiones_fecha`, `idx_asistencias_sesiones_gestion`.
  - [x] 1.1.3 Define table `asistencias_estudiantes`:
    - Columns: `id` (BIGSERIAL PK), `sesion_id` (BIGINT NOT NULL REFERENCES `asistencias_sesiones(id)` ON DELETE CASCADE), `estudiante_codigo` (VARCHAR(50) NOT NULL), `estudiante_nombre` (VARCHAR(255) NOT NULL), `carrera_codigo` (VARCHAR(30) NOT NULL DEFAULT 'CARSIS'), `carrera_nombre` (VARCHAR(255) NOT NULL DEFAULT 'Ingeniería de Sistemas'), `estado` (VARCHAR(20) NOT NULL DEFAULT 'PRESENTE'), `observacion` (VARCHAR(500)), `creado_en` (TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP), `actualizado_en` (TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP).
    - Constraints: `chk_estado_asistencia` asserting `estado IN ('PRESENTE', 'FALTA', 'ATRASO', 'LICENCIA')`, and unique constraint `uq_estudiante_sesion` on `(sesion_id, estudiante_codigo)`.
    - Indexes: `idx_asistencias_est_sesion`, `idx_asistencias_est_codigo`, `idx_asistencias_est_carrera`, `idx_asistencias_est_estado`.

- [x] 1.2 Domain Model: Enums, Entities & Repositories
  - [x] 1.2.1 Create domain enum [`EstadoAsistencia.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/enums/EstadoAsistencia.java) with values:
    - `PRESENTE` ("P", "Presente", 1.0)
    - `FALTA` ("F", "Falta", 0.0)
    - `ATRASO` ("A", "Atraso", 0.5)
    - `LICENCIA` ("L", "Licencia", 1.0)
  - [x] 1.2.2 Create JPA entity [`AsistenciaSesion.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/model/AsistenciaSesion.java) in `bo.edu.unitepc.sisa.domain.model` mapping `asistencias_sesiones` with:
    - Fields: `id`, `materiaCodigo`, `materiaNombre`, `gestionCodigo`, `fecha`, `tipoClase`, `comision`, `tema`, `observaciones`, `registradoPor`, `creadoEn`, `actualizadoEn`.
    - Relationship: `@OneToMany(mappedBy = "sesion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)` with helper method `addEstudiante(AsistenciaEstudiante estudiante)`.
  - [x] 1.2.3 Create JPA entity [`AsistenciaEstudiante.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/model/AsistenciaEstudiante.java) in `bo.edu.unitepc.sisa.domain.model` mapping `asistencias_estudiantes` with:
    - Fields: `id`, `sesion` (`@ManyToOne(fetch = FetchType.LAZY)`), `estudianteCodigo`, `estudianteNombre`, `carreraCodigo`, `carreraNombre`, `estado` (`@Enumerated(EnumType.STRING)`), `observacion`, `creadoEn`, `actualizadoEn`.
  - [x] 1.2.4 Create Spring Data JPA repository [`AsistenciaSesionRepository.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/repository/AsistenciaSesionRepository.java) with query methods:
    - `Optional<AsistenciaSesion> findByMateriaCodigoAndFechaAndTipoClaseAndComision(String materiaCodigo, LocalDate fecha, String tipoClase, String comision)`
    - `List<AsistenciaSesion> findByMateriaCodigoAndGestionCodigoOrderByFechaDesc(String materiaCodigo, String gestionCodigo)`
    - `@Query("SELECT DISTINCT s FROM AsistenciaSesion s LEFT JOIN FETCH s.estudiantes WHERE s.id = :id") Optional<AsistenciaSesion> findByIdWithEstudiantes(@Param("id") Long id)`
  - [x] 1.2.5 Create Spring Data JPA repository [`AsistenciaEstudianteRepository.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/repository/AsistenciaEstudianteRepository.java) with query methods:
    - `List<AsistenciaEstudiante> findBySesionId(Long sesionId)`
    - `@Query("SELECT ae FROM AsistenciaEstudiante ae JOIN ae.sesion s WHERE s.materiaCodigo = :materiaCodigo AND s.gestionCodigo = :gestionCodigo") List<AsistenciaEstudiante> findByMateriaAndGestion(@Param("materiaCodigo") String materiaCodigo, @Param("gestionCodigo") String gestionCodigo)`

- [x] 1.3 DTO Contracts & Validation Records
  - [x] 1.3.1 Create request record [`GuardarAsistenciaRequest.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/request/GuardarAsistenciaRequest.java) with validation annotations: `@NotBlank materiaCodigo`, `@NotBlank materiaNombre`, `gestionCodigo`, `@NotNull LocalDate fecha`, `@NotBlank tipoClase`, `@NotBlank comision`, `tema`, `observaciones`, and `@NotEmpty List<AsistenciaEstudianteRequest> estudiantes`.
  - [x] 1.3.2 Create request record [`AsistenciaEstudianteRequest.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/request/AsistenciaEstudianteRequest.java) with `@NotBlank estudianteCodigo`, `@NotBlank estudianteNombre`, `carreraCodigo`, `carreraNombre`, `@NotBlank estado`, and `observacion`.
  - [x] 1.3.3 Create response records:
    - [`AsistenciaSesionDto.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/dto/AsistenciaSesionDto.java) representing full session details with child marks.
    - [`AsistenciaEstudianteDto.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/dto/AsistenciaEstudianteDto.java) representing individual student mark.
    - [`AsistenciaResumenDto.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/dto/AsistenciaResumenDto.java) holding cumulative course attendance metrics and total at-risk students count.
    - [`AsistenciaEstudianteResumenDto.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/dto/AsistenciaEstudianteResumenDto.java) holding per-student cumulative semester counts (total, P, F, A, L, % compliance, and `cumpleNormativa80Pct`).

- [x] 1.4 Command Services & Business Logic
  - [x] 1.4.1 Create command [`ScuSaveAsistenciaCmd.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuSaveAsistenciaCmd.java) annotated with `@Transactional`:
    - Lookup existing session by `(materiaCodigo, fecha, tipoClase, comision)`.
    - If found: update session topic, observations, and `actualizadoEn`; update or insert student marks matching `estudianteCodigo`, preserving idempotency.
    - If not found: create new `AsistenciaSesion`, attach new `AsistenciaEstudiante` records, and persist via repository cascade.
    - Populate `registradoPor` from Spring Security context / `TenantContext`.
    - Return mapped [`AsistenciaSesionDto`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/dto/AsistenciaSesionDto.java).
  - [x] 1.4.2 Create command [`ScuGetAsistenciaSesionCmd.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuGetAsistenciaSesionCmd.java) annotated with `@Transactional(readOnly = true)`:
    - Query `findByMateriaCodigoAndFechaAndTipoClaseAndComision` and eagerly fetch student marks.
    - Return `Optional<AsistenciaSesionDto>`.
  - [x] 1.4.3 Create command [`ScuGetAsistenciaResumenCmd.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuGetAsistenciaResumenCmd.java) annotated with `@Transactional(readOnly = true)`:
    - Aggregate all sessions and marks for `materiaCodigo` and `gestionCodigo`.
    - Compute per-student compliance: $\text{\% Asistencia} = \frac{\text{P} + (0.5 \times \text{A}) + \text{L}}{\text{Total Sesiones}} \times 100$.
    - Evaluate 80% rule: flag `cumpleNormativa80Pct = porcentajeAsistencia >= 80.0`.
    - Calculate global subject percentage and count students at risk (`porcentajeAsistencia < 80.0`).
    - Return populated [`AsistenciaResumenDto`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/dto/AsistenciaResumenDto.java).

- [x] 1.5 REST Controller & Endpoint Exposure
  - [x] 1.5.1 Create REST controller [`ScuAsistenciaController.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuAsistenciaController.java) under `@RequestMapping("/api/v1/asistencias")`:
    - Apply class-level `@PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_VICERRECTOR_SEDE', 'ROLE_VICERRECTOR_NACIONAL', 'ROLE_ADMIN')")`.
  - [x] 1.5.2 Expose `POST /api/v1/asistencias/sesion`: validates `@Valid @RequestBody GuardarAsistenciaRequest`, calls `ScuSaveAsistenciaCmd`, and returns HTTP 200 with `ResourceBuilder`.
  - [x] 1.5.3 Expose `GET /api/v1/asistencias/sesion`: accepts `@RequestParam String materiaCodigo`, `@RequestParam LocalDate fecha`, `@RequestParam(defaultValue = "TEORICA") String tipoClase`, `@RequestParam(defaultValue = "TA-01") String comision`, calls `ScuGetAsistenciaSesionCmd`, and returns session data or HTTP 404.
  - [x] 1.5.4 Expose `GET /api/v1/asistencias/sesiones/{materiaCodigo}`: accepts `@PathVariable String materiaCodigo` and optional `@RequestParam(defaultValue = "2-2026") String gestionCodigo`, queries `findByMateriaCodigoAndGestionCodigoOrderByFechaDesc`, and returns list of historical sessions.
  - [x] 1.5.5 Expose `GET /api/v1/asistencias/resumen/{materiaCodigo}`: accepts `@PathVariable String materiaCodigo` and optional `@RequestParam(defaultValue = "2-2026") String gestionCodigo`, calls `ScuGetAsistenciaResumenCmd`, and returns cumulative compliance summary.
  - [x] 1.5.6 Update [`scu-api.constant.ts`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/shared/constants/scu-api.constant.ts) adding `ASISTENCIA` constants (`SESION`, `SESIONES_BY_MATERIA`, `RESUMEN_BY_MATERIA`).

---

## Phase 2: Frontend Shell & Tab 5 Navigation Layout in `app.component.html`

- [x] 2.1 Navigation & Tab Shell Integration
  - [x] 2.1.1 Add segmented tab button `#btn-tab-asistencia` to the top tab bar in [`app.component.html`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html) inside `#doc-sec-asignaturas` next to `#btn-tab-cronograma-planes`:
    - Lucide `clipboard-check` icon with teal badge styling (`bg-teal-100 dark:bg-teal-950/90 text-teal-600 dark:text-teal-400`).
    - Tab label: `"5. Lista y Asistencia"`.
    - Badge indicator: `"Nómina Oficial"` (`bg-teal-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full`).
  - [x] 2.1.2 Add contextual sidebar navigation item `#sidebar-tab-asistencia` in [`app.component.html`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html) under *"Documentos de la Carpeta"*:
    - Lucide `clipboard-check` icon and text `"5. Lista y Asistencia"`.
    - Click handler wired to `window.switchDocMainTab('tab-asistencia')`.
  - [x] 2.1.3 Add direct export action button in sidebar Direct Export Center in [`app.component.html`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html):
    - Label `"Asistencia Oficial (.xlsx)"` with Lucide `file-spreadsheet` icon triggering `window.exportAttendanceExcel()`.
  - [x] 2.1.4 Update `window.switchDocMainTab` in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js):
    - Add active tab button styling for `tab-asistencia` with active teal ring (`ring-teal-500/20`), active shadow, and border.
    - Update sidebar active styling for `#sidebar-tab-asistencia`.
    - Update clear button label `#btn-vaciar-pestana-label` to `"Reiniciar Asistencia de Sesión"`.
    - Trigger `window.loadAttendanceForCurrentSelection()` upon switching to `tab-asistencia`.

- [x] 2.2 Tab 5 Container Structure (`#tab-asistencia`)
  - [x] 2.2.1 Construct main container `#tab-asistencia` in [`app.component.html`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html) immediately following `#tab-cronograma-planes` with classes `doc-tab-panel p-6 space-y-6 hidden`.
  - [x] 2.2.2 Construct the Session Parameters Toolbar (`#asistencia-toolbar`):
    - Native HTML5 date picker `#asistencia-fecha-input` with calendar icon, defaulting to current ISO date within active term II-2026.
    - Class type segmented switch `#asistencia-tipo-clase`: buttons for `TEORICA` (*Clase Teórica*) and `PRACTICA` (*Clase Práctica / Laboratorio*).
    - Commission selector dropdown `#asistencia-comision-select` dynamically populated with course commissions (e.g., `TA-01`, `PL-01`, `PL-02`).
    - Pedagogical topic text input field `#asistencia-tema-input` with placeholder *"Tema o contenido desarrollado en la sesión..."*.
    - Direct action buttons:
      - `#btn-marcar-todos-presentes` ("⚡ Marcar Todos Presentes") with emerald hover styling.
      - `#btn-guardar-asistencia` ("💾 Guardar Asistencia") with teal primary button styling and loading indicator.
      - `#btn-exportar-asistencia-xlsx` ("📊 Exportar Excel") with emerald border button styling.
    - Data source synchronization indicator badge `#asistencia-sync-badge` displaying real-time connection status (`"En línea (SEA Gateway)"`, `"Caché local sincronizado"`, or `"Modo desconectado (Semilla institucional)"`).

- [x] 2.3 Real-Time KPI Ribbon Container
  - [x] 2.3.1 Construct Real-Time KPI Ribbon inside `#tab-asistencia` with 6 responsive metric cards:
    - Card 1 (`#asistencia-kpi-total`): *Total Inscritos* (icon `users`, neutral slate).
    - Card 2 (`#asistencia-kpi-presentes`): *Presentes (P)* (icon `user-check`, emerald styling).
    - Card 3 (`#asistencia-kpi-faltas`): *Faltas (F)* (icon `user-x`, rose styling).
    - Card 4 (`#asistencia-kpi-atrasos`): *Atrasos (A)* (icon `clock`, amber styling).
    - Card 5 (`#asistencia-kpi-licencias`): *Licencias (L)* (icon `file-text`, sky blue styling).
    - Card 6 (`#asistencia-kpi-porcentaje`): *% Asistencia de Sesión* with embedded 80% rule compliance badge (`#asistencia-kpi-cumplimiento-badge`).

- [x] 2.4 Career Cohort Filters & Student Roster Containers
  - [x] 2.4.1 Construct Career Cohort Filter Bar `#asistencia-career-filters`:
    - Responsive flex container for pill filter buttons (`"Todas las Carreras (Consolidado)"`, individual career pills).
  - [x] 2.4.2 Construct Student Roster Table Container `#asistencia-roster-container`:
    - Clean table layout with columns: `Nº`, `Código Estudiantil`, `Estudiante (Apellidos y Nombres)`, `Carrera`, `Marcación de Asistencia (P / F / A / L)`, `Observaciones / Justificación`, and `Cumplimiento Semestral (Regla 80%)`.
  - [x] 2.4.3 Construct Historical Sessions Accordion `#asistencia-historial-accordion`:
    - Collapsible panel with header *"Historial de Sesiones Registradas en el Semestre"*, badge count `#asistencia-historial-count`, and container `#asistencia-historial-list`.

---

## Phase 3: Roster Ingestion & Common Subjects Cross-Career Partitioning

- [x] 3.1 Gateway Ingestion & 3-Tier Offline Resilience Client
  - [x] 3.1.1 Implement `window.loadSubjectRoster(mKey)` in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js):
    - **Tier 1 (Instant Local Render)**: Check `localStorage` for `sisa_roster_${mKey}`. If found, immediately parse and invoke `window.renderAttendanceRoster(cachedData)` with 0ms latency.
    - **Tier 2 (Live Gateway Ingestion)**: Dispatch background `fetch` to `/api/v1/catalogo-academico/students/byGroup?groupId={groupId}` for each linked group in `materiasData[mKey].groups`.
    - Merge student lists, associate each student with their corresponding `carreraCodigo` and `carreraNombre` from the group definition, update `localStorage` key `sisa_roster_${mKey}`, update `#asistencia-sync-badge` to `"En línea (SEA Gateway)"`, and re-render.
  - [x] 3.1.2 Build Authentic Bolivian Student Mock Generator in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js) (**Tier 3 Fallback**):
    - Provide curated lists of authentic Bolivian paternal surnames (*Mamani, Condori, Quispe, Flores, Rodriguez, Choque, Vargas, Mendoza, Torrico, Fernandez, Lopez, Gutierrez, Morales, Rojas, Colque, Huanca, Alarcon, Villarroel, Claros, Camacho*), maternal surnames (*Perez, Cruz, Sanchez, Gomez, Chavez, Rios, Mercado, Soliz, Claure, Pinto, Beltran, Miranda, Guzman, Aguilar, Ortiz, Suarez, Arteaga, Arnez, Ledezma, Zurita*), and first names (*Kevin, Marisol, Alejandro, Daniela, Rodrigo, Valeria, Brandon, Camila, Alvaro, Gabriela, Jhonatan, Andrea, Cristian, Paola, Sebastian, Natalia, Mauricio, Luciana, Diego, Sofia*).
    - If live Gateway fetch fails (network error, HTTP 500, or returns empty array `[]`) and no cached roster exists: generate 25–35 deterministic student records.
    - Format student codes as `{CARRERA_PREFIX}-202{3|4|5}-{SEQ}` (e.g. `SIS-2024-012`, `TEL-2024-045`).
    - Allocate students proportionally among `carrerasResolved` for the cátedra.
    - Cache generated seed into `sisa_roster_${mKey}` and set `#asistencia-sync-badge` to `"Modo desconectado (Semilla institucional)"`.

- [x] 3.2 Cross-Career Cohort Partitioning & Visual Segregation
  - [x] 3.2.1 Implement cross-career partitioner in `window.renderAttendanceRoster()` in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js):
    - Identify distinct careers present in `activeRosterStudents` (`carreraCodigo`).
    - If subject is common (`isCommon === true` or multiple careers found): group students into separate career buckets.
  - [x] 3.2.2 Build institutional career cohort section headers in the roster table:
    - Dedicated banner row spanning all table columns.
    - Official career badge with institutional theme colors:
      - *Ingeniería de Sistemas*: Indigo badge (`bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200`).
      - *Ingeniería de Telecomunicaciones*: Violet badge (`bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200`).
      - *Ingeniería Biomédica*: Teal badge (`bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-200`).
      - *Medicina / Salud*: Emerald badge (`bg-emerald-100 text-emerald-800 border-emerald-200`).
    - Career title label: `"Carrera: Licenciatura en [Nombre de Carrera]"`.
    - Real-time sub-total summary pill for that career: enrolled count, Presentes, Faltas, Atrasos, Licencias, and `% Asistencia de Carrera`.
  - [x] 3.2.3 Render dynamic Career Cohort Filter Pills in `#asistencia-career-filters`:
    - Generate pill for `"Todas las Carreras (Consolidado)"` showing total enrolled count.
    - Generate individual career pills showing cohort name and count (e.g. `"Ing. de Sistemas (24)"`, `"Ing. de Telecomunicaciones (12)"`).
    - Implement `window.filterAttendanceByCareer(careerCode)`: clicking a pill filters table rows to display only students from the selected career, applies active pill styling, and preserves all recorded marks and global calculations.

---

## Phase 4: Interactive Attendance Taking Engine & Offline Resilience

- [x] 4.1 Interactive 4-State Toggle Engine & Optimistic UI
  - [x] 4.1.1 Render 4-way segmented toggle buttons per student row in `#asistencia-roster-container`:
    - `P` (Presente): Green button (`bg-emerald-600 text-white shadow-xs` when active; `hover:bg-emerald-100 text-emerald-700` when inactive).
    - `F` (Falta): Red button (`bg-rose-600 text-white shadow-xs` when active; `hover:bg-rose-100 text-rose-700` when inactive).
    - `A` (Atraso): Amber button (`bg-amber-500 text-white shadow-xs` when active; `hover:bg-amber-100 text-amber-700` when inactive).
    - `L` (Licencia): Sky blue button (`bg-sky-600 text-white shadow-xs` when active; `hover:bg-sky-100 text-sky-700` when inactive).
  - [x] 4.1.2 Implement `window.setStudentAttendanceStatus(studentCode, status)` in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js):
    - Optimistically update `currentAttendanceSession.estudiantes[studentCode].estado = status`.
    - Update button segment visual styles immediately with 0ms latency.
    - Trigger `window.updateAttendanceLiveKPIs()` immediately.
  - [x] 4.1.3 Implement inline observation input handling:
    - Text input per row for remarks/justifications (`#obs-${studentCode}`) with `oninput` handler updating `currentAttendanceSession.estudiantes[studentCode].observacion`.
  - [x] 4.1.4 Implement `window.markAllStudentsPresent()` in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js):
    - One-click bulk action: iterate all currently visible/filtered students and set status to `PRESENTE`.
    - Update all segmented button groups to active green (`P`).
    - Preserve existing observation notes.
    - Recalculate live KPIs and show transient feedback toast.

- [x] 4.2 Live Compliance KPIs & 80% Rule Early Warning Alerts
  - [x] 4.2.1 Implement `window.updateAttendanceLiveKPIs()` in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js):
    - Calculate aggregate counts: Total Enrolled, Presentes, Faltas, Atrasos, Licencias.
    - Compute session compliance percentage:
      $$\text{\% Asistencia} = \frac{\text{Presentes} + (0.5 \times \text{Atrasos}) + \text{Licencias}}{\text{Total Marcados}} \times 100$$
    - Update KPI ribbon counters: `#asistencia-kpi-total`, `#asistencia-kpi-presentes`, `#asistencia-kpi-faltas`, `#asistencia-kpi-atrasos`, `#asistencia-kpi-licencias`, and `#asistencia-kpi-porcentaje`.
    - Calculate and update sub-totals on each career cohort banner.
  - [x] 4.2.2 Enforce 80% Rule Compliance Badge in `#asistencia-kpi-cumplimiento-badge`:
    - When `% Asistencia >= 80.0%`: render emerald styling (`bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300`), Lucide `check-circle` icon, and text `"Cumple Normativa (>= 80%)"`.
    - When `% Asistencia < 80.0%`: render warning styling (`bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 animate-pulse`), Lucide `alert-triangle` icon, and text `"Alerta: Asistencia < 80% ([pct]%)"`.
  - [x] 4.2.3 Render cumulative student risk indicator per row:
    - Query cumulative attendance metrics from `/api/v1/asistencias/resumen/{materiaCodigo}`.
    - If a student has semester cumulative attendance $< 80.0\%$, render warning pill `"En Riesgo (<80%)"` in the student's status column.

- [x] 4.3 Persistent Session Storage, LocalStorage Mirroring & Historical Audit
  - [x] 4.3.1 Implement `window.saveAttendanceSession()` in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js):
    - Construct `GuardarAsistenciaRequest` payload from active subject, date picker, class type, commission, session topic, and student marks map.
    - Set `#btn-guardar-asistencia` to saving state with animated spinner.
    - **Local Cache Mirroring**: Save session payload to `localStorage` under key `sisa_attendance_${mKey}_${fecha}_${tipoClase}_${comision}`.
    - Dispatch `POST /api/v1/asistencias/sesion` with Authorization JWT.
    - On success (HTTP 200): reset button state, display institutional toast notification (*"✓ Asistencia guardada correctamente en el sistema institucional"*), and refresh historical sessions list.
    - On network error: keep local cache, display warning toast (*"⚠️ Conexión no disponible. Asistencia guardada localmente en el navegador y pendiente de sincronización"*).
  - [x] 4.3.2 Implement `window.loadAttendanceForDate(date)` in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js):
    - Wire `onchange` on date picker `#asistencia-fecha-input`, type toggle `#asistencia-tipo-clase`, and commission selector `#asistencia-comision-select`.
    - Query backend `GET /api/v1/asistencias/sesion?materiaCodigo=...&fecha=...&tipoClase=...&comision=...`.
    - Fallback to `localStorage` key `sisa_attendance_${mKey}_${fecha}_${tipoClase}_${comision}` if offline.
    - If saved session exists: hydrate student marks, observations, and topic input into the editor.
    - If no session exists: initialize editor with uncommitted marks.
  - [x] 4.3.3 Implement `window.loadAttendanceHistory()` in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js):
    - Query `GET /api/v1/asistencias/sesiones/{materiaCodigo}`.
    - Populate `#asistencia-historial-list` in accordion `#asistencia-historial-accordion` with chronological cards showing: date formatted as `DD/MM/YYYY`, class type badge, commission, topic covered, and attendance tally (Presentes / Total, and compliance percentage).
    - Clicking any historical card switches active editor parameters to that session and loads its marks.

---

## Phase 5: Official UNITEPC Excel Export (Apache POI) & Printable PDF Integration

- [x] 5.1 Backend Institutional Excel Generator (`ScuExportAsistenciaXlsxCmd`)
  - [x] 5.1.1 Create command [`ScuExportAsistenciaXlsxCmd.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuExportAsistenciaXlsxCmd.java) using Apache POI (`org.apache.poi.xssf.usermodel.XSSFWorkbook`):
    - Institutional Header: UNITEPC official title, subject code and name, docente name, academic term (`II-2026`), and emission timestamp.
    - Career Cohort Section Dividers: Formatted section banner row per career cohort (`CARSIS - Ingeniería de Sistemas`, `CARELE - Ingeniería de Telecomunicaciones`).
    - Attendance Matrix: Columns for Student Code, Full Name, individual session dates held in the term (cells populated with `P`, `F`, `A`, or `L`), Total Asistencias, Total Faltas, `% Asistencia`, and Habilitación Status (`HABILITADO` $\ge 80\%$, `INHABILITADO` $< 80\%$).
    - Summary Row: Column totals for Presentes, Faltas, and overall class compliance percentage.
    - Endorsement Signature Block: Official sign-off lines for *"Docente Titular"* and *"Director de Carrera"*.
  - [x] 5.1.2 Expose export endpoint in [`ScuOfficeController.java`](file:///c:/PROYECTOS/SISA/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuOfficeController.java):
    - `@GetMapping("/export/asistencia")` accepting `materiaCodigo` and `gestionCodigo`.
    - Stream workbook bytes with headers:
      - `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
      - `Content-Disposition: attachment; filename="Asistencia_{materiaCodigo}_{gestionCodigo}.xlsx"`
    - Apply `@PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_DIR_CARRERA', 'ROLE_ADMIN')")`.

- [x] 5.2 Frontend Excel Export Wiring
  - [x] 5.2.1 Implement `window.exportAttendanceExcel()` in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js):
    - Connect click event from `#btn-exportar-asistencia-xlsx` in Tab 5 toolbar and sidebar Direct Export Center.
    - Trigger binary file download from `/api/v1/office/export/asistencia?materiaCodigo=${mKey}&gestionCodigo=${gestion}`.
    - Show download in-progress toast and handle error responses gracefully.

- [x] 5.3 Printable PDF & Dossier Integration
  - [x] 5.3.1 Define print stylesheet rules in [`app.component.html`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/app/app.component.html) (`@media print`):
    - Hide interactive UI elements: segmented toggle buttons, quick batch buttons, date pickers, commission dropdowns, filter pills, and observation inputs.
    - Format student roster table with crisp black borders, high-contrast typography, and explicit print column widths suitable for standard Letter/A4 paper.
    - Render printable institutional header block and endorsement signature blocks for Docente Titular and Director de Carrera.
  - [x] 5.3.2 Update PDF Compilation Modal handler `window.openPdfPrintModal()` in [`app-controller.js`](file:///c:/PROYECTOS/SISA/sisa-frontend/src/assets/app-controller.js) to include Tab 5 attendance records in the comprehensive academic folder print dossier.

- [x] 5.4 Verification, Automated Testing & End-to-End Acceptance
  - [x] 5.4.1 Flyway migration test: Verify that `V7__student_attendance_tracking.sql` executes without error on PostgreSQL and schema matches JPA entity annotations.
  - [x] 5.4.2 Backend Unit/Integration Tests:
    - Test `ScuSaveAsistenciaCmd` verifying atomic upsert behavior and absence of duplicate session records on identical date/type/commission.
    - Test `ScuGetAsistenciaResumenCmd` verifying precision of 80% rule compliance calculations and at-risk student detection.
    - Test `ScuExportAsistenciaXlsxCmd` verifying valid XLSX binary output structure with career grouping headers and signature rows.
    - Test `ScuAsistenciaController` security rules with unauthorized/authorized JWT tokens.
  - [x] 5.4.3 Frontend End-to-End User Journey Verification:
    - Step 1: Open teacher workspace `view1` for common subject `SIS-213 Programación III`.
    - Step 2: Click `#btn-tab-asistencia` and verify tab activation, teal glow indicator, and sidebar sync.
    - Step 3: Verify 3-tier student roster ingestion (0ms cached render or Bolivian mock seed fallback).
    - Step 4: Verify cross-career segregation into *Ingeniería de Sistemas* and *Ingeniería de Telecomunicaciones* sections with distinct banners, counts, and career filter pills.
    - Step 5: Click `"⚡ Marcar Todos Presentes"` and verify instant 100% KPI ribbon calculation.
    - Step 6: Mark 5 students as `FALTA`, observe live KPI recalculation, and verify 80% rule warning alert triggers when compliance drops below 80%.
    - Step 7: Click `"Guardar Asistencia"` and verify idempotent persistence to PostgreSQL and `localStorage`.
    - Step 8: Switch dates and verify historical session reload from cache/database.
    - Step 9: Click `"Exportar Asistencia (.xlsx)"` and verify successful download of styled UNITEPC Excel spreadsheet.
    - Step 10: Trigger print preview and verify crisp, clean institutional printable layout.

---

## Verification & Acceptance Criteria

1. **Tab 5 Navigation & Shell Integration**:
   - Tab 5 button `#btn-tab-asistencia` is prominently rendered in the top segmented tab bar of `view1` with icon `clipboard-check` and badge `"Nómina Oficial"`.
   - Clicking `#btn-tab-asistencia` displays `#tab-asistencia`, applies active teal glow styling (`ring-teal-500/20`), and synchronizes `#sidebar-tab-asistencia`.
2. **Catalog Ingestion & 3-Tier Offline Resilience**:
   - Ingests student rosters from `/api/v1/catalogo-academico/students/byGroup` for all linked groups.
   - If gateway is unreachable, transparently falls back to authentic Bolivian seed mock roster without blocking the user.
   - Displays sync badge indicating active data source.
3. **Cross-Career Visual Segregation**:
   - For common subjects with multiple degree programs, students are segregated into career cohort sections with distinct institutional headers and sub-totals.
   - Career cohort filter pills allow filtering between unified cátedra view and career-isolated roster views.
4. **4-State Marking & 80% Rule Early Warning**:
   - 4-way toggle buttons (`P`, `F`, `A`, `L`) update student states with 0ms optimistic UI latency.
   - `"⚡ Marcar Todos Presentes"` marks all visible students present in one click.
   - Real-Time KPI Ribbon computes total, P, F, A, L counts, and overall % compliance.
   - Sessions or students with $< 80\%$ attendance immediately display high-visibility warning badges.
5. **Idempotent Persistence & Auditability**:
   - Saves to PostgreSQL via `POST /api/v1/asistencias/sesion` with database unique constraint enforcement on `(materia_codigo, fecha, tipo_clase, comision)`.
   - Repeated saves on the same session update records without creating duplicates.
   - Mirrors saved sessions in `localStorage` for 0ms offline availability.
6. **Historical Sessions Audit**:
   - Historical sessions accordion displays past class dates held during the term.
   - Clicking a historical card loads that session into the active editor.
7. **Institutional Excel & PDF Export**:
   - Official UNITEPC Excel export (`.xlsx`) generated via Apache POI includes institutional headers, career sections, session dates matrix, totals, 80% compliance status, and signature lines.
   - Dedicated `@media print` rules format the attendance list into a clean institutional printable dossier.
