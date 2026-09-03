# Implementation Tasks: 05-docente-documents-and-common-subjects

## Phase 1: Frontend State & Collision Elimination
- [x] Refactor frontend storage services to use teacher-scoped composite keys (`${teacherCi}_${item.code}`).
- [x] Remove all usage of generic/index-based keys (e.g., `materia_cat_X`).
- [x] Implement strict FormGroups and Signals reset on `SubjectSwitch` action to prevent form state bleeding.
- [x] Update auto-save RxJS pipelines with `debounceTime` and `switchMap` to cancel pending saves on subject switch.
- [x] Bind auto-save subscriptions strictly to component lifecycle and active subject ID.

## Phase 2: Common Course Clustering & Ingestion Flow
- [x] Implement backend grouping logic in `/api/v1/planificaciones/docente/asignaciones` to return `CommonCourseClusterDto`.
- [x] Create UI for single upload point per common subject cluster to prevent duplicate work.
- [x] Implement dynamic subtabs in the UI to display and handle exports for each associated career in the cluster.
- [x] Update `OfficeTemplateService` export routines to accept `carreraId` for dynamic career metadata injection (e.g., banners, codes).

## Phase 3: Office Ingestion Verification
- [x] Implement POI parser for Word Programa Analítico (.docx).
- [x] Implement POI parser for Excel PAC Pedagógico (.xlsx).
- [x] Implement POI parser for Excel Cronograma Matriz 7 (.xlsx).
- [x] Implement POI parser for Excel Planes de Clase (.xlsx).
- [x] Verify that all 4 tabs load parsed data cleanly into the UI.
- [x] Verify that all 4 document types can be dynamically exported from the UI per career subtab.

## Phase 4: Integration & System Verification
- [x] Build and deploy the changes via Docker.
- [x] Perform live testing of the file import process for all 4 document types.
- [x] Verify exporting documents injects correct career metadata per subtab.
- [x] Test switching between subjects rapidly to ensure no auto-save race conditions or form bleeding occurs.
- [x] Test switching between teachers to verify cache separation (no cache bleed).
