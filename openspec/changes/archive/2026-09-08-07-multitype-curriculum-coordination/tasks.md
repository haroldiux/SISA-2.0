# Implementation Tasks: Multitype Curriculum Coordination (Change 07)

## Phase 1: Database & DTOs Foundation
- [x] 1.1 Create Flyway migration script to add `course_type`, `component_type`, `pac_type`, `plan_type` columns to relevant tables.
- [x] 1.2 Implement `ComponentType` enum (TA, PA, PL, PS) in backend.
- [x] 1.3 Implement `CourseType` enum (TEORICO, PRACTICO, TEORICO_PRACTICO) in backend.
- [x] 1.4 Refactor DTOs to include `templateType` field.
- [x] 1.5 Create `SharedPlanData` and `PersonalPlanData` DTO structures within `ScuPlanClaseDto`.

## Phase 2: Strategy Pattern Infrastructure
- [x] 2.1 Define `PacParserStrategy` interface.
- [x] 2.2 Define `PlanClaseParserStrategy` interface.
- [x] 2.3 Implement `ParserFactory` with component-based routing.
- [x] 2.4 Implement Template Assignment Service to handle Document Assignment Matrix logic.

## Phase 3: PAC Parsers
- [x] 3.1 Implement `PacGeneralParser` to read/write PAC GRAL Excel structure.
- [x] 3.2 Implement `PacPracticoParser` to read/write PAC PRÁCTICO Excel structure (4-phase model).

## Phase 4: Plan de Clases Parsers
- [x] 4.1 Implement `PlanClaseTeoricoParser` (Conceptual + Actitudinal, 3-phase).
- [x] 4.2 Implement `PlanClasePracticoParser` (4-phase: Preparación, Ejecución Guiada, Ejecución Autónoma, Cierre).
- [x] 4.3 Implement `PlanClaseTeoricoPracticoParser` (Conceptual + Procedimental + Actitudinal, 3-phase).

## Phase 5: Frontend Dynamic Rendering
- [x] 5.1 Implement component type detection from gateway groups (TA-XX, PA-XX, PL-XX, PS-XX) in JS controllers.
- [x] 5.2 Create dynamic PAC form accommodating GRAL vs PRÁCTICO sections.
- [x] 5.3 Create dynamic Plan de Clases form accommodating TEÓRICO vs PRÁCTICO vs TEÓRICO-PRÁCTICO.
- [x] 5.4 Implement UI separation for Shared vs Personal sections (Docente view).
- [x] 5.5 Implement visual badges (TA/PA/PL/PS) in the UI.
- [x] 5.6 Implement consolidated view for Director de Carrera.

## Phase 6: Integration & Verification
- [x] 6.1 Conduct end-to-end testing with all 5 Excel templates.
- [x] 6.2 Validate all 6 assignment matrix scenarios.
- [x] 6.3 Validate Director de Carrera consolidated view.
- [x] 6.4 Rebuild Docker images and test deployment.
