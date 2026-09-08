# Specification: UNITEPC SISA 2.0 Institutional Authentication & Password Management

## 1. Overview & Purpose
This specification defines the canonical authentication and credential management architecture for SISA 2.0. It establishes dedicated, full-page screen experiences for Login (`/login`) and Password Change (`/cambiar-contrasena`) matching UNITEPC institutional standards (`media_1788886485919.png` and `media_1788886509503.png`). It replaces legacy modal overlays with mutually exclusive, state-driven root views (`#view-login`, `#view-change-password`, and `#sp-shell`) managed via the HTML5 History API, guaranteeing complete visual isolation, zero backdrop blur artifacts, and robust backward compatibility.

## 2. Root View Architecture & Layout Toggling

### 2.1 Sibling Root Views
The top-level DOM structure in `app.component.html` defines three mutually exclusive sibling root elements:
1. **`#view-login`**: Full-viewport institutional split-screen view matching `media_1788886485919.png` (URL `/login`).
2. **`#view-change-password`**: Full-viewport centered card canvas matching `media_1788886509503.png` (URL `/cambiar-contrasena`).
3. **`#sp-shell`**: Canonical authenticated portal shell (URL `/dashboard`).

Only ONE root view is visible at any given time. When `#view-login` or `#view-change-password` is active, `#sp-shell` is hidden via the `.hidden` class, eliminating backdrop blur overlays and preventing unauthenticated rendering of portal components.

### 2.2 Controller View Management & URL Synchronization
Root view transitions are orchestrated imperatively by `app-controller.js`:
- `window.showLoginView()`: Displays `#view-login`, hides `#view-change-password` and `#sp-shell`, clears sensitive input fields and errors, updates browser URL to `/login` via `history.replaceState`, and re-initializes Lucide icons.
- `window.showChangePasswordView(user, tempToken, isVoluntary, prefillCurrentPassword)`: Displays `#view-change-password`, hides `#view-login` and `#sp-shell`, sets dynamic badge (`PRIMER INGRESO` vs `SEGURIDAD DE LA CUENTA`), pre-fills current password if supplied, evaluates live validation rules, and updates browser URL to `/cambiar-contrasena` via `history.replaceState`.
- `window.showPortalShell(targetViewId)`: Displays `#sp-shell`, hides `#view-login` and `#view-change-password`, activates the target module (defaults to `#view-dashboard` or `#view6` for `ROLE_ADMIN`), and updates URL to `/dashboard` via `history.replaceState`.
- `window.handlePasswordChangeCancel()`: Routes to `showPortalShell()` if voluntary change, or executes `logoutUser()` if mandatory initial change.

### 2.3 Backward Compatibility Wrappers
To prevent regressions across existing code callers, the controller retains wrapper functions on `window`:
- `openLoginModal()` -> delegates directly to `showLoginView()`.
- `closeLoginModal()` -> hides `#view-login`.
- `openForcedPasswordModal()` -> delegates directly to `showChangePasswordView()`.
- `closeForcedPasswordModal()` -> hides `#view-change-password`.

---

## 3. Screen Specifications

### 3.1 Full-Page Institutional Login View (`#view-login`)
- **Container**: Full-viewport flex container (`min-h-screen w-screen flex flex-col lg:flex-row bg-white dark:bg-slate-900`).
- **Left Column (`lg:w-1/2` Branding & Value Proposition)**:
  - **Decorative Lavender Concentric Arc SVG (`.login-bg-arc`)**: Positioned at bottom-right quadrant with circles radiating outward (`r=220 stroke #7B47B8`, `r=140 stroke #7B47B8`, `r=70 stroke #1F9FAD`), dimmed to `opacity: 0.1` in dark mode.
  - **Institutional Wordmark**: `UNITE` in institutional purple (`#5B3E96`), `PC` in sea teal (`#1F9FAD`), and uppercase subtitle `UNIVERSIDAD PRIVADA` in sea teal (`tracking-[0.25em]`).
  - **Eyebrow Tag**: `PLATAFORMA INSTITUCIONAL` in uppercase tracked purple font (`text-xs font-bold tracking-widest text-[#7B47B8]`).
  - **Display Headline**: `"Gestión integral de evaluaciones académicas."` (`text-4xl lg:text-5xl font-black font-display tracking-tight text-[#18171C] dark:text-white leading-[1.15]`).
  - **Body Description**: `"Un espacio seguro para planificar, generar, imprimir y calificar las evaluaciones de la Universidad."` (`text-sm lg:text-base text-[#6B6873] dark:text-slate-400 max-w-md`).
  - **Feature Value Pills**:
    1. *Acceso por roles*: Lucide `shield` icon inside soft purple container (`bg-[#F0E9F8] text-[#7B47B8] w-12 h-12 rounded-2xl`), text *"Cada usuario visualiza únicamente lo que necesita."*
    2. *Proceso trazable*: Lucide `check-square` icon inside soft teal container (`bg-[#E0F2F4] text-[#1F9FAD] w-12 h-12 rounded-2xl`), text *"Evaluaciones controladas desde su configuración hasta el resultado."*
- **Right Column (`lg:w-1/2` Authentication Canvas)**:
  - **Background**: Soft neutral canvas (`bg-[#F8FAFC] dark:bg-slate-950`).
  - **Authentication Card**: `w-full max-w-[430px] rounded-[28px] bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 p-8 sm:p-10 text-center`.
  - **Squircle Checkmark Badge**: `w-12 h-12 rounded-2xl bg-[#6E56CF] text-white flex items-center justify-center shadow-md shadow-purple-500/20 mx-auto` containing Lucide `check` (stroke 2.5).
  - **Institutional Category Tag**: `ACCESO INTERNO` (`text-[11px] font-extrabold uppercase tracking-wider text-[#6E56CF] mt-4 mb-1`).
  - **Headline & Subtitle**: `"Bienvenido"` (`text-2xl sm:text-3xl font-extrabold text-[#18171C] font-display`), and `"Ingresa con tu usuario y contraseña del sistema."` (`text-xs text-slate-500`).
  - **Input Fields (`bg-[#EDF2F9] dark:bg-slate-800/80`)**:
    - `#login-username`: Lucide `user` icon, label `USUARIO`.
    - `#login-password`: Lucide `lock` icon, label `CONTRASEÑA`, and eye toggle button invoking `toggleLoginPasswordVisibility()`.
  - **Submit Button (`#btn-do-login`)**: Full width `bg-[#9079ED] hover:bg-[#8064E8] text-white rounded-xl py-3 text-xs font-semibold shadow-md shadow-[#9079ED]/25`, label `"Ingresar al sistema →"`.
  - **Protected Session Notice**: Lucide `lock` icon in sea teal (`#1F9FAD`) + `"Sesión protegida para usuarios autorizados."` (`text-[11px] text-slate-500`).
  - **Bottom Institutional Bar**: Left: `SISTEMA DE EVALUACIONES • UNITEPC` | Right: `ACCESO INTERNO` (`text-[10px] uppercase text-slate-400 tracking-wider`).

### 3.2 Full-Page Institutional Password Change View (`#view-change-password`)
- **Container**: Full-viewport centered flex canvas (`min-h-screen w-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 p-4`).
- **Centered Card**: `w-full max-w-[460px] rounded-[28px] bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 p-8 sm:p-10 text-center`.
- **Squircle Lock Badge**: `w-12 h-12 rounded-2xl bg-[#6E56CF] text-white flex items-center justify-center shadow-md shadow-purple-500/20 mx-auto` containing Lucide `lock` (stroke 2.5).
- **Dynamic Badge Label (`#change-pwd-badge`)**: Displays `"PRIMER INGRESO"` for initial mandatory change or `"SEGURIDAD DE LA CUENTA"` for voluntary updates.
- **Card Headline & Description**: `"Actualiza tu contraseña"` (`text-2xl sm:text-3xl font-extrabold text-[#18171C] font-display`), and `"Por seguridad, debes reemplazar la contraseña temporal antes de ingresar al sistema."`.
- **3 Password Inputs (`bg-[#EDF2F9] dark:bg-slate-800/80 rounded-xl px-3.5 py-2.5`)**:
  1. `CONTRASEÑA ACTUAL` (`#change-current-password`): Pre-filled automatically during mandatory first login.
  2. `NUEVA CONTRASEÑA` (`#change-new-password`): Wired to `validatePasswordLive()` on keystroke.
  3. `REPETIR NUEVA CONTRASEÑA` (`#change-confirm-password`): Wired to `validatePasswordLive()` on keystroke.
- **Interactive Rule Checklist ("Reglas de la nueva contraseña")**:
  - Box container: `bg-[#F8FAFC] dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 rounded-xl p-4 text-left`.
  - Header: Lucide `shield` icon (`#7B47B8`) + `"Reglas de la nueva contraseña"`.
  - Rule 1 (`#rule-length`): *"Debe tener entre 8 y 72 caracteres."* (Target: 8 <= length <= 72).
  - Rule 2 (`#rule-diff`): *"Debe ser diferente de la contraseña actual."* (Target: newPassword !== currentPassword && newPassword.length > 0).
  - Rule 3 (`#rule-match`): *"La confirmación debe coincidir con la nueva contraseña."* (Target: confirmPassword === newPassword && newPassword.length > 0).
  - Indicators toggle dynamically between neutral circle (`○`, `text-slate-400`) and emerald checkmark (`✓`, `text-emerald-600 font-bold`).
- **Action Buttons & Notices**:
  - Submit Button (`#btn-do-change-password`): `w-full py-3 px-4 rounded-xl bg-[#9079ED] hover:bg-[#8064E8] text-white font-semibold text-xs shadow-md shadow-[#9079ED]/25`, label `"Guardar nueva contraseña →"`.
  - Explanatory Notice: `"Estas reglas también se verifican al guardar la contraseña."` (`text-[11px] text-slate-400 text-center mt-4`).
  - Cancel / Abort Button (`#btn-cancel-pwd-change`): Invokes `window.handlePasswordChangeCancel()`.

---

## 4. Backend Authentication & Password Change Contracts

### 4.1 Login Contract (`POST /api/v1/auth/login`)
- **Request Payload**:
  ```json
  {
    "username": "admin",
    "password": "SecretPassword123!"
  }
  ```
- **Response (`ScuAuthResponse`)**:
  - `accessToken`: JWT bearer token.
  - `refreshToken`: Refresh token.
  - `mustChangePassword`: Boolean flag indicating whether account requires immediate credential update.
  - `user`: Object containing `id`, `username`, `email`, `role`, `sedeNombre`, and `mustChangePassword`.

### 4.2 Password Change Contract (`POST /api/v1/auth/change-password`)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Request Payload (`ScuChangePasswordCmd`)**:
  ```json
  {
    "username": "docente.cbb",
    "currentPassword": "InitialPasswordOrCI",
    "newPassword": "NewSecurePassword2026!",
    "confirmPassword": "NewSecurePassword2026!"
  }
  ```
- **Backend Validation Rules**:
  1. Validates current password against BCrypt hash in DB (HTTP 401 if invalid).
  2. Rejects if `newPassword` equals `currentPassword` (HTTP 401).
  3. Rejects if `newPassword` equals CI or username (HTTP 400).
  4. Enforces length between 8 and 72 characters (HTTP 400).
  5. Enforces exact match between `newPassword` and `confirmPassword` (HTTP 400).
  6. Upon success, updates hash, clears `must_change_password` flag to `false`, and returns HTTP 200 with refreshed session tokens.

### 4.3 Session Lifecycle & Storage
- Tokens and user identity are persisted in `localStorage`:
  - `scu_access_token`: Active JWT access token.
  - `scu_refresh_token`: Refresh token.
  - `scu_user_info`: Serialized user profile JSON.
- Session verification on page load (`checkInitialAuth()`):
  - Validates active token via `GET /api/v1/auth/me`.
  - If token is absent or invalid (401/403), invokes `logoutUser()`, presents `#view-login`, and rewrites URL to `/login`.
  - If token is valid and `mustChangePassword == true`, routes to `#view-change-password` at `/cambiar-contrasena`.
  - If token is valid and `mustChangePassword == false`, routes to `#sp-shell` at `/dashboard`.

---

## 5. Theming, Responsiveness & Print Isolation

- **Dark Mode Support**: Full support for `.dark` theme using design tokens from `sea-portal-ui`. Auth card switches to `bg-slate-900` with `border-slate-800`, input containers switch to `bg-slate-800/80`, text tokens switch to dark neutral palette, and the lavender concentric arc SVG dims to `opacity: 0.1`.
- **Responsive Layout**: On viewports `< 1024px` (mobile/tablet), `#view-login` stacks vertically (`flex-col`), presenting a compact institutional header on top while keeping the authentication card horizontally centered.
- **Print Isolation**: `@media print` rules strictly hide `#view-login` and `#view-change-password` (`display: none !important;`) alongside portal shell chrome, ensuring clean print rendering of official documents.

---

## 6. Given/When/Then Acceptance Scenarios

### Scenario 1: Unauthenticated session displays full-page Login view (`#view-login`)
- **Given** an unauthenticated visitor opens `/` or `/login`
- **When** `checkInitialAuth()` executes and finds no valid token in `localStorage`
- **Then** `#view-login` is rendered visible without the `.hidden` class
- **And** `#sp-shell` and `#view-change-password` are completely hidden with `.hidden`
- **And** no modal backdrop blur overlays are present in the DOM
- **And** the left column displays the UNITEPC wordmark, `PLATAFORMA INSTITUCIONAL`, display headline, description, 2 feature pills, and lavender concentric circular arc SVG
- **And** the right column centers the authentication card with username and password fields, submit button, and protected session notice
- **And** the browser URL displays `/login`.

### Scenario 2: Successful authentication for regular user (`mustChangePassword == false`)
- **Given** the user is viewing `#view-login`
- **When** the user inputs valid credentials for an active account with `mustChangePassword == false` and submits the form
- **Then** `POST /api/v1/auth/login` returns HTTP 200 with access token and user profile
- **And** session tokens and profile are saved to `localStorage`
- **And** `#view-login` is hidden with `.hidden`
- **And** `#sp-shell` is made visible without `.hidden`
- **And** the active view switches to `#view-dashboard` (or `#view6` if user is `ROLE_ADMIN`)
- **And** the browser URL updates to `/dashboard` via `history.replaceState`
- **And** a welcome toast notification appears with the user's name.

### Scenario 3: First-time login with temporary initial password (`mustChangePassword == true`)
- **Given** a user with a temporary password is on `#view-login`
- **When** the user submits valid initial credentials
- **Then** `POST /api/v1/auth/login` returns HTTP 200 with `mustChangePassword: true`
- **And** `#view-login` is hidden
- **And** `#view-change-password` is displayed without `.hidden`
- **And** `#sp-shell` remains completely hidden
- **And** the username and current password are retained and prefilled into `#change-current-password`
- **And** the card displays the badge `"PRIMER INGRESO"` and headline `"Actualiza tu contraseña"`
- **And** the browser URL updates to `/cambiar-contrasena`.

### Scenario 4: Dynamic password validation checklist on keyup in Password Change view
- **Given** the user is viewing `#view-change-password`
- **When** the user types into `#change-new-password` and `#change-confirm-password`
- **Then** `validatePasswordLive()` evaluates rules on each input event:
  - If length is between 8 and 72 characters, `#rule-length` displays `✓` and emerald text; otherwise displays `○` and slate text
  - If new password is non-empty and differs from current password, `#rule-diff` displays `✓` and emerald text; otherwise displays `○`
  - If confirm password is non-empty and matches new password, `#rule-match` displays `✓` and emerald text; otherwise displays `○`
- **And** the visual status indicators update instantly with zero screen flickering.

### Scenario 5: Password change submission sends valid payload, verifies success, and transitions to `#sp-shell`
- **Given** the user has fulfilled all password rules on `#view-change-password`
- **When** the user clicks `"Guardar nueva contraseña →"`
- **Then** a `POST /api/v1/auth/change-password` request is sent with payload:
  `{ username, currentPassword, newPassword, confirmPassword }`
- **And** upon HTTP 200 response, `mustChangePassword` is set to `false` in user session
- **And** updated tokens are stored in `localStorage`
- **And** `#view-change-password` is hidden with `.hidden`
- **And** `#sp-shell` is displayed without `.hidden`
- **And** the browser URL updates to `/dashboard`
- **And** a confirmation toast `"¡Contraseña actualizada con éxito!"` is shown.

### Scenario 6: User logout from `#sp-shell` clears session and transitions back to `#view-login`
- **Given** an authenticated user is working inside `#sp-shell`
- **When** the user clicks logout in the sidebar footer or topbar dropdown
- **Then** `window.logoutUser()` removes `scu_access_token`, `scu_refresh_token`, and `scu_user_info` from `localStorage`
- **And** `#sp-shell` is hidden with `.hidden`
- **And** `#view-change-password` is hidden
- **And** `#view-login` is displayed without `.hidden`
- **And** form fields and error alerts in `#view-login` are reset
- **And** the browser URL updates to `/login`
- **And** an informational toast `"Sesión cerrada correctamente"` is displayed.

### Scenario 7: Theme toggle (dark/light) functions correctly across all views
- **Given** the user is on `#view-login` or `#view-change-password`
- **When** the theme toggle is triggered (or system preference is dark)
- **Then** the `.dark` class is applied to the root document
- **And** `#view-login` adopts dark styling (`bg-slate-900` / `bg-slate-950`), white text, and dark input containers (`bg-slate-800/80`)
- **And** the lavender concentric arc SVG dims opacity to `0.1`
- **And** `#view-change-password` displays dark card background (`bg-slate-900`) and border (`border-slate-800`) with legible typography and emerald checkmarks.

### Scenario 8: Direct deep links or page refreshes with valid token stay in `#sp-shell`, without token show `#view-login`
- **Given** the user refreshes the browser on `/dashboard` or deep-link `/view2`
- **When** `checkInitialAuth()` executes:
  - If a valid token exists and `GET /api/v1/auth/me` responds with HTTP 200, `#sp-shell` remains visible, `#view-login` remains hidden, and the requested view is rendered
  - If no token exists or `GET /api/v1/auth/me` responds with HTTP 401/403, `logoutUser()` executes, `#sp-shell` is hidden, `#view-login` is rendered, and the URL is rewritten to `/login`.
