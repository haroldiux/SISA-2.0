# Technical Design: 02-office-ingestion-and-live-sync

## 1. Metadata
- **Change Name**: `02-office-ingestion-and-live-sync`
- **Project**: SISA (Sistema Integrado de Seguimiento Académico)
- **Status**: DESIGNED
- **Date**: 2026-08-25
- **Author**: GentleAI SISA Architecture Team
- **Store Mode**: Hybrid (`openspec/changes/02-office-ingestion-and-live-sync/design.md` + Engram)
- **Standards & Conventions**: SEA Coding Standards (`.atl/conventions-frontend.md`, `.atl/conventions-backend.md`)
- **Traceability**: References Proposal `#576` and Specification `#578`

---

## 2. Executive Architectural Overview & System Context

The `02-office-ingestion-and-live-sync` change transitions SISA from initial structural scaffolding into a production-hardened academic governance platform. It solves the complex challenge of ingesting, validating, synchronizing, and exporting institutional UNITEPC academic planning documents (PAC Matriz 7, Plan de Clases, Programa Analítico) while maintaining 100% fidelity to official Microsoft Excel (`.xlsx`) and Word (`.docx`) formatting, borders, fonts, formulas, and merged cells.

Furthermore, this design hardens the end-to-end live academic governance lifecycle across all 5 institutional roles:
1. **Docente**: Prepares syllabus drafts, imports existing Excel/Word files, verifies pedagogical moments, and submits dossiers for review.
2. **Director de Carrera**: Filters dossiers across semesters 1º to 10º, executes review transitions (`APROBADO`, `OBSERVADO`, `RECHAZADO`), and issues actionable feedback.
3. **Director Académico**: Operates the real-time Active Class Radar to locate ongoing lectures, conducts in-situ classroom audits, scores PAC topic concordance, computes SHA-256 digital signatures, and triggers automatic 3-strike disciplinary recurrence escalations.
4. **Vicerrectorado de Sede**: Monitors campus-wide compliance, syllabus adherence metrics, and active disciplinary remediation plans.
5. **Vicerrectorado Nacional**: Views cross-campus comparative KPI benchmarks (Cochabamba, La Paz, El Alto, Cobija) and institutional compliance radars.

---

## 3. Architecture Decision Records (ADRs)

### ADR-001: In-Memory POI Streaming with DynamicRowShifter vs. External Template Frameworks
- **Status**: ACCEPTED
- **Context**: Institutional UNITEPC Excel and Word templates possess delicate styling, custom color palettes (`#1E3A8A`, `#047857`), complex multi-column merged headers, and variable row requirements (e.g., PAC Matriz 7 requires 10 to 60+ sessions; Plan de Clases requires 3 to 10 pedagogical moments; Word requires dynamic table insertion for 1 to 12 learning units). External template libraries introduce heavy dependencies and lack native formula translation.
- **Decision**: Implement a native, low-overhead POI engine using `DynamicRowShifter`, `XlsxTemplateCloner`, and `DocxTemplateCloner` built directly on Apache POI 5.2.3.
- **Consequences**:
  - Full control over Excel internal structures: row shifting, cell style indexing, `CellRangeAddress` translation, and formula coordinate re-binding.
  - Zero third-party template DSL syntax required in official Word/Excel files.
  - Stream-safe binary generation using in-memory byte buffers with zero disk I/O leaks.

### ADR-002: Dual Routing Strategy (Canonical `/api/v1/**` + Legacy `/api/v1/system/**`)
- **Status**: ACCEPTED
- **Context**: The frontend and existing scaffolding previously utilized `/api/v1/system/**` routes. The specification mandates standardizing canonical domain routes (`/api/v1/planificaciones/**`, `/api/v1/office/**`, `/api/v1/academic/**`, `/api/v1/auditorias/**`) while maintaining non-breaking backward compatibility.
- **Decision**: Configure Spring Web `@RequestMapping` annotations with dual path arrays on all controllers (e.g. `@RequestMapping({\"/api/v1/planificaciones\", \"/api/v1/system/planning\"})`).
- **Consequences**:
  - Instant support for both canonical Clean REST routes and legacy paths.
  - Seamless zero-downtime transition for frontend modules.

### ADR-003: Immutable Cryptographic In-Situ Audit Signature
- **Status**: ACCEPTED
- **Context**: In-situ classroom audits represent legal/institutional evidence of teacher performance. Audit records must be protected against post-hoc tampering by administrators or faculty.
- **Decision**: Generate an immutable SHA-256 digital signature at the moment of audit finalization:
  $$\text{Hash} = \text{SHA256}(\text{asignacionId} \parallel \text{auditorId} \parallel \text{timestamp} \parallel \text{puntualidad} \parallel \text{concordancia} \parallel \text{momento})$$
  The computed hash is stored in `hash_firma_digital` and returned with all audit payloads.

### ADR-004: 3-Strike Disciplinary Recurrence State Machine
- **Status**: ACCEPTED
- **Context**: Academic non-conformance (unexcused teacher absence, severe tardiness >15 min, or teaching topics outside the approved syllabus) requires progressive institutional escalation without manual administrative overhead.
- **Decision**: Implement an automatic 3-strike disciplinary engine in `ScuFinalizeAuditoriaInSituCmd`:
  - **Strike 1 (`NIVEL_1`)**: Automated formal verbal warning notification (`NOTIFICADO`).
  - **Strike 2 (`NIVEL_2`)**: Written reprimand requiring a Remedial Action Plan (`PlanAccionMejora`) within 5 business days (`PLAN_ACCION_REQUERIDO`).
  - **Strike 3 (`NIVEL_3`)**: Disciplinary escalation to Regional and National Vice-rectors (`ESCALADO_VICERRECTORADO`).

### ADR-005: Frontend SEA Command-HTTP Pipeline & Subscription Lifecycle
- **Status**: ACCEPTED
- **Decision**: Strictly enforce SEA conventions across 100% of frontend code:
  - Component (`*.component.ts`) delegates mutating workflows to Commands (`*.cmd.ts`).
  - HTTP Services (`*.http.ts`) handle only raw HTTP transport returning `Observable<{ data: T }>`.
  - All components implement `_initialize()` and `_finalize()` with `takeUntil(this._destroy$)` subscription teardown.
  - All entities, components, services, and directives use the `scu-` prefix.

---

## 4. Backend Deep Technical Design (Java 21 / Spring Boot 3)

### 4.1 DynamicRowShifter & TemplateCloner Engine Deep Design

#### 4.1.1 DynamicRowShifter Mathematical Model & Algorithm
```
Let Sheet S be the active XSSFSheet.
Let R_proto be the prototype row index (e.g. row 15).
Let R_start = R_proto + K (the insertion index before downstream content).
Let M = N - K be the number of rows to insert (M > 0).
Let R_last = S.getLastRowNum().

Algorithm shiftAndCloneRows(S, R_start, M, R_proto):
1. IF M <= 0 OR S == null THEN RETURN.
2. IF R_start <= R_last THEN:
       S.shiftRows(R_start, R_last, M, true, false)
       // Shifts all rows from R_start to R_last down by M positions.
3. FOR i = 0 TO M - 1 DO:
       r_new = R_start + i
       Row_new = S.createRow(r_new)
       Row_new.setHeight(Row_proto.getHeight())
       
       FOR c = 0 TO Row_proto.getLastCellNum() - 1 DO:
           Cell_proto = Row_proto.getCell(c)
           IF Cell_proto != null THEN:
               Cell_new = Row_new.createCell(c, Cell_proto.getCellType())
               IF Cell_proto.getCellStyle() != null THEN:
                   Cell_new.setCellStyle(Cell_proto.getCellStyle())
               END IF
           END IF
       END FOR
   END FOR
4. // Merged Region Translation:
   MergedRegions_ToAdd = []
   FOR EACH Region A in S.getMergedRegions() DO:
       IF A.getFirstRow() == R_proto AND A.getLastRow() == R_proto THEN:
           FOR i = 0 TO M - 1 DO:
               r_new = R_start + i
               NewRegion = new CellRangeAddress(r_new, r_new, A.getFirstColumn(), A.getLastColumn())
               MergedRegions_ToAdd.add(NewRegion)
           END FOR
       END IF
   END FOR
   FOR EACH NewRegion in MergedRegions_ToAdd DO:
       S.addMergedRegion(NewRegion)
   END FOR
5. // Dynamic Formula Recalculation:
   RecalculateFormulas(S, R_start, M)
```

---

## 5. Canonical REST Controllers & DTOs

| Domain Controller | Canonical Base Path | Dual Legacy Alias | Responsibilities |
| :--- | :--- | :--- | :--- |
| `ScuPlanningController` | `/api/v1/planificaciones` | `/api/v1/system/planning` | PAC Matriz 7, Programa Analítico, and Plan de Clases CRUD and review |
| `ScuOfficeController` | `/api/v1/office` | `/api/v1/system/office` | Streaming .xlsx/.docx exports and multipart file ingestion |
| `ScuAuditController` | `/api/v1/auditorias` | `/api/v1/system/audit` | In-situ radar matching, audit finalization, SHA-256 signing, disciplinary strikes |
| `ScuAcademicController` | `/api/v1/academic` | `/api/v1/system/academic` | Careers, gestiones, campuses, teacher assignments |
