# Proposal: 08-access-control-and-user-management

## Intent
Implement a complete Identity and Access Management (IAM) module for SISA. This includes 6 institutional roles (`ADMIN`, `VICERRECTOR_NACIONAL`, `VICERRECTOR_SEDE`, `DIRECTOR_ACADEMICO_SEDE`, `DIRECTOR_CARRERA`, `DOCENTE`), multi-sede/multi-carrera/multi-asignatura relational bindings, forced first-login password change (initial password = CI), and a user management admin panel with registration modal.

## Scope
### In Scope
*   **Database:** Schema migration `V6__user_management_and_academic_assignments.sql` adding `must_change_password` to `usuarios`, `ROLE_ADMIN`, and `usuario_asignaciones_academicas` table (with `sede_id`, `carrera_id`, `asignatura_id`).
*   **Backend Auth:** Update `ScuAuthController` login response to include `mustChangePassword` flag and temporary token. Add `POST /api/v1/auth/change-password` endpoint.
*   **Backend Admin:** Create `ScuAdminUsuarioController` for user CRUD (`GET`, `POST`, `PUT`, `DELETE`/toggle, `reset-password`).
*   **Frontend UI:** UNITEPC-styled Login Screen, Forced Password Change Modal/View on first login, and Admin User Management view with Registration Modal (matching reference mockup with CI, Role, Name, Status, and nested academic assignments).

### Out of Scope
*   External OAuth2 user sync or Active Directory integration.
*   Biometric, 2FA, or MFA authentication.

## Approach
**Option B (Full IAM Domain Model)** is selected to provide comprehensive and native management of users and academic assignments within SISA.

## Affected Areas
*   **Backend:** `bo.edu.unitepc.sisa.domain.model.Usuario`, `UsuarioAsignacionAcademica`, `RolUsuario`, `ScuAuthController`, `ScuAdminUsuarioController`, `SecurityConfig`, Flyway migration `V6`.
*   **Frontend:** `app.component.html`, `app-controller.js`, stylesheets.

## Risks and Mitigations
*   **Existing User Compatibility:** Risk of locking out existing users without the `must_change_password` flag. *Mitigation:* Ensure migration sets `must_change_password` to false for existing users or triggers a controlled reset.

## Rollback Plan
Revert frontend and backend commits. Execute a Flyway rollback script (down migration for V6) to remove the new tables and columns.

## Success Criteria
*   Users can log in and are forced to change their password on the first login if their initial password is their CI.
*   Admin users can fully manage other users and assign complex academic scopes via the UI.
*   All new endpoints are secured and unit/integration tested.
