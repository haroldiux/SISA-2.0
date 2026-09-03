# Exploration: 05-docente-documents-and-common-subjects

## 1. Feature Overview
This change addresses critical improvements in the Docente module and document management system of SISA. It ensures full support for uploading and parsing all 4 institutional document types, introduces deduplication for Common Courses (Materias Comunes) to prevent double work for teachers, and resolves severe state management and caching collisions in the frontend application.

## 2. Technical Context & Requirements

### 1. Document Upload & Parsing (Tabs 1-4)
The system must support extraction and structural validation of official Office documents:
- **Tab 1: Programa Analítico (.docx)**: Extracts units, topics, and bibliography in APA 7 format.
- **Tab 2: PAC Pedagógico Oficial (.xlsx)**: Parses 14 key pedagogical sections, global competencies, and structural learning elements.
- **Tab 3: Cronograma de Clases (.xlsx - Matriz 7)**: Iterates and extracts 42+ sessions mapping dates, didactic sequences, and evaluation milestones.
- **Tab 4: Planes de Clase (.xlsx)**: Processes individual sheet-based lesson plans capturing didactic moments, assigned resources, and pedagogical tasks.

### 2. Common Courses (Materias Comunes) Deduplication
To optimize teacher workload, subjects shared across multiple careers (e.g., Programación I for both Sistemas and Electrónica) must be unified:
- Single-source upload and editing linking to a common course cluster.
- UI implementation of "carrera-subtabs" allowing teachers to preview and export the exact same syllabus, but dynamically decorated with the respective career banner and code (e.g., SIS-113 vs ELEC-113).

### 3. State Management & Cache Collision Fixes
- **Storage Keys**: The current storage key strategy (\mKey = materia_cat_\ + idx) and assignment mapping (\signacionId\ = idx + 1) generates local storage and PostgreSQL key collisions across different users and subjects.
- **Resolution**: Refactor state keys to be universally distinct and scoped to the teacher (e.g., \\_\\ or leveraging JWT claims and internal UUIDs).
- **Form State Bleeding**: Ensure Angular form controls and signals are fully reset upon switching subjects. Auto-save handlers must be detached and re-bound to prevent stale inputs from corrupting the newly selected subject's payload.

## 3. Architecture & Integration Strategy
- **Backend Refactoring**: Ensure the endpoints reliably handle the unified common course mapping. Review the /api/v1/office/import/* and /api/v1/planificaciones/* endpoints to map to the new deduplicated course clustering.
- **Frontend State Management**: Transition from index-based mapping to deterministic, identity-based composite keys in the State management layer (NgRx / Signals) and local caching service.
- **Dynamic Exporters**: The OfficeTemplateService or export routines must accept a target \carreraId\ dynamically to inject the correct institutional banners and career metadata into the exported Office documents.

## 4. Implementation Plan
### Phase 1: State Management Cleanup
- Refactor the frontend keys and signacionId logic. Replace \mKey\ with a robust deterministic composite key.
- Fix form state bleeding by resetting state signals/observables during the SubjectSwitch action.

### Phase 2: Common Course Clustering
- Introduce the "common course cluster" concept in the backend. 
- Implement multi-career subtabs in the Angular UI for the Docente view.
- Update the PDF/Office export routines to accept career context.

### Phase 3: Document Parsers & Office Ingestion
- Ensure the backend POI parsers can extract all 4 required tabs successfully.
- Verify endpoints:
  - /api/v1/office/import/programa-analitico
  - /api/v1/office/import/pac
  - /api/v1/office/import/plan-clase
  - /api/v1/planificaciones/programa-analitico
  - /api/v1/planificaciones/pac

## 5. Risks & Considerations
- **Concurrency on Auto-Save**: Auto-saving while the user rapidly clicks between subjects could result in race conditions. A debounce and switchMap strategy is required in the RxJS pipelines.
- **Legacy Document Mapping**: Existing documents that were previously mapped as duplicate entries across careers might require a migration script to cluster them correctly into the new common course structure.
