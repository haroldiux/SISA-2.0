# Plan de Implementación: Sistema de Planificación, Gestión y Seguimiento Académico (SISA)

## 1. Pila Tecnológica del Sistema

| Capa / Dominio | Tecnología / Herramienta | Rol en el Proyecto |
| :--- | :--- | :--- |
| **Frontend** | Angular (TypeScript), SCSS, PrimeNG, Tailwind | Arquitectura modular basada en convenciones (`scu-`), Standalone Components / Módulos, Signals/RxJS para reactividad y paleta institucional *unitepc-pro*. |
| **Backend** | Java 21 con Spring Boot 3.3+ | API RESTful desacoplada, gestión transaccional de negocio, arquitectura limpia por capas y cliente Gateway OAuth2 M2M. |
| **Seguridad** | Spring Security, JWT, RBAC | Autenticación centralizada y control de acceso basado en roles jerárquicos multisede (`DOCENTE`, `DIR_CARRERA`, `DIR_ACADEMICA`, `VICERRECTOR_SEDE`, `VICERRECTOR_NACIONAL`). |
| **Integración Gateway SEA** | REST Client, OAuth2 M2M, Records DTO | Conexión con `gw-dev.unitepc.solutions` para sincronización de Sedes, Carreras, Pensum, Grupos, Aulas, Docentes y Estudiantes. |
| **Motor Ingesta / Exportación** | Apache POI (`poi-ooxml`, `poi-scratchpad`) | Extracción, validación tabular y exportación sobre plantillas maestras Word (`.docx`) y Excel (`.xlsx`). |
| **Base de Datos & Caché** | PostgreSQL 16 (Flyway) | Almacenamiento relacional estructurado, tablas espejo para catálogo académico SEA (patrón ACL/Cache-Aside) y columnas JSONB. |
| **Almacenamiento de Archivos** | MinIO / S3 Compatible | Repositorio de almacenamiento seguro para documentos Office originales subidos y versiones generadas. |
| **Infraestructura & Despliegue** | Docker, Docker Compose, Nginx, CI/CD | Contenerización de servicios, proxy inverso y automatización de despliegues. |

---

## 2. Fases de Implementación con Integración del Gateway SEA

### Fase 1: Arquitectura Base, Modelo de Datos, Seguridad y Gateway Central SEA
* **Cliente Gateway Institucional (OAuth 2.0 M2M):**
  * Configuración en `application.yml` (`gateway-base-url: https://gw-dev.unitepc.solutions`, `client-id`, `client-secret`, `system-client-id`).
  * Implementación de `UnitepcGatewayClient.java` con `RestClient` de Spring Boot 3.3 y auto-renovación thread-safe del Token JWT (expiración a 300s con margen de 30s).
  * Creación de Records DTO en Java 21 (`TokenResponseDto`, `BranchOfficeDto`, `CareerDto`, `CourseDto`, `GroupItemDto`, `StudentItemDto`, `CampusDto`, `TimeFrameDto`).
  * Creación del controlador proxy `/api/v1/catalogo-academico` (`CatalogoAcademicoController.java`).
* **Modelo Entidad-Relación y Tablas Espejo (Flyway):**
  * Migraciones Flyway para catálogo académico sincronizado: `sea_sedes`, `sea_carreras`, `sea_materias`, `sea_grupos` (Patrón Anti-Corruption Layer y Cache-Aside).
  * Estructuración del núcleo curricular y supervisión: Planificaciones, Unidades, Sesiones PAC, Planes de Clase por 5 momentos didácticos, Auditorías In Situ y Actas.
* **Seguridad y Control de Acceso (Spring Security):**
  * Configuración de autenticación JWT y RBAC con los 5 niveles jerárquicos multisede.
  * Filtros de visibilidad transversal por Sede y Carrera según el rol activo.
* **Setup del Frontend Angular & Insignia de Conexión Live:**
  * Creación de `UnitepcGatewayService` en Angular con Signals para monitoreo de estado de conexión (`seaStatus: 'online' | 'offline'`).
  * Integración del badge institucional **Live / Offline** en el Sidebar/Header y paleta institucional *unitepc-pro* (Púrpura `#7B47B8`, Teal `#1F9FAD`).

---

### Fase 2: Motor de Ingesta, Procesamiento y Exportación Office (Word & Excel)
* **Módulo de Lectura y Extracción de Datos (Apache POI):**
  * **Parser de PAC y Cronograma (`.xlsx`):** Extracción de metadatos de cabecera, competencias y lectura iterativa con anclas semánticas (`SEC_7`) de la matriz de sesiones (resiliente a cualquier número de semanas o sesiones).
  * **Parser de Plan de Clases (`.xlsx`):** Extracción dinámica multi-hoja (`UA-X Tema Y`) de resultados de aprendizaje, saberes (conceptual, procedimental, actitudinal), estrategias didácticas y desglose por 5 momentos (*Introducción, Logros, Contenidos, Cuerpo y Cierre* con minutos configurables y respeto a celdas vacías).
  * **Parser de Programa Analítico (`.docx`):** Extracción de tablas de identificación, unidades temáticas jerárquicas y bibliografía básica/complementaria.
* **Motor de Validación de Integridad:**
  * Algoritmo de coherencia: validación cruzada entre temas del Programa Analítico vs. PAC vs. Planes de Clase.
  * Vinculación con los códigos oficiales del pensum (`syllabusCourseId`) obtenidos del Gateway SEA.
* **Motor de Exportación Fiel a Plantilla (*Template Cloner*):**
  * Inyección de datos persistidos en plantillas maestras `.docx` y `.xlsx` preservando diseño original institucional.

---

### Fase 3: Módulos de Operación Académica (Docente y Dirección de Carrera)
* **Módulo Docente (`scu-docente-planning`):**
  * Consumo directo de `timeFrames/active` para fijar la gestión académica vigente (ej. `2-2026`).
  * Carga dinámica de materias y grupos asignados mediante `courses` y `groups` del Gateway.
  * Hub de carga de los 3 documentos oficiales mediante *drag-and-drop* y editor tabular reactivo de contingencia.
* **Módulo de Dirección de Carrera (`scu-career-oversight`):**
  * Generación de la malla curricular semestral (1° a 10° semestre) a partir de `courses` del Gateway.
  * Visualización de docentes titulares asignados a cada grupo (`groups`) con semáforo de entrega (*Borrador, En Revisión, Observado, Aprobado*).
  * Flujo de observaciones y aprobación definitiva de la planificación de la carrera.

---

### Fase 4: Módulo de Auditoría In Situ (Dirección Académica)
* **Cruce en Tiempo Real con Infraestructura y Nómina Oficial:**
  * Consumo de `campuses` y `groups` (aula, horario, campus) para mapeo físico en tiempo real.
  * Consumo de `students/byGroup` para descargar la nómina oficial de alumnos inscritos al auditar un aula.
* **Módulo de Auditoría en Campo (`scu-academic-audit`):**
  * Vista adaptada para tablets del Director Académico: selección de Campus -> Bloque -> Aula.
  * Cruce automático: muestra qué materia, docente y tema planificado corresponde en ese minuto exacto.
  * Formulario ágil de verificación in situ, control de asistencia con nómina y emisión inmediata de Acta Digital de Auditoría.

---

### Fase 5: Módulos Estratégicos y Toma de Decisiones (Vicerrectorados)
* **Módulo de Vicerrectorado Sede (`scu-regional-analytics`):**
  * Agregación de indicadores de cumplimiento por carreras de la sede (`careers`).
  * Matriz de Control de Reincidencias, historial de atrasos y gestor de Planes de Acción disciplinarios.
* **Módulo de Vicerrectorado Nacional (`scu-executive-dashboard`):**
  * Macro-tablero analítico multisede consolidado con datos de `branchOffices` (Cochabamba, La Paz, El Alto, Cobija, Santa Cruz).
  * Filtros multidimensionales en tiempo real y exportación de reportes ejecutivos consolidados a PDF y Excel.

---

### Fase 6: Aseguramiento de Calidad (QA), Pruebas de Resiliencia y Despliegue
* **Pruebas de Integración y Resiliencia del Gateway:**
  * Pruebas unitarias y de integración de `UnitepcGatewayClient` con WireMock / MockWebServer.
  * Validación del ciclo de vida del token M2M (renovación automática antes de expiración).
  * Pruebas de resiliencia Offline: verificación de que el sistema continúa operando con la caché de PostgreSQL ante micro-cortes del Gateway externo.
* **Pruebas de Ingesta Office:**
  * Pruebas automatizadas con múltiples variantes de archivos Office reales.
* **Empaquetado y Despliegue:**
  * Contenedores Docker (Frontend Nginx, Backend Spring Boot, PostgreSQL 16 y MinIO).
  * Pipelines de CI/CD para Staging y Producción.