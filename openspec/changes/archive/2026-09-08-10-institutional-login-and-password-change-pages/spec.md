# Specification: 10 Institutional Login & Password Change Full-Page Screens

**Change ID**: `10-institutional-login-and-password-change-pages`  
**Topic**: Full-Page Institutional Login Screen (Split 2-Column) and Password Change Screen (Centered Card Canvas)  
**Status**: Draft / Proposed  
**Artifact Mode**: Hybrid (`openspec` markdown + Engram memory persistence)  
**Reference Designs**: 
- `media_1788886485919.png` (`planificacion.unitepc.edu.bo/login`)
- `media_1788886509503.png` (`planificacion.unitepc.edu.bo/cambiar-contrasena`)  
**Design System**: `sea-portal-ui` (`c:\PROYECTOS\SISA\.agent\skills\sea-portal-ui\SKILL.md`)  
**Engram Topic Key**: `sdd/10-institutional-login-and-password-change-pages/spec`

---

## 1. Introduction & Context

In the initial implementation of SISA 2.0, authentication and mandatory first-login password updates were rendered inside modal dialogs (`#sisa-login-modal` and `#modal-forced-password-change`) layered over a dark backdrop blur (`bg-slate-950/85 backdrop-blur-md`). This legacy approach kept the main application shell (`.sp-shell`) mounted in the background DOM, partially visible to unauthenticated visitors.

The canonical UNITEPC institutional standard—exemplified in production reference screenshots `media_1788886485919.png` and `media_1788886509503.png`—mandates dedicated, **full-page screen experiences**:
1. **Institutional Login Screen (`/login`)**: A full-viewport split 2-column layout. The left column communicates institutional brand identity, academic value proposition, and RBAC security highlights over a subtle lavender concentric arc graphic. The right column centers a clean white rounded card (`rounded-[28px]`) featuring a purple check squircle badge, institutional uppercase tags, soft bluish-gray input fields (`#EDF2F9`), and secure session indicators.
2. **Password Change Screen (`/cambiar-contrasena`)**: A clean, distraction-free centered card canvas on a soft neutral background (`#F8FAFC`). It displays a purple lock squircle badge, "PRIMER INGRESO" institutional tag, three soft-toned input fields (`CONTRASEÑA ACTUAL`, `NUEVA CONTRASEÑA`, `REPETIR NUEVA CONTRASEÑA`), an interactive "Reglas de la nueva contraseña" validation container with dynamic status indicators, and an action button.

This specification formalizes the transformation from popup modal overlays to clean, full-screen root views (`#view-login`, `#view-change-password`) that sit as direct siblings to `#sp-shell`, synchronized with browser URLs via the HTML5 History API, while preserving all existing module controllers and session workflows with zero regressions.

---

## 2. Requirements

### 2.1 Root View Architecture & Layout Toggling
- **REQ-ROOT-01**: The root HTML structure MUST define `#view-login`, `#view-change-password`, and `#sp-shell` as sibling root elements at the top level of the DOM.
- **REQ-ROOT-02**: Only ONE root view MUST be visible at any given time. When `#view-login` or `#view-change-password` is active, `#sp-shell` MUST be completely hidden (`class="... hidden"`), eliminating backdrop blur overlays and unauthenticated rendering of portal components.
- **REQ-ROOT-03**: Root view switching MUST be orchestrated imperatively by `app-controller.js` via `showLoginView()`, `showChangePasswordView()`, and `showPortalShell()`.
- **REQ-ROOT-04**: Root view transitions MUST synchronize with browser address bar state using `history.replaceState` without triggering full page reloads:
  - `#view-login` -> `/login`
  - `#view-change-password` -> `/cambiar-contrasena`
  - `#sp-shell` -> `/dashboard` (or requested deep-link module)
- **REQ-ROOT-05**: Backward-compatible wrappers (`openLoginModal()`, `closeLoginModal()`, `openForcedPasswordModal()`, `closeForcedPasswordModal()`) MUST be retained to prevent regressions across existing code callers.

### 2.2 Full-Page Institutional Login View (`#view-login`)
- **REQ-LOGIN-01**: `#view-login` MUST render as a full-viewport flex container (`min-h-screen w-screen flex flex-col lg:flex-row bg-white dark:bg-slate-900`) matching `media_1788886485919.png`.
- **REQ-LOGIN-02 (Left Column Branding)**: The left column (`lg:w-1/2`) MUST contain:
  - Institutional Wordmark: `UNITE` in institutional purple (`#5B3E96`), `PC` in sea teal (`#1F9FAD`), and uppercase subtitle `UNIVERSIDAD PRIVADA` in sea teal (`tracking-[0.25em]`).
  - Eyebrow Tag: `PLATAFORMA INSTITUCIONAL` in uppercase tracked purple font (`text-xs font-bold tracking-widest text-[#7B47B8]`).
  - Display Title: `"Gestión integral de evaluaciones académicas."` in bold display typography (`text-4xl lg:text-5xl font-black font-display tracking-tight text-[#18171C] dark:text-white leading-[1.15]`).
  - Body Description: `"Un espacio seguro para planificar, generar, imprimir y calificar las evaluaciones de la Universidad."` (`text-sm lg:text-base text-[#6B6873] dark:text-slate-400 max-w-md`).
  - Two Feature Value Cards:
    1. *Acceso por roles*: Icon Lucide `shield` inside soft purple container (`bg-[#F0E9F8] text-[#7B47B8] w-12 h-12 rounded-2xl`), text *"Cada usuario visualiza únicamente lo que necesita."*
    2. *Proceso trazable*: Icon Lucide `check-square` inside soft teal container (`bg-[#E0F2F4] text-[#1F9FAD] w-12 h-12 rounded-2xl`), text *"Evaluaciones controladas desde su configuración hasta el resultado."*
  - Decorative Background Arc: Subtle concentric circular arcs rendered via SVG radiating from the bottom-right quadrant with low opacity.
- **REQ-LOGIN-03 (Right Column Canvas)**: The right column (`lg:w-1/2`) MUST render a soft neutral canvas (`bg-[#F8FAFC] dark:bg-slate-950`) centering the authentication card.
- **REQ-LOGIN-04 (Authentication Card)**: The authentication card MUST feature:
  - Width: `w-full max-w-[430px]`, `rounded-[28px]`, pure white background (`bg-white dark:bg-slate-900`), diffused shadow (`shadow-[0_20px_50px_rgba(0,0,0,0.05)]`), and thin border (`border border-slate-100 dark:border-slate-800`).
  - Squircle Badge: `w-12 h-12 rounded-2xl bg-[#6E56CF] text-white flex items-center justify-center shadow-md shadow-purple-500/20 mx-auto` containing Lucide `check` (`stroke-[2.5]`).
  - Category Label: `ACCESO INTERNO` in uppercase bold purple font (`text-[11px] font-extrabold uppercase tracking-wider text-[#6E56CF] mt-4 mb-1`).
  - Header & Subtitle: `"Bienvenido"` (`text-2xl sm:text-3xl font-extrabold text-[#18171C] font-display`), and `"Ingresa con tu usuario y contraseña del sistema."` (`text-xs text-slate-500`).
- **REQ-LOGIN-05 (Inputs & Action Button)**:
  - Form `#sisa-login-form` with:
    - Input `#login-username`: Container `bg-[#EDF2F9] dark:bg-slate-800/80 rounded-xl px-3.5 py-2.5`, Lucide `user` icon, label `USUARIO`.
    - Input `#login-password`: Container `bg-[#EDF2F9] dark:bg-slate-800/80 rounded-xl px-3.5 py-2.5`, Lucide `lock` icon, label `CONTRASEÑA`, and eye toggle button invoking `toggleLoginPasswordVisibility()`.
    - Submit Button `#btn-do-login`: Full width `bg-[#9079ED] hover:bg-[#8064E8] text-white rounded-xl py-3 text-xs font-semibold shadow-md shadow-[#9079ED]/25`, label `"Ingresar al sistema →"`.
  - Security Notice: Lucide `lock` icon in `#1F9FAD` + text `"Sesión protegida para usuarios autorizados."` (`text-[11px] text-slate-500`).
  - Bottom Page Bar: Left: `SISTEMA DE EVALUACIONES • UNITEPC` | Right: `ACCESO INTERNO` (`text-[10px] uppercase text-slate-400 tracking-wider`).

### 2.3 Full-Page Password Change View (`#view-change-password`)
- **REQ-PWD-01**: `#view-change-password` MUST render as a full-viewport centered flex container (`min-h-screen w-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 p-4`) matching `media_1788886509503.png`.
- **REQ-PWD-02 (Password Card)**: The card MUST feature:
  - Width `w-full max-w-[460px]`, `rounded-[28px]`, pure white background (`bg-white dark:bg-slate-900`), diffused shadow (`shadow-[0_20px_50px_rgba(0,0,0,0.05)]`), padding `p-8 sm:p-10`.
  - Squircle Badge: `w-12 h-12 rounded-2xl bg-[#6E56CF] text-white flex items-center justify-center shadow-md shadow-purple-500/20 mx-auto` containing Lucide `lock`.
  - Badge Label `#change-pwd-badge`: Dynamic text displaying `"PRIMER INGRESO"` for forced change or `"SEGURIDAD DE LA CUENTA"` for voluntary change.
  - Header & Subtitle: `"Actualiza tu contraseña"` (`text-2xl sm:text-3xl font-extrabold text-[#18171C] font-display`), and `"Por seguridad, debes reemplazar la contraseña temporal antes de ingresar al sistema."` (`text-xs text-slate-500 max-w-sm mx-auto`).
- **REQ-PWD-03 (3 Password Inputs)**:
  1. `CONTRASEÑA ACTUAL` (`#change-current-password`): Container `bg-[#EDF2F9] rounded-xl px-3.5 py-2.5`, `type="password"`.
  2. `NUEVA CONTRASEÑA` (`#change-new-password`): Container `bg-[#EDF2F9] rounded-xl px-3.5 py-2.5`, `type="password"`, wired to real-time evaluator `validatePasswordLive()`.
  3. `REPETIR NUEVA CONTRASEÑA` (`#change-confirm-password`): Container `bg-[#EDF2F9] rounded-xl px-3.5 py-2.5`, `type="password"`, wired to real-time evaluator `validatePasswordLive()`.
- **REQ-PWD-04 (Dynamic Rule Checklist)**:
  - Verification Box: `bg-[#F8FAFC] dark:bg-slate-800/50 border border-slate-100 rounded-xl p-4`.
  - Header: Lucide `shield` icon (`#7B47B8`) + `"Reglas de la nueva contraseña"`.
  - Three dynamic rule indicators updating live on keystroke:
    - Rule 1 (`#rule-length`): *"Debe tener entre 8 y 72 caracteres."* (Target range: 8 <= length <= 72).
    - Rule 2 (`#rule-diff`): *"Debe ser diferente de la contraseña actual."* (Target: newPassword !== currentPassword && newPassword.length > 0).
    - Rule 3 (`#rule-match`): *"La confirmación debe coincidir con la nueva contraseña."* (Target: confirmPassword === newPassword && newPassword.length > 0).
  - Valid status transforms icon to `✓` in `text-emerald-600 font-bold`. Inactive or unmet status displays `○` in `text-slate-400`.
- **REQ-PWD-05 (Action Button & Sub-Notice)**:
  - Submit Button `#btn-do-change-password`: `w-full py-3 px-4 rounded-xl bg-[#9079ED] hover:bg-[#8064E8] text-white font-semibold text-xs tracking-wide shadow-md shadow-[#9079ED]/25 flex items-center justify-center gap-2 mt-6 cursor-pointer`, label `"Guardar nueva contraseña →"`.
  - Explanatory Notice: `"Estas reglas también se verifican al guardar la contraseña."` (`text-[11px] text-slate-400 mt-4 text-center`).
  - Cancel / Exit Action (`#btn-cancel-pwd-change`): Allows user to abort change and return to login or portal.

### 2.4 Authentication & Password Change Data Contracts
- **REQ-AUTH-01 (Login Request)**:
  - Endpoint: `POST /api/v1/auth/login`
  - Payload: `{ username: string, password: string }`
  - Response: `ScuAuthResponse` containing `accessToken`, `refreshToken`, `mustChangePassword`, `user` (`id`, `username`, `email`, `role`, `sedeNombre`, `mustChangePassword`).
- **REQ-AUTH-02 (Password Change Payload Alignment)**:
  - Endpoint: `POST /api/v1/auth/change-password`
  - Headers: `Authorization: Bearer <token>`
  - Payload MUST include all four properties:
    ```json
    {
      "username": "<username>",
      "currentPassword": "<currentPassword>",
      "newPassword": "<newPassword>",
      "confirmPassword": "<confirmPassword>"
    }
    ```
  - Backend command `ScuChangePasswordCmd` verifies BCrypt hash of `currentPassword`, character length (8-72), non-matching CI/username, and exact match of `confirmPassword`.
- **REQ-AUTH-03 (Session Token Management)**:
  - Upon successful auth, access token and user info MUST be stored in `localStorage` under `scu_access_token`, `scu_refresh_token`, and `scu_user_info`.
  - Session restoration via `checkInitialAuth()` MUST query `GET /api/v1/auth/me`. If invalid (401/403), session is cleared and `#view-login` displayed.

### 2.5 Theming & Responsive Behavior
- **REQ-THEME-01**: Both `#view-login` and `#view-change-password` MUST fully support dark theme (`.dark` class on root/body) utilizing design tokens from `sea-portal-ui` (`--sp-bg`, `--sp-surface`, `--sp-ink`).
- **REQ-THEME-02**: On screens `< 1024px` (mobile/tablet), `#view-login` MUST stack vertically, collapsing the left column into a clean institutional header while preserving centered alignment of the authentication card.

---

## 3. Scenarios & Acceptance Criteria (Given / When / Then)

### Scenario 1: Unauthenticated session displays full-page Login view (`#view-login`)
- **Given** an unauthenticated visitor navigates to the application root URL `/` or `/login`
- **When** `checkInitialAuth()` executes and finds no valid token in `localStorage`
- **Then** the full-page Login view `#view-login` is rendered visible without the `.hidden` class
- **And** the portal shell `#sp-shell` and password change view `#view-change-password` are completely hidden with `.hidden`
- **And** no modal backdrop blur overlays are present
- **And** the left column displays the UNITEPC logo, "PLATAFORMA INSTITUCIONAL", display title, body, two feature pills, and lavender concentric arc SVG
- **And** the right column centers the authentication card with username and password inputs, submit button, and protected session notice
- **And** the browser URL displays `/login`.

### Scenario 2: Successful authentication for regular user (`mustChangePassword == false`)
- **Given** the user is viewing `#view-login`
- **When** the user inputs valid credentials for an active account with `mustChangePassword == false` and submits the form
- **Then** `POST /api/v1/auth/login` returns HTTP 200 with access token and user data
- **And** session tokens and profile are saved to `localStorage`
- **And** `#view-login` is hidden with `.hidden`
- **And** `#sp-shell` is made visible without `.hidden`
- **And** the active view switches to `#view-dashboard` (or `#view6` if user is `ROLE_ADMIN`)
- **And** the browser URL updates to `/dashboard` via `history.replaceState`
- **And** a welcome toast notification appears with the user's name.

### Scenario 3: First-time login with temporary initial password (`mustChangePassword == true`)
- **Given** a new user with a temporary password is on `#view-login`
- **When** the user submits their valid initial credentials
- **Then** `POST /api/v1/auth/login` returns HTTP 200 with `mustChangePassword: true`
- **And** `#view-login` is hidden
- **And** `#view-change-password` is displayed without `.hidden`
- **And** `#sp-shell` remains completely hidden
- **And** the username and current password are retained in memory and prefilled into `#change-current-password`
- **And** the card displays the badge "PRIMER INGRESO" and header "Actualiza tu contraseña"
- **And** the browser URL updates to `/cambiar-contrasena`.

### Scenario 4: Dynamic password validation checklist on keyup in Password Change view
- **Given** the user is viewing `#view-change-password`
- **When** the user types into `#change-new-password` and `#change-confirm-password`
- **Then** `validatePasswordLive()` evaluates the rules on each input event:
  - If length is between 8 and 72 characters, `#rule-length` displays a green checkmark `✓` and emerald text; otherwise displays `○` and slate text
  - If new password is non-empty and differs from current password, `#rule-diff` displays a green checkmark `✓` and emerald text; otherwise displays `○`
  - If confirm password is non-empty and matches new password, `#rule-match` displays a green checkmark `✓` and emerald text; otherwise displays `○`
- **And** the visual state updates instantly without screen flickering.

### Scenario 5: Password change submission sends valid payload, verifies success, and transitions to `#sp-shell`
- **Given** the user has fulfilled all password rules on `#view-change-password`
- **When** the user clicks "Guardar nueva contraseña →"
- **Then** a `POST /api/v1/auth/change-password` request is sent with JSON payload:
  `{ username, currentPassword, newPassword, confirmPassword }`
- **And** upon HTTP 200 response, `mustChangePassword` is set to `false` in user session
- **And** updated tokens are stored in `localStorage`
- **And** `#view-change-password` is hidden with `.hidden`
- **And** `#sp-shell` is displayed without `.hidden`
- **And** the browser URL updates to `/dashboard`
- **And** a confirmation toast `"¡Contraseña actualizada con éxito!"` is shown.

### Scenario 6: User logout from `#sp-shell` clears session and transitions back to `#view-login`
- **Given** an authenticated user is working inside `#sp-shell`
- **When** the user clicks the logout button in the sidebar footer or topbar dropdown
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
- **And** `#view-login` adopts dark background (`bg-slate-900` / `bg-slate-950`), white text, and dark input containers (`bg-slate-800/80`)
- **And** the lavender concentric arc SVG dims opacity (`opacity-10`) to maintain visual subtlety
- **And** `#view-change-password` displays dark card background (`bg-slate-900`) and border (`border-slate-800`) with legible typography and emerald checkmarks.

### Scenario 8: Direct deep links or page refreshes with valid token stay in `#sp-shell`, without token show `#view-login`
- **Given** the user refreshes the browser on `/dashboard` or deep-link `/view2`
- **When** `checkInitialAuth()` executes:
  - If a valid token exists and `GET /api/v1/auth/me` responds with HTTP 200, `#sp-shell` remains visible, `#view-login` remains hidden, and the requested view is rendered
  - If no token exists or `GET /api/v1/auth/me` responds with HTTP 401/403, `logoutUser()` executes, `#sp-shell` is hidden, `#view-login` is rendered, and the URL is rewritten to `/login`.

---

## 4. Architectural Matrix & Backward Compatibility

| Component / Function | Legacy Implementation | New Canonical Implementation | Compatibility Mode |
| :--- | :--- | :--- | :--- |
| **Login UI** | `#sisa-login-modal` with `bg-slate-950/85 backdrop-blur-md` | `#view-login` full-viewport split 2-column layout matching `media_1788886485919.png` | `openLoginModal()` delegates directly to `showLoginView()`. |
| **Password Change UI** | `#modal-forced-password-change` overlay | `#view-change-password` full-viewport centered card matching `media_1788886509503.png` | `openForcedPasswordModal()` delegates directly to `showChangePasswordView()`. |
| **Current Password Field** | Omitted in modal HTML | `#change-current-password` input included and sent in payload | Required for backend `ScuChangePasswordCmd` validation. |
| **Rule Validation** | Static bullet list | `#rule-length`, `#rule-diff`, `#rule-match` dynamic indicators updated live on keyup | Dynamic status feedback via `validatePasswordLive()`. |
| **URL Management** | Static address bar | History API `history.replaceState` (`/login`, `/cambiar-contrasena`, `/dashboard`) | Clean navigation without router dependencies. |
| **Session Transitions** | Modal `.hidden` toggles leaving `.sp-shell` exposed | Sibling root views `#view-login`, `#view-change-password`, `#sp-shell` mutually exclusive | Absolute visual isolation between auth and shell. |
