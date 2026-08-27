# Exploration: 04-sea-gateway-integration

## 1. Feature Overview
Integration of the SISA system with the UNITEPC Central Gateway APIs (https://gw-dev.unitepc.solutions). This integration enables SISA to securely fetch and synchronize institutional academic structures including Branches (Sedes), Careers, Courses (Materias), Groups, Teachers, Students, and Active TimeFrames.

## 2. Technical Context & Constraints

### Backend (Spring Boot 3.3 / Java 21)
* **Authentication**: OAuth2 M2M (Machine to Machine) flow via client_credentials grant type. The token has a TTL of 300 seconds and requires thread-safe auto-renewal (30s buffer before expiration).
* **Client Implementation**: Utilize Spring's RestClient within UnitepcGatewayClient to fetch data, providing Authorization: Bearer <token> and clientId: <system_client_id> headers.
* **Proxy Controllers**: Expose proxy endpoints under /api/v1/catalogo-academico/* (e.g., CatalogoAcademicoController) to allow the frontend to safely interact with the gateway data.
* **Database Mirroring (ACL)**: Flyway migrations to create mirror tables (sea_sedes, sea_carreras, sea_materias, sea_grupos) in PostgreSQL 16. This adheres to the Anti-Corruption Layer (ACL) and Cache-Aside patterns, providing resilience against upstream downtime.

### Frontend (Angular 17+)
* **Reactivity**: A dedicated UnitepcGatewayService using Angular Signals (seaStatus: signal<'online' | 'offline' | 'sync'>) to monitor and broadcast the connection status.
* **UI/UX Integration**: Implementation of a Live/Offline status badge located in the Sidebar/Header, indicating real-time connectivity to the academic catalog.
* **Design System**: Strict adherence to the unitepc-pro color palette (Primary Purple #7B47B8, Secondary Teal #1F9FAD) and typography (Geist, Geist Mono).

## 3. Architecture & Integration Strategy
SISA's architecture incorporates a transparent proxying layer coupled with resilient local caching:
1. **Direct Proxying**: The Angular frontend calls the Spring Boot proxy endpoints, which in turn seamlessly route the requests to the Central Gateway using the managed OAuth2 credentials.
2. **Offline Resilience (Cache-Aside)**: Mirror tables in PostgreSQL (sea_*) ensure critical operational data is persisted locally. If the Central Gateway becomes unresponsive, the system can fallback to this localized cache, ensuring uninterrupted institutional operations.
3. **Reactive UI State**: The frontend uses reactive state management (Signals) to reflect network interruptions immediately through the UI badge, managing user expectations.

## 4. Implementation Plan
1. **Database & Properties**: Configure application.yml with gateway credentials and create V1__catalogo_sea.sql for the mirror tables.
2. **DTOs & Client**: Implement Java 21 Records for the Gateway payloads (e.g., BranchOfficeDto, CourseDto) and build the UnitepcGatewayClient with synchronized token handling.
3. **Controller**: Create CatalogoAcademicoController to act as the intermediary for the frontend.
4. **Angular Service**: Develop unitepc-gateway.service.ts to manage API calls and connection state (seaStatus).
5. **Component Updates**: Refactor the main layout/sidebar component to incorporate the Gateway status badge and connection indicators.

## 5. Risks & Considerations
* **Concurrency on Token Renewal**: The getToken() method must be properly synchronized to prevent multiple threads from concurrently requesting new tokens when the TTL expires.
* **Data Staleness**: Establish clear guidelines on how often the mirror tables (sea_*) should be updated to prevent local data from drifting from the master records in the UNITEPC Central Gateway.
