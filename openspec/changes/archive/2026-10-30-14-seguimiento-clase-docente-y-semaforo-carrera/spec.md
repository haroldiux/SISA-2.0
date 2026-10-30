# Functional Specification: Seguimiento Ágil de Sesión Docente y Semáforo Curricular de Carrera

**Sistema Integral de Seguimiento Académico (SISA 2.0) — UNITEPC**  
**ID de Cambio:** `14-seguimiento-clase-docente-y-semaforo-carrera`  
**Módulo:** Seguimiento de Aula & Supervisión de Avance Curricular  
**Fecha:** *30 de Octubre de 2026*  
**Autor:** *Arquitecto de Software Principal (sdd-architect)*  
**Estado:** *Aprobado para Implementación Técnica*

---

## 1. Alcance y Contexto Funcional

### 1.1 Propósito
La presente especificación establece los contratos funcionales, esquemas de datos REST, validaciones, códigos de respuesta HTTP y criterios de aceptación en formato Gherkin para la implementación del cambio **14-seguimiento-clase-docente-y-semaforo-carrera**.

El sistema solventa dos necesidades institucionales críticas de la Universidad Técnica Privada Cosmos (UNITEPC):
1. **Para el Docente (`ROLE_DOCENTE`)**: Proporcionar un panel de **Seguimiento de Sesión de Clase** integrado en la Pestaña 5 de la Carpeta Docente (`view1` - `#tab-asistencia`), permitiendo contrastar la Macroplanificación Institucional (Matriz 7) con la Planificación Personal de Aula (Plan de Clase), verificar momentos didácticos (Inicio 15', Desarrollo 60', Cierre 15') y recursos didácticos empleados, y registrar el cumplimiento temático en aula en menos de 5 segundos ($\le 3$ clics).
2. **Para la Dirección de Carrera (`ROLE_DIR_CARRERA`, `ROLE_DIR_ACADEMICA`, `ROLE_ADMIN`)**: Ofrecer una pestaña interactiva de **Semáforo de Avance Curricular** en el entorno de supervisión (`view2`), con cálculo automatizado de avance cronológico institucional (Semana 13 de 20), avance real de aula, semaforización tri-color (🟢 Verde, 🟡 Amarillo, 🔴 Rojo), penalización obligatoria por ausencia de Plan de Clase, y modal de auditoría pedagógica longitudinal por asignatura.

---

## 2. Actores y Matriz de Control de Acceso (RBAC)

| Rol Institucional | Código de Rol Spring Security | Permisos en Módulo de Seguimiento |
|:---|:---|:---|
| **Docente Titular** | `ROLE_DOCENTE` | - Registrar/actualizar seguimiento de sus sesiones asignadas (`POST /api/v1/seguimiento/sesion`).<br>- Consultar el seguimiento de sus propias sesiones y materias.<br>- Visualizar datos de su semáforo de materia en modo solo lectura. |
| **Director de Carrera** | `ROLE_DIR_CARRERA` | - Consultar el reporte consolidado de semáforo de su carrera (`GET /api/v1/seguimiento/semaforo-carrera/{carreraCodigo}`).<br>- Consultar el detalle pedagógico de cualquier materia de su carrera.<br>- Consultar sesiones individuales registradas. |
| **Dirección Académica / Vicerrectorado** | `ROLE_DIR_ACADEMICA`<br>`ROLE_VICERRECTOR_SEDE`<br>`ROLE_VICERRECTOR_NACIONAL` | - Acceso irrestricto de consulta a semáforos de todas las carreras y sedes.<br>- Auditoría de sesiones y métricas pedagógicas a nivel institucional. |
| **Administrador del Sistema** | `ROLE_ADMIN` | - Acceso administrativo total (lectura y gestión de mantenimiento). |

---

## 3. Especificación de Endpoints REST

Todos los endpoints responden bajo el estándar de sobre de respuesta institucional de SISA 2.0:
```json
{
  "status": 200,
  "message": "Mensaje descriptivo de la operación",
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-30T14:30:00Z"
  }
}
```

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ RESUMEN DE ENDPOINTS DEL MÓDULO                                                                        │
├───────┬─────────────────────────────────────────────────┬───────────────────────┬──────────────────────┤
│ MÉTODO│ RUTA                                            │ ROL PERMITIDO         │ PROPÓSITO            │
├───────┼─────────────────────────────────────────────────┼───────────────────────┼──────────────────────┤
│ POST  │ /api/v1/seguimiento/sesion                      │ DOCENTE, ADMIN        │ Guardar/Upsert clase │
│ GET   │ /api/v1/seguimiento/sesion/{sesionId}           │ DOCENTE, DIR, ADMIN   │ Obtener seguimiento  │
│ GET   │ /api/v1/seguimiento/materia/{materiaCodigo}     │ DOCENTE, DIR, ADMIN   │ Resumen de materia   │
│ GET   │ /api/v1/seguimiento/semaforo-carrera/{carreraId}│ DIR, ACAD, ADMIN      │ Semáforo de carrera  │
└───────┴─────────────────────────────────────────────────┴───────────────────────┴──────────────────────┘
```

---

### Endpoint 1: Registrar o Actualizar Seguimiento de Sesión (Upsert Ágil)

- **Ruta:** `POST /api/v1/seguimiento/sesion`
- **Seguridad:** `@PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_ADMIN')")`
- **Descripción:** Crea o actualiza de manera idempotente el registro de seguimiento pedagógico de una clase de aula. Si se proporciona `sesionMatriz7Id`, se asocia a la macroplanificación oficial y actualiza automáticamente el estado del `PlanDeClase` vinculado a `EJECUTADO` (si el cumplimiento es `TOTALMENTE_CUMPLIDO` o `PARCIALMENTE_CUMPLIDO`).

#### Request Payload (`GuardarSeguimientoClaseRequest`):
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
  "recursosPlanificados": [
    "Proyector multimedia",
    "IDE IntelliJ IDEA",
    "Pizarra acrílica",
    "Diapositivas Unidad IV"
  ],
  "recursosUtilizados": [
    "Proyector multimedia",
    "IDE IntelliJ IDEA",
    "Pizarra acrílica"
  ],
  "momentoInicioCumplido": true,
  "momentoDesarrolloCumplido": true,
  "momentoCierreCumplido": true,
  "estadoCumplimiento": "TOTALMENTE_CUMPLIDO",
  "observacionesDocente": "Se completó la codificación en vivo del modelo polimórfico. Los estudiantes ejecutaron la prueba exitosamente."
}
```

#### Reglas de Validación de Entrada:
1. `materiaCodigo`: Obligatorio, no vacío, longitud máxima 30 caracteres.
2. `fechaEjecucion`: Obligatorio, formato ISO-8601 `YYYY-MM-DD`. No puede ser una fecha futura posterior a 24 horas del reloj del servidor.
3. `tipoClase`: Obligatorio. Valores admitidos: `TEORICA`, `PRACTICA`, `LABORATORIO`, `CLINICA`.
4. `comision`: Obligatorio, no vacío, longitud máxima 20 caracteres (ej. `TA-01`, `PL-01`).
5. `estadoCumplimiento`: Obligatorio. Valores admitidos: `TOTALMENTE_CUMPLIDO`, `PARCIALMENTE_CUMPLIDO`, `NO_CUMPLIDO`.
6. `cumplimientoScore`: Asignado automáticamente por el backend según el enum:
   - `TOTALMENTE_CUMPLIDO` $\rightarrow 1.00$
   - `PARCIALMENTE_CUMPLIDO` $\rightarrow 0.50$
   - `NO_CUMPLIDO` $\rightarrow 0.00$
7. `momentoInicioCumplido`, `momentoDesarrolloCumplido`, `momentoCierreCumplido`: Booleanos no nulos (por defecto `true`).
8. `recursosPlanificados` y `recursosUtilizados`: Listas de strings válidas; si se reciben nulas, se inicializan como colecciones vacías `[]`.

#### Response Payload (HTTP 200 OK / 201 Created):
```json
{
  "status": 200,
  "message": "Seguimiento de sesión registrado exitosamente",
  "data": {
    "id": 85,
    "sesionMatriz7Id": 142,
    "materiaCodigo": "SIS-213",
    "carreraCodigo": "CARSIS",
    "docenteCi": "4892104",
    "fechaEjecucion": "2026-10-30",
    "tipoClase": "TEORICA",
    "comision": "TA-01",
    "temaOficial": "Mapeo Objeto-Relacional Avanzado y Herencia en JPA",
    "temaEjecutado": "Mapeo Objeto-Relacional Avanzado y Herencia en JPA (Estrategia JOINED)",
    "recursosPlanificados": [
      "Proyector multimedia",
      "IDE IntelliJ IDEA",
      "Pizarra acrílica",
      "Diapositivas Unidad IV"
    ],
    "recursosUtilizados": [
      "Proyector multimedia",
      "IDE IntelliJ IDEA",
      "Pizarra acrílica"
    ],
    "momentoInicioCumplido": true,
    "momentoDesarrolloCumplido": true,
    "momentoCierreCumplido": true,
    "estadoCumplimiento": "TOTALMENTE_CUMPLIDO",
    "cumplimientoScore": 1.00,
    "observacionesDocente": "Se completó la codificación en vivo del modelo polimórfico. Los estudiantes ejecutaron la prueba exitosamente.",
    "planClaseEstadoActualizado": "EJECUTADO",
    "creadoEn": "2026-10-30T14:35:10Z",
    "actualizadoEn": "2026-10-30T14:35:10Z"
  },
  "meta": {
    "timestamp": "2026-10-30T14:35:10Z"
  }
}
```

---

### Endpoint 2: Obtener Seguimiento por ID de Sesión Matriz 7

- **Ruta:** `GET /api/v1/seguimiento/sesion/{sesionId}`
- **Seguridad:** `@PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_ADMIN')")`
- **Descripción:** Recupera el registro de seguimiento vinculado a una sesión específica del PAC Matriz 7. Si no existe seguimiento previo, retorna un objeto nulo con código 200 para que la interfaz mantenga los valores por defecto sin emitir alertas de error.

#### Parámetros de Ruta:
- `sesionId` (Long): Identificador primario de la entidad `SesionMatriz7`.

#### Response Payload (HTTP 200 OK - Registro existente):
```json
{
  "status": 200,
  "message": "Seguimiento de sesión recuperado exitosamente",
  "data": {
    "id": 85,
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
    "cumplimientoScore": 1.00,
    "observacionesDocente": "Clase impartida sin incidencias.",
    "planClaseEstadoActualizado": "EJECUTADO",
    "creadoEn": "2026-10-30T14:35:10Z",
    "actualizadoEn": "2026-10-30T14:35:10Z"
  },
  "meta": {
    "timestamp": "2026-10-30T14:36:00Z"
  }
}
```

#### Response Payload (HTTP 200 OK - Sin registro previo):
```json
{
  "status": 200,
  "message": "No existe registro de seguimiento para la sesión especificada",
  "data": null,
  "meta": {
    "timestamp": "2026-10-30T14:36:00Z"
  }
}
```

---

### Endpoint 3: Obtener Resumen Pedagógico y Sesiones de una Materia

- **Ruta:** `GET /api/v1/seguimiento/materia/{materiaCodigo}`
- **Seguridad:** `@PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_ADMIN')")`
- **Descripción:** Devuelve el historial longitudinal de sesiones impartidas en la asignatura, agregando métricas de cumplimiento de momentos pedagógicos e histograma de recursos didácticos para auditoría docente o modal de supervisión.

#### Parámetros de Consulta (Query Params):
- `gestionCodigo` (String, opcional): Gestión académica (por defecto `'2-2026'`).

#### Response Payload (HTTP 200 OK):
```json
{
  "status": 200,
  "message": "Resumen pedagógico de la materia obtenido exitosamente",
  "data": {
    "materiaCodigo": "SIS-213",
    "materiaNombre": "Programación III",
    "gestionCodigo": "2-2026",
    "totalSesionesProgramadas": 36,
    "totalSesionesRegistradas": 22,
    "puntajeTotalAcumulado": 21.50,
    "porcentajeAvanceReal": 59.72,
    "cumplimientoMomentos": {
      "inicioPorcentaje": 100.0,
      "desarrolloPorcentaje": 95.45,
      "cierrePorcentaje": 90.91
    },
    "recursosHistograma": [
      { "recurso": "Proyector multimedia", "usos": 22 },
      { "recurso": "IDE IntelliJ IDEA", "usos": 20 },
      { "recurso": "Pizarra acrílica", "usos": 18 },
      { "recurso": "GitHub Classroom", "usos": 14 }
    ],
    "sesiones": [
      {
        "id": 85,
        "sesionMatriz7Id": 142,
        "nroSesion": 22,
        "semana": 13,
        "fechaEjecucion": "2026-10-30",
        "tipoClase": "TEORICA",
        "comision": "TA-01",
        "temaEjecutado": "Mapeo Objeto-Relacional Avanzado y Herencia en JPA",
        "estadoCumplimiento": "TOTALMENTE_CUMPLIDO",
        "cumplimientoScore": 1.00,
        "observacionesDocente": "Se completó la codificación en vivo."
      }
    ]
  },
  "meta": {
    "timestamp": "2026-10-30T14:40:00Z"
  }
}
```

---

### Endpoint 4: Reporte Consolidado del Semáforo Curricular de Carrera

- **Ruta:** `GET /api/v1/seguimiento/semaforo-carrera/{carreraCodigo}`
- **Seguridad:** `@PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_VICERRECTOR_SEDE', 'ROLE_VICERRECTOR_NACIONAL', 'ROLE_ADMIN')")`
- **Descripción:** Endpoint analítico central para la Dirección de Carrera. Calcula en tiempo real las métricas de Avance Planeado vs Real de todas las asignaturas de la carrera, clasifica en el semáforo tri-color (🟢, 🟡, 🔴), penaliza asignaturas sin Plan de Clase y produce los KPIs globales del tablero de control.

#### Parámetros de Ruta y Consulta:
- `carreraCodigo` (Ruta, String, obligatorio): Sigla de la carrera (ej. `CARSIS`, `CARELE`, `CARMED`).
- `gestionCodigo` (Query, String, opcional): Por defecto `'2-2026'`.
- `semanaCorte` (Query, Integer, opcional): Semana activa institucional a evaluar (por defecto calculada a partir de la fecha del calendario o `13`).

#### Response Payload (HTTP 200 OK):
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
        "docenteCi": "4892104",
        "docenteNombre": "Ing. Carlos Mendoza Torrico",
        "tienePlanClase": true,
        "totalPlanesRegistrados": 36,
        "totalSesionesProgramadas": 36,
        "totalSesionesRegistradas": 22,
        "puntajeRealTotal": 21.50,
        "avancePlaneadoPorcentaje": 65.00,
        "avanceRealPorcentaje": 59.72,
        "diferenciaPorcentaje": -5.28,
        "colorSemaforo": "VERDE",
        "motivoAlerta": "Avance dentro del margen institucional tolerable",
        "momentosCumplimiento": {
          "inicio": 100.0,
          "desarrollo": 95.45,
          "cierre": 90.91
        }
      },
      {
        "materiaCodigo": "SIS-311",
        "materiaNombre": "Base de Datos I",
        "semestre": 4,
        "docenteCi": "3719024",
        "docenteNombre": "Lic. Roberto Gómez Fernández",
        "tienePlanClase": true,
        "totalPlanesRegistrados": 36,
        "totalSesionesProgramadas": 36,
        "totalSesionesRegistradas": 18,
        "puntajeRealTotal": 17.00,
        "avancePlaneadoPorcentaje": 65.00,
        "avanceRealPorcentaje": 47.22,
        "diferenciaPorcentaje": -17.78,
        "colorSemaforo": "AMARILLO",
        "motivoAlerta": "Desfase moderado (-17.78%): requiere reprogramación de contenidos",
        "momentosCumplimiento": {
          "inicio": 88.89,
          "desarrollo": 88.89,
          "cierre": 72.22
        }
      },
      {
        "materiaCodigo": "MAT-101",
        "materiaNombre": "Cálculo I",
        "semestre": 1,
        "docenteCi": "5291038",
        "docenteNombre": "Ing. Jaime Villarroel Soliz",
        "tienePlanClase": true,
        "totalPlanesRegistrados": 36,
        "totalSesionesProgramadas": 36,
        "totalSesionesRegistradas": 12,
        "puntajeRealTotal": 11.00,
        "avancePlaneadoPorcentaje": 65.00,
        "avanceRealPorcentaje": 30.56,
        "diferenciaPorcentaje": -34.44,
        "colorSemaforo": "ROJO",
        "motivoAlerta": "Desfase grave (-34.44%): retraso superior a 4 semanas lectivas",
        "momentosCumplimiento": {
          "inicio": 75.0,
          "desarrollo": 83.33,
          "cierre": 58.33
        }
      },
      {
        "materiaCodigo": "SIS-412",
        "materiaNombre": "Sistemas Operativos",
        "semestre": 5,
        "docenteCi": "6102941",
        "docenteNombre": "Ing. Fernando Morales Peñaranda",
        "tienePlanClase": false,
        "totalPlanesRegistrados": 0,
        "totalSesionesProgramadas": 36,
        "totalSesionesRegistradas": 0,
        "puntajeRealTotal": 0.00,
        "avancePlaneadoPorcentaje": 65.00,
        "avanceRealPorcentaje": 0.00,
        "diferenciaPorcentaje": -65.00,
        "colorSemaforo": "ROJO",
        "motivoAlerta": "Penalización crítica: Asignatura sin Plan de Clase registrado",
        "momentosCumplimiento": {
          "inicio": 0.0,
          "desarrollo": 0.0,
          "cierre": 0.0
        }
      }
    ]
  },
  "meta": {
    "timestamp": "2026-10-30T14:45:00Z"
  }
}
```

---

## 4. Códigos de Error HTTP y Manejo de Excepciones

| Código HTTP | Nombre del Error | Causa / Condición de Activación | Payload de Error Típico |
|:---|:---|:---|:---|
| **400 Bad Request** | `VALIDATION_FAILED` | Infracción de restricciones de entrada (ej. fecha futura inválida, tipo de clase inexistente, o formato JSON malformado). | `{"status": 400, "message": "Parámetro fechaEjecucion no puede ser futura", "data": null}` |
| **401 Unauthorized** | `UNAUTHORIZED` | Token JWT ausente, vencido o con firma no válida. | `{"status": 401, "message": "Acceso no autenticado", "data": null}` |
| **403 Forbidden** | `FORBIDDEN` | El docente autenticado intenta registrar o consultar sesiones de otra materia no asignada en su carga horaria. | `{"status": 403, "message": "No tiene permisos para modificar la asignatura especificada", "data": null}` |
| **404 Not Found** | `RESOURCE_NOT_FOUND` | La carrera o código de materia especificado no existe en el catálogo académico institucional. | `{"status": 404, "message": "Carrera con código 'CARXXX' no encontrada", "data": null}` |
| **409 Conflict** | `CONCURRENT_MODIFICATION` | Conflicto de concurrencia al actualizar la sesión por otro proceso administrativo simultáneo. | `{"status": 409, "message": "Conflicto de concurrencia al actualizar el seguimiento", "data": null}` |
| **500 Internal Error** | `SERVER_ERROR` | Error imprevisto en la base de datos o fallo en el motor de serialización JSONB. | `{"status": 500, "message": "Error interno al procesar el semáforo curricular", "data": null}` |

---

## 5. Criterios de Aceptación Gherkin (BDD Scenarios)

### Escenario 1: Registro Ágil de Clase en Aula con Valores por Defecto (Happy Path $\le 5$ seg)
```gherkin
Scenario: Registro ultra-rápido de clase cumplida normalmente
  Given que el docente con CI "4892104" tiene abierta la materia "SIS-213" en la Pestaña 5
  And el selector de sesiones oficial tiene seleccionada la sesión de hoy "Sesión 22 - Semana 13"
  And el panel de Seguimiento de Sesión auto-cargó:
    | Campo                    | Valor                                                |
    | temaOficial              | Mapeo Objeto-Relacional Avanzado y Herencia en JPA   |
    | momentoInicioCumplido    | true (15 min)                                        |
    | momentoDesarrolloCumplido| true (60 min)                                        |
    | momentoCierreCumplido    | true (15 min)                                        |
    | estadoCumplimiento       | TOTALMENTE_CUMPLIDO (+1.0)                           |
  When el docente hace clic en el botón "Guardar Seguimiento" sin modificar ningún valor
  Then el sistema envía un HTTP POST a "/api/v1/seguimiento/sesion"
  And el backend retorna HTTP 200 OK con "cumplimientoScore: 1.00"
  And el registro se persiste en la tabla "seguimientos_clases" con id auto-generado
  And el estado de la entidad "PlanDeClase" vinculada cambia automáticamente a "EJECUTADO"
  And el frontend muestra un badge de confirmación "Sesión Registrada (Score: 1.0)" en menos de 200 ms
  And el tiempo total de interacción del docente es inferior a 5 segundos con un único clic
```

### Escenario 2: Registro con Desfase Parcial y Observación de Aula
```gherkin
Scenario: Docente registra sesión parcialmente cumplida por falta de tiempo en el cierre
  Given que el docente tiene seleccionada la sesión 15 de "SIS-311"
  When el docente desmarca la casilla del momento "Cierre (15 min)"
  And hace clic en el selector de cumplimiento "PARCIALMENTE CUMPLIDO (+0.5)"
  And escribe en observaciones: "Se extendió el ejercicio práctico de normalización; las conclusiones pasan al inicio de la siguiente clase."
  And hace clic en "Guardar Seguimiento"
  Then el backend recibe el payload con:
    | Campo                    | Valor                                                |
    | momentoInicioCumplido    | true                                                 |
    | momentoDesarrolloCumplido| true                                                 |
    | momentoCierreCumplido    | false                                                |
    | estadoCumplimiento       | PARCIALMENTE_CUMPLIDO                                |
  And el backend asigna automáticamente "cumplimientoScore: 0.50"
  And el estado del "PlanDeClase" se actualiza a "EJECUTADO"
  And la respuesta HTTP es 200 OK
  And en el historial de sesiones la clase figura con badge amarillo "0.5 pts - Parcial"
```

### Escenario 3: Consulta del Semáforo de Carrera para Materia al Día (Semáforo Verde)
```gherkin
Scenario: Director de Carrera visualiza materia con avance óptimo en el semáforo
  Given que el Director de Carrera de "CARSIS" ingresa a la Vista 2 de Supervisión Curricular
  And la gestión académica activa es "II-2026" cursando la Semana 13 de 20 (Avance Planeado: 65.0%)
  When el Director hace clic en la pestaña "Semáforo de Avance"
  And el sistema consulta "GET /api/v1/seguimiento/semaforo-carrera/CARSIS"
  Then para la materia "SIS-213 Programación III" con 22 sesiones y puntaje real de 21.5 sobre 36:
    | Métrica                  | Valor Calculado |
    | Avance Planeado          | 65.00%          |
    | Avance Real              | 59.72%          |
    | Diferencia Delta         | -5.28%          |
  And debido a que -5.28% >= -10.0%, el semáforo asigna "colorSemaforo: VERDE"
  And la fila de la materia muestra un badge verde con icono check "Al Día (65% / 60%)"
```

### Escenario 4: Detección y Alerta de Materia con Retraso Moderado (Semáforo Amarillo)
```gherkin
Scenario: Materia con desfase de 3 sesiones entra en zona de advertencia
  Given que la materia "SIS-311 Base de Datos I" tiene 36 sesiones programadas
  And en la Semana 13 (65.0% planeado), el docente solo ha acumulado 17.0 puntos reales
  When el motor de semáforo evalúa la materia:
    | Avance Real              | (17.0 / 36) * 100 = 47.22%                           |
    | Diferencia Delta         | 47.22% - 65.00% = -17.78%                            |
  Then como -17.78% se encuentra entre -25.0% y -10.0%
  And la materia clasifica en "colorSemaforo: AMARILLO"
  And el contador de KPI "En Atención (Amarillo)" de la cinta superior se incrementa en 1
  And la tabla muestra la alerta "Desfase Moderado (-17.78%)" requiriendo reprogramación
```

### Escenario 5: Penalización Crítica por Falta de Plan de Clase (Semáforo Rojo Forzado)
```gherkin
Scenario: Materia sin Plan de Clase es penalizada en Rojo aunque tenga asistencias
  Given que la materia "SIS-412 Sistemas Operativos" no cuenta con ningún "PlanDeClase" registrado
  When el Director de Carrera consulta el semáforo curricular
  Then el backend verifica que "tienePlanClase == false"
  And el motor fuerza la clasificación a "colorSemaforo: ROJO" independientemente de su avance numérico
  And el atributo "motivoAlerta" especifica "Penalización crítica: Asignatura sin Plan de Clase registrado"
  And en la interfaz de supervisión se muestra un badge rojo parpadeante "🔴 Falta Plan de Clase"
  And el KPI "Materias en Riesgo Crítico" contabiliza esta materia
```

### Escenario 6: Despliegue del Modal de Detalle Pedagógico Longitudinal
```gherkin
Scenario: Director de Carrera audita la trayectoria pedagógica de un docente
  Given que la tabla del Semáforo de Avance muestra la materia "SIS-213"
  When el Director hace clic en el botón "Ver Detalle" de la fila
  Then el sistema abre el modal "#modal-supervision-seguimiento-detalle"
  And el modal renderiza:
    | Componente               | Contenido Mostrado                                    |
    | Barras de Momentos       | Inicio: 100%, Desarrollo: 95.5%, Cierre: 90.9%        |
    | Nube de Recursos         | Proyector (22), IntelliJ (20), Pizarra (18)           |
    | Tabla de Sesiones        | Lista de las 22 sesiones con temas, fechas y puntajes |
    | Observaciones Docente    | Comentarios de aula registrados en cada fecha         |
  And permite al Director exportar o imprimir la auditoría pedagógica directamente
```

---

## 6. Trazabilidad de Requisitos

| Código de Requisito | Descripción | Endpoints / Componentes Responsables |
|:---|:---|:---|
| **REQ-SEG-01** | Panel de Seguimiento de Sesión en Tab 5 Docente | `POST /api/v1/seguimiento/sesion`, `#tab-asistencia` |
| **REQ-SEG-02** | Contraste Macro vs Microplanificación | `app.component.html` (Tarjetas Oficial vs Aula), `SesionMatriz7` |
| **REQ-SEG-03** | Verificación de Momentos (15-60-15) y Recursos | `SeguimientoClase` (`recursos_utilizados`, `momento_*`) |
| **REQ-SEG-04** | Pestaña de Semáforo Curricular en Supervisión | `GET /api/v1/seguimiento/semaforo-carrera/{id}`, `#supervision-tab-semaforo` |
| **REQ-SEG-05** | Cálculo Tri-Color y Algoritmo Matemático | `ScuGetSemaforoCarreraCmd`, `ColorSemaforo` |
| **REQ-SEG-06** | Penalización Estricta por Ausencia de Plan | `ScuGetSemaforoCarreraCmd` (`tienePlanClase == false`) |
| **REQ-SEG-07** | Modal de Detalle y Auditoría Pedagógica | `GET /api/v1/seguimiento/materia/{id}`, `#modal-supervision-seguimiento-detalle` |
