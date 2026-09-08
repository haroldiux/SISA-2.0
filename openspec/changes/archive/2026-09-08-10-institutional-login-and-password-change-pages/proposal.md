# Proposal: 10-institutional-login-and-password-change-pages

## Intent
Replace popup overlay modals (`#sisa-login-modal`, `#modal-forced-password-change`) with full-page institutional screens for Login (`planificacion.unitepc.edu.bo/login`) and Password Change (`planificacion.unitepc.edu.bo/cambiar-contrasena`) matching reference screenshots `media_1788886485919.png` and `media_1788886509503.png`, using state-driven root view toggling with zero regressions.

## Scope
### In Scope
- **Full-Page Login View (`#view-login`)**:
  - Split 2-column layout.
  - Left column: UNITEPC wordmark, `PLATAFORMA INSTITUCIONAL`, display headline ("Gestión integral de evaluaciones académicas."), description, two feature pills ("Acceso por roles", "Proceso trazable"), and decorative lavender concentric arc.
  - Right column: Centered authentication card (`max-w-[430px]`, `rounded-[28px]`, `bg-white`), squircle checkmark badge, institutional tag (`ACCESO INTERNO`), "Bienvenido", soft bluish-gray input fields (`#login-username`, `#login-password`), password visibility toggle, submit button (`#btn-do-login`), protected session notice, and bottom footer bar.
- **Full-Page Password Change View (`#view-change-password`)**:
  - Full-screen centered card (`max-w-[460px]`, `rounded-[28px]`, `bg-white`).
  - Squircle lock badge, dynamic badge label (`PRIMER INGRESO` / `SEGURIDAD DE LA CUENTA`), "Actualiza tu contraseña", description.
  - Inputs: `CONTRASEÑA ACTUAL`, `NUEVA CONTRASEÑA`, `REPETIR NUEVA CONTRASEÑA`.
  - Live validation rules box (`#rule-length`, `#rule-diff`, `#rule-match`) with real-time checklist indicators.
  - Submit button (`#btn-do-change-password`) and cancel/logout action.
- **State-Driven Root View Switching (`app-controller.js`)**:
  - Manage visibility among sibling root views (`#view-login`, `#view-change-password`, `#sp-shell`).
  - URL synchronization via HTML5 `history.replaceState` (`/login`, `/cambiar-contrasena`, `/dashboard`).
  - Session lifecycle: initial auth check, mandatory password redirect, voluntary password change, and logout.
  - Backward-compatible wrappers for legacy callers (`openLoginModal`, `openForcedPasswordModal`, `closeLoginModal`).
- **Backend Payload Alignment**:
  - Transmit `currentPassword`, `newPassword`, `confirmPassword`, and `username` to `POST /api/v1/auth/change-password` matching `ScuChangePasswordCmd`.

### Out of Scope
- Modifications to Spring Boot backend `/api/v1/auth/*` endpoints (existing API is complete and verified).
- SSO or third-party OAuth providers.

## Approach
Adopt **Option B (State-Driven Root View Toggling with History API)**. Root views `#view-login`, `#view-change-password`, and `#sp-shell` reside as sibling containers in `app.component.html`, toggled imperatively by controller state. This guarantees 100% pixel-perfect fidelity, clean URL reflection, and zero regression risk to existing DOM modules.

## Affected Areas
- `sisa-frontend/src/app/app.component.html`
- `sisa-frontend/src/assets/app-controller.js`
- `sisa-frontend/src/styles.scss`

## Risks and Mitigations
- **Legacy Callers to Modals**: Retain alias functions `openLoginModal()` and `openForcedPasswordModal()` delegating directly to root view switchers.
- **Mobile Responsiveness**: Stack the login view vertically on viewports `< 1024px` while maintaining centered card layout.
- **First-Login Current Password**: Automatically preserve or prompt the credential entered during initial login.

## Rollback Plan
Revert changes to `app.component.html`, `app-controller.js`, and `styles.scss` via Git commit checkout.

## Success Criteria
- Full-page Login and Password Change render exactly per reference designs without backdrop blur overlays.
- Real-time password rules dynamically check off as valid input is entered.
- URLs update appropriately (`/login`, `/cambiar-contrasena`, `/dashboard`).
- All existing authenticated modules (`view1` through `view6`) operate without functional regressions.
