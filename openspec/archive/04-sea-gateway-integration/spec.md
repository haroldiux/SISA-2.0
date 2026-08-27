# Specification: 04-sea-gateway-integration

## 1. Requirements
* **M2M Authentication**: Implement OAuth2 client credentials flow to authenticate with the UNITEPC Central Gateway (`https://gw-dev.unitepc.solutions`).
* **Token Management**: Auto-renew tokens with a 300s TTL, ensuring thread-safe operations and a 30-second proactive renewal buffer.
* **Proxy Controller**: Expose `/api/v1/catalogo-academico/*` endpoints to securely serve gateway data to the frontend without exposing credentials.
* **Local Mirroring**: Persist gateway master data (Branches, Careers, Courses, Groups) into PostgreSQL (`sea_*` tables) using Cache-Aside and Anti-Corruption Layer patterns for offline resilience.
* **Reactive Frontend**: Use Angular Signals (`seaStatus: signal<'online' | 'offline' | 'sync'>`) in a dedicated `UnitepcGatewayService` to track connection health.
* **UI Indicator**: Display a real-time Live (green) / Offline (red pulse) status badge in the application sidebar/header.

## 2. Given/When/Then Scenarios

### Scenario 1: Token Auto-Renewal
**Given** the current OAuth2 token has less than 30 seconds remaining before expiration
**When** a new request is made to the Gateway via `UnitepcGatewayClient`
**Then** the client synchronously requests a new token before fulfilling the request, ensuring no concurrent token requests occur.

### Scenario 2: Successful Proxy Request (Live Status)
**Given** the Gateway is online and reachable
**When** the frontend requests data via `/api/v1/catalogo-academico/*`
**Then** the backend successfully proxies the data, and the Angular `UnitepcGatewayService` sets `seaStatus` to `'online'`, displaying a green "Live" badge.

### Scenario 3: Gateway Unreachable (Offline Resilience)
**Given** the UNITEPC Central Gateway is down or unreachable
**When** the frontend requests data via `/api/v1/catalogo-academico/*`
**Then** the backend retrieves data from the local `sea_*` mirror tables as a fallback, and the Angular UI sets `seaStatus` to `'offline'`, displaying a red "Offline" badge.
