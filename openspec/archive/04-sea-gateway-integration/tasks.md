# Implementation Tasks: 04-sea-gateway-integration

## Phase 1: Backend DTOs & Configuration
- [x] Add gateway connection properties (URL, credentials) to `application.yml`.
- [x] Create `TokenResponseDto` record in `bo.edu.unitepc.sisa.api.dto.gateway`.
- [x] Create `BranchOfficeDto` record.
- [x] Create `CareerDto` record.
- [x] Create `CourseDto` record.
- [x] Create `GroupItemDto` record.
- [x] Create `StudentItemDto` record.
- [x] Create `CampusDto` record.
- [x] Create `TimeFrameDto` record.

## Phase 2: Gateway Client & Proxy Controller
- [x] Implement `UnitepcGatewayClient` using Spring `RestClient`.
- [x] Implement thread-safe token renewal logic in `UnitepcGatewayClient.getToken()` with 30s buffer.
- [x] Add gateway fetch methods (branch offices, careers, courses, students) using the renewed token.
- [x] Implement `CatalogoAcademicoController` proxy endpoints under `/api/v1/catalogo-academico`.

## Phase 3: Database Mirroring Migration
- [x] Create Flyway migration script `V3__catalogo_sea.sql`.
- [x] Define `sea_sedes` table schema in the migration script.
- [x] Define `sea_carreras` table schema in the migration script.
- [x] Define `sea_materias` table schema in the migration script.
- [x] Define `sea_grupos` table schema in the migration script.
- [x] Verify Flyway migration applies correctly to PostgreSQL.

## Phase 4: Angular Frontend Service & Live/Offline Indicator
- [x] Create `UnitepcGatewayService` with `seaStatus` Angular signal (`'online' | 'offline' | 'sync'`).
- [x] Implement HTTP calls to proxy controller in `UnitepcGatewayService` with error handling updating `seaStatus`.
- [x] Update `sidebar.component.ts` (or header) to inject `UnitepcGatewayService`.
- [x] Add Live (green) / Offline (red pulse) indicator badge to the UI based on `seaStatus`.

## Phase 5: Verification & Testing
- [x] Write integration tests for token renewal logic and thread safety.
- [x] Write integration tests for proxy controller endpoints.
- [x] Verify frontend reactive badge behavior under both online and offline network conditions.
- [x] Test database mirroring and Flyway migration application.
- [x] Build and deploy changes in Docker for final validation.
