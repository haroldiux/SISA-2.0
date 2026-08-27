# Technical Design: 04-sea-gateway-integration

## 1. DTO Records (Gateway Payloads)
Implement Java 21 Records in `com.xpertiflow.evaluaciones.api.dto.gateway`:
* `TokenResponseDto(String accessToken, String tokenType, Integer expiresIn)`
* `BranchOfficeDto(String id, String code, String name)`
* `CareerDto(String id, String code, String name, String branchOfficeCode)`
* `CourseDto(String id, String code, String name, Integer semester, String syllabusCourseId, String careerCode)`
* `GroupItemDto(String id, String name, String classType, String teacherName, String teacherCi, String classroom, String schedule, String campus, Integer enrolledStudentsCount)`
* `StudentItemDto(String id, String code, String firstName, String firstLastName, String secondLastName)`
* `CampusDto(String id, String name, String branchOfficeId)`
* `TimeFrameDto(String id, String name, String year, String term, Boolean active)`

## 2. UnitepcGatewayClient
*   Use Spring `RestClient` to interact with `https://gw-dev.unitepc.solutions`.
*   Implement synchronized `getToken()` method:
    *   Check if `tokenExpiration` minus 30s is after `Instant.now()`.
    *   If valid, return existing token.
    *   Otherwise, call `/auth/token` with `client_credentials`, update token and expiration, and return.
*   Fetch data methods (e.g., `getBranchOffices()`, `getCareers()`) append `Authorization: Bearer <token>` and `clientId` headers.

## 3. CatalogoAcademicoController
*   Path: `/api/v1/catalogo-academico`
*   Endpoints:
    *   `GET /branchOffices` -> `List<BranchOfficeDto>`
    *   `GET /careers?branchOfficeCode={code}` -> `List<CareerDto>`
    *   `GET /courses?branchOfficeCode={code}&careerCode={code}` -> `List<CourseDto>`
    *   `GET /students/byGroup?groupId={id}` -> `List<StudentItemDto>`

## 4. Database Mirroring (Flyway Schema)
Create `V4__catalogo_sea.sql`:
```sql
CREATE TABLE sea_sedes (
    id VARCHAR(64) PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE sea_carreras (
    id VARCHAR(64) PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    sede_codigo VARCHAR(20) REFERENCES sea_sedes(codigo)
);

CREATE TABLE sea_materias (
    id VARCHAR(64) PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    semestre SMALLINT NOT NULL DEFAULT 1,
    syllabus_course_id VARCHAR(64) NULL,
    carrera_id VARCHAR(64) REFERENCES sea_carreras(id)
);

CREATE TABLE sea_grupos (
    id VARCHAR(64) PRIMARY KEY,
    codigo_grupo VARCHAR(20) NOT NULL,
    tipo_clase VARCHAR(20) NOT NULL DEFAULT 'TEORICA',
    docente_nombre VARCHAR(150) NOT NULL,
    docente_ci VARCHAR(30) NULL,
    horario VARCHAR(80) NULL,
    aula VARCHAR(50) NULL,
    campus VARCHAR(100) NULL,
    materia_id VARCHAR(64) REFERENCES sea_materias(id)
);
```

## 5. Angular Frontend integration
### UnitepcGatewayService
*   Use Angular 17+ `signal` for connection tracking: `public readonly seaStatus = signal<'online' | 'offline' | 'sync'>('online');`
*   In HTTP requests to `/api/v1/catalogo-academico/*`, use `.pipe(tap(...))` to update `seaStatus` based on success or failure.

### Sidebar Live/Offline Indicator
*   Inject `UnitepcGatewayService`.
*   Use conditional template rendering (e.g., `@if (gateway.seaStatus() === 'online')`) to display:
    *   **Live**: Emerald green styling (`bg-emerald-100 text-emerald-800`).
    *   **Offline**: Rose red styling with animation (`bg-rose-100 text-rose-800 animate-pulse`).
*   Follow the `unitepc-pro` design system colors.
