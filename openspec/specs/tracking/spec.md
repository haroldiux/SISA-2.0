# Specification: Módulo de Seguimiento Pedagógico de Sesión en Aula y Semáforo Curricular de Carrera

**Sistema Integral de Seguimiento Académico (SISA 2.0) — UNITEPC**  
**Dominio:** Tracking & Curricular Supervision  
**Estado:** ✅ Oficial / Consolidado  
**Versión:** 1.0.0 (Consolidada tras Cambio 14)  

---

## 1. Overview & Contexto Institucional

Bajo la reglamentación académica de la Universidad Técnica Privada Cosmos (UNITEPC), el proceso de enseñanza-aprendizaje requiere una articulación estricta entre la **macroplanificación curricular** (Cronograma Matriz 7 de 20 semanas lectivas) y la **ejecución pedagógica real en aula** (Plan de Clase de 90 minutos por sesión).

Históricamente, los docentes registraban el avance temático en planillas desconectadas o de manera tardía, generando una brecha de información que impedía a los Directores de Carrera (`ROLE_DIR_CARRERA`) y a la Dirección Académica (`ROLE_DIR_ACADEMICA`) detectar oportunamente retrasos en el calendario curricular, temas inconclusos o asignaturas sin microplanificación didáctica.

Este módulo introduce dos subsistemas complementarios e interoperables:
1. **Subsistema Docente (Seguimiento de Sesión en Aula - Tab 5 `view1`)**:
   - Panel interactivo integrado en la Pestaña 5 de la Carpeta Docente (`#tab-asistencia`), posicionado inmediatamente debajo del selector de sesiones SEA.
   - Contraste visual entre la Macroplanificación Institucional (Matriz 7 - Solo Lectura) y la Planificación Personal de Aula (Plan de Clase - Autonomía Docente).
   - Verificación de los tres momentos didácticos institucionales: Inicio (15 min), Desarrollo (60 min) y Cierre (15 min).
   - Registro de recursos planificados y utilizados en formato JSONB.
   - **Registro ultra-rápido en aula en menos de 5 segundos con 1 solo clic**, auto-completando estados y valores por defecto basados en la sesión activa.
   - Transmutación atómica del estado del `PlanDeClase` vinculado a `EJECUTADO`.
2. **Subsistema de Supervisión Curricular (Semáforo de Avance de Carrera - Tab Semáforo `view2`)**:
   - Tablero analítico para Directores de Carrera y Autoridades Académicas que calcula en tiempo real el balance entre **Avance Planeado Institucional** (Semana 13 de corte sobre 20 semanas = 65.00%) y **Avance Real de Aula** ($P_{\text{real}} / N_{\text{total}} \times 100\%$).
   - Semáforo tri-color algorítmico: 🟢 Verde ($\Delta\% \ge -10\%$), 🟡 Amarillo ($-25\% \le \Delta\% < -10\%$) y 🔴 Rojo ($\Delta\% < -25\%$).
   - **Penalización Normativa Estricta**: Asignaturas sin Plan de Clase registrado (`tienePlanClase == false` o `totalPlanes == 0`) son forzadas obligatoriamente a semáforo 🔴 Rojo con alerta crítica, sin importar las horas lectivas registradas.
   - Modal de Auditoría Pedagógica Longitudinal con histograma de recursos didácticos, cumplimiento porcentual de momentos y bitácora cronológica completa.

---

## 2. Actores y Control de Acceso Basado en Roles (RBAC)

| Rol Institucional | Permisos y Alcance en Seguimiento | Endpoints Autorizados |
|:---|:---|:---|
| **Docente Titular** (`ROLE_DOCENTE`) | - Registrar y actualizar seguimiento de sus sesiones asignadas.<br>- Consultar el seguimiento y resumen pedagógico de sus asignaturas.<br>- Acceso restringido: no puede consultar el semáforo global de la carrera. | `POST /api/v1/seguimiento/sesion`<br>`GET /api/v1/seguimiento/sesion/{id}`<br>`GET /api/v1/seguimiento/materia/{cod}` |
| **Director de Carrera** (`ROLE_DIR_CARRERA`) | - Consultar el reporte consolidado de semáforo de su carrera (`CARSIS`, etc.).<br>- Auditar el detalle pedagógico e historial de sesiones de cualquier asignatura de su carrera.<br>- Consultar sesiones individuales. | `GET /api/v1/seguimiento/semaforo-carrera/{carrera}`<br>`GET /api/v1/seguimiento/materia/{cod}`<br>`GET /api/v1/seguimiento/sesion/{id}` |
| **Dirección Académica / Vicerrectorados** (`ROLE_DIR_ACADEMICA`, `ROLE_VICERRECTOR_*`) | - Acceso irrestricto de consulta y auditoría curricular a todas las carreras, sedes y materias a nivel nacional. | Endpoints completos de consulta y agregación |
| **Administrador del Sistema** (`ROLE_ADMIN`) | - Acceso total de lectura, escritura y mantenimiento de auditoría. | Todos los endpoints |

---

## 3. Requisitos Funcionales y Técnicos

### REQ-SEG-01: Panel de Seguimiento de Sesión en Tab 5 Docente
- **REQ-SEG-01.1**: El contenedor `#panel-seguimiento-sesion` DEBE renderizarse en la Pestaña 5 (`#tab-asistencia`) de la Carpeta Docente (`view1`), inmediatamente debajo de la barra de parámetros de asistencia (`#asistencia-toolbar`).
- **REQ-SEG-01.2**: El panel DEBE sincronizarse reactivamente al cambiar de sesión en `#asistencia-sesion-select`, invocando `window.syncSeguimientoFromActiveSession(ses)`.
- **REQ-SEG-01.3**: El registro DEBE completarse en un máximo de 1 clic y menos de 5 segundos de interacción del docente cuando se aceptan los valores por defecto.
- **REQ-SEG-01.4**: La respuesta visual del frontend tras guardar DEBE actualizar el badge de estado a `Sesión Registrada (Score: 1.0)` en menos de 200 ms.

### REQ-SEG-02: Contraste Macroplanificación (Matriz 7) vs Autonomía de Aula
- **REQ-SEG-02.1**: La interfaz DEBE presentar una disposición de doble tarjeta semántica:
  - **Tarjeta 1 (Macroplanificación Oficial - Matriz 7)**: Solo lectura, identificada con badge `Normativo`. Muestra semana académica, número de sesión, horario, aula, unidad didáctica y tema oficial planificado.
  - **Tarjeta 2 (Planificación Personal de Aula - Plan de Clase)**: Editable, identificada con badge `Autonomía Docente`. Permite ingresar el tema ejecutado real, checkboxes de momentos didácticos, recursos y observaciones de aula.
- **REQ-SEG-02.2**: Si la sesión no cuenta con tema ejecutado previo, DEBE heredar automáticamente el tema oficial planificado de la Matriz 7 como sugerencia inicial.

### REQ-SEG-03: Verificación de Momentos Didácticos (15'-60'-15') y Recursos Empleados
- **REQ-SEG-03.1**: El sistema DEBE registrar el cumplimiento de los tres momentos pedagógicos institucionales:
  - `momentoInicioCumplido` (Inicio 15 min): Motivación, recuperación de saberes previos y propósito.
  - `momentoDesarrolloCumplido` (Desarrollo 60 min): Construcción del aprendizaje, actividades prácticas y resolución de casos.
  - `momentoCierreCumplido` (Cierre 15 min): Síntesis, metacognición, retroalimentación y evaluación formativa.
- **REQ-SEG-03.2**: Ponderación del puntaje de cumplimiento (`cumplimientoScore`):
  - `TOTALMENTE_CUMPLIDO` $\rightarrow 1.00$ punto.
  - `PARCIALMENTE_CUMPLIDO` $\rightarrow 0.50$ puntos.
  - `NO_CUMPLIDO` $\rightarrow 0.00$ puntos.
- **REQ-SEG-03.3**: Los recursos didácticos planificados y utilizados DEBEN almacenarse en columnas PostgreSQL de tipo `JSONB` (`recursos_planificados`, `recursos_utilizados`), serializados mediante `JsonbStringListConverter`.
- **REQ-SEG-03.4**: Al registrar un seguimiento con puntaje mayor a cero (`score > 0`), si existe un `PlanDeClase` vinculado a la sesión (`sesionMatriz7Id`), su estado DEBE transitar automáticamente a `EstadoPlanificacion.EJECUTADO`.

### REQ-SEG-04: Tablero de Semáforo Curricular de Carrera en Supervisión (`view2`)
- **REQ-SEG-04.1**: La barra de navegación de supervisión DEBE incluir la pestaña interactiva `#supervision-tab-semaforo` (*"Semáforo de Avance"*).
- **REQ-SEG-04.2**: Al activar la pestaña, DEBE desplegarse la cinta de KPIs `#semaforo-kpi-ribbon` con contadores consolidados:
  - `Total Asignaturas`
  - `Al Día (🟢 Verde)`
  - `En Atención (🟡 Amarillo)`
  - `Riesgo Crítico (🔴 Rojo)`
  - `Sin Plan de Clase (Alerta)`
- **REQ-SEG-04.3**: La vista DEBE agrupar las asignaturas por semestre curricular (1º a 8º Semestre), renderizando tablas detalladas con:
  - Asignatura y Docente titular
  - Turno lectivo
  - Avance Planeado % (Semana 13 = 65.00%)
  - Avance Real % (con barra progresiva de color y puntaje acumulado)
  - Delta diferencial ($\Delta\%$)
  - Badge de Semáforo Curricular (🟢, 🟡, 🔴)
  - Botón de acción *"Ver Auditoría"* para abrir el modal longitudinal.

### REQ-SEG-05: Algoritmo Matemático Ponderado Tri-Color
- **REQ-SEG-05.1**: Las métricas de avance DEBEN calcularse con precisión de 2 decimales (`RoundingMode.HALF_UP`):
  $$\text{Avance Planeado} = \left(\frac{W_{\text{corte}}}{W_{\text{total}}}\right) \times 100\% = \left(\frac{13}{20}\right) \times 100\% = 65.00\%$$
  $$\text{Avance Real} = \min\left(100.00\%, \left(\frac{\sum P_{\text{real}}}{N_{\text{total}}}\right) \times 100\%\right)$$
  $$\Delta\% = \text{Avance Real} - \text{Avance Planeado}$$
- **REQ-SEG-05.2**: Clasificación tri-color según el umbral diferencial:
  - 🟢 **VERDE (Al Día)**: $\Delta\% \ge -10.0\%$ (retraso inferior a 2 semanas lectivas).
  - 🟡 **AMARILLO (En Atención)**: $-25.0\% \le \Delta\% < -10.0\%$ (retraso de 2 a 5 semanas, requiere reprogramación).
  - 🔴 **ROJO (Riesgo Crítico)**: $\Delta\% < -25.0\%$ (retraso grave superior a 5 semanas).

### REQ-SEG-06: Penalización Normativa Estricta por Ausencia de Plan de Clase
- **REQ-SEG-06.1**: Si una asignatura no registra microplanificación (`tienePlanClase == false` o `totalPlanes == 0`), el motor de evaluación DEBE forzar obligatoriamente su clasificación a 🔴 **ROJO**.
- **REQ-SEG-06.2**: La penalización DEBE anular cualquier puntaje de avance lectivo real en aula, asignando en `motivoAlerta`: *"Penalización crítica: Asignatura sin Plan de Clase registrado"*.
- **REQ-SEG-06.3**: En la interfaz de supervisión, la fila DEBE resaltar con badge rojo parpadeante indicando la infracción normativa.

### REQ-SEG-07: Modal Institucional de Auditoría Pedagógica Longitudinal
- **REQ-SEG-07.1**: Al hacer clic en *"Ver Auditoría"*, el modal `#modal-supervision-seguimiento-detalle` DEBE consultar `GET /api/v1/seguimiento/materia/{materiaCodigo}`.
- **REQ-SEG-07.2**: El modal DEBE renderizar:
  - Porcentajes promedio de cumplimiento de los 3 momentos pedagógicos (Inicio, Desarrollo, Cierre).
  - Histograma de recursos didácticos utilizados con conteo de frecuencia descendente.
  - Bitácora cronológica con fecha, número de sesión, tema ejecutado, score obtenido y observaciones registradas por el docente.

### REQ-SEG-08: Modelo de Datos Relacional y Migración Flyway V8
- **REQ-SEG-08.1**: La tabla principal `seguimientos_clases` DEBE crearse mediante la migración `V8__seguimiento_clases_y_semaforo_avance.sql` con las siguientes especificaciones:
  - Clave primaria: `id BIGSERIAL PRIMARY KEY`.
  - Relación opcional con macroplanificación: `sesion_matriz7_id BIGINT REFERENCES sesiones_matriz7(id) ON DELETE SET NULL`.
  - Campos de contexto: `materia_codigo VARCHAR(30) NOT NULL`, `carrera_codigo VARCHAR(20) NOT NULL`, `docente_ci VARCHAR(20) NOT NULL`, `fecha_ejecucion DATE NOT NULL`, `tipo_clase VARCHAR(20) NOT NULL`, `comision VARCHAR(20) NOT NULL`.
  - Contenido temático: `tema_oficial TEXT`, `tema_ejecutado TEXT NOT NULL`.
  - Didáctica y recursos: `recursos_planificados JSONB DEFAULT '[]'`, `recursos_utilizados JSONB DEFAULT '[]'`, `momento_inicio_cumplido BOOLEAN NOT NULL DEFAULT TRUE`, `momento_desarrollo_cumplido BOOLEAN NOT NULL DEFAULT TRUE`, `momento_cierre_cumplido BOOLEAN NOT NULL DEFAULT TRUE`.
  - Ponderación: `estado_cumplimiento VARCHAR(30) NOT NULL`, `cumplimiento_score NUMERIC(3,2) NOT NULL DEFAULT 1.00`, `observaciones_docente TEXT`.
  - Restricción de unicidad: `UNIQUE (materia_codigo, comision, fecha_ejecucion)`.
  - Índices de rendimiento: `idx_seguimiento_materia_fecha`, `idx_seguimiento_carrera`, `idx_seguimiento_docente`.

### REQ-SEG-09: Resiliencia Offline y Persistencia Dual
- **REQ-SEG-09.1**: En caso de indisponibilidad temporal de la red o del backend, el cliente DEBE persistir la sesión en `localStorage` bajo la clave `sisa_seguimiento_{materiaCodigo}_{sesionId}`.
- **REQ-SEG-09.2**: Al restablecerse la conectividad, el cliente DEBE sincronizar automáticamente los registros pendientes con el servidor.

---

## 4. Esquemas de Contrato REST

### 4.1 `POST /api/v1/seguimiento/sesion`
**Seguridad:** `@PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_ADMIN')")`

**Request:**
```json
{
  "sesionMatriz7Id": 142,
  "materiaCodigo": "SIS-213",
  "carreraCodigo": "CARSIS",
  "docenteCi": "4892104",
  "fechaEjecucion": "2026-10-30",
  "tipoClase": "TEORICA",
  "comision": "TA-01",
  "temaOficial": "Mapeo Objeto-Relacional Avanzado y Herencia en JPA",
  "temaEjecutado": "Mapeo Objeto-Relacional Avanzado y Herencia en JPA (Estrategia JOINED)",
  "recursosPlanificados": ["Proyector multimedia", "IDE IntelliJ IDEA", "Pizarra acrílica"],
  "recursosUtilizados": ["Proyector multimedia", "IDE IntelliJ IDEA", "Pizarra acrílica"],
  "momentoInicioCumplido": true,
  "momentoDesarrolloCumplido": true,
  "momentoCierreCumplido": true,
  "estadoCumplimiento": "TOTALMENTE_CUMPLIDO",
  "observacionesDocente": "Se completó la codificación en vivo sin incidencias."
}
```

**Response (HTTP 200 OK):**
```json
{
  "status": 200,
  "message": "Seguimiento de sesión registrado exitosamente",
  "data": {
    "id": 85,
    "sesionMatriz7Id": 142,
    "materiaCodigo": "SIS-213",
    "cumplimientoScore": 1.00,
    "planClaseEstadoActualizado": "EJECUTADO",
    "actualizadoEn": "2026-10-30T14:35:10Z"
  }
}
```

### 4.2 `GET /api/v1/seguimiento/semaforo-carrera/{carreraCodigo}`
**Seguridad:** `@PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_VICERRECTOR_SEDE', 'ROLE_VICERRECTOR_NACIONAL', 'ROLE_ADMIN')")`

**Response (HTTP 200 OK):**
```json
{
  "status": 200,
  "message": "Reporte de semáforo de carrera generado exitosamente",
  "data": {
    "carreraCodigo": "CARSIS",
    "carreraNombre": "Licenciatura en Ingeniería de Sistemas",
    "gestionCodigo": "2-2026",
    "semanaCorte": 13,
    "totalSemanasSemestre": 20,
    "avancePlaneadoGlobalPorcentaje": 65.00,
    "avanceRealPromedioPorcentaje": 58.45,
    "kpis": {
      "totalMaterias": 48,
      "materiasAlDiaVerde": 35,
      "materiasAtencionAmarillo": 9,
      "materiasCriticoRojo": 4,
      "materiasSinPlanClase": 1
    },
    "materias": [
      {
        "materiaCodigo": "SIS-213",
        "materiaNombre": "Programación III",
        "semestre": 3,
        "docenteNombre": "Ing. Carlos Mendoza Torrico",
        "tienePlanClase": true,
        "totalSesionesProgramadas": 36,
        "totalSesionesRegistradas": 22,
        "puntajeRealTotal": 21.50,
        "avancePlaneadoPorcentaje": 65.00,
        "avanceRealPorcentaje": 59.72,
        "diferenciaPorcentaje": -5.28,
        "colorSemaforo": "VERDE",
        "motivoAlerta": "Avance dentro del margen institucional tolerable"
      }
    ]
  }
}
```

---

## 5. Escenarios de Aceptación Formales (BDD Gherkin)

### Scenario 1: Registro ágil en aula $\le 5$ segundos (Happy Path)
```gherkin
Scenario: Docente registra sesión cumplida en un solo clic
  Given que el docente con CI "4892104" tiene abierta la materia "SIS-213" en la Pestaña 5
  And la sesión activa pre-cargada es "Sesión 22 - Semana 13" con los 3 momentos en true
  When el docente hace clic en "Guardar Seguimiento" sin alterar campos
  Then el backend persiste el registro con "cumplimientoScore: 1.00"
  And el estado de "PlanDeClase" cambia automáticamente a "EJECUTADO"
  And el badge visual confirma "Sesión Registrada (Score: 1.0)" en menos de 200 ms
  And el tiempo total de interacción no supera los 5 segundos.
```

### Scenario 2: Registro con cumplimiento parcial
```gherkin
Scenario: Docente registra sesión con momento de cierre inconcluso
  Given que el docente desmarca la casilla del momento "Cierre (15 min)"
  And selecciona el estado "PARCIALMENTE_CUMPLIDO"
  When hace clic en "Guardar Seguimiento"
  Then el backend persiste con "cumplimientoScore: 0.50"
  And en la bitácora la sesión figura con badge amarillo "0.5 pts - Parcial".
```

### Scenario 3: Clasificación Verde en Semáforo de Carrera
```gherkin
Scenario: Materia con avance cercano al cronograma clasifica en Verde
  Given la materia "SIS-213" con Avance Planeado de 65.00% y Avance Real de 59.72%
  When el motor de semáforo evalúa la diferencia Delta (-5.28%)
  Then como -5.28% >= -10.0%, clasifica en "ColorSemaforo.VERDE" con badge 🟢 "Al Día".
```

### Scenario 4: Clasificación Amarilla por Desfase Moderado
```gherkin
Scenario: Materia con desfase de 3 a 4 semanas lectivas entra en Amarillo
  Given la materia "SIS-311" con Avance Planeado de 65.00% y Avance Real de 47.22%
  When el motor de semáforo evalúa la diferencia Delta (-17.78%)
  Then como -25.0% <= -17.78% < -10.0%, clasifica en "ColorSemaforo.AMARILLO" con alerta de reprogramación.
```

### Scenario 5: Penalización Crítica por Falta de Plan de Clase
```gherkin
Scenario: Materia sin Plan de Clase es forzada a Semáforo Rojo
  Given que la materia "SIS-412" no tiene registrado ningún "PlanDeClase" ("tienePlanClase == false")
  When el motor evalúa el semáforo de carrera
  Then la clasificación es forzada a "ColorSemaforo.ROJO"
  And el motivoAlerta indica "Penalización crítica: Asignatura sin Plan de Clase registrado"
  And se contabiliza en el KPI "Materias Sin Plan de Clase".
```

### Scenario 6: Modal de Auditoría Longitudinal Pedagógica
```gherkin
Scenario: Director de Carrera audita la trayectoria pedagógica de una asignatura
  Given que el Director hace clic en "Ver Auditoría" de la materia "SIS-213"
  When el modal "#modal-supervision-seguimiento-detalle" consulta los datos
  Then renderiza las barras de momentos (Inicio: 100%, Desarrollo: 95.5%, Cierre: 90.9%)
  And despliega el histograma de recursos didácticos utilizados
  And lista cronológicamente las 22 sesiones con temas y observaciones de aula.
```

---

## 6. Decisiones Arquitectónicas (ADRs)

- **ADR-01 (Especialización Relacional vs Sobrecarga de Asistencia)**: Se crea la tabla dedicada `seguimientos_clases` en lugar de agregar campos a `asistencias_sesiones`. Esto garantiza segregación de responsabilidades y permite consultas analíticas agregadas ultrarrápidas sin bloquear el registro de asistencia estudiantil.
- **ADR-02 (Modelo Tri-Color Ponderado con Penalización Normativa)**: Matemática con redondeo estricto `HALF_UP` a 2 decimales y forzamiento imperativo a rojo cuando no existe microplanificación, garantizando la exigencia institucional del modelo por competencias.
- **ADR-03 (Serialización JSONB para Recursos Didácticos)**: Flexibilidad de catálogos y compatibilidad con consultas nativas PostgreSQL (`jsonb_array_elements_text`) para generar histogramas de uso en un solo query.
- **ADR-04 (Transmutación Automática de Estado en PlanDeClase)**: Integración atómica entre el seguimiento de sesión y la microplanificación, evitando doble carga administrativa al docente.
- **ADR-05 (Agregación SQL Nativa en Semáforo de Carrera)**: Agrupación masiva por asignatura en una sola consulta de base de datos (`GROUP BY s.materia_codigo`), eliminando el antipatrón de consulta $N+1$.
