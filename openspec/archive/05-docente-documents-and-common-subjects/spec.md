# Specification: 05-docente-documents-and-common-subjects

## 1. Requirements

### 1.1. Document Import (4 Types)
*   **Programa Analítico (Tab 1):** Support `.docx` extraction, mapping units, topics, and bibliography in APA 7 format.
*   **PAC Pedagógico (Tab 2):** Support `.xlsx` parsing of 14 key pedagogical sections, global competencies, and structural elements.
*   **Cronograma Matriz 7 (Tab 3):** Support `.xlsx` extraction of 42+ sessions including dates, didactic sequences, and evaluation milestones.
*   **Planes de Clase (Tab 4):** Support `.xlsx` processing of lesson plans across multiple sheets, capturing didactic moments and resources.

### 1.2. Common Course Deduplication & Multi-career Subtabs
*   **Deduplication:** Group subjects taught by a single teacher across multiple careers (e.g., Programación I for Sistemas and Electrónica) into a unified Common Course Cluster.
*   **Teacher UI:** Present clustered subjects once to prevent duplicate data entry.
*   **Multi-career Subtabs:** Provide subtabs per career within a Common Course. Exporting from a specific subtab must generate the document injected with the correct career metadata (banner, code).

### 1.3. Deterministic State Management & Collision Prevention
*   **Storage Keys:** Replace index-based keys (`materia_cat_idx`) with deterministic composite keys (`${teacherCi}_${courseCode}`).
*   **State Bleeding:** Reset Angular Signals and FormControls when switching subjects.
*   **Auto-save Safeties:** Prevent race conditions during rapid subject switching by canceling pending auto-saves using RxJS `switchMap` and debounce strategies.

## 2. Given/When/Then Scenarios

### Scenario 1: Programa Analítico DOCX Import
**Given** the user is on the Programa Analítico tab of a subject
**When** the user uploads a valid `.docx` Programa Analítico file
**Then** the system extracts units, topics, and APA 7 bibliographies and populates the form without errors.

### Scenario 2: PAC Pedagógico XLSX Import
**Given** the user is on the PAC tab
**When** the user uploads a valid `.xlsx` PAC file
**Then** the system extracts the 14 pedagogical sections and competencies, updating the UI accordingly.

### Scenario 3: Matriz 7 XLSX Import
**Given** the user is on the Cronograma tab
**When** the user uploads a valid `.xlsx` Matriz 7 file
**Then** the system creates up to 42+ session entries with their respective dates, sequences, and evaluation milestones.

### Scenario 4: Planes de Clase XLSX Import
**Given** the user is on the Planes de Clase tab
**When** the user uploads a valid `.xlsx` Planes de Clase file
**Then** the system iterates through the workbook sheets, creating lesson plans capturing didactic moments and resources for each session.

### Scenario 5: Common Course Deduplication & Export
**Given** a teacher is assigned to "Programación I" for both "Sistemas" and "Electrónica"
**When** the teacher views their subjects
**Then** they see a single entry for "Programación I"
**And When** they navigate to the "Electrónica" subtab and click Export
**Then** the exported document contains the Electrónica career banner and code.

### Scenario 6: Collision-free State Management on Rapid Switch
**Given** the teacher has made edits to Subject A triggering a debounced auto-save
**When** the teacher immediately switches to Subject B before the auto-save completes
**Then** the auto-save for Subject A is completed or canceled safely, form state is fully reset, and Subject B's data is cleanly loaded without any data from Subject A bleeding over.
