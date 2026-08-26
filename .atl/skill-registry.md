# SISA • Skill & Convention Registry
**Sistema de Planificación, Gestión y Seguimiento Académico**

Este registro documenta las habilidades (skills), convenciones y directrices de ingeniería configuradas para el proyecto **SISA**, abarcando tanto el ecosistema Frontend (Angular / PrimeNG / Tailwind) como Backend (Java Spring Boot / PostgreSQL / Apache POI) y Arquitectura General.

---

## 1. Resumen de Convenciones Base

### Frontend (SEA / Angular Architecture)
- **Documento Fuente**: [.atl/conventions-frontend.md](file:///c:/PROYECTOS/SISA/.atl/conventions-frontend.md)
- **Prefijo Institucional**: `scu-` (*Sea Core University*) obligatorio en selectores, componentes, directivas y nombres de archivo.
- **Formato de Archivo**: Kebab-case con prefijo (e.g. `scu-docente-planning.component.ts`).
- **Estructura por Feature**:
  - `commands/`: Patrón Command para acciones y orquestación de UI.
  - `components/`: Smart/Container y Dumb/Presentational components.
  - `constants/`: Constantes inmutables de la feature.
  - `enums/`: Enums de dominio y estado.
  - `http/`: Definiciones de contratos HTTP, requests y responses tipadas.
  - `services/`: Lógica de negocio y facades de servicios.
- **UI Stack**: Angular 15+, PrimeNG con Theme PrimeUI, Tailwind CSS para utilidades, SCSS para estilos encapsulados.
- **Gestión de Estado**: NGXS State Management (Actions, States, Selectors) y Signals / RxJS.

### Backend (Java Spring Boot / Hexagonal Architecture)
- **Documento Fuente**: [.atl/conventions-backend.md](file:///c:/PROYECTOS/SISA/.atl/conventions-backend.md)
- **Stack**: Java 21+, Spring Boot 3+, Spring Data JPA, Spring Security con JWT Stateless y RBAC.
- **Persistencia**: PostgreSQL con extensiones JSONB para contenido curricular dinámico.
- **Motor de Ingesta & Exportación**: Apache POI (`poi-ooxml`, `poi-scratchpad`) para extracción, validación tabular y exportación sobre plantillas maestras Word (`.docx`) y Excel (`.xlsx`).
- **Estructura Modular & Clean Code**:
  - `api/`: Controllers RESTful, endpoints expuestos, validaciones DTO (`@Valid`).
  - `service/`: Casos de uso de negocio puros, transacciones (`@Transactional`), orquestación.
  - `model/` / `entity/`: Entidades JPA mapeadas y Domain Value Objects.
  - `repository/`: Interfaces Spring Data JPA / PostgreSQL queries optimizadas.
  - `util/` / `parser/`: Parsers y Template Cloners de Office.
- **Reglas de Código**:
  - Límite de 120 caracteres por línea, indentación de 4 espacios.
  - Estructura de clase estricta: Constantes estáticas (`PUBLIC` -> `PROTECTED` -> `PRIVATE`), variables de instancia, constructores en orden de sobrecarga, métodos.
  - Mensajes de excepción descriptivos y manejo de errores centralizado (`@ControllerAdvice`).

---

## 2. Catálogo de Habilidades (Skills en `.agent/skills/`)

### Categoría 1: Arquitectura y Patrones Frontend
| Skill | Directorio | Descripción |
| :--- | :--- | :--- |
| `frontend-architecture-builder-pattern` | [.agent/skills/frontend-architecture-builder-pattern](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-architecture-builder-pattern) | Reglas y directrices para la implementación del patrón Builder en el frontend. |
| `frontend-architecture-command-pattern` | [.agent/skills/frontend-architecture-command-pattern](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-architecture-command-pattern) | Reglas y directrices para el patrón Command en orquestación de operaciones UI. |
| `frontend-architecture-microfrontend` | [.agent/skills/frontend-architecture-microfrontend](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-architecture-microfrontend) | Arquitectura de microfrontends con Module Federation en Angular. |
| `frontend-architecture-monorepo` | [.agent/skills/frontend-architecture-monorepo](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-architecture-monorepo) | Guía y estructura del Monorepo Angular SEA. |
| `frontend-architecture-project-structure` | [.agent/skills/frontend-architecture-project-structure](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-architecture-project-structure) | Estructura canónica de carpetas y organización de proyectos frontend. |

### Categoría 2: Comandos y Scaffolding (/cmd)
| Skill | Directorio | Descripción |
| :--- | :--- | :--- |
| `frontend-cmd-init-project` | [.agent/skills/frontend-cmd-init-project](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-cmd-init-project) | Instrucciones de scaffolding y referencia para `/init-project:monorepo`. |
| `frontend-cmd-new-feature` | [.agent/skills/frontend-cmd-new-feature](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-cmd-new-feature) | Scaffolding de nuevas features en la arquitectura modular (`/project:new-feature`). |
| `frontend-cmd-new-library` | [.agent/skills/frontend-cmd-new-library](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-cmd-new-library) | Generación y configuración de nuevas librerías (`/project:new-library`). |
| `frontend-cmd-review` | [.agent/skills/frontend-cmd-review](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-cmd-review) | Procedimiento de revisión estática de código y cumplimiento de convenciones. |
| `frontend-init-project` | [.agent/skills/frontend-init-project](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-init-project) | Orquestador maestro de inicialización de monorepo. |
| `frontend-init-project-skill` | [.agent/skills/frontend-init-project-skill](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-init-project-skill) | Wrapper y metadatos de ejecución para inicialización de proyectos. |

### Categoría 3: Convenciones de Código y TypeScript
| Skill | Directorio | Descripción |
| :--- | :--- | :--- |
| `frontend-code-conventions-naming` | [.agent/skills/frontend-code-conventions-naming](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-code-conventions-naming) | Convenciones de nombres para clases, componentes, servicios, pipes y archivos. |
| `frontend-code-conventions-typescript` | [.agent/skills/frontend-code-conventions-typescript](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-code-conventions-typescript) | Directrices de TypeScript estricto, tipos explícitos, inmutabilidad y estilo. |
| `frontend-memory-memory` | [.agent/skills/frontend-memory-memory](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-memory-memory) | Gestión de prefijos institucionales (`scu-`) y memoria de contexto frontend. |

### Categoría 4: Desarrollo Modular y Capas
| Skill | Directorio | Descripción |
| :--- | :--- | :--- |
| `frontend-development-component` | [.agent/skills/frontend-development-component](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-development-component) | Creación de componentes (Smart vs. Dumb), ciclo de vida, Inputs/Outputs tipados. |
| `frontend-development-http` | [.agent/skills/frontend-development-http](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-development-http) | Capa HTTP, contratos tipados de API, interceptores y manejo de errores. |
| `frontend-development-service` | [.agent/skills/frontend-development-service](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-development-service) | Creación e inyección de servicios singleton, facades y tokens de inyección. |
| `frontend-development-routes` | [.agent/skills/frontend-development-routes](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-development-routes) | Enrutamiento modular, lazy loading, guards de autenticación y breadcrumbs. |
| `frontend-development-modules-library-modules` | [.agent/skills/frontend-development-modules-library-modules](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-development-modules-library-modules) | Estructuración y exportación de módulos para librerías compartidas. |
| `frontend-development-modules-main-app-modules` | [.agent/skills/frontend-development-modules-main-app-modules](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-development-modules-main-app-modules) | Estructuración de módulos en la aplicación principal (`app-core`, `public`, `secure`). |

### Categoría 5: Pasos de Inicialización de Proyecto (Step-by-Step)
| Skill | Paso | Descripción |
| :--- | :--- | :--- |
| `frontend-init-project-01-folder-structure` | Paso 01 | Creación de la estructura de carpetas raíz y módulos. |
| `frontend-init-project-02-root-config` | Paso 02 | Archivos de configuración raíz (`angular.json`, `tsconfig.json`, linters). |
| `frontend-init-project-03-app-core` | Paso 03 | Core de la aplicación principal (servicios singleton, interceptores). |
| `frontend-init-project-04-module-public` | Paso 04 | Módulo público (vistas de login y acceso no autenticado). |
| `frontend-init-project-05-module-secure` | Paso 05 | Módulo seguro (shell de navegación, layouts autenticados, topbar/sidebar). |
| `frontend-init-project-06-environments` | Paso 06 | Archivos de variables de entorno (`environment.ts`, `environment.prod.ts`). |
| `frontend-init-project-07-assets` | Paso 07 | Assets globales, i18n y estilos maestros SCSS. |
| `frontend-init-project-08-library-config` | Paso 08 | Configuración del proyecto de librería Angular (`ng-package.json`). |
| `frontend-init-project-09-library-modules` | Paso 09 | Módulos de la librería (Main Module y Shared Module). |
| `frontend-init-project-10-library-welcome` | Paso 10 | Módulo inicial / Welcome de la librería. |
| `frontend-init-project-11-library-assets` | Paso 11 | Assets y estilos específicos de la librería. |

### Categoría 6: Autenticación, Estado, UI y Testing
| Skill | Directorio | Descripción |
| :--- | :--- | :--- |
| `frontend-auth-keycloak` | [.agent/skills/frontend-auth-keycloak](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-auth-keycloak) | Integración y guards con Keycloak / OIDC / JWT. |
| `frontend-state-ngxs-pattern` | [.agent/skills/frontend-state-ngxs-pattern](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-state-ngxs-pattern) | Patrón canónico de gestión de estado con NGXS. |
| `frontend-state-ngxs-anterior` | [.agent/skills/frontend-state-ngxs-anterior](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-state-ngxs-anterior) | Guía de compatibilidad de estados anteriores de NGXS. |
| `frontend-ui-primeng-tailwind` | [.agent/skills/frontend-ui-primeng-tailwind](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-ui-primeng-tailwind) | Integración de PrimeNG con utilidades Tailwind CSS PrimeUI. |
| `sea-portal-ui` | [.agent/skills/sea-portal-ui](file:///c:/PROYECTOS/SISA/.agent/skills/sea-portal-ui) | Sistema de diseño completo UNITEPC-PRO (Dark/Light theme, tokens, shell, modales, tablas). |
| `frontend-testing-unit-testing` | [.agent/skills/frontend-testing-unit-testing](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-testing-unit-testing) | Estrategia de pruebas unitarias, mocks y harnesses de testing. |
| `frontend-deployment-library-packaging` | [.agent/skills/frontend-deployment-library-packaging](file:///c:/PROYECTOS/SISA/.agent/skills/frontend-deployment-library-packaging) | Empaquetado NPM y despliegue de artefactos de librerías. |

---

## 3. Matriz de Roles y Vistas Académicas (SISA Core Domain)
1. **Docente (`scu-docente-planning`)**: Carga y edición de PAC, Plan de Clases y Programa Analítico con previsualización reactiva y contingencia tabular.
2. **Dirección de Carrera (`scu-career-oversight`)**: Supervisión semestral por cohortes (1° a 10° semestre), matriz semafórica de validación y flujos de aprobación.
3. **Dirección Académica (`scu-academic-audit`)**: Mapeo físico/horario de aulas en tiempo real, auditoría in situ en tablets y generación de actas digitales.
4. **Vicerrectorado de Sede (`scu-regional-analytics`)**: Panel regional, control de reincidencias docentes y gestión de planes de acción disciplinarios.
5. **Vicerrectorado Nacional (`scu-executive-dashboard`)**: Tablero macro multisede (Cochabamba, La Paz, El Alto, Cobija), benchmarking comparativo y reportes consolidados.
