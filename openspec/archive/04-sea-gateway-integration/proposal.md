# Proposal: 04-sea-gateway-integration

## Intent
Integrate the SISA system with the UNITEPC Central Gateway APIs (`https://gw-dev.unitepc.solutions`) using an OAuth 2.0 M2M flow. This enables SISA to synchronize master institutional academic structures (Branches, Careers, Courses, Groups, Students, and Active Timeframes) securely and efficiently.

## In/Out Scope
**In Scope:**
*   Backend integration using Spring Boot 3.3 `RestClient` and OAuth2 `client_credentials` with thread-safe token renewal.
*   Proxy REST controllers (`/api/v1/catalogo-academico/*`) to expose centralized data to the frontend.
*   Database mirroring (PostgreSQL `sea_*` tables) adhering to Anti-Corruption Layer (ACL) and Cache-Aside patterns via Flyway.
*   Angular 17+ reactive service (`UnitepcGatewayService`) using Signals to monitor connection state (`seaStatus`).
*   UI integration of a real-time Live/Offline connectivity badge in the sidebar.

**Out of Scope:**
*   Modifications or enhancements to the UNITEPC Central Gateway APIs.
*   Bi-directional synchronization (SISA acts as a read-only client).

## Approach
The architecture implements a transparent proxy coupled with a resilient local cache. The Angular frontend will call Spring Boot proxy endpoints, which seamlessly route requests to the Gateway using managed OAuth2 credentials. To provide offline resilience, critical operational data is mirrored locally in PostgreSQL. If the Gateway is unresponsive, the system gracefully degrades to this local cache. The UI leverages Angular Signals to reactively reflect the connection status, ensuring users are aware of potential network interruptions.

## Affected Areas
*   **Backend:** `application.yml` (Gateway properties), `UnitepcGatewayClient`, `CatalogoAcademicoController`, Gateway DTOs.
*   **Database:** `V1__catalogo_sea.sql` for mirror tables (`sea_sedes`, `sea_carreras`, `sea_materias`, `sea_grupos`).
*   **Frontend:** `unitepc-gateway.service.ts`, `sidebar.component.ts` (Live/Offline badge).

## Risks
*   **Token Concurrency:** Multiple threads attempting to renew the 300s TTL token simultaneously.
*   **Data Staleness:** Local mirror tables drifting from the centralized master records if sync intervals are not optimally tuned.

## Rollback Plan
Revert the backend feature branch, delete the Flyway migration (and drop `sea_*` tables), and revert the Angular sidebar component changes.

## Success Criteria
*   OAuth2 tokens auto-renew safely (30s buffer) across concurrent requests.
*   Angular UI accurately displays "Live" (green) or "Offline" (red pulse) status.
*   Mirror tables populate successfully without corrupting existing SISA schemas.
