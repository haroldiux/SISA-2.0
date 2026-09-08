# Task Breakdown: 08-access-control-and-user-management

## Phase 1: Database Schema & Entity Updates
- [x] 1.1 Create Flyway migration `sisa-backend/src/main/resources/db/migration/V6__user_management_and_academic_assignments.sql` (adds `must_change_password` to `usuarios`, adds `ROLE_ADMIN` to constraint, creates `usuario_asignaciones_academicas` table with `id`, `usuario_id`, `sede_id`, `carrera_id`, `asignatura_id`, `creado_en`).
- [x] 1.2 Update `Usuario.java` (add `mustChangePassword`, `ci`, mapping to `UsuarioAsignacionAcademica`).
- [x] 1.3 Create `UsuarioAsignacionAcademica.java` entity.
- [x] 1.4 Update `RolUsuario.java` enum to include `ROLE_ADMIN`.

## Phase 2: Authentication & Password Change Flow
- [x] 2.1 Update `ScuLoginRequest` & `ScuAuthResponse` (include `mustChangePassword`, temporary change-password token support).
- [x] 2.2 Create `ScuChangePasswordRequest` DTO and command `ScuChangePasswordCmd`.
- [x] 2.3 Add `POST /api/v1/auth/change-password` endpoint in `ScuAuthController`.
- [x] 2.4 Unit tests for authentication and password change flows.

## Phase 3: Admin User Management Backend (CRUD & Assignments)
- [x] 3.1 Create DTOs `ScuRegisterUserRequest`, `ScuUpdateUserRequest`, `ScuUserDetailResponse`, `AcademicaAsignacionDto`.
- [x] 3.2 Create repository `UsuarioAsignacionAcademicaRepository`.
- [x] 3.3 Create service `ScuAdminUsuarioService` (list with filters, create with CI as password, update, toggle active, reset password to CI).
- [x] 3.4 Create controller `ScuAdminUsuarioController` (`/api/v1/admin/usuarios`).
- [x] 3.5 Unit & integration tests for user admin operations.

## Phase 4: Frontend Login & First-time Password Change
- [x] 4.1 Implement UNITEPC institutional Login screen/modal with `unitepc-pro` styling.
- [x] 4.2 Implement Forced Password Change modal/view when `mustChangePassword == true`.
- [x] 4.3 Session storage and auto-load of logged-in user profile (`/api/v1/auth/me`).

## Phase 5: Frontend Admin User Management & Registration Modal
- [x] 5.1 Create Admin Users panel (table listing users, role badges, sede/carrera badges, status, action buttons).
- [x] 5.2 Implement the exact "Registrar usuario" modal matching user reference UI:
  - [x] CI / Usuario input
  - [x] Rol dropdown (6 institutional roles)
  - [x] Nombre completo input (SEA canonical)
  - [x] Switch "Usuario activo y habilitado para ingresar"
  - [x] "Asignaciones académicas" nested picker (Sede -> Carrera -> Asignatura -> "+ Agregar asignación")
  - [x] Visual tags/list of added assignments with remove action
  - [x] Cancelar / Guardar usuario buttons
- [x] 5.3 Implement Edit User modal and Password Reset action.

## Phase 6: Integration & Verification
- [x] 6.1 End-to-end testing of user creation with initial CI password.
- [x] 6.2 End-to-end testing of first-login forced password change.
- [x] 6.3 End-to-end testing of multi-sede, multi-carrera academic assignments.
- [x] 6.4 Build and verify backend + frontend deployment in Docker.
