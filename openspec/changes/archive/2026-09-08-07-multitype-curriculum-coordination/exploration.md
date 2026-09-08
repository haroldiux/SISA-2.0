# Exploration: Multi-type Curriculum Templates & Coordination

## 1. Context & Analysis
The UNITEPC educational model requires specific templates for distinct course modalities:
- **Teórico**: Theoretical classes, requiring 3 phases of pedagogical moments, and conceptual/attitudinal knowledge elements.
- **Práctico**: Practical classes, using a 4-phase methodological model.
- **Teórico-Práctico**: Mixed classes, incorporating both components (TA and PA) and 3 learning types (conceptual, procedural, attitudinal).

Furthermore, the teaching model separates Nivel Global (shared course description, competencies) from Nivel Sesión (individual teacher sessions, timings, activities).

Currently, the sisa-backend handles parsing through monolithic classes (PacExcelParser.java, PlanesClaseExcelParser.java). These parsers dynamically scan rows but hardcode assumptions like a 3-phase model (Inicio, Desarrollo, Cierre), which fails to fully accommodate the 4-phase Práctico model or specific column deviations. On the frontend (pp-controller.js), a single form interface exists to represent all these variations.

## 2. Architectural Comparison

### Option A: Monolithic Parser/Generator with If/Else Branches
This approach would extend the existing PlanesClaseExcelParser and pp-controller.js by passing a CourseType parameter and adding conditional logic to handle differences.

*   **Pros**:
    *   Fastest path to implementation.
    *   Keeps all parsing logic in a single file.
*   **Cons**:
    *   **High Complexity**: The parsers are already ~300+ lines of complex string-matching. Adding logic for 4-phase models and conditional component mappings will exponentially increase cyclomatic complexity.
    *   **Brittle**: Changes to the Práctico template might break the Teórico parsing.
    *   **Poor Separation of Concerns**: Blends Nivel Global shared logic with Nivel Sesión individual logic.

### Option B: Strategy Pattern (Polymorphic Parsers & View Renderers)
This approach refactors the architecture to define an interface ExcelParserStrategy and implements specific parsers for each modality (e.g., PlanClaseTeoricoParser, PlanClasePracticoParser). The Gateway API (UnitepcGatewayClient) provides the type (Teórico, Práctico, TA, PA, PL, PS) metadata to both backend and frontend.

*   **Pros**:
    *   **Open/Closed Principle**: Easy to add a new curriculum type in the future without modifying existing code.
    *   **Accurate Parsing**: Each parser exactly matches its Excel template (e.g., the Práctico parser expects 4 phases).
    *   **Frontend Scalability**: The UI can render specialized sub-components dynamically based on the component type.
*   **Cons**:
    *   Requires refactoring existing parser classes and ScuOfficeController.
    *   More boilerplate (Factory pattern needed).

## 3. Concrete Recommendations
1.  **Adopt Option B (Strategy Pattern)** for backend parsers and generators. Create a ParserFactory that inspects the file or metadata and routes to the correct strategy.
2.  **Separate Shared vs. Individual Data**:
    *   Update ScuPacDto to clearly distinguish shared Nivel Global properties (Competencias, Unidades) from Nivel Sesión properties.
    *   Enforce access controls so that modifying Nivel Global requires consensus (or is restricted to the lead teacher), while Nivel Sesión is freely editable by the assigned teacher.
3.  **Frontend Polymorphism**: Refactor pp-controller.js (or move to structured components) to render specific forms based on the ComponentType (TA, PA, PL, PS) returned by the Gateway.

## 4. Risks & Mitigations
*   **Data Loss during Migration**: Existing data parsed under the monolithic 3-phase assumption might not cleanly map to a 4-phase model.
    *   *Mitigation*: Run a data migration script. Keep the original Excel files as a source of truth for re-parsing using the new strategies.
*   **UI/UX Complexity**: Teachers might be confused if the forms change shape depending on the group type.
    *   *Mitigation*: Use clear visual badging (e.g., "Práctica de Laboratorio (PL)") and contextual tooltips.
