# Tasks: 02-office-ingestion-and-live-sync

## 1. Metadata
- **Change Name**: `02-office-ingestion-and-live-sync`
- **Project**: SISA (Sistema Integrado de Seguimiento Académico)
- **Author**: GentleAI SISA Architecture Team
- **Date**: 2026-08-25
- **Status**: READY FOR IMPLEMENTATION
- **Store Mode**: Hybrid (`openspec/changes/02-office-ingestion-and-live-sync/tasks.md` + Engram)
- **Standards & Conventions**: SEA Coding Standards (`.atl/conventions-frontend.md`, `.atl/conventions-backend.md`)
- **Traceability**: References Proposal `#576`, Specification `#578`, and Technical Design `#579`

---

## 2. Implementation Task Breakdown

### Phase 1: Dynamic POI Office Ingestion & Shifter Engine

- [x] **Task 1.1: Enhance `DynamicRowShifter` for Excel Row Expansion, Merged Cell Translation, and Formula Re-binding**
  - **File**: `sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/office/DynamicRowShifter.java`
  - **Verification**: Unit tests confirm 10 to 60+ rows expansion without formula corruption.

- [x] **Task 1.2: Harden `PacExcelParser` for Institutional PAC Base Document**
  - **File**: `sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/office/PacExcelParser.java`
  - **Verification**: Ingests real `PAC TALLER DE IDIOMAS.xlsx` returning 40 parsed `ScuSesionMatriz7Dto` instances.

- [x] **Task 1.3: Harden `PlanesClaseExcelParser` for Institutional Plan de Clases Document**
  - **File**: `sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/office/PlanesClaseExcelParser.java`
  - **Verification**: Ingests real `PLAN DE CLASES TALLER DE IDIOMAS.xlsx` and builds `ScuPlanClaseRequest` with 3 moments.

- [x] **Task 1.4: Harden `ProgramaAnaliticoDocxParser` for Institutional Word Document**
  - **File**: `sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/office/ProgramaAnaliticoDocxParser.java`
  - **Verification**: Ingests real `Programa Analitico PROGRAMACION III.docx` returning valid `ScuProgramaAnaliticoRequest`.

- [x] **Task 1.5: Implement `DocxTemplateCloner` and `XlsxTemplateCloner` for High-Fidelity Office Export**
  - **Files**: `DocxTemplateCloner.java`, `XlsxTemplateCloner.java`, `OfficeTemplateService.java`
  - **Verification**: Exported `.xlsx` and `.docx` files download and open cleanly in Microsoft Office without style loss.

- [x] **Task 1.6: Verify and Setup Base Templates in Classpath**
  - **Files**: `template_pac.xlsx`, `template_plan_clases.xlsx`, `template_programa_analitico.docx`
  - **Verification**: Classpath resource loader loads templates without errors.

---

### Phase 2: Backend REST Service & Controller Enhancements

- [x] **Task 2.1: Implement Dual Canonical Controller Routing Architecture**
  - **Files**: `ScuPlanningController.java`, `ScuOfficeController.java`, `ScuAuditController.java`, `ScuAcademicController.java`
  - **Verification**: Both canonical `/api/v1/**` and legacy `/api/v1/system/**` URLs return identical JSON envelopes.

- [x] **Task 2.2: Implement Planning Lifecycle Service Commands**
  - **Files**: `ScuSavePacCmd.java`, `ScuReviewPacCmd.java`, `ScuSavePlanClaseCmd.java`, `ScuSaveProgramaAnaliticoCmd.java`
  - **Verification**: State machine guards prevent unauthorized transitions and enforce observation notes.

- [x] **Task 2.3: Implement In-Situ Classroom Audit Service with Active Radar and SHA-256 Digital Signature**
  - **Files**: `ScuInitiateAuditoriaInSituCmd.java`, `ScuFinalizeAuditoriaInSituCmd.java`, `ScuSignAuditoriaInSituCmd.java`
  - **Verification**: Radar matches active class, produces audit record with SHA-256 hash.

- [x] **Task 2.4: Implement 3-Strike Disciplinary Recurrence Escalator**
  - **File**: `ScuFinalizeAuditoriaInSituCmd.java`
  - **Verification**: 3 non-conforming audits sequentially trigger Strike 1, Strike 2, and Strike 3 records.

- [x] **Task 2.5: Enforce Multi-Tenant Isolation via `SedeTenantSpecification` and `TenantContext`**
  - **Files**: `TenantContext.java`, `SedeTenantSpecification.java`, `ScuJwtAuthenticationFilter.java`
  - **Verification**: Multi-tenant isolation verified in test suite.

- [x] **Task 2.6: Create Comprehensive Multi-Sede Relational Data Seeder (`V2__seed_multi_sede_real_data.sql`)**
  - **File**: `sisa-backend/src/main/resources/db/migration/V2__seed_multi_sede_real_data.sql`
  - **Verification**: Flyway migration executes cleanly on startup.

---

### Phase 3: Angular Frontend HTTP Services & Commands

- [x] **Task 3.1: Update REST Constants Dictionary (`scu-api.constant.ts`)**
- [x] **Task 3.2: Configure `ScuJwtInterceptor` for Multi-Tenant Header Propagation and Token Refresh**
- [x] **Task 3.3: Implement Angular Planning HTTP Service and Commands**
- [x] **Task 3.4: Implement Career Oversight HTTP Service and Review Command**
- [x] **Task 3.5: Implement Academic Audit HTTP Service and In-Situ Radar Commands**
- [x] **Task 3.6: Implement Academic & Analytics HTTP Service for Regional and Executive Dashboards**

---

### Phase 4: Dynamic Live Binding in Frontend Views

- [x] **Task 4.1: Wire Docente Planning Workspace with Real Ingestion, Reactive Form Matrix, and Export**
- [x] **Task 4.2: Wire Career Oversight Review Desk with 1º-10º Semester Filtering and Review Modal**
- [x] **Task 4.3: Wire In-Situ Academic Audit Desk with Active Class Radar and Cross-Check Scoring**
- [x] **Task 4.4: Wire Regional Analytics Desk with Real-Time Database Metrics and Disciplinary Strike Monitoring**
- [x] **Task 4.5: Wire Executive Vice-Rector Dashboard with Cross-Sede Comparative Rankings**
- [x] **Task 4.6: Verify Nginx Reverse Proxy Configuration in Container Environment**

---

### Phase 5: Test Suites & End-to-End Validation

- [x] **Task 5.1: Create Real Document Ingestion Test Suite (`RealDocumentIngestionIntegrationTest.java`)**
- [x] **Task 5.2: Create DynamicRowShifter 60+ Rows Stress Test Suite (`DynamicRowShifterStressTest.java`)**
- [x] **Task 5.3: Create Multi-Tenant Security Test Suite (`MultiTenantSedeSecurityTest.java`)**
- [x] **Task 5.4: Create In-Situ Radar & 3-Strike Disciplinary Recurrence Test Suite (`InSituAuditAndStrikeEngineTest.java`)**
- [x] **Task 5.5: Create Angular Component & Command Jasmine Unit Test Suites**
