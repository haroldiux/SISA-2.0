# Design: 07-multitype-curriculum-coordination

## 1. Overview
This document outlines the technical design for implementing dynamic curriculum template assignments (PAC and Plan de Clases) based on course component types detected from SEA Gateway integration.

## 2. Architecture & Design Patterns

### 2.1 Strategy Pattern for Parsers/Generators
We will replace the existing monolithic parser implementation with a Strategy Pattern to handle the 5 official UNITEPC Excel templates.

**Interfaces:**
- `PacParserStrategy`
- `PlanClaseParserStrategy`

**Concrete Strategies:**
- `PacGeneralParser` (PAC GRAL)
- `PacPracticoParser` (PAC PRÁCTICO)
- `PlanClaseTeoricoParser` (Plan TEÓRICO)
- `PlanClasePracticoParser` (Plan PRÁCTICO)
- `PlanClaseTeoricoPracticoParser` (Plan TEÓRICO-PRÁCTICO)

**Factory:**
- `ParserFactory`: Factory class that inspects file metadata or component type context to instantiate and route to the correct parser strategy.

### 2.2 Component Detection
Group components are extracted from `GroupItemDto` from the SEA Gateway.
- Prefix logic checks `code.startsWith("TA")`, `PA`, `PL`, `PS`.
- The assignment engine determines document assignments per teacher upon synchronization with the gateway.

## 3. Data Transfer Objects (DTOs)

### 3.1 DTO Refactoring
Update `ScuPacDto` and `ScuPlanClaseDto` to clearly segregate shared vs. personal data.
- **ScuPacDto**: Will act as the Nivel Global container.
- **ScuPlanClaseDto**: Will contain nested objects or properties distinguishing `SharedData` and `PersonalData`.

```java
public class ScuPlanClaseDto {
    // Shared among same subject/component
    private SharedPlanData sharedData;
    // Personal to the teacher
    private PersonalPlanData personalData;
    private String templateType; // TEORICO, PRACTICO, TEORICO_PRACTICO
}
```

## 4. Database Schema Changes

Migrations via Flyway to add multi-type support:

```sql
-- Migration: VX__Add_Component_Types.sql
ALTER TABLE scu_course ADD COLUMN course_type VARCHAR(50);
ALTER TABLE scu_group ADD COLUMN component_type VARCHAR(10); -- TA, PA, PL, PS

ALTER TABLE scu_pac ADD COLUMN pac_type VARCHAR(20); -- GRAL, PRACTICO
ALTER TABLE scu_plan_clase ADD COLUMN plan_type VARCHAR(30); -- TEORICO, PRACTICO, TEORICO_PRACTICO
```

## 5. Frontend Angular Refactoring

### 5.1 Dynamic Rendering
The Angular frontend (formerly mapped via `app-controller.js`) will leverage component-based polymorphic rendering using Signals for state management.
- `TemplateContainerComponent`: Parent component holding state.
- `TeoricoFormComponent`, `PracticoFormComponent`, `TeoricoPracticoFormComponent`: Child components rendered dynamically based on the current context (`ComponentType`).

### 5.2 Visual Badges
UI will implement visual badges to explicitly show the component type (e.g., `<span class="badge badge-ta">TA</span>`, also Live/Offline badge for Gateway status) for clarity to teachers.

## 6. Data Flow

1. **Sync**: `GatewaySyncService` pulls groups, identifies prefixes (TA/PA/PL/PS).
2. **Assignment**: `TemplateAssignmentService` evaluates the rules (same teacher vs different teachers) and creates necessary PAC and PlanClase entities with their respective `type` flags.
3. **Frontend Fetch**: Client requests documents. Backend returns DTOs including shared and personal payload parts.
4. **Export**: Client requests Excel export. `ScuOfficeController` invokes `ParserFactory.getPlanClaseGenerator(type)` to build the corresponding XLSX file.
