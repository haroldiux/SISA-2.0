# Proposal: 05-docente-documents-and-common-subjects

## Intent
Enhance the Docente module by supporting full ingestion of all 4 official Office document types (Programa Analítico, PAC, Cronograma, Planes de Clase), introducing deduplication for Common Courses (Materias Comunes), and resolving critical frontend state/cache collisions.

## In Scope
* Backend POI parser implementation for 4 document types (DOCX and XLSX).
* Backend clustering logic for Common Courses across multiple careers.
* UI implementation of "carrera-subtabs" for exporting documents with dynamic career banners.
* Frontend state management refactoring to use deterministic composite keys instead of index-based keys.
* Fixes for Angular form state bleeding and race conditions on auto-save during subject switching.

## Out of Scope
* Changes to official document template visual structures (headers, logos) beyond dynamic career data injection.
* Creation of new document types outside the 4 specified.

## Technical Approach
* **Parsers:** Leverage Apache POI in backend endpoints (`/api/v1/office/import/*`) to extract structures reliably (e.g., APA 7 bibliographies, 14 pedagogical sections, 42+ matrix sessions).
* **Deduplication:** Group assignments of the same subject across different careers into a single "Common Course Cluster". The UI will use subtabs to allow exporting with the correct career metadata dynamically injected by `OfficeTemplateService`.
* **State & Caching:** Replace index-based keys (e.g., `materia_cat_X`) with UUID/JWT-based deterministic composite keys. Implement `switchMap` and debounce in RxJS auto-save pipelines to prevent race conditions. Force reset Signals/FormControls on subject change to prevent state bleeding.

## Affected Areas
* **Backend:** `/api/v1/office/import/*` endpoints, `/api/v1/planificaciones/*`, `OfficeTemplateService`, and domain models/DTOs for assignment clustering.
* **Frontend:** Docente module UI (carrera-subtabs), NgRx/Signals state stores, local caching services, and auto-save RxJS pipelines.

## Risks & Mitigations
* **Risk:** Auto-save race conditions during rapid subject switching.
  **Mitigation:** Use `switchMap` to cancel pending saves and strictly detach/re-bind auto-save handlers.
* **Risk:** Legacy data duplication.
  **Mitigation:** Create a Flyway migration script to consolidate existing duplicate career assignments into single common course clusters.

## Rollback Plan
Revert backend API changes and Flyway migrations. Roll back frontend state management and UI changes to the previous index-based architecture.

## Success Criteria
* All 4 document types parse successfully via POI.
* Common courses display once for teachers, with subtabs correctly exporting career-specific documents.
* Zero state collisions or form bleeding when switching subjects.
