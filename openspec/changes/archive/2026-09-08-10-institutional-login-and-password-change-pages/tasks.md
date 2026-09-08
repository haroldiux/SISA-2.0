# Tasks: 10 Institutional Login & Password Change Full-Page Screens

**Change ID**: `10-institutional-login-and-password-change-pages`  
**Topic**: Full-Page Institutional Login Screen (Split 2-Column) and Password Change Screen (Centered Card Canvas)  
**Status**: Ready for Implementation  
**Artifact Mode**: Hybrid (`openspec` markdown + Engram memory persistence)  
**Reference Designs**: 
- `media_1788886485919.png` (`planificacion.unitepc.edu.bo/login`)
- `media_1788886509503.png` (`planificacion.unitepc.edu.bo/cambiar-contrasena`)  
**Design System**: `sea-portal-ui` (`c:\PROYECTOS\SISA\.agent\skills\sea-portal-ui\SKILL.md`)  
**Engram Topic Key**: `sdd/10-institutional-login-and-password-change-pages/tasks`  
**Target Files**:
- `sisa-frontend/src/styles.scss`
- `sisa-frontend/src/app/app.component.html`
- `sisa-frontend/src/assets/app-controller.js`

---

## Phase 1: CSS & SCSS Styling (`styles.scss`)

- [x] 1.1 Add styles for `#view-login` and `#view-change-password` root screens, background colors, SVG arc, input styling, and entry animations in `sisa-frontend/src/styles.scss`
  - [x] 1.1.1 Add typography inheritance and input font styling for `#view-login` and `#view-change-password` (`font-family: 'Geist', 'Inter', system-ui, sans-serif;` with placeholder color `#94A3B8`).
  - [x] 1.1.2 Define `.login-bg-arc` styling for subtle lavender concentric decorative background arc (absolute positioning, bottom/right offset `-6rem`, 500px dimensions, `opacity: 0.4`, pointer events none).
  - [x] 1.1.3 Add soft bluish-gray input field styling (`bg-[#EDF2F9]`, border focus transition to `#9079ED`).
  - [x] 1.1.4 Implement dynamic rule indicators styling `.rule-icon` (14x14px inline-flex center, 11px font size).
  - [x] 1.1.5 Add `@keyframes sp-card-enter` entry animation (`opacity: 0` to `1`, `transform: scale(0.97) translateY(8px)` to `scale(1) translateY(0)`) and apply to card containers in `#view-login` and `#view-change-password` with `220ms cubic-bezier(0.16, 0.84, 0.44, 1)`.
- [x] 1.2 Add dark mode overrides for auth screens and print suppression rules in `sisa-frontend/src/styles.scss`
  - [x] 1.2.1 Add dark mode overrides for `.login-bg-arc` (`.dark & { opacity: 0.1; }`).
  - [x] 1.2.2 Add dark mode overrides for auth cards (`.dark .bg-white`, `.dark .dark\:bg-slate-900`) and input containers (`.dark .bg-[#EDF2F9]`).
  - [x] 1.2.3 Ensure `@media print` rules explicitly hide `#view-login` and `#view-change-password` (`display: none !important;`) alongside the existing shell suppression rules.

---

## Phase 2: HTML Structure in `app.component.html`

- [x] 2.1 Remove or replace popup overlay modals `#sisa-login-modal` and `#modal-forced-password-change` with sibling root views
  - [x] 2.1.1 Remove `#sisa-login-modal` (backdrop-blur overlay container lines 24-87) from `sisa-frontend/src/app/app.component.html`.
  - [x] 2.1.2 Remove `#modal-forced-password-change` (backdrop-blur overlay container lines 92-142) from `sisa-frontend/src/app/app.component.html`.
  - [x] 2.1.3 Ensure the canonical portal shell container has `id="sp-shell"` and class `sp-shell` (`<div id="sp-shell" class="sp-shell flex h-screen w-screen ... hidden">`) as a sibling root element to `#view-login` and `#view-change-password`.
- [x] 2.2 Implement `#view-login` full-page 2-column view matching `media_1788886485919.png`
  - [x] 2.2.1 Construct `#view-login` container (`min-h-screen w-screen flex flex-col lg:flex-row bg-white dark:bg-slate-900 transition-all duration-300`).
  - [x] 2.2.2 Build Left Column (Branding & Value Proposition):
    - [x] 2.2.2.1 Embed decorative lavender concentric arc SVG (`viewBox="0 0 500 500"` with 3 concentric circles: r=220 stroke `#7B47B8`, r=140 stroke `#7B47B8`, r=70 stroke `#1F9FAD`).
    - [x] 2.2.2.2 Add institutional wordmark (`UNITE` in `#5B3E96` / dark `#9B6FD0`, `PC` in `#1F9FAD` / dark `#4FBCC8`, and `UNIVERSIDAD PRIVADA` uppercase subtitle in `#1F9FAD` with tracking `[0.25em]`).
    - [x] 2.2.2.3 Add `PLATAFORMA INSTITUCIONAL` eyebrow tag (`text-xs font-bold uppercase tracking-widest text-[#7B47B8]`).
    - [x] 2.2.2.4 Add display headline `"Gestión integral de evaluaciones académicas."` (`text-4xl lg:text-5xl font-black font-display tracking-tight text-[#18171C] dark:text-white leading-[1.15]`).
    - [x] 2.2.2.5 Add body description text (`"Un espacio seguro para planificar, generar, imprimir y calificar las evaluaciones de la Universidad."`).
    - [x] 2.2.2.6 Add feature pill 1: "Acceso por roles" (Lucide `shield`, container `bg-[#F0E9F8] text-[#7B47B8]`, description *"Cada usuario visualiza únicamente lo que necesita."*).
    - [x] 2.2.2.7 Add feature pill 2: "Proceso trazable" (Lucide `check-square`, container `bg-[#E0F2F4] text-[#1F9FAD]`, description *"Evaluaciones controladas desde su configuración hasta el resultado."*).
  - [x] 2.2.3 Build Right Column (Centered Authentication Canvas):
    - [x] 2.2.3.1 Construct canvas container (`lg:w-1/2 flex flex-col justify-between items-center bg-[#F8FAFC] dark:bg-slate-950 p-6 sm:p-10`).
    - [x] 2.2.3.2 Construct white authentication card (`bg-white dark:bg-slate-900 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 p-8 sm:p-10 w-full max-w-[430px] text-center`).
    - [x] 2.2.3.3 Add purple check squircle badge (`w-12 h-12 rounded-2xl bg-[#6E56CF] text-white flex items-center justify-center shadow-md shadow-purple-500/20 mx-auto`, Lucide `check` stroke 2.5).
    - [x] 2.2.3.4 Add institutional tag `ACCESO INTERNO` (`text-[11px] font-extrabold uppercase tracking-wider text-[#6E56CF] mt-4 mb-1`).
    - [x] 2.2.3.5 Add card title `"Bienvenido"` and subtitle `"Ingresa con tu usuario y contraseña del sistema."`.
    - [x] 2.2.3.6 Add form `#sisa-login-form` with error container (`#login-error-container`, `#login-error-msg`).
    - [x] 2.2.3.7 Add input `#login-username` inside `bg-[#EDF2F9] dark:bg-slate-800/80` container with Lucide `user` icon and label `USUARIO`.
    - [x] 2.2.3.8 Add input `#login-password` inside `bg-[#EDF2F9] dark:bg-slate-800/80` container with Lucide `lock` icon, label `CONTRASEÑA`, and eye toggle button (`#login-pwd-eye` invoking `toggleLoginPasswordVisibility()`).
    - [x] 2.2.3.9 Add submit button `#btn-do-login` (`bg-[#9079ED] hover:bg-[#8064E8] text-white rounded-xl py-3 text-xs font-semibold shadow-md shadow-[#9079ED]/25`, label `"Ingresar al sistema →"`).
    - [x] 2.2.3.10 Add security notice footer badge (Lucide `lock` in `#1F9FAD` + `"Sesión protegida para usuarios autorizados."`).
    - [x] 2.2.3.11 Include development quick-fill demo shortcuts (`Admin` / `Docente`).
    - [x] 2.2.3.12 Add bottom page bar (`SISTEMA DE EVALUACIONES • UNITEPC` on left, `ACCESO INTERNO` on right).
- [x] 2.3 Implement `#view-change-password` full-page centered card view matching `media_1788886509503.png`
  - [x] 2.3.1 Construct `#view-change-password` container (`min-h-screen w-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 p-4 transition-all duration-300 hidden select-none`).
  - [x] 2.3.2 Construct centered card (`bg-white dark:bg-slate-900 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 p-8 sm:p-10 w-full max-w-[460px] text-center animate-in fade-in zoom-in-95 duration-200`).
  - [x] 2.3.3 Add purple lock squircle badge (`w-12 h-12 rounded-2xl bg-[#6E56CF] text-white flex items-center justify-center shadow-md shadow-purple-500/20 mx-auto`, Lucide `lock` stroke 2.5).
  - [x] 2.3.4 Add dynamic badge label `#change-pwd-badge` (`text-[11px] font-extrabold uppercase tracking-wider text-[#6E56CF]`, default text `"PRIMER INGRESO"`).
  - [x] 2.3.5 Add card title `"Actualiza tu contraseña"` and subtitle `"Por seguridad, debes reemplazar la contraseña temporal antes de ingresar al sistema."`.
  - [x] 2.3.6 Add form `#forced-password-form` with error container (`#change-password-error`, `#change-password-error-msg`).
  - [x] 2.3.7 Add input 1: `CONTRASEÑA ACTUAL` (`#change-current-password`) with `bg-[#EDF2F9] rounded-xl px-3.5 py-2.5` container and `oninput="window.validatePasswordLive()"`.
  - [x] 2.3.8 Add input 2: `NUEVA CONTRASEÑA` (`#change-new-password`) with `bg-[#EDF2F9] rounded-xl px-3.5 py-2.5` container and `oninput="window.validatePasswordLive()"`.
  - [x] 2.3.9 Add input 3: `REPETIR NUEVA CONTRASEÑA` (`#change-confirm-password`) with `bg-[#EDF2F9] rounded-xl px-3.5 py-2.5` container and `oninput="window.validatePasswordLive()"`.
  - [x] 2.3.10 Add dynamic rules container (`bg-[#F8FAFC] dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 rounded-xl p-4 text-left`):
    - [x] 2.3.10.1 Title with Lucide `shield` icon in `#7B47B8` + `"Reglas de la nueva contraseña"`.
    - [x] 2.3.10.2 Indicator `#rule-length`: `"Debe tener entre 8 y 72 caracteres."` with child `.rule-icon`.
    - [x] 2.3.10.3 Indicator `#rule-diff`: `"Debe ser diferente de la contraseña actual."` with child `.rule-icon`.
    - [x] 2.3.10.4 Indicator `#rule-match`: `"La confirmación debe coincidir con la nueva contraseña."` with child `.rule-icon`.
  - [x] 2.3.11 Add submit button `#btn-do-change-password` (`w-full py-3 px-4 rounded-xl bg-[#9079ED] hover:bg-[#8064E8] text-white font-semibold text-xs shadow-md shadow-[#9079ED]/25`, label `"Guardar nueva contraseña →"`).
  - [x] 2.3.12 Add verification disclaimer text `"Estas reglas también se verifican al guardar la contraseña."`.
  - [x] 2.3.13 Add cancel / abort action button `#btn-cancel-pwd-change` invoking `window.handlePasswordChangeCancel()`.

---

## Phase 3: Script Controller (`app-controller.js`) Implementation

- [x] 3.1 Implement root view togglers `showLoginView()`, `showChangePasswordView()`, and `showPortalShell()` with `history.replaceState` URL sync
  - [x] 3.1.1 Implement `window.showLoginView()`: hides `#sp-shell` and `#view-change-password`, unhides `#view-login`, resets error alert and sensitive fields, pushes `/login` via `history.replaceState`, re-initializes Lucide icons.
  - [x] 3.1.2 Implement `window.showChangePasswordView(user, tempToken, isVoluntary, prefillCurrentPassword)`: hides `#sp-shell` and `#view-login`, unhides `#view-change-password`, populates `#change-current-password` if prefilled, resets new/confirm inputs, sets dynamic badge (`PRIMER INGRESO` vs `SEGURIDAD DE LA CUENTA`) and cancel button label, calls `validatePasswordLive()`, pushes `/cambiar-contrasena` via `history.replaceState`.
  - [x] 3.1.3 Implement `window.showPortalShell(targetViewId)`: hides `#view-login` and `#view-change-password`, unhides `#sp-shell`, switches to target module view (defaults to `view-dashboard` or `view6` for admin), pushes `/dashboard` via `history.replaceState`.
  - [x] 3.1.4 Implement `window.handlePasswordChangeCancel()`: routes to `showPortalShell()` if voluntary change, or calls `logoutUser()` if mandatory initial change.
- [x] 3.2 Update `checkInitialAuth()` to check token and switch to `#view-login` if unauthenticated or `#sp-shell` if authenticated
  - [x] 3.2.1 If no token exists in `localStorage`, call `window.showLoginView()` and exit.
  - [x] 3.2.2 If token exists, validate against `GET /api/v1/auth/me`. If valid, update session and route to `showChangePasswordView()` if `mustChangePassword` is true, otherwise route to `showPortalShell()`.
  - [x] 3.2.3 If response is 401/403, call `window.logoutUser()`.
  - [x] 3.2.4 In offline fallback, restore cached user into `showPortalShell()` if available, otherwise call `showLoginView()`.
  - [x] 3.2.5 Update controller initialization `setTimeout` (lines ~6371) to ensure `checkInitialAuth()` controls initial view display rather than blindly calling `switchView('view-dashboard')`.
- [x] 3.3 Update `handleLoginSubmit` to transition to `#view-change-password` when `mustChangePassword == true` (prefilling current password), or to `#sp-shell` when false
  - [x] 3.3.1 Validate inputs, show loading state on `#btn-do-login` (`⏳ Validando credenciales...`).
  - [x] 3.3.2 Send `POST /api/v1/auth/login` with `{ username, password }`.
  - [x] 3.3.3 On HTTP error, display error message in `#login-error-container` and reset submit button.
  - [x] 3.3.4 If `mustChangePassword === true`, invoke `window.showChangePasswordView(user, token, false, password)` passing current password for automated prefill.
  - [x] 3.3.5 If `mustChangePassword === false`, invoke `window.setAuthSession(token, user)`, call `window.showPortalShell()`, and show welcome toast.
- [x] 3.4 Implement `validatePasswordLive()` for real-time checklist indicators on the 3 password rules
  - [x] 3.4.1 Read values from `#change-current-password`, `#change-new-password`, and `#change-confirm-password`.
  - [x] 3.4.2 Evaluate Rule 1 (`#rule-length`): length >= 8 && length <= 72.
  - [x] 3.4.3 Evaluate Rule 2 (`#rule-diff`): newPassword.length > 0 && currentPassword.length > 0 && newPassword !== currentPassword.
  - [x] 3.4.4 Evaluate Rule 3 (`#rule-match`): newPassword.length > 0 && newPassword === confirmPassword.
  - [x] 3.4.5 For each rule, update container text color and `.rule-icon` text (`✓` in emerald-600 / dark:emerald-400 vs `○` in slate-400).
- [x] 3.5 Update `handleForcedPasswordSubmit` to send complete payload `{ username, currentPassword, newPassword, confirmPassword }` to `/api/v1/auth/change-password` and handle success/error states
  - [x] 3.5.1 Validate client-side: current password present, new password length 8-72, different from current, matches confirm, not equal to CI or username.
  - [x] 3.5.2 Show loading state on `#btn-do-change-password` (`⏳ Guardando...`).
  - [x] 3.5.3 Send `POST /api/v1/auth/change-password` with JSON body `{ username, currentPassword, newPassword, confirmPassword }` and `Authorization: Bearer <token>` header.
  - [x] 3.5.4 On success, clear `mustChangePassword` flag in user session, update tokens in `localStorage`, transition to `window.showPortalShell()`, and display toast `"¡Contraseña actualizada con éxito!"`.
  - [x] 3.5.5 On error, display server error message in `#change-password-error` and restore submit button.
- [x] 3.6 Update `logoutUser()` to clear session and show `#view-login`
  - [x] 3.6.1 Remove `scu_access_token`, `scu_refresh_token`, `scu_user_info` from `localStorage`.
  - [x] 3.6.2 Clear temporary password change memory variables (`_tempPasswordChangeUser`, `_tempPasswordChangeToken`).
  - [x] 3.6.3 Close user profile dropdown menu if open.
  - [x] 3.6.4 Invoke `window.showLoginView()` to cleanly present `#view-login` with URL `/login`.
  - [x] 3.6.5 Show toast notification `"ℹ️ Sesión cerrada correctamente"`.
- [x] 3.7 Maintain backward-compatible aliases for legacy modal methods
  - [x] 3.7.1 Export `window.openLoginModal = function() { window.showLoginView(); };`.
  - [x] 3.7.2 Export `window.closeLoginModal = function() {};`.
  - [x] 3.7.3 Export `window.openForcedPasswordModal = function(user, token) { window.showChangePasswordView(user, token, false); };`.
  - [x] 3.7.4 Export `window.closeForcedPasswordModal = function() {};`.

---

## Phase 4: Build, Deployment & Docker Synchronization

- [x] 4.1 Syntax check `node --check sisa-frontend/src/assets/app-controller.js`
  - [x] 4.1.1 Run Node.js syntax verification on `app-controller.js` to ensure zero syntax errors or unclosed blocks.
- [x] 4.2 Build Angular production bundle `npm run build`
  - [x] 4.2.1 Execute `npm run build` in `sisa-frontend` directory and confirm error-free compilation of HTML template, SCSS styles, and TypeScript components.
- [x] 4.3 Copy updated bundle and `app-controller.js` to Docker container `sisa-frontend:/usr/share/nginx/html/`
  - [x] 4.3.1 Copy dist artifacts: `docker cp sisa-frontend/dist/sisa-frontend/. sisa-frontend:/usr/share/nginx/html/`.
  - [x] 4.3.2 Copy `app-controller.js` asset: `docker cp sisa-frontend/src/assets/app-controller.js sisa-frontend:/usr/share/nginx/html/assets/app-controller.js`.

---

## Phase 5: Verification & Acceptance Testing

- [x] 5.1 Verify live login view matching `media_1788886485919.png` at `http://localhost:4200/`
  - [x] 5.1.1 Open `http://localhost:4200/` in an unauthenticated state (or incognito) and verify URL is `/login`.
  - [x] 5.1.2 Verify split 2-column layout renders: Left column displays UNITEPC wordmark, display headline, body, two feature pills, and lavender concentric SVG arc; Right column centers white authentication card.
  - [x] 5.1.3 Verify no backdrop blur overlay exists and `#sp-shell` is not visible.
  - [x] 5.1.4 Verify password visibility toggle works (eye icon swaps, password text reveals/hides).
- [x] 5.2 Verify forced password change view matching `media_1788886509503.png`
  - [x] 5.2.1 Trigger or simulate password change screen (`/cambiar-contrasena`).
  - [x] 5.2.2 Verify centered card renders with purple lock squircle badge, "PRIMER INGRESO" tag, and title "Actualiza tu contraseña".
  - [x] 5.2.3 Verify inputs for `CONTRASEÑA ACTUAL`, `NUEVA CONTRASEÑA`, and `REPETIR NUEVA CONTRASEÑA`.
  - [x] 5.2.4 Verify dynamic checklist box "Reglas de la nueva contraseña" renders all 3 rules with initial neutral `○` indicators.
- [x] 5.3 Test live login with admin and teacher credentials
  - [x] 5.3.1 Click demo quick-fill "Admin" (`admin` / `Unitepc2026!`) and submit: verify successful auth, transition to `#sp-shell`, redirection to `/dashboard` (or `view6`), and welcome toast.
  - [x] 5.3.2 Logout and click demo quick-fill "Docente" (`docente.cbb` / `Unitepc2026!`) and submit: verify successful auth and transition to `#sp-shell`.
- [x] 5.4 Test first-time login password change flow and real-time validation checks
  - [x] 5.4.1 Register a new user in admin panel (or use existing user with `must_change_password = true`) whose password is their CI.
  - [x] 5.4.2 Log in with initial credentials: verify transition directly to `#view-change-password` with current password prefilled.
  - [x] 5.4.3 Type into "Nueva contraseña" and "Repetir nueva contraseña": verify Rule 1 (8-72 chars), Rule 2 (different from current), and Rule 3 (matching confirmation) turn green (`✓`) dynamically as requirements are met.
  - [x] 5.4.4 Submit valid password change: verify `POST /api/v1/auth/change-password` responds 200, user is updated with `mustChangePassword = false`, transitions to `#sp-shell`, and success toast appears.
- [x] 5.5 Test logout returning cleanly to `#view-login`
  - [x] 5.5.1 Click logout from user dropdown menu or sidebar footer.
  - [x] 5.5.2 Verify tokens are cleared from `localStorage`, `#sp-shell` is hidden, `#view-login` is displayed, URL is `/login`, and login form is reset.
