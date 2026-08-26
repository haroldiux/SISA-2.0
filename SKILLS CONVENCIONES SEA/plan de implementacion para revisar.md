# Plan de Implementación: Sistema de Planificación, Gestión y Seguimiento Académico

## 1. Pila Tecnológica del Sistema

| Capa / Dominio | Tecnología / Herramienta | Rol en el Proyecto |
| :--- | :--- | :--- |
| **Frontend** | Angular (TypeScript), SCSS | Arquitectura modular basada en convenciones (`scu-`), Standalone Components / Módulos, Signals/RxJS para reactividad. |
| **Backend** | Java con Spring Boot | API RESTful desacoplada, gestión transaccional de negocio y arquitectura limpia por capas. |
| **Seguridad** | Spring Security, JWT, RBAC | Autenticación centralizada y control de acceso basado en roles jerárquicos multisede. |
| **Motor Ingesta / Exportación** | Apache POI (`poi-ooxml`, `poi-scratchpad`) | Extracción, validación tabular y exportación sobre plantillas maestras Word (`.docx`) y Excel (`.xlsx`). |
| **Base de Datos** | PostgreSQL | Almacenamiento relacional estructurado con soporte de columnas JSONB para esquemas flexibles de contenidos. |
| **Almacenamiento de Archivos** | MinIO / S3 Compatible | Repositorio de almacenamiento seguro para documentos Office originales subidos y versiones generadas. |
| **Diseño y Prototipado** | Figma, OpenDesign Tokens | Diseño UI/UX de alta fidelidad, tokens de color, espaciado y librería de componentes atómicos. |
| **Infraestructura & Despliegue** | Docker, Docker Compose, Nginx, CI/CD | Contenerización de servicios, proxy inverso y automatización de despliegues. |

---

## 2. Fases de Implementación

### Fase 1: Arquitectura Base, Modelo de Datos y Seguridad Multirrol
* **Definición del Modelo Entidad-Relación:**
  * Estructuración de tablas maestras: Sedes, Campus, Carreras, Asignaturas, Gestiones Académicas, Aulas y Asignaciones Docentes.
  * Modelado del núcleo curricular: Planificaciones, Unidades de Aprendizaje, Sesiones PAC/Cronograma y Planes de Clase por momentos didácticos.
  * Modelado de supervisión y control: Auditorías In Situ, Actas de Verificación, Observaciones y Registro Histórico de Reincidencias.
* **Seguridad y Control de Acceso (Spring Security):**
  * Configuración de autenticación por tokens JWT sin estado (*stateless*).
  * Implementación de RBAC estricto con los 5 niveles de acceso: `DOCENTE`, `DIR_CARRERA`, `DIR_ACADEMICA`, `VICERRECTOR_SEDE` y `VICERRECTOR_NACIONAL`.
  * Filtros de visibilidad por contexto institucional (filtro transversal por Sede y Carrera según el rol activo).
* **Setup del Entorno Frontend Angular:**
  * Estructuración modular siguiendo las convenciones institucionales: directorios separados para `commands/`, `constants/`, `enums/`, `http/`, `services/` y `components/` con selector prefijado (`scu-`).
  * Integración de Design Tokens de Figma (paleta púrpura/índigo, estados semánticos, espaciado base de 8px y tipografía).

---

### Fase 2: Motor de Ingesta, Procesamiento y Exportación Office (Word & Excel)
* **Módulo de Lectura y Extracción de Datos (Apache POI):**
  * **Parser de PAC y Cronograma (`.xlsx`):** Extracción de metadatos de cabecera, justificación, competencias globales/específicas y lectura iterativa de la matriz dinámica de 20 semanas y más de 30 sesiones (temas, saberes conceptuales, procedimentales, actitudinales, criterios e instrumentos).
  * **Parser de Plan de Clases (`.xlsx`):** Extracción multi-hoja (`UA-X Tema Y`) de resultados de aprendizaje, logros, indicadores, estrategias didácticas y desglose de la secuencia didáctica por momentos (*Introducción, Logros, Contenidos, Cuerpo y Cierre* con sus duraciones).
  * **Parser de Programa Analítico (`.docx`):** Extracción de tablas de identificación, unidades temáticas jerárquicas y bibliografía básica/complementaria.
* **Motor de Validación de Integridad:**
  * Algoritmo de verificación de consistencia: coherencia entre la cantidad de temas del Programa Analítico vs. el PAC y las sesiones del Plan de Clases.
  * Detección automática de celdas vacías críticas, inconsistencias en carga horaria y formato de columnas.
* **Motor de Exportación Fiel a Plantilla (*Template Cloner*):**
  * Generación de archivos descargables en `.docx` y `.xlsx` inyectando la información persistida en base de datos sobre los formatos oficiales universitarios, preservando estilos y tablas intactas.

---

### Fase 3: Módulos de Operación Académica (Docente y Dirección de Carrera)
* **Módulo Docente (`scu-docente-planning`):**
  * Interfaz de selección de materia asignada y gestión académica activa.
  * Hub de carga de los 3 documentos oficiales mediante áreas *drag-and-drop*.
  * Visor de previsualización inmediata post-procesamiento con indicadores de error/alerta por fila.
  * Editor tabular de contingencia para modificar datos extraídos directamente en la plataforma antes del envío oficial.
* **Módulo de Dirección de Carrera (`scu-career-oversight`):**
  * Tablero de control de asignaturas agrupadas por semestres (1° a 10° semestre).
  * Matriz semafórica de avance documental (*Borrador, En Revisión, Observado, Aprobado*).
  * Visor de validación comparativa y consolidada de la materia.
  * Flujo de retroalimentación: marcado de observaciones puntuales al docente o botón de aprobación definitiva de la planificación de la carrera.

---

### Fase 4: Módulo de Auditoría In Situ (Dirección Académica)
* **Configuración del Mapeo Físico y Horario:**
  * Catálogo de sedes, campus (ej. Campus Juan Pablo II), bloques, aulas y franjas horarias por turno.
  * Motor de cruce en tiempo real: consulta instantánea de qué materia, qué docente y qué tema del Plan de Clases/PAC corresponde impartir en un aula y hora exacta.
* **Módulo de Auditoría en Campo (`scu-academic-audit`):**
  * Vista optimizada para tablets/dispositivos móviles para el Director Académico.
  * Formulario ágil de verificación in situ: presencia docente, correspondencia del tema dictado con el planificado, recursos didácticos utilizados y registro de asistencia aproximada.
  * Emisión inmediata de Acta Digital de Auditoría con copia automática y notificación de incidentes a Vicerrectorado Sede.

---

### Fase 5: Módulos Estratégicos y Toma de Decisiones (Vicerrectorados)
* **Módulo de Vicerrectorado Sede (`scu-regional-analytics`):**
  * Tablero regional de métricas: % de cumplimiento de entrega por carreras de la sede, tiempos promedio de validación y volumen de auditorías realizadas.
  * Matriz de Control de Reincidencias: historial de atrasos, incumplimientos de avance curricular y llamadas de atención por docente.
  * Gestor de Planes de Acción: módulo para asentar resoluciones institucionales, seguimiento disciplinario e informes para procesos de recontratación o desvinculación.
* **Módulo de Vicerrectorado Nacional (`scu-executive-dashboard`):**
  * Macro-tablero analítico multisede (Cochabamba, La Paz, El Alto, Cobija).
  * Filtros multidimensionales en tiempo real para análisis comparativo entre facultades y carreras a nivel país.
  * Generador de reportes ejecutivos consolidados con exportación automatizada a PDF y matrices Excel.

---

### Fase 6: Calidad (QA), Pruebas de Carga y Despliegue
* **Aseguramiento de Calidad:**
  * Pruebas unitarias y de integración para los motores de parseo de Apache POI contra múltiples variantes de archivos Office reales.
  * Pruebas End-to-End (E2E) para verificar el ciclo de vida completo: Carga Docente -> Aprobación de Carrera -> Auditoría In Situ -> Impacto en Reporte Nacional.
* **Optimización y Despliegue:**
  * Empaquetado en contenedores Docker independientes (Frontend Nginx, Backend Spring Boot, Base de Datos PostgreSQL y Storage MinIO).
  * Configuración de CI/CD para despliegue automatizado en entornos de *Staging* y *Producción*.
  * Pruebas de estrés y procesamiento asíncrono para cargas masivas de archivos en periodos pico de inicio de semestre.