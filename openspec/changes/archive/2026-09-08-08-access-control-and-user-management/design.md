# Technical Design: 08 Access Control and User Management

## 1. Database Migrations

### `V6__user_management_and_academic_assignments.sql`
- Add `ci` (VARCHAR) and `must_change_password` (BOOLEAN DEFAULT TRUE) to `usuarios` table.
- Add `is_active` (BOOLEAN DEFAULT TRUE) to `usuarios` table.
- Create `usuario_asignacion_academica` table:
  - `id` (PK, UUID)
  - `usuario_id` (FK to usuarios)
  - `sede_id` (FK or identifier)
  - `carrera_id` (FK or identifier, nullable)
  - `asignatura_id` (FK or identifier, nullable)
  - `created_at`, `updated_at`

## 2. Domain Model Updates
- **`Usuario`**: Add fields `String ci`, `boolean mustChangePassword`, `boolean isActive`, and `List<UsuarioAsignacionAcademica> asignaciones`.
- **`UsuarioAsignacionAcademica`**: New entity representing the mapping of a user to a Sede, Carrera, and optionally Asignatura.
- **`RolUsuario`**: Ensure `ROLE_ADMIN`, `ROLE_VICERRECTOR_NACIONAL`, `ROLE_VICERRECTOR_SEDE`, `ROLE_DIRECTOR_ACADEMICO_SEDE`, `ROLE_DIRECTOR_CARRERA`, `ROLE_DOCENTE` are defined.

## 3. DTOs
- `ScuRegisterUserRequest`: `{ ci, rol, nombreCompleto, isActive, List<AcademicaAsignacionDto> asignaciones }`
- `ScuUpdateUserRequest`: `{ rol, nombreCompleto, isActive, List<AcademicaAsignacionDto> asignaciones }`
- `ScuChangePasswordRequest`: `{ oldPassword, newPassword }`
- `ScuUserDetailResponse`: `{ id, ci, nombreCompleto, rol, isActive, mustChangePassword, asignaciones }`
- `AcademicaAsignacionDto`: `{ sedeId, carreraId, asignaturaId }`

## 4. REST Controllers

### `ScuAuthController`
- **`POST /api/v1/auth/login`**: Enhanced to check `mustChangePassword`. If true, returns a specific status code or flag, and issues a restricted JWT.
- **`POST /api/v1/auth/change-password`**: Accepts `ScuChangePasswordRequest`, validates restricted JWT or old password, updates password, sets `mustChangePassword = false`, returns full JWT.

### `ScuAdminUsuarioController`
- Protected by `@PreAuthorize("hasRole('ADMIN')")`.
- **`GET /api/v1/admin/usuarios`**: List users.
- **`POST /api/v1/admin/usuarios`**: Register a new user.
- **`PUT /api/v1/admin/usuarios/{id}`**: Update user details and assignments.
- **`POST /api/v1/admin/usuarios/{id}/reset-password`**: Reset password to CI.

## 5. Frontend Architecture
- **Login Flow**: 
  - Institutional Login View handles normal authentication.
  - If backend indicates password change required, route to Forced Change Password View.
- **Admin View**: 
  - User management table displaying users, roles, and status.
- **Modals**: 
  - "Registrar usuario" / "Editar usuario" components.
  - CI / USUARIO, ROL, NOMBRE COMPLETO fields.
  - Status toggle switch.
  - "Asignaciones académicas" section with cascading dropdowns for Sede -> Carrera -> Asignatura.
  - State managed via Angular Signals to dynamically update the list of assignments.
