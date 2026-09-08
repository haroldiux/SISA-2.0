# Specification: Identity and Access Management (IAM) & User Management

## 1. Overview & Purpose
This specification defines the identity, authentication, role-based access control (RBAC), and academic scope mapping architecture for SISA 2.0. It governs user lifecycle management, institutional roles across UNITEPC hierarchies, first-login credential enforcement (CI-based initial password), multi-level academic assignments (Sede, Carrera, Asignatura), and administrative endpoints.

## 2. Institutional Roles
The system enforces 6 institutional roles:
- **`ROLE_ADMIN`**: Full administrative access across all system entities, users, and configurations.
- **`ROLE_VICERRECTOR_NACIONAL`**: Institutional oversight at national level.
- **`ROLE_VICERRECTOR_SEDE`**: Institutional oversight restricted to specific Sede.
- **`ROLE_DIRECTOR_ACADEMICO_SEDE`**: Academic oversight restricted to specific Sede.
- **`ROLE_DIRECTOR_CARRERA`**: Academic and curriculum coordination for specific Sede and Carrera.
- **`ROLE_DOCENTE`**: Access to assigned subjects and didactic documentation planning.

## 3. Core Requirements
- **First-time Login Password Enforcement**: Newly created or reset accounts have `ci` as the initial password and `must_change_password = true`. Upon first authentication, the system restricts access via a temporary JWT and forces a secure password update.
- **Role-Based Access Control**: Sensitive administrative endpoints (`/api/v1/admin/usuarios/**`) are strictly restricted to `ROLE_ADMIN`. Non-admin requests receive HTTP 403 Forbidden.
- **Academic Scope Assignment**: Users can be mapped to multiple academic assignments specifying Sede, Carrera, and optionally Asignatura via `usuario_asignaciones_academicas`.
- **Administrative User Lifecycle**: Administrators can list, create, edit, deactivate/activate, and reset passwords (to CI) for any user through a dedicated modal-based management interface.

## 4. REST Endpoints

### Authentication (`ScuAuthController`)
- `POST /api/v1/auth/login`: Authenticates credentials. If `mustChangePassword` is true, returns a restricted password-change JWT and flag.
- `POST /api/v1/auth/change-password`: Validates password-change request, updates hash in DB, sets `mustChangePassword = false`, and returns full session JWT.
- `GET /api/v1/auth/me`: Returns the profile and academic assignments of the authenticated user.

### User Administration (`ScuAdminUsuarioController` - `@PreAuthorize("hasRole('ADMIN')")`)
- `GET /api/v1/admin/usuarios`: List all users with filtering support.
- `POST /api/v1/admin/usuarios`: Register a new user with initial CI password and academic assignments.
- `PUT /api/v1/admin/usuarios/{id}`: Update user metadata, status, and academic assignments.
- `POST /api/v1/admin/usuarios/{id}/reset-password`: Reset user password to their CI and re-enable `mustChangePassword`.

## 5. Given/When/Then Scenarios

### Scenario 1: First login with initial password
- **Given** a newly created user with their CI as the password and `mustChangePassword = true`
- **When** the user attempts to log in with these credentials
- **Then** the system authenticates the user but issues a temporary JWT restricted to password change, and prompts the user to change their password.

### Scenario 2: Password change validation and activation
- **Given** a user logged in with a temporary password-change JWT
- **When** the user submits a new secure password
- **Then** the system updates the password, sets `mustChangePassword = false`, and issues a full access JWT.

### Scenario 3: Regular login after password has been changed
- **Given** a user with `mustChangePassword = false`
- **When** the user logs in with their updated password
- **Then** the system authenticates the user and issues a full access JWT.

### Scenario 4: Admin registers new user via modal
- **Given** an administrator in the user management view
- **When** the admin fills out the "Registrar usuario" modal with CI, Role, Name, Status, and Academic Assignments (Sede, Carrera, Asignatura) and clicks Save
- **Then** the system creates the user, sets their initial password to the CI, sets `mustChangePassword = true`, and saves the academic assignments.

### Scenario 5: Admin edits user and updates academic assignments
- **Given** an administrator editing an existing user
- **When** the admin modifies the academic assignments and saves
- **Then** the system updates the user's academic assignments accordingly.

### Scenario 6: Admin disables user
- **Given** an administrator editing an active user
- **When** the admin toggles "Usuario activo y habilitado para ingresar" to false and saves
- **Then** the system marks the user as inactive and they can no longer log in.

### Scenario 7: Admin resets user password to CI
- **Given** an administrator managing a user
- **When** the admin triggers a password reset
- **Then** the system resets the user's password to their CI and sets `mustChangePassword = true`.

### Scenario 8: Role-based access control to endpoints
- **Given** a user with a non-admin role
- **When** they attempt to access `/api/v1/admin/usuarios`
- **Then** the system denies access with a 403 Forbidden error.
