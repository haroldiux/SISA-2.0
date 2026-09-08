# Proposal: 07-multitype-curriculum-coordination

## Intent
Implement a multi-type curriculum coordination system that dynamically assigns the correct official UNITEPC templates (Teórico, Práctico, Teórico-Práctico) to each teacher based on their component types (TA, PA, PL, PS) and whether theory/practice are taught by the same or different teachers.

## Scope

### In Scope
- Dynamic course type detection from SEA Gateway (`theoryHours`/`practiceHours`) with manual override.
- Official document assignment rules (see Document Assignment Matrix below).
- 5 base template parsers/generators via Strategy Pattern.
- Shared PAC coordination among teachers of the same component type.
- Individual Plan de Clases per teacher/group.
- Frontend dynamic form rendering with visual component badges.

### Out of Scope
- Real-time collaborative editing (WebSocket) for the PAC layer.
- Migration of historical course templates.
- Programa Analítico (DOCX) changes (already handled).

## Data Ownership Model

### Document-level ownership

| Document | Level | Who fills it |
|:---|:---:|:---|
| Programa Analítico | Per subject | All teachers of the subject share one document |
| PAC (GRAL or PRÁCTICO) | Per subject/component | All teachers of the same component share one document |
| Plan de Clases | Mixed | Shared + Personal sections (see below) |

### Plan de Clases: Shared vs Personal sections

**Teórico / Teórico-Práctico:**

| Section | Ownership | Notes |
|:---|:---:|:---|
| 1. Datos Generales | 🤝 Shared | Same subject, unit, competency (except teacher name) |
| 2. Planificación del Aprendizaje | 🤝 Shared | Themes, outcomes, Saberes (Conceptual/Procedimental/Actitudinal) |
| 3. Estrategias, Evaluación y Secuencia | 👤 Personal | Each teacher plans their own strategies, evaluation instruments, and didactic sequence |

**Práctico:**

| Section | Ownership | Notes |
|:---|:---:|:---|
| 1. Datos Generales | 🤝 Shared | Except teacher name, date, environment |
| 2. Datos de la Práctica | 🤝 Shared | Title, duration, objective |
| 3. Alineación y Recursos | 🤝 Shared | Bloom outcomes, materials |
| 4. Modelo Metodológico | 👤 Personal | Each teacher's own phase activities |
| 5. Evaluación de los Aprendizajes | 👤 Personal | Own techniques and instruments |
| 6. Desarrollo | 👤 Personal | Own timing and activities |

### Example
> Harold Rojas teaches TA+PA groups 1,3 of Informática Médica.
> Martín Sánchez teaches TA+PA groups 2,4 of the same subject.
> Both share the same Programa Analítico, PAC, and Plan de Clases sections 1-2.
> Each fills their OWN section 3 (Estrategias, Evaluación y Secuencia) independently.

## Document Assignment Matrix (Official UNITEPC Rules)

### PAC (Programa de Asignatura — Nivel Global)

| Teacher's Components | Same Teacher? | PAC Document(s) |
|:---|:---:|:---|
| TA + PA | ✅ Yes | **PAC GRAL** only |
| TA + PL or PS | ✅ Yes | **PAC GRAL** + **PAC PRÁCTICO** |
| TA only | — | **PAC GRAL** only |
| PA only | — | **PAC PRÁCTICO** only |
| PL or PS only | — | **PAC PRÁCTICO** only |
| TA + (PA/PL/PS), different teachers | ❌ No | TA teachers → **PAC GRAL** · PA/PL/PS teachers → **PAC PRÁCTICO** |

### Plan de Clases (Nivel Sesión)

| Teacher's Components | Same Teacher? | Plan de Clases Document |
|:---|:---:|:---|
| TA + PA | ✅ Yes | **Plan TEÓRICO-PRÁCTICO** |
| TA + PL or PS | ✅ Yes | **Plan TEÓRICO** + **Plan PRÁCTICO** |
| TA only | — | **Plan TEÓRICO** only |
| PA only | — | **Plan PRÁCTICO** only |
| PL or PS only | — | **Plan PRÁCTICO** only |
| TA + (PA/PL/PS), different teachers | ❌ No | TA teachers → **Plan TEÓRICO** · PA/PL/PS teachers → **Plan PRÁCTICO** |

### Assignment Logic (pseudocode)
```
teacherGroups = getGroupsForTeacher(teacherCI, courseId)
hasTA = teacherGroups.any(g => g.code.startsWith("TA"))
hasPA = teacherGroups.any(g => g.code.startsWith("PA"))
hasPL = teacherGroups.any(g => g.code.startsWith("PL"))
hasPS = teacherGroups.any(g => g.code.startsWith("PS"))
hasPractice = hasPA || hasPL || hasPS

if (hasTA && hasPA && !hasPL && !hasPS):
    # Same teacher does TA+PA → Teórico-Práctico
    pac = [PAC_GRAL]
    plan = [PLAN_TEORICO_PRACTICO]
elif (hasTA && (hasPL || hasPS)):
    # Same teacher does TA + Lab/Sim → needs both
    pac = [PAC_GRAL, PAC_PRACTICO]
    plan = [PLAN_TEORICO, PLAN_PRACTICO]
elif (hasTA && !hasPractice):
    # Theory only
    pac = [PAC_GRAL]
    plan = [PLAN_TEORICO]
elif (hasPractice && !hasTA):
    # Practice only (PA, PL, or PS)
    pac = [PAC_PRACTICO]
    plan = [PLAN_PRACTICO]
```

### Component Legend
- **TA**: Trabajo de Aula (classroom theory)
- **PA**: Práctica de Aula (classroom practice)
- **PL**: Práctica de Laboratorio (lab practice)
- **PS**: Práctica de Simulación (simulation practice)

## Approach
Strategy Pattern for backend parsers (`ParserFactory` → `PacGeneralParser`, `PacPracticoParser`, `PlanClaseTeoricoParser`, `PlanClasePracticoParser`, `PlanClaseTeoricoPracticoParser`). Course type auto-detected from SEA Gateway group prefixes. Frontend renders appropriate form sections dynamically per component.

## Affected Areas

| Area | Path / Component | Impact |
|:---|:---|:---|
| Backend | `infrastructure/office/parsers/` | New: `ParserFactory` + 5 strategy parsers |
| Backend | `api/controller/ScuOfficeController.java` | Modified: route through factory |
| Backend | `api/request/` | Modified: DTOs for multi-type structures |
| Frontend | `app-controller.js` | Modified: dynamic sections per component type |
| Database | Schema | New: `course_type`, `component_type` columns |
| Gateway | `GroupItemDto` | Read: group code prefixes (TA-XX, PA-XX, PL-XX, PS-XX) |

## Risks

| Risk | Likelihood | Mitigation |
|:---|:---:|:---|
| Gateway data edge cases | Medium | Manual override for course/component type |
| Parser complexity | Medium | Strict Strategy Pattern + unit tests per parser |
| Teacher-component mismatch | Low | Validate against Gateway groups at assignment time |

## Rollback Plan
Feature flag on new parser routing. Revert DB schema migration. Restore monolithic parser as fallback.

## Dependencies
- `04-sea-gateway-integration` (group prefix data, active).

## Success Criteria
- [ ] 5 template variants parse and generate correctly.
- [ ] Document assignment matrix correctly applied based on teacher's group prefixes.
- [ ] Same-teacher TA+PA scenario produces single PAC GRAL + Plan TEÓRICO-PRÁCTICO.
- [ ] Different-teacher scenario correctly splits PAC GRAL vs PAC PRÁCTICO.
- [ ] Shared PAC fields propagate among teachers of the same component.
- [ ] Visual badges clearly indicate component type (TA/PA/PL/PS) in the UI.
