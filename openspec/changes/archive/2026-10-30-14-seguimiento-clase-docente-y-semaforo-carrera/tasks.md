# Tasks: Seguimiento Ágil de Sesión Docente y Semáforo Curricular de Carrera

**ID de Cambio:** `14-seguimiento-clase-docente-y-semaforo-carrera`  
**Tema:** Módulo de Seguimiento Pedagógico de Sesión en Aula para Docentes (Registro en <5 seg / 1 clic) y Tablero de Control de Semáforo Curricular de Carrera en Tiempo Real (Tri-Color Ponderado y Penalización Normativa)  
**Estado:** Listo para Implementación Técnica (Fase 4: Tasks)  
**Artefacto OpenSpec:** `openspec/changes/14-seguimiento-clase-docente-y-semaforo-carrera/tasks.md`  
**Gestión Activa:** `II-2026` / `2-2026` (Semana 13 de Corte sobre 20 Semanas Totales = 65.00% Avance Planeado)  
**Casos de Estudio / Semillas Piloto:**
- **Materia Verde (Al Día)**: `SIS-213 Programación III` — Docente: **Ing. Carlos Alberto Morales Siles** (CI: `4892104`), Carrera: `CARSIS`, 22 sesiones, 21.5 pts reales, Avance Real: 59.72%, Delta: -5.28% ($\ge -10\% \rightarrow$ 🟢 **VERDE**).
- **Materia Amarillo (Riesgo Moderado)**: `SIS-311 Base de Datos I` — Docente: **Lic. Roberto Gómez Fernández** (CI: `3719024`), Carrera: `CARSIS`, 18 sesiones, 17.0 pts reales, Avance Real: 47.22%, Delta: -17.78% ($-25\% \le \Delta < -10\% \rightarrow$ 🟡 **AMARILLO**).
- **Materia Rojo (Desfase Grave)**: `MAT-101 Cálculo I` — Docente: **Ing. Jaime Villarroel Soliz** (CI: `5291038`), Carrera: `CARSIS`, 12 sesiones, 11.0 pts reales, Avance Real: 30.56%, Delta: -34.44% ($< -25\% \rightarrow$ 🔴 **ROJO**).
- **Materia Rojo (Penalización Sin Plan)**: `SIS-412 Sistemas Operativos` — Docente: **Ing. Fernando Morales Peñaranda** (CI: `6102941`), Carrera: `CARSIS`, 0 planes de clase registrados ($\text{tienePlanClase} == \text{false} \rightarrow$ 🔴 **ROJO FORZADO**).

---

## Presupuesto de Código Estimado (LOC Breakdown)

| Capa / Componente | Archivos Intervenidos | Líneas Estimadas (LOC) |
|:---|:---|:---:|
| **Base de Datos & DDL** | `V8__seguimiento_clases_y_semaforo_avance.sql` | ~160 LOC |
| **Modelos de Dominio y Enums** | `EstadoCumplimientoTema.java`, `ColorSemaforo.java`, `EstadoPlanificacion.java`, `SeguimientoClase.java` | ~195 LOC |
| **Repositorio & Proyecciones SQL** | `SeguimientoClaseRepository.java`, `MateriaSeguimientoAggregation.java`, `RecursoUsoProjection.java` | ~110 LOC |
| **DTOs de API y Contratos** | `GuardarSeguimientoClaseRequest.java`, `SeguimientoClaseDto.java`, `ResumenMateriaSeguimientoResponse.java`, `SemaforoCarreraResponse.java` | ~270 LOC |
| **Comandos de Negocio (Backend)** | `ScuSaveSeguimientoClaseCmd.java`, `ScuGetSeguimientoSesionCmd.java`, `ScuGetMateriaAuditoriaCmd.java`, `ScuGetSemaforoCarreraCmd.java` | ~420 LOC |
| **Controlador REST & Seguridad** | `ScuSeguimientoController.java`, `SecurityConfig.java` | ~140 LOC |
| **Frontend Docente (Vista 1)** | `app.component.html` (Markup Tab 5), `app-controller.js` (Lógica Sesión y Guardado Rápido) | ~290 LOC |
| **Frontend Supervisión (Vista 2)** | `app.component.html` (Tab Semáforo, Ribbon KPIs, Modal), `app-controller.js` (Cálculo, Tablero y Modal), `scu-api.constant.ts` | ~310 LOC |
| **Pruebas Automatizadas Unitarias/Integración** | `SeguimientoClaseRepositoryTest.java`, `ScuGetSemaforoCarreraCmdTest.java`, `ScuSaveSeguimientoClaseCmdTest.java`, `ScuSeguimientoControllerSecurityTest.java` | ~450 LOC |
| **TOTAL GENERAL ESTIMADO** | **23 archivos** | **~2,345 LOC** |

---

## Archivos Afectados

### Backend (Java / SQL)
1. [`sisa-backend/src/main/resources/db/migration/V8__seguimiento_clases_y_semaforo_avance.sql`](file:///f:/SISA%202/sisa-backend/src/main/resources/db/migration/V8__seguimiento_clases_y_semaforo_avance.sql) *(Nuevo)*
2. [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/enums/EstadoCumplimientoTema.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/enums/EstadoCumplimientoTema.java) *(Nuevo)*
3. [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/enums/ColorSemaforo.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/enums/ColorSemaforo.java) *(Nuevo)*
4. [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/enums/EstadoPlanificacion.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/enums/EstadoPlanificacion.java) *(Modificado: incorporar `EJECUTADO`)*
5. [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/model/SeguimientoClase.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/model/SeguimientoClase.java) *(Nuevo)*
6. [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/repository/projection/MateriaSeguimientoAggregation.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/repository/projection/MateriaSeguimientoAggregation.java) *(Nuevo)*
7. [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/repository/projection/RecursoUsoProjection.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/repository/projection/RecursoUsoProjection.java) *(Nuevo)*
8. [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/repository/SeguimientoClaseRepository.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/repository/SeguimientoClaseRepository.java) *(Nuevo)*
9. [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/repository/PlanDeClaseRepository.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/repository/PlanDeClaseRepository.java) *(Modificado: consultas de conteo)*
10. [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/request/GuardarSeguimientoClaseRequest.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/request/GuardarSeguimientoClaseRequest.java) *(Nuevo)*
11. [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/dto/SeguimientoClaseDto.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/dto/SeguimientoClaseDto.java) *(Nuevo)*
12. [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/dto/ResumenMateriaSeguimientoResponse.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/dto/ResumenMateriaSeguimientoResponse.java) *(Nuevo)*
13. [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/dto/SemaforoCarreraResponse.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/dto/SemaforoCarreraResponse.java) *(Nuevo)*
14. [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuSaveSeguimientoClaseCmd.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuSaveSeguimientoClaseCmd.java) *(Nuevo)*
15. [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuGetSeguimientoSesionCmd.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuGetSeguimientoSesionCmd.java) *(Nuevo)*
16. [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuGetMateriaAuditoriaCmd.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuGetMateriaAuditoriaCmd.java) *(Nuevo)*
17. [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuGetSemaforoCarreraCmd.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuGetSemaforoCarreraCmd.java) *(Nuevo)*
18. [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuSeguimientoController.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuSeguimientoController.java) *(Nuevo)*
19. [`sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/security/SecurityConfig.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/security/SecurityConfig.java) *(Modificado)*
20. [`sisa-backend/src/test/java/bo/edu/unitepc/sisa/domain/repository/SeguimientoClaseRepositoryTest.java`](file:///f:/SISA%202/sisa-backend/src/test/java/bo/edu/unitepc/sisa/domain/repository/SeguimientoClaseRepositoryTest.java) *(Nuevo)*
21. [`sisa-backend/src/test/java/bo/edu/unitepc/sisa/service/command/ScuGetSemaforoCarreraCmdTest.java`](file:///f:/SISA%202/sisa-backend/src/test/java/bo/edu/unitepc/sisa/service/command/ScuGetSemaforoCarreraCmdTest.java) *(Nuevo)*
22. [`sisa-backend/src/test/java/bo/edu/unitepc/sisa/service/command/ScuSaveSeguimientoClaseCmdTest.java`](file:///f:/SISA%202/sisa-backend/src/test/java/bo/edu/unitepc/sisa/service/command/ScuSaveSeguimientoClaseCmdTest.java) *(Nuevo)*
23. [`sisa-backend/src/test/java/bo/edu/unitepc/sisa/api/controller/ScuSeguimientoControllerSecurityTest.java`](file:///f:/SISA%202/sisa-backend/src/test/java/bo/edu/unitepc/sisa/api/controller/ScuSeguimientoControllerSecurityTest.java) *(Nuevo)*

### Frontend (HTML / JavaScript / TypeScript)
24. [`sisa-frontend/src/app/app.component.html`](file:///f:/SISA%202/sisa-frontend/src/app/app.component.html) *(Modificado: Panel Tab 5, Tab Semáforo, Ribbon KPIs y Modal)*
25. [`sisa-frontend/src/assets/app-controller.js`](file:///f:/SISA%202/sisa-frontend/src/assets/app-controller.js) *(Modificado: Handlers reactivos docentes, cálculo de semáforo, renderizado tri-color y apertura modal)*
26. [`sisa-frontend/src/app/shared/constants/scu-api.constant.ts`](file:///f:/SISA%202/sisa-frontend/src/app/shared/constants/scu-api.constant.ts) *(Modificado: Endpoints de seguimiento)*

---

## Fase 1: Persistencia y Dominio Backend

- [x] 1.1 Crear Migración Flyway `V8__seguimiento_clases_y_semaforo_avance.sql`
  - [x] 1.1.1 Crear archivo [`sisa-backend/src/main/resources/db/migration/V8__seguimiento_clases_y_semaforo_avance.sql`](file:///f:/SISA%202/sisa-backend/src/main/resources/db/migration/V8__seguimiento_clases_y_semaforo_avance.sql).
  - [x] 1.1.2 Definir la tabla `seguimientos_clases` con columnas:
    - `id BIGSERIAL PRIMARY KEY`
    - `sesion_matriz7_id BIGINT REFERENCES sesiones_matriz7(id) ON DELETE SET NULL`
    - `materia_codigo VARCHAR(30) NOT NULL`
    - `carrera_codigo VARCHAR(30) NOT NULL DEFAULT 'CARSIS'`
    - `docente_ci VARCHAR(30) NOT NULL`
    - `fecha_ejecucion DATE NOT NULL`
    - `tipo_clase VARCHAR(20) NOT NULL DEFAULT 'TEORICA'`
    - `comision VARCHAR(20) NOT NULL DEFAULT 'TA-01'`
    - `tema_oficial VARCHAR(500)`
    - `tema_ejecutado VARCHAR(500)`
    - `recursos_planificados JSONB NOT NULL DEFAULT '[]'::jsonb`
    - `recursos_utilizados JSONB NOT NULL DEFAULT '[]'::jsonb`
    - `momento_inicio_cumplido BOOLEAN NOT NULL DEFAULT TRUE`
    - `momento_desarrollo_cumplido BOOLEAN NOT NULL DEFAULT TRUE`
    - `momento_cierre_cumplido BOOLEAN NOT NULL DEFAULT TRUE`
    - `estado_cumplimiento VARCHAR(30) NOT NULL DEFAULT 'TOTALMENTE_CUMPLIDO'`
    - `cumplimiento_score NUMERIC(3,2) NOT NULL DEFAULT 1.00`
    - `observaciones_docente TEXT`
    - `creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP`
    - `actualizado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP`
  - [x] 1.1.3 Agregar restricciones `CHECK`:
    - `chk_estado_cumplimiento CHECK (estado_cumplimiento IN ('TOTALMENTE_CUMPLIDO', 'PARCIALMENTE_CUMPLIDO', 'NO_CUMPLIDO'))`
    - `chk_cumplimiento_score CHECK (cumplimiento_score IN (0.00, 0.50, 1.00))`
    - `chk_tipo_clase_seg CHECK (tipo_clase IN ('TEORICA', 'PRACTICA', 'LABORATORIO', 'CLINICA'))`
  - [x] 1.1.4 Agregar restricciones de unicidad:
    - `CONSTRAINT uq_seguimiento_sesion_matriz7 UNIQUE (sesion_matriz7_id)`
    - `CONSTRAINT uq_seguimiento_materia_fecha_comision UNIQUE (materia_codigo, fecha_ejecucion, tipo_clase, comision)`
  - [x] 1.1.5 Crear índices de cobertura y desempeño:
    - `idx_seguimientos_materia_codigo ON seguimientos_clases(materia_codigo)`
    - `idx_seguimientos_docente_ci ON seguimientos_clases(docente_ci)`
    - `idx_seguimientos_fecha ON seguimientos_clases(fecha_ejecucion)`
    - `idx_seguimientos_carrera ON seguimientos_clases(carrera_codigo)`
    - `idx_seguimientos_sesion_matriz7 ON seguimientos_clases(sesion_matriz7_id)`
    - `idx_seguimientos_cumplimiento ON seguimientos_clases(estado_cumplimiento)`
  - [x] 1.1.6 Insertar semillas de prueba representativas para la gestión `II-2026` (Semana 13 de Corte):
    - **Caso 1 (Verde)**: `SIS-213 Programación III` (3 sesiones con puntaje acumulado alto).
    - **Caso 2 (Amarillo)**: `SIS-311 Base de Datos I` (2 sesiones con desfase parcial `PARCIALMENTE_CUMPLIDO`).
    - **Caso 3 (Rojo por Desfase)**: `MAT-101 Cálculo I` (1 sesión `NO_CUMPLIDO` con desfase crítico).

- [x] 1.2 Implementar Enums de Dominio
  - [x] 1.2.1 Crear [`EstadoCumplimientoTema.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/enums/EstadoCumplimientoTema.java) en `bo.edu.unitepc.sisa.domain.enums`:
    - Valores: `TOTALMENTE_CUMPLIDO` (score `1.00`), `PARCIALMENTE_CUMPLIDO` (score `0.50`), `NO_CUMPLIDO` (score `0.00`).
    - Atributos: `BigDecimal score`, `String etiqueta`, `String tailwindBadgeClass`.
    - Método de utilidad `fromScore(BigDecimal score)`.
  - [x] 1.2.2 Crear [`ColorSemaforo.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/enums/ColorSemaforo.java) en `bo.edu.unitepc.sisa.domain.enums`:
    - Valores: `VERDE`, `AMARILLO`, `ROJO`.
    - Atributos: `String descripcion`, `String colorDotClass`, `String badgeClass`.
  - [x] 1.2.3 Actualizar [`EstadoPlanificacion.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/enums/EstadoPlanificacion.java):
    - Añadir el literal `EJECUTADO` al ciclo de vida (`BORRADOR`, `ENVIADO_REVISION`, `OBSERVADO`, `APROBADO`, `EJECUTADO`).

- [x] 1.3 Implementar Entidad JPA `SeguimientoClase`
  - [x] 1.3.1 Crear [`SeguimientoClase.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/model/SeguimientoClase.java) con anotaciones `@Entity`, `@Table(name = "seguimientos_clases")`, `@Getter`, `@Setter`, `@NoArgsConstructor`.
  - [x] 1.3.2 Mapear campos: `id`, `sesionMatriz7` (`@OneToOne(fetch = FetchType.LAZY)` a `SesionMatriz7`), `materiaCodigo`, `carreraCodigo`, `docenteCi`, `fechaEjecucion`, `tipoClase`, `comision`, `temaOficial`, `temaEjecutado`.
  - [x] 1.3.3 Mapear columnas JSONB con [`JsonbStringListConverter`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/persistence/converter/JsonbStringListConverter.java):
    - `recursosPlanificados` (`List<String>`)
    - `recursosUtilizados` (`List<String>`)
  - [x] 1.3.4 Mapear banderas de momentos: `momentoInicioCumplido`, `momentoDesarrolloCumplido`, `momentoCierreCumplido` con valor por defecto `Boolean.TRUE`.
  - [x] 1.3.5 Mapear `estadoCumplimiento` (`@Enumerated(EnumType.STRING)`), `cumplimientoScore` (`BigDecimal`), `observacionesDocente` (`TEXT`), `creadoEn` y `actualizadoEn` (`OffsetDateTime`).
  - [x] 1.3.6 Configurar métodos de ciclo de vida `@PrePersist` y `@PreUpdate` para sincronizar `cumplimientoScore` a partir de `estadoCumplimiento.getScore()` y actualizar `actualizadoEn`.

- [x] 1.4 Crear Proyecciones e Interfaces SQL para Agregación
  - [x] 1.4.1 Crear interfaz [`MateriaSeguimientoAggregation.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/repository/projection/MateriaSeguimientoAggregation.java) con getters:
    - `String getMateriaCodigo()`
    - `Long getTotalSesionesRegistradas()`
    - `Double getPuntajeTotal()`
    - `Long getCountInicio()`
    - `Long getCountDesarrollo()`
    - `Long getCountCierre()`
  - [x] 1.4.2 Crear interfaz [`RecursoUsoProjection.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/repository/projection/RecursoUsoProjection.java) con getters:
    - `String getRecurso()`
    - `Long getUsos()`

- [x] 1.5 Implementar `SeguimientoClaseRepository` y Consultas de Conteo
  - [x] 1.5.1 Crear [`SeguimientoClaseRepository.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/repository/SeguimientoClaseRepository.java) extendiendo `JpaRepository<SeguimientoClase, Long>`.
  - [x] 1.5.2 Declarar métodos de consulta derivados:
    - `Optional<SeguimientoClase> findBySesionMatriz7Id(Long sesionMatriz7Id)`
    - `Optional<SeguimientoClase> findByMateriaCodigoAndFechaEjecucionAndTipoClaseAndComision(String materiaCodigo, LocalDate fechaEjecucion, TipoSesion tipoClase, String comision)`
    - `List<SeguimientoClase> findByMateriaCodigoOrderByFechaEjecucionAsc(String materiaCodigo)`
  - [x] 1.5.3 Declarar consulta nativa masiva `aggregateByCarrera(@Param("carreraCodigo") String carreraCodigo)` con `GROUP BY s.materia_codigo` evitando problema $N+1$.
  - [x] 1.5.4 Declarar consulta nativa `getRecursosHistogramaByMateria(@Param("materiaCodigo") String materiaCodigo)` utilizando `jsonb_array_elements_text(s.recursos_utilizados)`.
  - [x] 1.5.5 Actualizar [`PlanDeClaseRepository.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/domain/repository/PlanDeClaseRepository.java) con método para verificar existencia de planes de clase por materia o asignación (`countBySesionPacMateriaCodigo` o consulta nativa `countPlanesByMateriaCodigo`).

---

## Fase 2: Lógica de Negocio y Endpoints REST

- [x] 2.1 Definir Contratos y DTOs de Request y Response
  - [x] 2.1.1 Crear [`GuardarSeguimientoClaseRequest.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/request/GuardarSeguimientoClaseRequest.java) en `bo.edu.unitepc.sisa.api.request`:
    - Campos: `sesionMatriz7Id` (Long), `materiaCodigo` (String, `@NotBlank`), `carreraCodigo` (String), `docenteCi` (String, `@NotBlank`), `fechaEjecucion` (LocalDate, `@NotNull`), `tipoClase` (TipoSesion, `@NotNull`), `comision` (String, `@NotBlank`), `temaOficial` (String), `temaEjecutado` (String), `recursosPlanificados` (List<String>), `recursosUtilizados` (List<String>), `momentoInicioCumplido` (Boolean), `momentoDesarrolloCumplido` (Boolean), `momentoCierreCumplido` (Boolean), `estadoCumplimiento` (EstadoCumplimientoTema, `@NotNull`), `observacionesDocente` (String).
  - [x] 2.1.2 Crear [`SeguimientoClaseDto.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/dto/SeguimientoClaseDto.java) en `bo.edu.unitepc.sisa.api.dto`:
    - Representación canónica de la entidad persistida incluyendo `cumplimientoScore`, `planClaseEstadoActualizado`, `creadoEn`, `actualizadoEn`.
  - [x] 2.1.3 Crear [`ResumenMateriaSeguimientoResponse.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/dto/ResumenMateriaSeguimientoResponse.java) con clases anidadas:
    - `MomentosStatsDto` (`inicioPorcentaje`, `desarrolloPorcentaje`, `cierrePorcentaje`).
    - `RecursoHistogramaDto` (`recurso`, `usos`).
    - `SesionSeguimientoItemDto` (`id`, `nroSesion`, `semana`, `fechaEjecucion`, `tipoClase`, `comision`, `temaEjecutado`, `estadoCumplimiento`, `cumplimientoScore`, `observacionesDocente`).
  - [x] 2.1.4 Crear [`SemaforoCarreraResponse.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/dto/SemaforoCarreraResponse.java) con clases anidadas:
    - `SemaforoKpisDto` (`totalMaterias`, `materiasAlDiaVerde`, `materiasAtencionAmarillo`, `materiasCriticoRojo`, `materiasSinPlanClase`).
    - `SemaforoMateriaDto` (`materiaCodigo`, `materiaNombre`, `semestre`, `docenteCi`, `docenteNombre`, `tienePlanClase`, `totalPlanesRegistrados`, `totalSesionesProgramadas`, `totalSesionesRegistradas`, `puntajeRealTotal`, `avancePlaneadoPorcentaje`, `avanceRealPorcentaje`, `diferenciaPorcentaje`, `colorSemaforo`, `motivoAlerta`, `momentosCumplimiento`).

- [x] 2.2 Implementar Comando de Guardado Ágil `ScuSaveSeguimientoClaseCmd`
  - [x] 2.2.1 Crear [`ScuSaveSeguimientoClaseCmd.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuSaveSeguimientoClaseCmd.java) con anotación `@Service` y `@Transactional`.
  - [x] 2.2.2 Validar reglas de negocio:
    - Fecha de ejecución no futura a más de 24 horas del reloj del servidor.
    - Sanitización de listas `recursosPlanificados` y `recursosUtilizados` (evitar nulos).
    - Asignación de score a partir de `request.getEstadoCumplimiento().getScore()`.
  - [x] 2.2.3 Ejecutar Upsert idempotente:
    - Buscar existencia por `sesionMatriz7Id` (si no es nulo) o por coordenadas `(materiaCodigo, fechaEjecucion, tipoClase, comision)`.
    - Si existe, actualizar propiedades en la misma instancia; si no existe, instanciar nueva entidad.
  - [x] 2.2.4 Implementar transición automática en `PlanDeClase`:
    - Si `sesionMatriz7Id` no es nulo y `estadoCumplimiento != NO_CUMPLIDO`:
      - Consultar `PlanDeClase` vinculado mediante `planDeClaseRepository.findBySesionId(sesionMatriz7Id)`.
      - Si existe, cambiar `planDeClase.setEstado(EstadoPlanificacion.EJECUTADO)` y persistir.
  - [x] 2.2.5 Retornar `SeguimientoClaseDto` mapeado.

- [x] 2.3 Implementar Comandos de Consulta de Sesión y Materia
  - [x] 2.3.1 Crear [`ScuGetSeguimientoSesionCmd.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuGetSeguimientoSesionCmd.java):
    - Buscar seguimiento por `sesionMatriz7Id`.
    - Si existe, retornar `SeguimientoClaseDto`; si no existe, retornar `null` (permitiendo respuesta HTTP 200 con `data: null`).
  - [x] 2.3.2 Crear [`ScuGetMateriaAuditoriaCmd.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuGetMateriaAuditoriaCmd.java):
    - Consultar lista histórica de seguimientos por `materiaCodigo` ordenados por fecha ascendente.
    - Calcular porcentajes de momentos didácticos (Inicio, Desarrollo, Cierre) sobre el total de clases registradas.
    - Consultar agregación de histograma de recursos didácticos mediante `getRecursosHistogramaByMateria`.
    - Mapear a `ResumenMateriaSeguimientoResponse`.

- [x] 2.4 Implementar Comando del Semáforo Curricular `ScuGetSemaforoCarreraCmd`
  - [x] 2.4.1 Crear [`ScuGetSemaforoCarreraCmd.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/service/command/ScuGetSemaforoCarreraCmd.java):
    - Parámetros: `carreraCodigo`, `gestionCodigo` (por defecto `'2-2026'`), `semanaCorte` (por defecto `13`).
  - [x] 2.4.2 Obtener catálogo de asignaturas de la carrera desde `AsignaturaRepository` / `AsignacionDocenteRepository` / `SeaMateriaRepository`.
  - [x] 2.4.3 Consultar en un único viaje a BD las agregaciones masivas de seguimientos con `aggregateByCarrera(carreraCodigo)`.
  - [x] 2.4.4 Consultar el estado y conteo de planes de clase para cada materia de la carrera (`tienePlanClase`, `totalPlanes`).
  - [x] 2.4.5 Ejecutar el algoritmo matemático tri-color formal:
    - $\text{Avance Planeado} = (W_{corte} / 20.0) \times 100\% = 65.00\%$.
    - $\text{Avance Real} = (P_{real} / N_{total}) \times 100\%$ ($N_{total}=36$ o $40$).
    - $\Delta\% = \text{Avance Real} - \text{Avance Planeado}$.
    - Clasificación:
      - Si `tienePlanClase == false` o `totalPlanes == 0` $\rightarrow$ 🔴 **ROJO** (Penalización obligatoria: "Penalización crítica: Asignatura sin Plan de Clase registrado").
      - Si $\Delta\% < -25.00\%$ $\rightarrow$ 🔴 **ROJO** ("Desfase grave (-X%): retraso superior a 4 semanas").
      - Si $-25.00\% \le \Delta\% < -10.00\%$ $\rightarrow$ 🟡 **AMARILLO** ("Desfase moderado (-X%): requiere reprogramación").
      - Si $\Delta\% \ge -10.00\%$ $\rightarrow$ 🟢 **VERDE** ("Avance dentro del margen institucional tolerable").
  - [x] 2.4.6 Consolidar KPIs globales de carrera: `totalMaterias`, `materiasAlDiaVerde`, `materiasAtencionAmarillo`, `materiasCriticoRojo`, `materiasSinPlanClase`, `avanceRealPromedioPorcentaje`.
  - [x] 2.4.7 Retornar `SemaforoCarreraResponse`.

- [x] 2.5 Crear Controlador REST `ScuSeguimientoController` y Asegurar RBAC
  - [x] 2.5.1 Crear [`ScuSeguimientoController.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/api/controller/ScuSeguimientoController.java) anotado con `@RestController`, `@RequestMapping("/api/v1/seguimiento")`, `@Tag(name = "Seguimiento de Sesiones y Semáforo Curricular")`.
  - [x] 2.5.2 Exponer endpoint `POST /sesion`:
    - `@PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_ADMIN')")`
    - Inyectar y llamar a `ScuSaveSeguimientoClaseCmd`.
  - [x] 2.5.3 Exponer endpoint `GET /sesion/{sesionId}`:
    - `@PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_ADMIN')")`
    - Inyectar y llamar a `ScuGetSeguimientoSesionCmd`.
  - [x] 2.5.4 Exponer endpoint `GET /materia/{materiaCodigo}`:
    - `@PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_ADMIN')")`
    - Parámetro opcional `@RequestParam(defaultValue = "2-2026") String gestionCodigo`.
    - Inyectar y llamar a `ScuGetMateriaAuditoriaCmd`.
  - [x] 2.5.5 Exponer endpoint `GET /semaforo-carrera/{carreraCodigo}`:
    - `@PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_VICERRECTOR_SEDE', 'ROLE_VICERRECTOR_NACIONAL', 'ROLE_ADMIN')")`
    - Parámetros opcionales `@RequestParam(defaultValue = "2-2026") String gestionCodigo` y `@RequestParam(defaultValue = "13") Integer semanaCorte`.
    - Inyectar y llamar a `ScuGetSemaforoCarreraCmd`.
  - [x] 2.5.6 Verificar en [`SecurityConfig.java`](file:///f:/SISA%202/sisa-backend/src/main/java/bo/edu/unitepc/sisa/infrastructure/security/SecurityConfig.java) que la ruta `/api/v1/seguimiento/**` requiera autenticación obligatoria (`.authenticated()`).

---

## Fase 3: Frontend - Módulo Docente (Vista 1)

- [x] 3.1 Integrar Panel de Seguimiento de Sesión en Tab 5 (`app.component.html`)
  - [x] 3.1.1 Localizar el contenedor `#tab-asistencia` en [`sisa-frontend/src/app/app.component.html`](file:///f:/SISA%202/sisa-frontend/src/app/app.component.html#L2702).
  - [x] 3.1.2 Insertar el contenedor principal `#panel-seguimiento-sesion` debajo de `#asistencia-toolbar`:
    - Barra de encabezado con icono `compass`, título "Seguimiento Pedagógico de Sesión en Aula", badge de estado `#badge-seguimiento-status` y botón de guardado `#btn-guardar-seguimiento` (`window.saveSeguimientoSesion()`).
  - [x] 3.1.3 Estructurar la Tarjeta 1: **🏛️ Macroplanificación Oficial (Matriz 7)**:
    - Contenedor con fondo `slate-50/80` y badge "Normativo".
    - Contenedor de Unidad Temática `#seg-macro-unidad` (texto de solo lectura).
    - Contenedor de Tema Oficial del Día `#seg-macro-tema` (texto de solo lectura).
    - Indicadores de semana institucional, número de sesión, horario y aula.
  - [x] 3.1.4 Estructurar la Tarjeta 2: **👤 Planificación Personal de Aula (Plan de Clase)**:
    - Contenedor interactivo con fondo `teal-50/40` y badge "Autonomía Docente".
    - Grid de 3 checkboxes para momentos pedagógicos:
      - `#seg-momento-inicio` (Inicio 15')
      - `#seg-momento-desarrollo` (Desarrollo 60')
      - `#seg-momento-cierre` (Cierre 15')
    - Grupo de botones de radio visual para cumplimiento del tema:
      - `#seg-btn-total` ("✓ Total (+1.0)")
      - `#seg-btn-parcial` ("~ Parcial (+0.5)")
      - `#seg-btn-no` ("✕ No (0.0)")
    - Contenedor dinámico de checkboxes de recursos didácticos `#seg-recursos-container`.
    - Input de notas u observaciones de aula `#seg-observaciones-input`.

- [x] 3.2 Actualizar Constantes de API en Frontend
  - [x] 3.2.1 En [`sisa-frontend/src/app/shared/constants/scu-api.constant.ts`](file:///f:/SISA%202/sisa-frontend/src/app/shared/constants/scu-api.constant.ts), declarar constantes para las rutas:
    - `SEGUIMIENTO_SESION: '/api/v1/seguimiento/sesion'`
    - `SEGUIMIENTO_MATERIA: '/api/v1/seguimiento/materia'`
    - `SEGUIMIENTO_SEMAFORO_CARRERA: '/api/v1/seguimiento/semaforo-carrera'`

- [x] 3.3 Implementar Lógica Reactiva de Seguimiento Docente en `app-controller.js`
  - [x] 3.3.1 En [`sisa-frontend/src/assets/app-controller.js`](file:///f:/SISA%202/sisa-frontend/src/assets/app-controller.js), implementar variable de estado `window.__ACTIVE_SEGUIMIENTO_STATE__`:
    - Atributos: `sesionMatriz7Id`, `estadoCumplimiento`, `score`, `recursosUtilizados`, `momentos`, `observaciones`.
  - [x] 3.3.2 Implementar función `window.syncSeguimientoFromActiveSession(sessionData)`:
    - Invocada automáticamente en `window.onAttendanceSessionSelect(sessionId)`.
    - Poblar `#seg-macro-unidad` con la unidad temática de Matriz 7.
    - Poblar `#seg-macro-tema` con el contenido temático específico oficial.
    - Consultar si existe seguimiento previo con `GET /api/v1/seguimiento/sesion/{sessionId}`.
    - Si existe registro previo: sincronizar estado de checkboxes de momentos, botones de cumplimiento, recursos y observaciones, y colocar `#badge-seguimiento-status` en "Registrado (+X.X pts)".
    - Si no existe: inicializar con valores óptimos por defecto (3 momentos en `true`, cumplimiento `TOTALMENTE_CUMPLIDO`, recursos tomados del Plan de Clase, `#badge-seguimiento-status` en "Pendiente de Registro").
  - [x] 3.3.3 Implementar función `window.setSeguimientoCumplimiento(estado)`:
    - Gestionar clases Tailwind activas (`bg-emerald-600 text-white` vs `bg-slate-100 text-slate-700`).
    - Actualizar `__ACTIVE_SEGUIMIENTO_STATE__.estadoCumplimiento` con el enum seleccionado.
  - [x] 3.3.4 Implementar función `window.saveSeguimientoSesion()`:
    - Validar selección activa de sesión y materia.
    - Ensamblar payload JSON de `GuardarSeguimientoClaseRequest`.
    - Despachar petición HTTP `POST /api/v1/seguimiento/sesion` con JWT en encabezado `Authorization`.
    - En caso exitoso:
      - Mostrar toast institucional: `"✓ Seguimiento de clase guardado exitosamente (Score: 1.0)"`.
      - Actualizar `#badge-seguimiento-status` con estilo esmeralda "Registrado (Score: X.X)".
      - Almacenar copia en `localStorage` bajo `sisa_seguimiento_{materia}_{sesionId}` para disponibilidad offline inmediata.
      - Refrescar estado del Plan de Clase asociado en la interfaz si está abierto.
    - En caso de error: mostrar toast de error y permitir reintento sin pérdida de datos en pantalla.

---

## Fase 4: Frontend - Supervisión y Semáforo de Carrera (Vista 2)

- [x] 4.1 Añadir Pestaña de Semáforo y Cinta de KPIs en `app.component.html`
  - [x] 4.1.1 En [`sisa-frontend/src/app/app.component.html#L3073`](file:///f:/SISA%202/sisa-frontend/src/app/app.component.html#L3073), agregar el botón de la pestaña `#supervision-tab-semaforo` al lado de `#supervision-tab-clases`:
    - `onclick="window.setSupervisionActiveTab('SEMAFORO')"`
    - Icono `traffic-cone` y texto `"🚦 Semáforo de Avance"`.
  - [x] 4.1.2 Insertar el contenedor de la cinta de KPIs Tri-Color `#semaforo-kpi-ribbon` justo debajo de la barra de pestañas (inicialmente con clase `hidden`):
    - Tarjeta 1: Total Asignaturas (`#kpi-semaforo-total`).
    - Tarjeta 2: 🟢 Al Día (`#kpi-semaforo-verde`, diferencia $\ge -10\%$).
    - Tarjeta 3: 🟡 En Atención (`#kpi-semaforo-amarillo`, desfase $-10\%$ a $-25\%$).
    - Tarjeta 4: 🔴 Crítico (`#kpi-semaforo-rojo`, desfase $< -25\%$ o Sin Plan).
    - Tarjeta 5: Avance Real Promedio (`#kpi-semaforo-promedio` vs `65.0% Planeado`).

- [x] 4.2 Añadir Modal Institucional de Detalle Pedagógico en `app.component.html`
  - [x] 4.2.1 Al final de la vista de supervisión en `app.component.html`, declarar `#modal-supervision-seguimiento-detalle` (con backdrop blur y estado `hidden`).
  - [x] 4.2.2 Diseñar el encabezado del modal con icono `line-chart`, título `#modal-seg-materia-title`, subtítulo de docente `#modal-seg-docente-subtitle` y botón de cierre `window.closeModalSeguimientoDetalle()`.
  - [x] 4.2.3 Diseñar el cuerpo del modal:
    - Sección de métricas de momentos pedagógicos:
      - `#modal-seg-momento-inicio-pct` (Inicio 15 min %)
      - `#modal-seg-momento-des-pct` (Desarrollo 60 min %)
      - `#modal-seg-momento-cierre-pct` (Cierre 15 min %)
    - Sección de nube / histograma de recursos didácticos utilizados `#modal-seg-recursos-container`.
    - Tabla cronológica de sesiones impartidas con columnas: `Fecha`, `Tema Impartido`, `Momentos`, `Cumplimiento`, `Observaciones` y cuerpo dinámico `#modal-seg-table-body`.
  - [x] 4.2.4 Diseñar el pie del modal con botón de cierre y opción de exportación/impresión.

- [x] 4.3 Implementar Algoritmo y Tablero de Semáforo en `app-controller.js`
  - [x] 4.3.1 En [`sisa-frontend/src/assets/app-controller.js`](file:///f:/SISA%202/sisa-frontend/src/assets/app-controller.js), actualizar `window.setSupervisionActiveTab(tab)`:
    - Si `tab === 'SEMAFORO'`:
      - Activar estilos de pestaña seleccionada en `#supervision-tab-semaforo`.
      - Remover `hidden` de `#semaforo-kpi-ribbon` y ocultar las métricas documentales estándar.
      - Disparar `window.loadSupervisionSemaforoData()`.
    - Si `tab !== 'SEMAFORO'`:
      - Ocultar `#semaforo-kpi-ribbon` y restaurar vista documental estándar.
  - [x] 4.3.2 Implementar función `window.loadSupervisionSemaforoData(forceRefresh)`:
    - Obtener carrera seleccionada (`sisa_supervision_active_career` o `'CARSIS'`).
    - Comprobar cache en `localStorage['sisa_semaforo_' + carreraCode]`. Si existe, renderizar inmediatamente para latencia 0 ms.
    - Ejecutar llamada asíncrona `GET /api/v1/seguimiento/semaforo-carrera/{carreraCode}`.
    - Actualizar `localStorage` y volver a renderizar con datos frescos del servidor.
  - [x] 4.3.3 Implementar función `window.renderSemaforoCarreraView(semaforoData)`:
    - Actualizar los contadores de la cinta `#semaforo-kpi-ribbon`:
      - `#kpi-semaforo-total` $\leftarrow$ `data.kpis.totalMaterias`
      - `#kpi-semaforo-verde` $\leftarrow$ `data.kpis.materiasAlDiaVerde`
      - `#kpi-semaforo-amarillo` $\leftarrow$ `data.kpis.materiasAtencionAmarillo`
      - `#kpi-semaforo-rojo` $\leftarrow$ `data.kpis.materiasCriticoRojo`
      - `#kpi-semaforo-promedio` $\leftarrow$ `data.avanceRealPromedioPorcentaje + '%'`
    - Recorrer los acordeones semestrales en `#supervision-semesters-container`:
      - Reemplazar las columnas de estado documental por las columnas de **Semáforo Curricular**:
        - Columna **Avance Planeado**: `65.0% (Sem 13)`
        - Columna **Avance Real**: `XX.X% (K/N ses)` con barra de progreso Tailwind
        - Columna **Diferencia $\Delta\%$**: Con formato de signo `+X.X%` o `-X.X%`
        - Columna **Semáforo & Motivo**: Badge Tri-Color (🟢 Verde `Al Día`, 🟡 Amarillo `En Atención`, 🔴 Rojo `Crítico` o `Sin Plan`)
        - Columna **Acciones**: Botón `"🔍 Ver Auditoría"` que invoca `window.openModalSeguimientoDetalle(materiaCodigo)`.
  - [x] 4.3.4 Implementar funciones de control del Modal:
    - `window.openModalSeguimientoDetalle(materiaCodigo)`:
      - Abrir `#modal-supervision-seguimiento-detalle` con spinner de carga.
      - Consultar `GET /api/v1/seguimiento/materia/{materiaCodigo}`.
      - Poblar títulos, barras de momentos didácticos, histograma de recursos y tabla cronológica de sesiones con sus badges de cumplimiento.
      - Inicializar iconos Lucide (`lucide.createIcons()`).
    - `window.closeModalSeguimientoDetalle()`: ocultar el modal `#modal-supervision-seguimiento-detalle`.

---

## Fase 5: Verificación, Pruebas y Compilación

- [x] 5.1 Implementar Pruebas Unitarias del Backend
  - [x] 5.1.1 Crear [`SeguimientoClaseRepositoryTest.java`](file:///f:/SISA%202/sisa-backend/src/test/java/bo/edu/unitepc/sisa/domain/repository/SeguimientoClaseRepositoryTest.java):
    - Probar persistencia de entidad `SeguimientoClase` con listas JSONB en Postgres / H2 dialect.
    - Probar ejecución de la consulta nativa de agregación `aggregateByCarrera` y verificar que los cálculos matemáticos agrupados correspondan a las semillas.
    - Probar consulta nativa de histograma `getRecursosHistogramaByMateria`.
  - [x] 5.1.2 Crear [`ScuGetSemaforoCarreraCmdTest.java`](file:///f:/SISA%202/sisa-backend/src/test/java/bo/edu/unitepc/sisa/service/command/ScuGetSemaforoCarreraCmdTest.java):
    - Probar clasificación de materia en 🟢 **VERDE** cuando $\Delta\% \ge -10.0\%$ (ej. $-5.28\%$).
    - Probar clasificación en 🟡 **AMARILLO** cuando $-25.0\% \le \Delta\% < -10.0\%$ (ej. $-17.78\%$).
    - Probar clasificación en 🔴 **ROJO** cuando $\Delta\% < -25.0\%$ (ej. $-34.44\%$).
    - Probar penalización estricta en 🔴 **ROJO** cuando $\text{tienePlanClase} == \text{false}$, independientemente de su porcentaje numérico.
    - Probar cálculo de KPIs consolidados de carrera.
  - [x] 5.1.3 Crear [`ScuSaveSeguimientoClaseCmdTest.java`](file:///f:/SISA%202/sisa-backend/src/test/java/bo/edu/unitepc/sisa/service/command/ScuSaveSeguimientoClaseCmdTest.java):
    - Probar creación de nuevo seguimiento con score correcto asignado según el enum.
    - Probar idempotencia (actualización in-place si ya existe seguimiento para la misma sesión).
    - Probar que si existe `PlanDeClase` vinculado y el score es $>0$, su estado transmuta a `EstadoPlanificacion.EJECUTADO`.
  - [x] 5.1.4 Crear [`ScuSeguimientoControllerSecurityTest.java`](file:///f:/SISA%202/sisa-backend/src/test/java/bo/edu/unitepc/sisa/api/controller/ScuSeguimientoControllerSecurityTest.java):
    - Verificar que `POST /api/v1/seguimiento/sesion` permite acceso a `ROLE_DOCENTE` y `ROLE_ADMIN`, y deniega a usuarios sin rol.
    - Verificar que `GET /api/v1/seguimiento/semaforo-carrera/{carreraCodigo}` permite acceso a `ROLE_DIR_CARRERA`, `ROLE_DIR_ACADEMICA`, `ROLE_ADMIN`, y deniega con HTTP 403 Forbidden a `ROLE_DOCENTE`.

- [x] 5.2 Compilación y Verificación de Backend
  - [x] 5.2.1 Ejecutar compilación de pruebas de Maven:
    - Comando: `./mvnw test-compile` o `mvn clean test -Dtest=*Seguimiento*`.
    - Garantizar 0 errores de compilación y 0 fallos en los tests del módulo.
  - [x] 5.2.2 Verificar ejecución limpia de las migraciones Flyway (V1 a V8).

- [x] 5.3 Compilación y Verificación de Frontend
  - [x] 5.3.1 Validar consistencia sintáctica y balanceo de etiquetas HTML en `app.component.html`.
  - [x] 5.3.2 Validar funciones JavaScript en `app-controller.js` sin errores de sintaxis (`node --check sisa-frontend/src/assets/app-controller.js`).
  - [x] 5.3.3 Ejecutar verificación sintáctica y estructural de frontend:
    - Validación de sintaxis JS (`node --check sisa-frontend/src/assets/app-controller.js`) exitosa con código 0.
    - Integridad de constantes (`scu-api.constant.ts`) y componentes UI en `app.component.html`.

- [x] 5.4 Verificación Integral de Criterios de Aceptación (Escenarios BDD)
  - [x] 5.4.1 Verificar Escenario 1: Registro ágil en aula con valores por defecto en $\le 5$ segundos (Happy Path 1 Clic).
  - [x] 5.4.2 Verificar Escenario 2: Registro con momento de cierre desmarcado y cumplimiento parcial (+0.5 pts).
  - [x] 5.4.3 Verificar Escenario 3: Consulta del semáforo curricular para `SIS-213` con badge verde "Al Día".
  - [x] 5.4.4 Verificar Escenario 4: Detección y clasificación en amarillo para `SIS-311` con alerta de reprogramación.
  - [x] 5.4.5 Verificar Escenario 5: Penalización obligatoria en rojo para `SIS-412` por falta de Plan de Clase.
  - [x] 5.4.6 Verificar Escenario 6: Despliegue interactivo del modal de detalle pedagógico con histograma y sesiones.
