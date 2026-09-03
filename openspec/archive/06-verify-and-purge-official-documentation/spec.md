# Specification: Official Documentation Verification & Purge

## 1. Requirements

### 1.1 Programa Analítico Topic Extraction
- The Word parser must extract learning themes (`temas`) even when they are formatted as plain-text paragraphs or bullet points starting with `. ` or similar bullet characters, instead of strictly requiring tables or "TEMA" prefixes.
- `saberesConceptuales` must be populated correctly based on these extracted themes.
- If a unit has no themes extracted, the system should issue a warning in the response payload.

### 1.2 Plan de Clases Moment Header Filtering
- The Excel parser must not create `ScuMomentoPedagogicoDto` entries for structural header rows.
- Rows identified as a moment must have actual content (e.g., non-empty activity description or a valid duration) to avoid generating duplicate entries with `duracionMin: 0`.

### 1.3 Database/Mock Clean Slate Purge
- Provide a mechanism (test script or SQL) to purge all previously ingested official documents (Programas Analíticos, PACs, Planes de Clases) to ensure a clean slate before re-running ingestion tests.

## 2. BDD Scenarios

### Scenario 1: Word parser extracting bulleted topics
**Given** a Word document containing a learning unit with plain-text bulleted topics (e.g., ". CONCEPTOS DE LINGÜÍSTICA GENERAL")
**When** the document is parsed by `ProgramaAnaliticoDocxParser`
**Then** the topics are extracted into the `temas` array
**And** `saberesConceptuales` is correctly populated with the concatenated content
**And** no silent failure occurs for missing tables.

### Scenario 2: Excel parser ignoring moment header rows
**Given** a Plan de Clases Excel file with rows acting as headers for pedagogical moments (e.g., empty duration and empty specific activity)
**When** the document is parsed by `PlanesClaseExcelParser`
**Then** the parser skips these header rows
**And** only true moment rows with actual activities or durations are added to the `momentos` list.

### Scenario 3: Database clean slate purge
**Given** an environment with previously ingested test documents
**When** the purge script is executed
**Then** all existing records related to `ScuProgramaAnalitico`, `ScuPac`, and `ScuPlanClase` (and associated units/moments) are deleted
**And** the database is in a clean state ready for new ingestion verification.
