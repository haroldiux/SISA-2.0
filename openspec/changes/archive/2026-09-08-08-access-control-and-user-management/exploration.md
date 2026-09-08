# SISA IAM: User Management & Access Control Exploration

## Context & Requirements
The goal is to implement a robust User Management and Access Control (IAM) system for UNITEPC SISA, supporting the following core requirements:
1. **6 Institutional Roles**: `ADMIN`, `VICERRECTOR_NACIONAL`, `VICERRECTOR_SEDE`, `DIRECTOR_ACADEMICO_SEDE`, `DIRECTOR_CARRERA`, `DOCENTE`.
2. **First Login Password Flow**: New users start with their CI (Carnet de Identidad) as their password and are forced to change it upon their first successful login. This requires a `must_change_password` flag.
3. **User Registration & Admin View**: A UI for creating and managing users, toggling active status, selecting roles, and assigning academic contexts.
4. **Academic Assignments**: A user may have multiple contextual assignments (Multi-sede, Multi-carrera, Multi-asignatura). For instance, a teacher might teach across multiple subjects or even campuses.

## Current Codebase Analysis
- **`Usuario.java`**: Currently, the `Usuario` entity defines a flat structure with basic attributes (`username`, `email`, `passwordHash`, `rol`, `nombres`, `apellidos`, `activo`). It is linked to exactly one `Sede`, meaning it does not support multi-sede or multi-carrera directly. Also, the `mustChangePassword` flag is completely missing.
- **`RolUsuario.java`**: Currently lists 5 roles: `ROLE_DOCENTE`, `ROLE_DIR_CARRERA`, `ROLE_DIR_ACADEMICA`, `ROLE_VICERRECTOR_SEDE`, `ROLE_VICERRECTOR_NACIONAL`. The `ROLE_ADMIN` role is missing and needs to be added.
- **`ScuAuthController.java` & `SecurityConfig.java`**: Implements standard JWT login, but lacks the endpoint and logic needed for the forced password reset flow (e.g., checking `mustChangePassword` upon login and restricting access to other endpoints until changed).
- **Frontend Assets**: The current UI (`app.component.html` and `app-controller.js`) features views based on role, but lacks the dedicated Admin User Management modal/panel, as well as the initial Change Password modal.

## Architectural Options Comparison

### Option A: Minimal Extension (Flat JSON/Direct Relations)
- **Concept**: Add `mustChangePassword` and `ROLE_ADMIN` to the existing models. Convert the single `Sede` relation to a JSON column containing an array of assignments (e.g., `[{"sede": 1, "carrera": 2}, ...]`), keeping the database schema modifications minimal.
- **Pros**: Very fast to implement, minimal schema changes.
- **Cons**: Severe limitations on querying and relational integrity. It makes it extremely difficult to perform database-level operations like "Find all users in Carrera X" without complex JSON queries. It also mixes security domains with raw JSON data structures.

### Option B: Full IAM Domain Model (Recommended)
- **Concept**: Refactor the domain to include a comprehensive IAM model. Create tables for `usuario_roles` (if multi-role is desired, or keep as an enum if single role strictly applies but with dedicated access lists), and `usuario_asignaciones_academicas` linking a user to `sede_id`, `carrera_id`, and `asignatura_id`. Implement a dedicated `AdminUsuarioController` for user management and an explicit password change command/flow.
- **Pros**: 
  - **Scalability**: Clean relational structure handles Multi-sede, Multi-carrera, Multi-asignatura natively.
  - **Integrity**: Enforces foreign keys to academic structure entities.
  - **Extensibility**: Easily allows querying users by specific assignments.
- **Cons**: Requires more extensive schema creation, data migration, and backend boilerplate (repositories, services).

## Recommendations
We strongly recommend proceeding with **Option B**. The nature of academic structures demands strong relational integrity to map permissions correctly (e.g., a Director of Carrera X shouldn't modify Carrera Y). 

### Next Steps & Action Plan
1. **Model Updates**:
   - Add `ROLE_ADMIN` to `RolUsuario.java`.
   - Add `boolean mustChangePassword = true` to `Usuario.java`.
   - Remove the flat `Sede` relation from `Usuario` and replace it with a `@OneToMany` mapping to a new `UsuarioAsignacionAcademica` entity (fields: `user_id`, `sede_id`, `carrera_id`, `asignatura_id`).
2. **Backend Controllers**:
   - Modify `ScuAuthController` to handle the `mustChangePassword` condition. If true, the token payload should reflect a restricted state or force redirect.
   - Create `AdminUsuarioController` to serve the User Admin Module (CRUD users, reset password to CI, toggle active).
3. **Frontend Implementation**:
   - Build the User Registration Modal reflecting the reference UI (CI, Role dropdown, Name, Active switch, Academic Assignments block).
   - Implement the Forced Password Change modal intercepting the router/UI if the API indicates a required change.
