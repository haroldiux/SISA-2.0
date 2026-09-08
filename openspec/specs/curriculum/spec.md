# Specification: Multi-Type Curriculum Coordination

## 1. Overview & Purpose
This specification defines the multi-type curriculum coordination logic for SISA, based on official UNITEPC rules. It outlines the assignment of appropriate PAC (Programa de Asignatura - Nivel Global) and Plan de Clases (Nivel Sesión: Teórico, Práctico, Teórico-Práctico) templates depending on the combination of components (TA, PA, PL, PS) taught by a single teacher or multiple teachers, along with data ownership and visibility models.

## 2. Component Types
The system detects the component type based on the group prefix obtained from the SEA Gateway integration:
- **TA**: Trabajo de Aula (Classroom Theory)
- **PA**: Práctica de Aula (Classroom Practice)
- **PL**: Práctica de Laboratorio (Laboratory Practice)
- **PS**: Práctica de Simulación (Simulation Practice)

## 3. Data Ownership Model

### 3.1 Document-Level Ownership
- **Programa Analítico**: Shared by all teachers of the subject (one unified document per subject).
- **PAC (Programa de Asignatura)**: Shared by all teachers teaching the same component type in the subject.
- **Plan de Clases**: Mixed ownership (contains both shared and personal sections).

### 3.2 Plan de Clases Sections Ownership

**Teórico / Teórico-Práctico:**
- **Shared (Same subject, unit, competency)**: 1. Datos Generales (except teacher name), 2. Planificación del Aprendizaje (Themes, outcomes, Saberes: Conceptual/Procedimental/Actitudinal).
- **Personal (Per teacher)**: 3. Estrategias, Evaluación y Secuencia (Each teacher plans their own strategies, evaluation instruments, and didactic sequence).

**Práctico:**
- **Shared**: 1. Datos Generales (except teacher name, date, environment), 2. Datos de la Práctica (Title, duration, objective), 3. Alineación y Recursos (Bloom outcomes, materials).
- **Personal**: 4. Modelo Metodológico (Phased activities: Preparación, Ejecución Guiada, Ejecución Autónoma, Cierre), 5. Evaluación de los Aprendizajes (Techniques and instruments), 6. Desarrollo (Timing and activities).

## 4. Document Assignment Matrix (Official UNITEPC Rules)

| Teacher's Components | Same Teacher? | PAC Document(s) | Plan de Clases Document(s) |
| :--- | :---: | :--- | :--- |
| TA + PA | Yes | **PAC GRAL** | **Plan TEÓRICO-PRÁCTICO** |
| TA + (PL or PS) | Yes | **PAC GRAL** + **PAC PRÁCTICO** | **Plan TEÓRICO** + **Plan PRÁCTICO** |
| TA only | — | **PAC GRAL** | **Plan TEÓRICO** |
| PA only | — | **PAC PRÁCTICO** | **Plan PRÁCTICO** |
| PL or PS only | — | **PAC PRÁCTICO** | **Plan PRÁCTICO** |
| TA + (PA/PL/PS) | No (Diff Teachers) | TA → **PAC GRAL**<br>Practice → **PAC PRÁCTICO** | TA → **Plan TEÓRICO**<br>Practice → **Plan PRÁCTICO** |

### Assignment Logic Rules:
1. If teacher has `TA` and `PA` (and no `PL`/`PS`): Assigns `PAC GRAL` and `Plan TEÓRICO-PRÁCTICO`.
2. If teacher has `TA` and (`PL` or `PS`): Assigns both `PAC GRAL` and `PAC PRÁCTICO`, and both `Plan TEÓRICO` and `Plan PRÁCTICO`.
3. If teacher has only `TA`: Assigns `PAC GRAL` and `Plan TEÓRICO`.
4. If teacher has only Practice (`PA`, `PL`, or `PS`): Assigns `PAC PRÁCTICO` and `Plan PRÁCTICO`.
5. Different teachers for theory vs practice: Each receives their respective role documents.

## 5. Given/When/Then Scenarios

### Scenario 1: Same teacher teaches TA and PA
**Given** teacher "Harold" is assigned to group "TA-01" and "PA-01" for "Informática Médica"  
**When** the system determines template assignments  
**Then** Harold is assigned a single "PAC GRAL" template  
**And** Harold is assigned a single "Plan TEÓRICO-PRÁCTICO" template.

### Scenario 2: Same teacher teaches TA and PL/PS
**Given** teacher "Maria" is assigned to group "TA-02" and "PL-01" for "Anatomía"  
**When** the system determines template assignments  
**Then** Maria is assigned both "PAC GRAL" and "PAC PRÁCTICO" templates  
**And** Maria is assigned both "Plan TEÓRICO" and "Plan PRÁCTICO" templates.

### Scenario 3: Teacher teaches only TA (Theory only)
**Given** teacher "Juan" is assigned only to group "TA-03" for "Historia"  
**When** the system determines template assignments  
**Then** Juan is assigned only the "PAC GRAL" template  
**And** Juan is assigned only the "Plan TEÓRICO" template.

### Scenario 4: Teacher teaches only PA (Classroom Practice only)
**Given** teacher "Ana" is assigned only to group "PA-02" for "Matemáticas"  
**When** the system determines template assignments  
**Then** Ana is assigned only the "PAC PRÁCTICO" template  
**And** Ana is assigned only the "Plan PRÁCTICO" template.

### Scenario 5: Teacher teaches only PL/PS (Lab/Simulation Practice only)
**Given** teacher "Carlos" is assigned only to group "PL-02" for "Física"  
**When** the system determines template assignments  
**Then** Carlos is assigned only the "PAC PRÁCTICO" template  
**And** Carlos is assigned only the "Plan PRÁCTICO" template.

### Scenario 6: Different teachers for TA and Practice
**Given** teacher "Harold" is assigned to "TA-01" and teacher "Martin" is assigned to "PL-01" for the same subject  
**When** the system determines template assignments  
**Then** Harold is assigned "PAC GRAL" and "Plan TEÓRICO"  
**And** Martin is assigned "PAC PRÁCTICO" and "Plan PRÁCTICO"  
**And** Harold and Martin share the same Programa Analítico but have distinct PAC documents and Plan de Clases documents.

### Scenario 7: Shared vs Personal Data in Teórico-Práctico
**Given** teachers "A" and "B" both teach TA+PA for the same subject  
**When** teacher "A" modifies "Planificación del Aprendizaje" (Section 2)  
**Then** the change is visible to teacher "B"  
**When** teacher "A" modifies "Estrategias, Evaluación y Secuencia" (Section 3)  
**Then** the change remains personal to teacher "A" and is not reflected for teacher "B".

### Scenario 8: Career Director consolidated view
**Given** the Career Director accesses the "Carpeta Docente" for subject "Informática Médica"  
**When** the system renders the documentation view  
**Then** the Director sees one unified Programa Analítico for the subject  
**And** the Director sees one unified PAC (GRAL and/or PRÁCTICO as applicable)  
**And** the Director sees all shared Plan de Clases sections (Datos Generales, Planificación del Aprendizaje) as one consolidated view  
**And** for personal sections (Estrategias, Evaluación y Secuencia), the Director sees each teacher's version separately, labeled by teacher name and group assignment.

## 6. Visibility Model (Role-Based Access)

| Role | Programa Analítico | PAC | Plan de Clases (Shared) | Plan de Clases (Personal) |
|:---|:---:|:---:|:---:|:---:|
| **Director de Carrera** | View all per subject | View all per subject | View consolidated | View each teacher's version separately |
| **Docente** | Edit (shared with co-teachers) | Edit own component's PAC | Edit (shared with co-teachers) | Edit only their own personal sections |
