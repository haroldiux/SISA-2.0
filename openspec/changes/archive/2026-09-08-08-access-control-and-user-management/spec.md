# Specification: 08 Access Control and User Management

## 1. Introduction
This specification defines the requirements for role-based access control, user management, forced password change on first login, and academic assignment mappings in SISA 2.0.

## 2. Requirements
- The system must require users to change their password on first login (when using their CI as the initial password).
- Administrators must be able to create, edit, disable, and reset passwords for users via a dedicated modal.
- Users must be assigned specific academic scopes (Sede, Carrera, Asignatura).
- Endpoints must be protected by Role-Based Access Control (RBAC).

## 3. Scenarios

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
