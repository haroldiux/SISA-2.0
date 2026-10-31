# SISA 2.0 — Contexto Integral y Arquitectura del Sistema
**Sistema Integral de Seguimiento Académico y Supervisión Curricular**  
**Universidad Técnica Privada Cosmos (UNITEPC)**  
*Fecha de corte: 31 de Octubre de 2026*

---

## 1. Resumen Ejecutivo y Propósito

**SISA 2.0** es la plataforma institucional diseñada para la gestión, planificación didáctica, auditoría y visado curricular del cuerpo docente y las autoridades académicas de la **Universidad Técnica Privada Cosmos (UNITEPC)**.

El sistema resuelve la desconexión histórica entre la oferta de grupos en el sistema de registro central (**SEA - Sistema de Educación Académica**) y el seguimiento pedagógico en aula, proporcionando:
- **Desacoplamiento y Resiliencia**: Consumo del catálogo académico vía Gateway institucional (`UnitepcGatewayClient`) con almacenamiento y caché local en PostgreSQL para disponibilidad 100% ante caídas del servidor central.
- **Doble Flujo Operativo**:
  1. **Carpeta Docente**: Entorno de trabajo para docentes donde elaboran y gestionan los 5 documentos oficiales de planificación didáctica y control de aula.
  2. **Supervisión Curricular**: Entorno de control para Directores de Carrera, Directores Académicos y Vicerrectores para auditar, observar o visar la planificación semestral de todas las materias y monitorear el semáforo curricular en tiempo real.
- **Cobertura Nacional Multi-Sede y Multi-Carrera**: Soporte para las **9 sedes universitarias** y las **24 carreras vigentes** en UNITEPC con gobernanza de acceso según el perfil del usuario.

---

## 2. Arquitectura Tecnológica y Stack

```
┌────────────────────────────────────────────────────────┐
│                   Cliente Web SISA                     │
│    (Angular 15 + PrimeNG 15 + TailwindCSS + Vanilla)   │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / REST / JWT Bearer
┌───────────────────────────▼────────────────────────────┐
│              sisa-backend (Spring Boot 3.3.3)          │
│  - Seguridad: Spring Security 6 + JJWT + RBAC          │
│  - Negocio: Planificaciones, PAC, Microplanificación   │
│  - Asistencias: Control Semestral + Regla 80% UNITEPC  │
│  - Seguimiento en Aula: 5 Momentos Didácticos Oficiales │
│  - Reportes: Apache POI (Word .docx y Excel .xlsx)     │
│  - Gateway Client: WebClient reactivo hacia SEA        │
└─────────────┬────────────────────────────┬─────────────┘
              │ JDBC (HikariCP)            │ HTTPS
┌─────────────▼─────────────┐ ┌────────────▼─────────────┐
│   PostgreSQL 16 (sisa_db) │ │    UNITEPC Gateway       │
│  - 28 tablas relacionales │ │  - Sedes, Carreras,      │
│  - Migraciones Flyway     │ │    Grupos, Horarios      │
└───────────────────────────┘ └──────────────────────────┘
```

### 2.1 Backend (`sisa-backend`)
- **Runtime**: Java 17 LTS / OpenJDK 17.
- **Framework**: Spring Boot 3.3.3 con Spring Data JPA y Hibernate 6.
- **Seguridad**: Autenticación JWT stateless con caducidad configurada, control de acceso basado en roles institucionalizados y expiración forzada en cambios de contraseña.
- **Migraciones**: Flyway (`V1__init_sisa_schema.sql` a `V9__attendance_and_session_tracking.sql`).
- **Motor de Documentos Oficiales**:
  - Apache POI OOXML (`XWPFDocument`): Importación y exportación de Programas Analíticos en Word (.docx) respetando formato institucional de 14 puntos.
  - Apache POI HSSF/XSSF (`XSSFWorkbook`): Exportación multi-hoja de Planes de Clase (Teóricos y Prácticos) y Planilla Oficial de Asistencia en formato Excel (.xlsx).
- **Contenedor**: `sisa-backend` expuesto en puerto `8080`.

### 2.2 Frontend (`sisa-frontend`)
- **Framework**: Angular 15 compilado en modo producción y servido a través de NGINX 1.27 Alpine.
- **Componentes & Estilos**: PrimeNG 15, TailwindCSS, PrimeIcons y Lucide Icons.
- **Capa Reactiva Híbrida**: Controlador centralizado de interfaz en `assets/app-controller.js` con soporte para:
  - Persistencia de vista, asignatura y pestaña activa ante recarga (F5).
  - Sincronización instantánea de sesiones SEA (fechas, comisiones, aulas y modalidad).
  - Aislamiento estricto de nómina de asistencia por sesión y cohorte de carrera.
  - Conmutación automática de macroplanificación teórica (Matriz 7) vs práctica (Sección 8 del PAC Práctico).
  - Caché instantánea en `localStorage` con respaldo transparente contra el backend.
- **Contenedor**: `sisa-frontend` expuesto en puerto `4200`.

### 2.3 Base de Datos (`sisa-postgres`)
- **Motor**: PostgreSQL 16 Alpine.
- **Esquema**: `sisa_db` gestionado por usuario `sisa_admin`.
- **Tablas Clave**:
  - `usuarios`, `usuario_asignaciones_academicas`: Identidad institucional y relaciones de gobernanza por sede, carrera y cátedra.
  - `programas_analiticos`, `unidades_aprendizaje`, `bibliografia`: Macroplanificación oficial.
  - `pacs`, `sesiones_matriz7`: Mesoplanificación y cronograma de 20 semanas / guías prácticas.
  - `planes_clase`, `momentos_pedagogicos`: Microplanificación didáctica por sesión de 90 minutos (Secuencia Didáctica Oficial de 5 Momentos).
  - `sesiones_asistencia`, `estudiantes_asistencia_sesion`: Registro histórico y diario de asistencia estudiantil.
  - `seguimientos_clase_aula`: Trazabilidad pedagógica en aula por docente, sesión y recursos empleados.
  - `sea_sedes`, `sea_carreras`, `sea_materias`, `sea_grupos`: Espejo local de datos sincronizados desde el Gateway.

---

## 3. Catálogo Nacional y Topología Institucional

El sistema reconoce y resuelve de forma nativa los identificadores UUID oficiales provistos por el Gateway de UNITEPC (`/api/v1/university/externals/research/...`):

### 3.1 Sedes Académicas (9 Sedes)
| Código | UUID Gateway | Sede | Campus Principal |
|:---:|:---|:---|:---|
| `CBA` | `ea4fb26e-11a9-452f-9bae-4962de2dd931` | COCHABAMBA | Campus Juan Pablo II |
| `LPZ` | `035656e1-140b-4221-aa8d-84541d4e6608` | LA PAZ | Sede Académica La Paz |
| `EAL` | `ccd014b4-3ad5-4385-b281-27f711562d38` | EL ALTO | Sede Académica El Alto |
| `CBJ` | `f355b875-7c6b-4bed-95d8-b3aa4651b6ab` | COBIJA | Sede Regional Cobija |
| `IVI` | `bd45cf85-6dbc-4f1a-b8d6-e32188e524b5` | IVIRGARZAMA | Sede Trópico Ivirgarzama |
| `STC` | `303e75e6-74c3-40b6-adad-ecea9a1a778f` | SANTA CRUZ | Sede Santa Cruz |
| `CVI` | `e1498385-a339-4645-b580-0e09007dc7ed` | CARANAVI | Sede Nor Yungas Caranavi |
| `GUA` | `279bf4e7-f87b-44f2-a221-548cec0d6a8d` | GUAYARAMERIN | Sede Guayaramerín |
| `PTO` | `fe4054d0-4594-4453-9efc-4fb9cd5824ef` | PUERTO QUIJARRO| Sede Fronteriza Puerto Quijarro |

### 3.2 Carreras Universitarias (24 Carreras)
| Código | Prefijo | Duración | Carrera | Área / Facultad |
|:---:|:---:|:---:|:---|:---|
| `CARSIS` | `SIS` | 8 semestres | Licenciatura en Ingeniería de Sistemas | Tecnología |
| `CARELE` | `ELE` | 8 semestres | Licenciatura en Ingeniería Electrónica | Tecnología |
| `CARSON` | `SON` | 8 semestres | Licenciatura en Ingeniería de Sonido | Tecnología |
| `CARIBI` | `IBI` | 8 semestres | Licenciatura en Ingeniería Biomédica | Tecnología y Salud |
| `CARMED` | `MED` | 10 semestres | Licenciatura en Medicina | Ciencias de la Salud |
| `CARDER` | `DER` | 8 semestres | Licenciatura en Derecho | Ciencias Jurídicas |
| `CARODO` | `ODO` | 10 semestres | Licenciatura en Odontología | Ciencias de la Salud |
| `CARVET` | `VET` | 10 semestres | Licenciatura en Medicina Veterinaria y Zootecnia | Ciencias Agrarias |
| `CARBYF` | `BYF` | 10 semestres | Licenciatura en Bioquímica y Farmacia | Ciencias de la Salud |
| `CARENL` | `ENF` | 8 semestres | Licenciatura en Enfermería | Ciencias de la Salud |
| `CARFIS` | `FIS` | 8 semestres | Licenciatura en Fisioterapia y Kinesiología | Ciencias de la Salud |
| `CARNYD` | `NUT` | 8 semestres | Licenciatura en Nutrición y Dietética | Ciencias de la Salud |
| `CARADM` | `ADM` | 8 semestres | Licenciatura en Administración de Empresas | Ciencias Empresariales |
| `CARCPU` | `CPU` | 8 semestres | Licenciatura en Contaduría Pública | Ciencias Empresariales |
| `CARICO` | `ICO` | 8 semestres | Licenciatura en Ingeniería Comercial | Ciencias Empresariales |
| `CARCSO` | `CSO` | 8 semestres | Licenciatura en Comunicación Social | Humanidades |
| `CARCCP` | `CCP` | 4 semestres | Complementaria Contaduría Pública | Educación Continua |
| `CARCAD` | `CAD` | 4 semestres | Complementaria en Administración de Empresas | Educación Continua |
| `CARECO` | `ECO` | 8 semestres | Licenciatura en Economía | Ciencias Empresariales |
| `CARCIC` | `CIC` | 4 semestres | Complementaria Ingeniería Comercial | Educación Continua |
| `CARAYE` | `AYE` | 8 semestres | Licenciatura en Arte y Escultura | Artes |
| `CARCNE` | `CNE` | 8 semestres | Licenciatura en Cinematografía | Artes Audiovisuales |
| `CARFON` | `FON` | 8 semestres | Licenciatura en Fonoaudiología | Ciencias de la Salud |
| `CARPRO` | `PRO` | 6 semestres | Prótesis Dental | Técnico Superior |

---

## 4. Módulos y Flujos Funcionales

### 4.1 Carpeta Docente (Vista 1)
Estructurada en torno a los 5 documentos pedagógicos y de control oficiales:

1. **Documento 1: Programa Analítico (Macroplanificación)**
   - Formato oficial UNITEPC de 14 puntos (Fundamentación, Competencias, Unidades Temáticas, Metodología, Evaluación, Bibliografía).
   - Validador integrado de normas APA 7ma Edición para referencias bibliográficas.
   - Importador bidireccional Word (.docx): Extrae tablas, unidades de aprendizaje y temas persistiendo en base de datos.
   - Gobernanza institucional: Solo editable por la Dirección de Carrera Líder o administradores; docentes visualizan en modo solo lectura con autorización para exportar carátula oficial.

2. **Documento 2: PAC Teórico (Mesoplanificación Pedagógica)**
   - Define objetivos de aprendizaje, contenidos analíticos, metodologías activas, recursos y sistemas de evaluación continua.
   - Puntos 1 a 14 articulados con los elementos de competencia del Programa Analítico.

3. **Documento 3: Cronograma Semestral de 20 Semanas (Matriz 7 y PAC Práctico)**
   - **Modalidad Teórica (Matriz 7)**: Planificación sesión por sesión (Semana, Sesión #, Unidad Temática, Contenido Específico, Saberes Conceptuales/Procedimentales/Actitudinales, Criterio de Desempeño e Instrumento de Evaluación).
   - **Modalidad Práctica (Sección 8 del PAC Práctico)**: Planificación semestral de prácticas de laboratorio, escenarios de aprendizaje, actividades, desempeño procedimental, evidencias e instrumentos de evaluación (Rúbricas/Listas de cotejo).
   - Importadores dedicados desde Excel (.xlsx) con auto-completado de semanas y sesiones.

4. **Documento 4: Planes de Clase / Microplanificación Didáctica**
   - Microplanificación detallada por tema y sesión didáctica (hasta 40 sesiones: 20 teóricas + 20 prácticas).
   - Selector por pestañas de Unidades de Aprendizaje y conmutación entre *Plan Teórico (TA)* y *Guía Práctica (PL/PA)*.
   - Generación dinámica articulada desde el Programa Analítico.
   - Exportador oficial a Excel multi-hoja (.xlsx) con libro descargable por asignatura.

5. **Documento 5: Lista Oficial y Control de Asistencia Semestral**
   - Selector inteligente de sesiones sincronizado con las comisiones oficiales del SEA (fechas, horarios, aulas y tipo de clase).
   - **Aislamiento estricto de asistencia por sesión**: Cada sesión mantiene su propio estado de marcación (`P` Presente, `F` Falta, `A` Atraso, `L` Licencia) y justificación sin arrastrar marcas entre clases.
   - **Cálculo de la Regla del 80% (UNITEPC)**: Semáforo de habilitación en tiempo real (`Habilitado (>= 80%)` vs `Inhabilitado (< 80%)`).
   - **Segregación automática por cohorte/carrera**: En cátedras comunes, clasifica automáticamente a los estudiantes según su carrera de origen (ej. Ing. de Sistemas vs Ing. Electrónica).
   - **Seguimiento Pedagógico de Sesión en Aula (Fase 3)**:
     - **Secuencia Didáctica Oficial UNITEPC (5 Momentos)**:
       1. Introducción (15 min): Motivación y encuadre inicial.
       2. Resultados de Aprendizaje / Logros Esperados (10 min): Logros esperados de clase.
       3. Contenidos de la Clase (15 min): Mapa temático y saberes.
       4. Cuerpo de Contenidos (40 min): Construcción y desarrollo activo.
       5. Conclusión o Cierre (10 min): Síntesis plenaria y evaluación.
     - Cumplimiento temático cualitativo: *Totalmente Cumplido*, *Parcialmente Cumplido*, *No Cumplido*.
     - Conmutación automática de Macroplanificación: Despliega Matriz 7 para clases teóricas y Sección 8 para laboratorios.
     - Registro ágil en aula (< 5 segundos) con persistencia en PostgreSQL y localStorage.
   - Exportador oficial de Asistencia a Excel (.xlsx).

### 4.2 Supervisión Curricular y Semáforo Directivo (Vista 2)
Herramienta de auditoría para autoridades académicas (Directores de Carrera, Directores Académicos y Vicerrectores):

- **Semáforo Curricular de Avance en Tiempo Real**:
  - Indicador porcentual de avance pedagógico planificado vs ejecutado en aula.
  - Codificación por colores: **Verde** (Cumplimiento óptimo >= 80%), **Amarillo** (Alerta preventiva 60-79%), **Rojo** (Retraso crítico < 60%).
- **Auditoría de Secuencia Didáctica y Recursos**:
  - Trazabilidad del cumplimiento de los 5 momentos didácticos por docente.
  - Métricas de uso de recursos pedagógicos (Pizarra acrílica, proyector, guías de laboratorio, IDEs/código, plataformas virtuales).
- **Malla Curricular Interactiva por Semestre**:
  - Semestres dinámicos (hasta 10 para carreras de salud; hasta 8 para ingenierías/sociales; 4 para complementarias).
  - Estado de dossier por materia: Programa Analítico, PAC General, PAC Práctico, Planes de Clase y Asistencias.
- **Aprobación en Lote y Dictamen Semestral**:
  - Modal para emisión de resolución curricular y certificación de semestre completo.
  - Registro de observaciones docentes con trazabilidad histórica.
- **Exportación de Reporte Curricular PDF**: Malla completa con firmas, fechas de corte y estado de cada cátedra.

---

## 5. Gobernanza de Roles y Alcance Multi-Sede / Multi-Carrera

El sistema aplica un modelo RBAC estricto que restringe qué información puede ver y editar cada usuario:

### 5.1 Jerarquía de Roles
1. `ROLE_ADMIN` / `ROLE_VICERRECTOR_NACIONAL`: Acceso irrestricto a todas las 9 sedes y 24 carreras. Todos los selectores están desbloqueados.
2. `ROLE_VICERRECTOR_SEDE` / `ROLE_DIR_ACADEMICA`: Confinados a su sede asignada (el selector de Sede se bloquea con 🔒). Pueden auditar cualquiera de las 24 carreras de su sede.
3. `ROLE_DIR_CARRERA`:
   - **Sedes**: Confinado a sus sedes asignadas. Si tiene 1, se bloquea con 🔒; si tiene varias, solo puede alternar entre ellas.
   - **Carreras**: Confinado a sus carreras asignadas. Si administra 1 carrera, se bloquea con 🔒; si administra 2 o 3 (ej. Sistemas + Electrónica + Sonido), el menú desplegable le permite cambiar exclusivamente entre sus carreras.
4. `ROLE_DOCENTE`: Acceso exclusivo a sus asignaciones de aula en Vista 1. No tiene acceso a la supervisión directiva de Vista 2.

### 5.2 Soporte para Docentes Multi-Sede
Para casos donde un docente dicta cátedra en dos o más sedes universitarias (ej. La Paz y El Alto, o Cochabamba e Ivirgarzama):
- La consulta de grupos al Gateway no aplica filtro fijo de sede para docentes (`/api/v1/catalogo-academico/groups?term=2-2026&teacherCi=${ci}`).
- El sistema agrupa y presenta todas sus materias en una sola vista.
- Cada tarjeta de asignatura y registro en el menú lateral muestra explícitamente su distintivo de campus y sede (`📍 CBA • Campus Juan Pablo II`, `📍 IVI • Sede Ivirgarzama`), permitiendo al docente elaborar sus planificaciones sin tener que cerrar sesión ni cambiar de usuario.

---

## 6. Motor Curricular Universal y Prevención de Amontonamiento

Para evitar que materias de carreras sin plan estático se acumulen erróneamente en el 1º Semestre o reciban códigos genéricos (`SIS-101`), el controlador incorpora un motor inteligente en dos fases:

1. **Alineación Oficial Estricta**:
   - **Medicina Humana**: Las 65 asignaturas están mapeadas con sus códigos oficiales `MED-111` a `MED-528` distribuidas de manera exacta en sus 10 semestres.
   - **Ingeniería de Sistemas**: Las 47 asignaturas oficiales mapeadas con `SIS-111` a `SIS-425` en 8 semestres.
2. **Balanceador Universal Heurístico (22 Carreras Restantes)**:
   - Extrae niveles académicos en números romanos:
     - ` V` / `(V)` -> Semestres 9-10 (o semestre 8 si la carrera es de 8).
     - ` IV` / `(IV)` -> Semestres 7-8.
     - ` III` / `(III)` -> Semestres 5-6.
     - ` II` / `(II)` -> Semestres 3-4.
     - ` I` / `(I)` -> Semestres 1-2.
   - Palabras clave terminales (`Titulación`, `Graduación`, `Internado`, `Clínica Integral`) se ubican en el último semestre (`maxSemesters`).
   - Palabras clave iniciales (`Introducción`, `Básica`, `Fundamentos`, `Técnicas de Estudio`, `Romano`) se ubican en el 1º Semestre.
   - Asignaturas restantes: Distribución balanceada mediante hash determinístico para garantizar una carga homogénea (5 a 7 materias por semestre).
   - Códigos generados automáticamente: `${PREFIJO_CARRERA}-${SEMESTRE}0${INDICE}` (ej. `DER-101`, `DER-201`, `ODO-301`, `VET-402`), erradicando duplicados.
3. **Aislamiento de Cátedras Comunes**:
   - Asignaturas biomédicas como `Bioestadística` en Medicina quedan aisladas y no se vinculan como "Comunes con Ing. Comercial / Financiera". La condición común solo aplica si existe un `groupLinkId` real en el Gateway o si pertenecen a la misma facultad (ej. Sistemas con Electrónica).

---

## 7. Historial de Correcciones Críticas y Deuda Técnica Resuelta

| Error / Incidencia | Causa Raíz | Solución Implementada |
|:---|:---|:---|
| **Violación de unicidad `uq_plan_momento`** | Hibernate ejecutaba inserts antes de deletes al limpiar y recrear la colección de momentos con `orphanRemoval`. | Modificación in-place en `ScuSavePlanClaseCmd.java`: actualización de momentos existentes por tipo (`tipoMomento`) y eliminación quirúrgica de sobrantes. |
| **HTTP 500 en `/actuator/health`** | Dependencia `spring-boot-starter-actuator` ausente en el `pom.xml`. | Se adoptó `/api/v1/catalogo-academico/status` y endpoints de negocio como healthchecks fiables. |
| **HTTP 415 en Login con Gateway** | El token endpoint del Gateway requería `application/x-www-form-urlencoded` en vez de JSON. | Centralización del ciclo de vida del token dentro de `UnitepcGatewayClient` de Spring Boot con caché de token Bearer. |
| **CARRERA select invisible** | Si el usuario era Director y `careersToShow` filtraba a 0 resultados, el `<select>` quedaba sin `<option>` y colapsaba. | Fallback resiliente: Si el filtrado resulta en vacío, restaura las carreras de respaldo o el catálogo completo para que el selector nunca desaparezca. |
| **Cambio de Sede no actualizaba grupos** | En `renderSupervisionCurricular` el `branchId` estaba hardcodeado al UUID de Cochabamba. | Lookup dinámico del UUID de la sede desde `window.__SUPERVISION_SEDES_MAP__` y clave de caché independiente `sisa_cache_supervision_groups_${sede}_${career}`. |
| **Recarga (F5) reseteaba a Dashboard** | No se persistía la vista activa, la asignatura en auditoría ni la pestaña en `localStorage`. | Persistencia en tiempo real de `sisa_active_view`, `sisa_active_materia_key` y `sisa_active_doc_tab` con restauración automática en `initSisaDashboard()`. |
| **Desincronización de Sesiones en Tab 5** | `loadAttendanceForCurrentSelection` forzaba `match = courseOfficialSessions[0]`, dejando las insignias desincronizadas con la macroplanificación. | Eliminación del forzado arbitrario, exposición global de `courseOfficialSessions` y sincronización unificada en `onAttendanceSessionSelect` y `applySelectedSession`. |
| **Arrastre de Asistencia entre Clases** | `currentAttendanceSession.estudiantes` no se reseteaba al conmutar sesión, heredando marcas previas en sesiones no tomadas. | Reseteo estricto del mapa de estudiantes en `loadAttendanceForDate` con inicialización limpia (`PRESENTE`) por sesión y cohorte. |
| **Estructura Estática Teórica vs Práctica** | La tarjeta de Macroplanificación no conmutaba los campos según la modalidad de la sesión. | Conmutación dinámica: Despliega Matriz 7 (Saberes) en clases teóricas y Sección 8 (Actividad, Desempeño, Evidencias, Rúbrica) en clases de laboratorio. |

---

## 8. Estado del Proyecto: Lo que Tenemos vs Lo que Falta

### 8.1 Lo que Tenemos (Implementado al 100%)

| Módulo / Capacidad | Estado | Descripción Funcional |
|:---|:---:|:---|
| **Arquitectura Docker Universal** | ✅ 100% | Despliegue de Postgres, Spring Boot backend y Angular frontend con Nginx. Base de datos con seeder universal demo V9. |
| **Gobernanza RBAC y Catálogo Nacional** | ✅ 100% | 9 sedes, 24 carreras, soporte docente multisede, candados por rol directivo y balanceador heurístico universal. |
| **Documento 1: Programa Analítico** | ✅ 100% | Estructura oficial de 14 puntos, validación APA 7ma, importación bidireccional desde Word (.docx) y bloqueo de cátedra. |
| **Documento 2: PAC Pedagógico** | ✅ 100% | Puntos 1 a 14 articulados con los elementos de competencia del Programa Analítico. |
| **Documento 3: Cronograma Semestral (20 Semanas)** | ✅ 100% | Cronograma Teórico (Matriz 7) y Cronograma Práctico (Sección 8 del PAC Práctico) con importadores Excel (.xlsx). |
| **Documento 4: Planes de Clase** | ✅ 100% | Microdidáctica modular por Unidad de Aprendizaje, planes teóricos y guías prácticas, exportación Excel multi-hoja. |
| **Documento 5: Lista Oficial y Asistencia** | ✅ 100% | Selector reactivo según horario SEA, cálculo de Regla del 80%, segregación por carrera en cátedras comunes y exportación Excel. |
| **Seguimiento Pedagógico en Aula** | ✅ 100% | Secuencia didáctica de 5 momentos oficiales UNITEPC, macroplanificación dinámica teórica/práctica, registro ágil (< 5 seg). |
| **Supervisión Curricular y Semáforo** | ✅ 100% | Tablero directivo con semáforo porcentual por colores, auditoría de momentos didácticos, visado en lote y actas de semestre. |
| **Persistencia y Resiliencia de Navegación** | ✅ 100% | Cero reseteos al presionar F5; tolerancia offline a caídas del SEA Gateway con almacenamiento local seguro. |

### 8.2 Lo que Nos Falta (Roadmap Institucional Pendiente)

| Requerimiento / Hito Pendiente | Prioridad | Impacto / Alcance Institucional |
|:---|:---:|:---|
| **1. Módulo de Firma Digital Criptográfica** | Alta | Firma digital con certificado de Directores de Carrera sobre los reportes PDF de planes de clase y planillas de asistencia para validez legal ante el Viceministerio de Educación Superior. |
| **2. Bloqueo Automatizado de Actas en el SEA** | Alta | Enlace directo del cálculo del 80% de asistencia para bloquear automáticamente la carga de notas del 1º y 2º Parcial a estudiantes inhabilitados en el sistema central. |
| **3. Sistema de Notificaciones Tempranas y Alertas** | Media | Disparador de alertas automáticas (vía WhatsApp API / Correo institucional) a estudiantes con 2 o más faltas consecutivas y avisos al docente sobre rezago en la Matriz 7. |
| **4. App Móvil PWA con Marcación QR de Aula** | Media | Aplicación progresiva offline-first para docentes que permita tomar lista en el laboratorio o aula escaneando la credencial digital o carnet del estudiante desde el celular. |
| **5. Tablero Comparativo Multisede para Vicerrectorado** | Baja | Vista analítica nacional que compare en un solo gráfico el avance porcentual y cumplimiento pedagógico de la misma cátedra entre las 9 sedes de UNITEPC. |

---

## 9. Guía de Ejecución y Despliegue Rápido

Para levantar el entorno completo desde cero:

```bash
# 1. Levantar base de datos y backend
docker compose up -d postgres backend

# 2. Reconstruir y levantar frontend con los últimos cambios
docker compose build frontend
docker compose up -d frontend

# 3. Verificar estado de contenedores
docker compose ps
```

- **Frontend SISA**: `http://localhost:4200`
- **Backend API**: `http://localhost:8080/api/v1`
- **Credenciales Rápidas de Prueba**:
  - `admin` / `Unitepc2026!` (Administrador Nacional)
  - `dir.carrera.sis` / `Unitepc2026!` (Directora Multicarrera: Sistemas + Medicina)
  - `3065087` / `3065087` (Docente Rosmery Luizaga - Programación I)
  - `9465510` / `9465510` (Docente - Cátedras Teórico-Prácticas)
