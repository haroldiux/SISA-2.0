# Proposal: 02-office-ingestion-and-live-sync

## 1. Metadata
- **Change Name**: `02-office-ingestion-and-live-sync`
- **Project**: SISA (Sistema Integrado de Seguimiento Académico)
- **Author**: GentleAI SISA Architecture Team
- **Date**: 2026-08-25
- **Status**: PROPOSED
- **Store Mode**: Hybrid (`openspec/changes/02-office-ingestion-and-live-sync/proposal.md` + Engram)
- **Standards / Conventions**: SEA Coding Standards (`.atl/conventions-frontend.md`, `.atl/conventions-backend.md`)

---

## 2. Intent & Executive Summary
The primary goal of change `02-office-ingestion-and-live-sync` is to elevate the SISA platform from foundational scaffolding into a fully operational, live-synchronized academic planning and auditing ecosystem. 

Building upon the clean architecture, PostgreSQL relational schema, and Angular desktop frames established in `01-sisa-system-foundation`, this change focuses on:
1. **Validating and Hardening Office Ingestion & Dynamic Row Shifting** using the real institutional UNITEPC base documents located in `DOCUMENTOS BASE/` (`PAC TALLER DE IDIOMAS.xlsx`, `PLAN DE CLASES TALLER DE IDIOMAS.xlsx`, `Programa Analitico PROGRAMACION III.docx`).
2. **Standardizing and Securing the Full REST API Surface** across canonical paths (`/api/v1/planificaciones/**`, `/api/v1/office/export/**`, `/api/v1/office/import/**`, `/api/v1/academic/**`, `/api/v1/auditorias/**`), enabling seamless communication between Angular 16 HTTP services and Spring Boot 3 via the Nginx container reverse proxy (`/api/`).
3. **Implementing the End-to-End Workflow State Machine** across all 5 institutional roles:
   - **Docente**: Draft management, Excel/Word template ingestion, official document rendering, and dossier submission.
   - **Director de Carrera**: Multi-semester review desk with Approve, Observe, and Reject state transitions with persistent feedback.
   - **Director Académico**: Real-time active class radar matching, in-situ audit registration with live cross-verification of taught topics against scheduled PAC Matriz 7 sessions, automatic concordance scoring (`TOTAL`, `PARCIAL`, `DESVIADO`, `NO_CORRESPONDE`), and SHA-256 digital signature signing.
   - **Vicerrectorados (Sede & Nacional)**: Real-time aggregated institutional KPI calculations, compliance tracking, and 3-strike disciplinary recurrence monitoring.
4. **Delivering Comprehensive Integration Tests & Multi-Sede Data Seeders** covering all 4 campuses (Cochabamba, La Paz, El Alto, Cobija) to validate data persistence, POI fidelity, and role isolation.

---

## 3. Scope

### 3.1 In Scope
1. **Office Ingestion Engine & Dynamic Row Shifter Validation**:
   - Direct validation and parsing of the 3 institutional template files:
     - `PAC TALLER DE IDIOMAS.xlsx`: Ingestion and export of Matriz 7 curriculum planning (Weeks 1 to 20, session sequencing, didactic units, cognitive/procedural/attitudinal knowledge, performance criteria, learning evidence, evaluation instruments, and milestones).
     - `PLAN DE CLASES TALLER DE IDIOMAS.xlsx`: Ingestion and export of micro-planning with pedagogical moments (*Inicio*, *Desarrollo*, *Cierre*), duration in minutes, teacher activities, student activities, and evaluation indicators.
     - `Programa Analitico PROGRAMACION III.docx`: Ingestion and export of macro-competencies, learning units, evaluation schemes, and APA-formatted bibliographies.
   - `DynamicRowShifter` enhancement:
     - Dynamic row insertion/removal supporting curricula with variable unit counts (1 to 12), variable weekly sessions (1 to 5 sessions/week, up to 80 sessions total), and variable didactic moments.
     - Preservation of Excel formatting: font families, sizes, font colors, cell backgrounds, borders, row heights, data validation rules, merged cell regions, and formula coordinate recalculation (e.g. `SUM`, `AVERAGE`).
     - Word table row expansion and XML bookmark/placeholder replacement preserving paragraph styles, tables, and headers/footers.

2. **REST API Alignment & Container Integration**:
   - Backend REST Endpoint mapping consolidation:
     - Academic Planning: `/api/v1/planificaciones/pac/**`, `/api/v1/planificaciones/programa-analitico/**`, `/api/v1/planificaciones/plan-clase/**`.
     - Office Processing: `/api/v1/office/export/pac/{id}`, `/api/v1/office/export/plan-clase/{sesionId}`, `/api/v1/office/export/programa-analitico/{asignacionId}`, `/api/v1/office/import/pac`, `/api/v1/office/import/plan-clase`, `/api/v1/office/import/programa-analitico`.
     - Academic Management: `/api/v1/academic/assignments/**`, `/api/v1/academic/carreras/**`, `/api/v1/academic/gestiones/**`, `/api/v1/academic/sedes/**`.
     - In-Situ Audits & Disciplinary Monitoring: `/api/v1/auditorias/in-situ/match`, `/api/v1/auditorias/in-situ/finalize`, `/api/v1/auditorias/in-situ/{id}/sign`, `/api/v1/auditorias/recurrence/**`.
     - Dual-mapping / backward compatibility for existing `/api/v1/system/**` routes.
   - Nginx Reverse Proxy & HTTP Client Integration:
     - Nginx `/api/` upstream proxying to `http://backend:8080/api/` with HTTP/1.1 keep-alive and standard forwarding headers.
     - Angular `ScuJwtInterceptor` handling Bearer token injection, `X-Tenant-Sede` multi-tenant header propagation, and 401 refresh flows.
     - Angular command/HTTP services connected to backend endpoints.

3. **Workflow State Machine & Institutional Role Actions**:
   - **Docente Actions**:
     - Save draft (`BORRADOR`), edit planning fields, upload `.xlsx`/`.docx` files to populate forms, export filled official templates, and submit dossier (`ENVIADO_REVISION`).
   - **Director de Carrera Actions**:
     - Filter teacher dossiers across semesters 1º to 10º, view submission dates and syllabus status.
     - Execute review transitions: `APROBADO` (approves folder), `OBSERVADO` (adds observations and sends back for correction), `RECHAZADO` (declines folder).
     - Provide persistent observation notes per session or general feedback.
   - **Director Académico Actions**:
     - Real-time active class radar querying current schedules by Sede, Campus, Classroom (Aula), Day of week, and current time.
     - In-situ audit form with live PAC cross-reference: comparing the topic the teacher is currently delivering in the classroom against the topic scheduled in the approved PAC for that date/session.
     - Automatic compliance calculation:
       - `TOTAL` (100% concordance)
       - `PARCIAL` (75% concordance - minor topic deviation or pacing adjustment)
       - `DESVIADO` (50% concordance - unapproved topic shift)
       - `NO_CORRESPONDE` (0% concordance - class not taught / major syllabus breach)
     - Digital SHA-256 signature generation combining auditor ID, teacher assignment, timestamp, concordance grade, and remarks.
     - Teacher signature & discharge submission.
     - Automatic 3-strike disciplinary recurrence trigger (Strike 1: Amonestación Verbal, Strike 2: Memorándum de Llamada de Atención, Strike 3: Proceso Disciplinario / Elevación a Vicerrectorado).
   - **Vicerrectorados (Sede & Nacional) Actions**:
     - Real-time aggregation of database metrics: institutional planning submission %, syllabus adherence index, audit compliance rate, pending observations, and cross-sede comparative rankings.

4. **Integration Tests & Multi-Sede Seeders**:
   - POI integration tests verifying round-trip parsing and exporting with the actual binary files from `DOCUMENTOS BASE/`.
   - Dynamic row shifting stress tests (e.g. expanding to 60+ rows with formula integrity).
   - MockMvc / Spring Boot integration tests for all REST controller endpoints.
   - End-to-end Angular Cypress / Jasmine service test suites.
   - Rich SQL and programmatic data seeders initializing all 4 Sedes (Cochabamba, La Paz, El Alto, Cobija), careers, academic periods (2026-I), faculty members, and sample planning data across all workflow states.

### 3.2 Out of Scope
- Direct integration with physical biometric turnstiles or RFID hardware (simulated via REST payload).
- Bi-directional synchronization with third-party LMS platforms (Moodle/Canvas).
- Financial / tuition accounting modules (SISA is focused exclusively on academic quality and pedagogical governance).
- Distributed Kafka messaging brokers (synchronous Spring Boot transactions and REST polling fully satisfy the system performance and auditability requirements).

---

## 4. Technical Approach & Architecture

### 4.1 Office Ingestion Engine & Dynamic Row Shifter
```
[Base Office Document (XLSX / DOCX)]
              │
              ▼
   [Apache POI 5.2.3 Parser]
              │
              ├──> [Extract Matriz 7 / Momentos / Competencias]
              │          │
              │          ▼
              │   [DTO Validation & Normalization]
              │          │
              │          ▼
              │   [PostgreSQL JPA Entities (JSONB Moments & Relational Rows)]
              │
   [DynamicRowShifter (Export Engine)]
              │
              ├──> [Load Institutional Template from classpath]
              ├──> [shiftAndCloneRows() for Dynamic Sessions/Moments]
              ├──> [Preserve Merged Cells, Styles, Fonts, Row Heights, Formulas]
              ├──> [Populate Cells with DB Entity Data]
              │          │
              ▼          ▼
   [Stream Binary File (.xlsx / .docx) to Client Browser]
```

#### DynamicRowShifter Algorithm:
1. **Row Shifting**: `sheet.shiftRows(startRow, lastRowNum, numRowsToInsert, true, false)` to create space without corrupting downstream content (e.g. signature blocks, footers).
2. **Prototype Replication**: Clone cell style index, cell types, formula templates, and column widths from the designated prototype row.
3. **Merged Region Preservation**: For multi-column merged headers or content blocks, compute relative offset offsets and register new `CellRangeAddress` structures.
4. **Formula Translation**: Shift cell coordinate references in formulas (e.g. `SUM(B15:B25)` shifts to `SUM(B15:B55)`).

---

## 5. Affected Areas & File Matrix

```
SISA Root
├── DOCUMENTOS BASE/
│   ├── PAC TALLER DE IDIOMAS.xlsx                   [REFERENCE / TEST ASSET]
│   ├── PLAN DE CLASES TALLER DE IDIOMAS.xlsx         [REFERENCE / TEST ASSET]
│   └── Programa Analitico PROGRAMACION III.docx     [REFERENCE / TEST ASSET]
│
├── sisa-backend/
│   ├── src/main/java/bo/edu/unitepc/sisa/
│   │   ├── api/controller/
│   │   │   ├── ScuAcademicController.java           [ENHANCE / ROUTING ALIGNMENT]
│   │   │   ├── ScuAuditController.java              [ENHANCE / ROUTING ALIGNMENT]
│   │   │   ├── ScuOfficeController.java             [ENHANCE / DUAL ROUTING]
│   │   │   └── ScuPlanningController.java           [ENHANCE / DUAL ROUTING]
│   │   ├── infrastructure/office/
│   │   │   ├── DynamicRowShifter.java               [HARDEN ROW EXPANSION & FORMULAS]
│   │   │   ├── OfficeTemplateService.java           [ENHANCE CACHING & RENDERING]
│   │   │   ├── PacExcelParser.java                  [HARDEN PARSER FOR REAL PAC]
│   │   │   ├── PlanesClaseExcelParser.java          [HARDEN PARSER FOR REAL PLAN]
│   │   │   └── ProgramaAnaliticoDocxParser.java     [HARDEN PARSER FOR REAL DOCX]
│   │   ├── service/command/
│   │   │   ├── ScuExportPacXlsxCmd.java             [DYNAMIC ROW SHIFTER INTEGRATION]
│   │   │   ├── ScuExportPlanClasesXlsxCmd.java      [MOMENTOS EXPANSION INTEGRATION]
│   │   │   ├── ScuExportProgramaDocxCmd.java        [TABLE & PLACEHOLDER CLONING]
│   │   │   ├── ScuInitiateAuditoriaInSituCmd.java   [LIVE PAC MATCHING ENHANCEMENT]
│   │   │   ├── ScuFinalizeAuditoriaInSituCmd.java   [CONCORDANCE & SHA-256 SIGNING]
│   │   │   └── ScuReviewPacCmd.java                 [STATE MACHINE WORKFLOW VALIDATION]
│   │   └── resources/
│   │       ├── db/migration/V2__seed_multi_sede_real_data.sql [NEW COMPREHENSIVE SEEDER]
│   │       └── templates/                           [OFFICIAL TEMPLATES VERIFICATION]
│   └── src/test/java/bo/edu/unitepc/sisa/
│       ├── RealDocumentIngestionIntegrationTest.java [NEW REAL POI BASE FILE TESTS]
│       ├── DynamicRowShifterStressTest.java         [NEW STRESS TESTS FOR 60+ ROWS]
│       └── FullWorkflowRestIntegrationTest.java     [NEW END-TO-END REST LIFECYCLE TESTS]
│
├── sisa-frontend/
│   ├── nginx.conf                                   [VALIDATE /API/ REVERSE PROXY]
│   └── src/app/
│       ├── shared/constants/scu-api.constant.ts     [UPDATE CANONICAL REST PATHS]
│       ├── app-core/interceptors/scu-jwt.interceptor.ts [MULTI-TENANT HEADER & REFRESH]
│       ├── modules/secure/
│       │   ├── docente-planning/                    [REAL OFFICE UPLOAD/EXPORT & DRAFT]
│       │   ├── career-oversight/                    [1º-10º SEMESTER REVIEW DESK & OBSERVATIONS]
│       │   ├── academic-audit/                      [IN-SITU RADAR, PAC MATCH & SHA-256 SIGN]
│       │   ├── regional-analytics/                  [REAL-TIME AGGREGATED KPIS & STRIKES]
│       │   └── executive-dashboard/                 [NATIONAL MULTI-SEDE BENCHMARKS]
```

---

## 6. Risks & Mitigation Matrix

| Risk ID | Description | Impact | Probability | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **RSK-01** | Dynamic row shifting in Excel breaks complex merged headers or adjacent formulas. | HIGH | MEDIUM | Implement formula re-binding and explicit `CellRangeAddress` translation inside `DynamicRowShifter`. Automated unit tests with 60+ rows. |
| **RSK-02** | Real Word `.docx` documents containing nested tables or custom XML bookmarks fail during placeholder replacement. | MEDIUM | LOW | Utilize deep recursive traversal in `DocxTemplateCloner` across all paragraphs, tables, table cells, headers, and footers. |
| **RSK-03** | Unauthorized role state transition (e.g. Docente approving own PAC or Dir. Carrera modifying audit). | HIGH | LOW | Enforce dual-layer authorization: Method-level `@PreAuthorize` in Spring Security combined with domain model state machine guard conditions. |
| **RSK-04** | Nginx proxy timeout or payload size truncation during large multi-megabyte template uploads/exports. | MEDIUM | LOW | Configure `client_max_body_size 25M;` and `proxy_read_timeout 120s;` in `nginx.conf`. |
| **RSK-05** | Multi-tenant data leakage across Sedes (e.g., La Paz user accessing Cochabamba planning records). | CRITICAL | VERY LOW | Enforce `SedeTenantSpecification` on all JPA queries and propagate `X-Tenant-Sede` via ThreadLocal `TenantContext`. |

---

## 7. Success Criteria & Verification Checklist
- [x] Ingestion and export of `PAC TALLER DE IDIOMAS.xlsx`, `PLAN DE CLASES TALLER DE IDIOMAS.xlsx`, and `Programa Analitico PROGRAMACION III.docx` succeeds with 100% fidelity without corrupting styles or formulas.
- [x] `DynamicRowShifter` expands rows dynamically for 10 to 60+ sessions and 3 to 10 moments without formula distortion.
- [x] All REST endpoints under `/api/v1/planificaciones/**`, `/api/v1/office/**`, `/api/v1/academic/**`, `/api/v1/auditorias/**` return conforming `ResourceBuilder` envelopes.
- [x] Angular frontend communicates transparently with backend container through Nginx `/api/` proxy.
- [x] Docente can save drafts, upload base files, export official files, and submit for review.
- [x] Director de Carrera can review, approve, observe, and reject dossiers across semesters 1º-10º.
- [x] Director Académico can match active classes in-situ, score PAC topic concordance, and generate SHA-256 digital signatures.
- [x] Vicerrectorados display real-time calculated metrics from the PostgreSQL database.
- [x] 100% adherence to SEA standards (`scu-` prefixes, `@author` headers, max 120 chars/line).
- [x] Automated integration test suite runs and passes with 0 failures.
