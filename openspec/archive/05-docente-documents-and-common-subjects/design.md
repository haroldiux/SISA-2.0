# Technical Design: 05-docente-documents-and-common-subjects

## 1. POI Parsing Architecture
The backend will leverage Apache POI for document ingestion via endpoints under `/api/v1/office/import/*`:
*   **DocxParser (Programa Analítico):** Scans XWPFDocument paragraphs and tables to identify unit headers, topic rows, and bibliography sections based on known institutional text anchors.
*   **XlsxParser (PAC, Matriz 7, Planes de Clase):** Uses XSSFWorkbook to map specific cell coordinates (e.g., cell B4 for competencies) and iterate over rows (Matriz 7) or sheets (Planes de Clase). Parsers will construct strongly-typed DTOs to return to the frontend.

## 2. Composite Teacher-Scoped Storage Keys
To resolve localStorage and database key collisions, index-based mapping will be entirely replaced.
*   **Key Format:** `${teacherCi}_${courseCode}` (e.g., `1234567_SIS-113`).
*   **Implementation:** The frontend state manager and caching service will derive this composite key from the authenticated user's JWT claims (`ci` or `userId`) and the selected course's unique code.
*   **Benefit:** Universally distinct keys ensure that multiple teachers on the same machine or caching layers do not overwrite each other's data.

## 3. Decoupled Auto-save & State Bleeding Prevention
The frontend Angular application will enforce strict state isolation between subjects:
*   **RxJS `switchMap`:** The auto-save pipeline will use `debounceTime(1000)` followed by `switchMap`. When a `SubjectSwitch` action is dispatched, any pending HTTP save requests for the previous subject will be implicitly canceled if not yet executing, or gracefully ignored upon return.
*   **Form Reset:** The `SubjectSwitch` action will explicitly trigger `.reset()` on all Angular FormGroups and re-initialize Signals to their default states before loading the new subject's payload.
*   **Lifecycle Hooking:** Auto-save subscriptions will be tied strictly to the component lifecycle and the active subject ID, immediately unsubscribing and re-subscribing on subject change.

## 4. Common Course Clustering & Dynamic Export Context
*   **Backend Clustering:** The `/api/v1/planificaciones/docente/asignaciones` endpoint will group identical `asignatura_id` records for the same teacher into a `CommonCourseClusterDto`. This DTO will contain a list of associated `CareerDto` objects.
*   **Dynamic Export:** `OfficeTemplateService` routines (e.g., `exportProgramaDocx`) will accept a `carreraId` as an argument.
*   **Workflow:** When the teacher exports a document from a specific career subtab, the frontend passes the `carreraId`. The backend uses this ID to fetch the specific career metadata (facultad, carrera nombre) and injects the corresponding institutional banner into the `.docx` or `.xlsx` template before returning the file.
