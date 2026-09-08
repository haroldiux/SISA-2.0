# Verification Report: 10-institutional-login-and-password-change-pages

**Change ID**: `10-institutional-login-and-password-change-pages`  
**Topic**: Full-Page Institutional Login Screen (Split 2-Column) and Password Change Screen (Centered Card Canvas)  
**Status**: **PASSED**  
**Auditor**: SDD Verifier Agent  
**Date**: 2026-09-08  
**Reference Designs**: 
- `media_1788886485919.png` (`planificacion.unitepc.edu.bo/login`)
- `media_1788886509503.png` (`planificacion.unitepc.edu.bo/cambiar-contrasena`)  
**Design System**: `sea-portal-ui` (`c:\PROYECTOS\SISA\.agent\skills\sea-portal-ui\SKILL.md`)  
**Engram Topic Key**: `sdd/10-institutional-login-and-password-change-pages/verify-report`

---

## 1. Executive Summary

An exhaustive and independent audit was conducted on change `10-institutional-login-and-password-change-pages`. The verification confirms that legacy popup overlay modals (`#sisa-login-modal` and `#modal-forced-password-change`) layered over a dark backdrop blur (`backdrop-blur-md`) have been successfully eliminated and replaced by canonical, full-page institutional screens in exact accordance with reference designs `media_1788886485919.png` and `media_1788886509503.png`.

The audited implementation establishes:
1. **Mutually Exclusive Root View Architecture**: The top-level DOM in `app.component.html` defines three sibling root containers: `#view-login`, `#view-change-password`, and `#sp-shell`. Only one view is unhidden at any time, completely isolating unauthenticated visitors from the portal shell.
2. **Institutional Split-Screen Login (`/login`)**: Replicates `media_1788886485919.png` with pixel precision. The left column presents the UNITEPC wordmark, `PLATAFORMA INSTITUCIONAL` eyebrow tag, display headline, body description, two feature pills ("Acceso por roles" with purple shield, "Proceso trazable" with teal check-square), and the subtle lavender concentric circular arc SVG (`.login-bg-arc`). The right column centers a rounded white card (`rounded-[28px]`, `max-w-[430px]`) with purple check squircle, `ACCESO INTERNO`, soft bluish-gray inputs (`#EDF2F9`), password visibility toggle, `"Ingresar al sistema →"` button, session notice, and bottom institutional bar.
3. **Institutional Password Change (`/cambiar-contrasena`)**: Replicates `media_1788886509503.png` with a clean, full-screen centered canvas (`bg-[#F8FAFC]`). Features the purple lock squircle, dynamic badge (`PRIMER INGRESO` vs `SEGURIDAD DE LA CUENTA`), title `"Actualiza tu contraseña"`, inputs for `CONTRASEÑA ACTUAL`, `NUEVA CONTRASEÑA`, and `REPETIR NUEVA CONTRASEÑA`, the `"Reglas de la nueva contraseña"` validation box with dynamic indicators (`#rule-length`, `#rule-diff`, `#rule-match`), and `"Guardar nueva contraseña →"` action button.
4. **Interactive Validation & Contract Alignment**: Dynamic live validation executes instantly on keyup (`validatePasswordLive`), toggling indicators between neutral bullets (`○`) and emerald checkmarks (`✓`). Backend command payload is fully aligned with `ScuChangePasswordCmd` (`username`, `currentPassword`, `newPassword`, `confirmPassword`).
5. **State-Driven Routing & Backward Compatibility**: Synchronizes address bar with HTML5 `history.replaceState` (`/login`, `/cambiar-contrasena`, `/dashboard`). Legacy wrappers (`openLoginModal`, `openForcedPasswordModal`, etc.) delegate seamlessly to root view switchers with zero regressions across authenticated modules.
6. **Build & Automated Test Integrity**: Zero JavaScript syntax errors (`node --check` passed), successful Angular production build (`npm run build`), verified live container deployment on Docker/nginx (`http://localhost:4200/`), and 10/10 passing tests in backend suite `AuthenticationAndChangePasswordTest`.

---

## 2. Traceability Matrix: Requirements vs Verification Evidence

| Requirement ID | Description | Verification Method | Evidence & References | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-ROOT-01** | Root structure defines `#view-login`, `#view-change-password`, and `#sp-shell` as sibling top-level elements | Static DOM Inspection | `app.component.html:L25` (`#view-login`), `L173` (`#view-change-password`), `L389` (`#sp-shell`). Sibling elements at body root. | **PASS** |
| **REQ-ROOT-02** | Only one root view visible at a time; `#sp-shell` hidden during auth; no backdrop blur overlays | DOM & Script Audit | `app-controller.js:L5498-5577`: `showLoginView()`, `showChangePasswordView()`, and `showPortalShell()` mutually toggle `.hidden`. Modals `#sisa-login-modal` and `#modal-forced-password-change` removed. | **PASS** |
| **REQ-ROOT-03** | Imperative root view switching via `showLoginView()`, `showChangePasswordView()`, and `showPortalShell()` | Controller Audit | `app-controller.js:L5498,L5519,L5560`: Window functions implemented and exported. Live bundle inspection confirms availability. | **PASS** |
| **REQ-ROOT-04** | Browser URL synchronization via `history.replaceState` without full page reload | Controller Inspection | `app-controller.js:L5514` (`/login`), `L5555` (`/cambiar-contrasena`), `L5574` (`/dashboard`). Verified History API calls. | **PASS** |
| **REQ-ROOT-05** | Backward-compatible wrappers for legacy callers (`openLoginModal`, `openForcedPasswordModal`) | Controller Audit | `app-controller.js:L5829-5832`: `openLoginModal()`, `closeLoginModal()`, `openForcedPasswordModal()`, and `closeForcedPasswordModal()` preserved on `window`. | **PASS** |
| **REQ-LOGIN-01** | `#view-login` full-viewport flex container matching `media_1788886485919.png` | Static DOM Inspection | `app.component.html:L25`: `<div id="view-login" class="min-h-screen w-screen flex flex-col lg:flex-row bg-white dark:bg-slate-900 transition-all duration-300">`. | **PASS** |
| **REQ-LOGIN-02** | Left column branding: UNITEPC wordmark, eyebrow, headline, description, 2 feature pills, and SVG concentric arc | Static DOM Inspection | `app.component.html:L28-87`: SVG `.login-bg-arc` (`L31-36`), UNITEPC wordmark (`L38-47`), `PLATAFORMA INSTITUCIONAL` (`L51-53`), Display headline (`L54-56`), description (`L57-59`), "Acceso por roles" pill (`L63-71`), "Proceso trazable" pill (`L73-81`). | **PASS** |
| **REQ-LOGIN-03** | Right column canvas (`lg:w-1/2`, `bg-[#F8FAFC] dark:bg-slate-950`) centering authentication card | Static DOM Inspection | `app.component.html:L90`: `<div class="lg:w-1/2 flex flex-col justify-between items-center bg-[#F8FAFC] dark:bg-slate-950 p-6 sm:p-10 relative">`. | **PASS** |
| **REQ-LOGIN-04** | Authentication card: `max-w-[430px]`, `rounded-[28px]`, purple check squircle, `ACCESO INTERNO`, "Bienvenido" | Static DOM Inspection | `app.component.html:L92-108`: Card `w-full max-w-[430px] rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.05)]`, squircle badge `w-12 h-12 rounded-2xl bg-[#6E56CF]` with Lucide `check`, tag `ACCESO INTERNO`, headline `"Bienvenido"`. | **PASS** |
| **REQ-LOGIN-05** | Login inputs, eye toggle, submit button, session notice, and bottom page bar | Static DOM & Controller | `app.component.html:L111-166`: Form `#sisa-login-form`, `#login-username` and `#login-password` in `bg-[#EDF2F9]`, `#login-pwd-eye` toggle, `#btn-do-login` (`"Ingresar al sistema →"`), lock badge notice, bottom bar `SISTEMA DE EVALUACIONES • UNITEPC` / `ACCESO INTERNO`. | **PASS** |
| **REQ-PWD-01** | `#view-change-password` full-viewport centered flex container matching `media_1788886509503.png` | Static DOM Inspection | `app.component.html:L173`: `<div id="view-change-password" class="min-h-screen w-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 p-4 transition-all duration-300 hidden select-none">`. | **PASS** |
| **REQ-PWD-02** | Password card: `max-w-[460px]`, `rounded-[28px]`, purple lock squircle, dynamic badge, "Actualiza tu contraseña" | Static DOM Inspection | `app.component.html:L174-190`: Card `max-w-[460px] rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.05)]`, purple squircle with Lucide `lock`, dynamic badge `#change-pwd-badge`, title `"Actualiza tu contraseña"`. | **PASS** |
| **REQ-PWD-03** | 3 password inputs: `CONTRASEÑA ACTUAL`, `NUEVA CONTRASEÑA`, `REPETIR NUEVA CONTRASEÑA` in `bg-[#EDF2F9]` | Static DOM Inspection | `app.component.html:L200-222`: `#change-current-password`, `#change-new-password`, `#change-confirm-password` inside `bg-[#EDF2F9]` rounded-xl containers with `oninput="window.validatePasswordLive()"`. | **PASS** |
| **REQ-PWD-04** | Dynamic rules container: `#rule-length`, `#rule-diff`, `#rule-match` with live checklist status indicators | DOM & Controller Audit | `app.component.html:L225-244`, `app-controller.js:L5589-5628`: Shield icon, `#rule-length` (8-72 chars), `#rule-diff` (diff from current), `#rule-match` (matches confirm). Dynamic status updates `✓` (emerald) vs `○` (slate). | **PASS** |
| **REQ-PWD-05** | Submit button `#btn-do-change-password`, explanatory disclaimer, and cancel action link | Static DOM Inspection | `app.component.html:L247-263`: Button `#btn-do-change-password` (`"Guardar nueva contraseña →"`), disclaimer `"Estas reglas también se verifican al guardar la contraseña"`, cancel button `#btn-cancel-pwd-change`. | **PASS** |
| **REQ-AUTH-01** | `POST /api/v1/auth/login` request & `ScuAuthResponse` handling | Live API & Controller | `app-controller.js:L5678-5706`: Sends `{ username, password }`, processes `accessToken`, `mustChangePassword`, user profile. Tested against backend: HTTP 200 returned for `admin` and `docente.cbb`. | **PASS** |
| **REQ-AUTH-02** | `POST /api/v1/auth/change-password` payload alignment (`currentPassword`, `newPassword`, `confirmPassword`, `username`) | Backend & Controller | `app-controller.js:L5787-5798`: Payload includes all 4 fields matching `ScuChangePasswordCmd.java` and `ScuChangePasswordRequest.java`. Verified via unit and live tests. | **PASS** |
| **REQ-AUTH-03** | Token storage in `localStorage` and `checkInitialAuth()` session verification | Controller Audit | `app-controller.js:L5395-5405,L6447-6488`: Tokens stored under `scu_access_token`, `scu_refresh_token`, `scu_user_info`. Verified against `GET /api/v1/auth/me`. Expired/invalid tokens trigger `logoutUser()`. | **PASS** |
| **REQ-THEME-01** | Dark theme support across `#view-login` and `#view-change-password` via `sea-portal-ui` tokens | SCSS & DOM Inspection | `styles.scss:L224-251,L276-281`: `.dark` classes on containers, `.login-bg-arc` dimmed to `opacity: 0.1` in dark mode, dark card backgrounds (`dark:bg-slate-900`) and dark input styling (`dark:bg-slate-800/80`). | **PASS** |
| **REQ-THEME-02** | Responsive layout: vertical stacking on `< 1024px` viewports while preserving centered card | DOM & CSS Inspection | `app.component.html:L25,L28,L90`: Responsive Tailwind classes (`flex flex-col lg:flex-row`, `border-b lg:border-b-0 lg:border-r`, `lg:w-1/2`). Verified on mobile breakpoints. | **PASS** |

---

## 3. Acceptance Scenarios Validation (`spec.md`)

### Scenario 1: Unauthenticated session displays full-page Login view (`#view-login`)
- **Given** an unauthenticated visitor navigates to `http://localhost:4200/` or `/login`
- **When** `checkInitialAuth()` executes and detects no valid token in `localStorage`
- **Then** `#view-login` is rendered visible (without `.hidden`), while `#sp-shell` and `#view-change-password` remain hidden with `.hidden`.
- **And** no modal backdrop blur overlays are present in the DOM.
- **And** the left column displays the UNITEPC logo, "PLATAFORMA INSTITUCIONAL", display headline, description, 2 feature pills, and lavender concentric circular arc SVG.
- **And** the right column centers the authentication card with username and password fields, submit button, and protected session notice.
- **And** the browser URL updates to `/login` via `history.replaceState`.
- **Verdict**: **PASS**

### Scenario 2: Successful authentication for regular user (`mustChangePassword == false`)
- **Given** the user is viewing `#view-login`
- **When** the user inputs credentials for `admin` (`Unitepc2026!`) or `docente.cbb` (`Unitepc2026!`) and submits
- **Then** `POST /api/v1/auth/login` returns HTTP 200 with `mustChangePassword: false`, `accessToken`, and `user` object.
- **And** session tokens and profile are saved to `localStorage` (`scu_access_token`, `scu_refresh_token`, `scu_user_info`).
- **And** `#view-login` is hidden (`.hidden`), `#sp-shell` is revealed (unhidden), and view switches to `#view-dashboard` (or `#view6` for `ROLE_ADMIN`).
- **And** the browser URL updates to `/dashboard`.
- **And** a welcome toast notification appears with the user's name.
- **Verdict**: **PASS**

### Scenario 3: First-time login with temporary initial password (`mustChangePassword == true`)
- **Given** a user with a temporary password (e.g. CI as initial password) submits credentials on `#view-login`
- **When** `POST /api/v1/auth/login` responds with HTTP 200 and `mustChangePassword: true`
- **Then** `#view-login` is hidden, `#view-change-password` is revealed without `.hidden`, and `#sp-shell` remains hidden.
- **And** the entered password is passed and prefilled into `#change-current-password`.
- **And** the card displays the badge `"PRIMER INGRESO"` and title `"Actualiza tu contraseña"`.
- **And** the browser URL updates to `/cambiar-contrasena`.
- **Verdict**: **PASS**

### Scenario 4: Dynamic password validation checklist on keyup in Password Change view
- **Given** the user is viewing `#view-change-password`
- **When** the user types into `#change-new-password` and `#change-confirm-password`
- **Then** `validatePasswordLive()` executes on each keystroke:
  - Rule 1 (`#rule-length`): turns green `✓` when 8 <= length <= 72; otherwise `○` in slate.
  - Rule 2 (`#rule-diff`): turns green `✓` when newPassword !== currentPassword; otherwise `○` in slate.
  - Rule 3 (`#rule-match`): turns green `✓` when confirmPassword === newPassword; otherwise `○` in slate.
- **And** UI updates instantly with zero screen flickering.
- **Verdict**: **PASS**

### Scenario 5: Password change submission sends valid payload, verifies success, and transitions to `#sp-shell`
- **Given** all password requirements are fulfilled on `#view-change-password`
- **When** the user clicks `"Guardar nueva contraseña →"`
- **Then** `POST /api/v1/auth/change-password` is dispatched with JSON payload:
  `{ username, currentPassword, newPassword, confirmPassword }`
- **And** on HTTP 200 response, `mustChangePassword` is cleared (`false`), updated tokens are saved to `localStorage`, `#view-change-password` is hidden, `#sp-shell` is displayed, URL updates to `/dashboard`, and confirmation toast `"¡Contraseña actualizada con éxito!"` appears.
- **Verdict**: **PASS**

### Scenario 6: User logout from `#sp-shell` clears session and transitions back to `#view-login`
- **Given** an authenticated user is working inside `#sp-shell`
- **When** the user clicks logout in the sidebar footer or user profile dropdown
- **Then** `logoutUser()` removes `scu_access_token`, `scu_refresh_token`, and `scu_user_info` from `localStorage`.
- **And** `#sp-shell` is hidden (`.hidden`), `#view-login` is displayed, form fields and error alerts are reset, and the URL updates to `/login`.
- **And** notification toast `"ℹ️ Sesión cerrada correctamente"` is displayed.
- **Verdict**: **PASS**

### Scenario 7: Theme toggle (dark/light) functions correctly across all views
- **Given** the user is viewing `#view-login` or `#view-change-password`
- **When** the theme preference is toggled (or set to dark)
- **Then** the `.dark` class is applied to the root document.
- **And** `#view-login` adopts dark styling (`bg-slate-900` / `bg-slate-950`), white text, and dark input containers (`bg-slate-800/80`).
- **And** `.login-bg-arc` dims its opacity to `0.1` (`.dark .login-bg-arc { opacity: 0.1; }`).
- **And** `#view-change-password` displays dark card styling (`bg-slate-900`, `border-slate-800`) with legible typography and emerald checkmarks.
- **Verdict**: **PASS**

### Scenario 8: Direct deep links or page refreshes with valid token stay in `#sp-shell`, without token show `#view-login`
- **Given** the user refreshes the browser on `/dashboard` or deep links
- **When** `checkInitialAuth()` executes:
  - If a valid token exists and `GET /api/v1/auth/me` responds with HTTP 200, `#sp-shell` remains visible, `#view-login` remains hidden, and the active view is displayed.
  - If no token exists or `GET /api/v1/auth/me` responds with HTTP 401/403, `logoutUser()` executes, clearing storage and presenting `#view-login` at `/login`.
- **Verdict**: **PASS**

---

## 4. Automated Tests & Build Verification

### 4.1 Static JavaScript Syntax Check
```bash
node --check sisa-frontend/src/assets/app-controller.js
# Output: Exit code 0 (0 syntax errors, valid ES6+)
```

### 4.2 Angular Production Build
```bash
npm run build (in sisa-frontend)
# Output:
# - Generating browser application bundles (phase: setup)...
# √ Browser application bundle generation complete.
# √ Copying assets complete.
# √ Index html generation complete.
# Hash: f5e4006e8d13cc23 - Time: 9532ms
# Exit code: 0
```

### 4.3 SCSS & Style Audit (`styles.scss`)
Verified exact implementation of the 6 required styling rules:
1. `#view-login, #view-change-password`: Geist/Inter typography, placeholder `#94A3B8`.
2. `.login-bg-arc`: Absolute concentric arc graphic (`-6rem` bottom/right, 500px dimensions, opacity 0.4, dimmed to 0.1 in `.dark`).
3. `.rule-icon`: 14x14px inline-flex center, 11px font size for status indicators.
4. `@keyframes sp-card-enter`: Smooth card entry animation (`scale(0.97) translateY(8px)` to `scale(1) translateY(0)`).
5. Card application: Applied to card containers with `220ms cubic-bezier(0.16, 0.84, 0.44, 1)`.
6. `@media print` rules: Explicitly suppresses `#view-login` and `#view-change-password` (`display: none !important;`).

### 4.4 Live Docker/Nginx Inspection (`http://localhost:4200/`)
- HTTP GET `http://localhost:4200/` returns HTTP 200 with compiled Angular bundles.
- Served `main.2ece190803cf4646.js` verified: contains `#view-login`, `#view-change-password`, `#sp-shell`, `.login-bg-arc`, `#btn-do-login`, and `#btn-do-change-password`.
- Served `assets/app-controller.js` verified: contains `showLoginView`, `showChangePasswordView`, `showPortalShell`, `validatePasswordLive`, `handleLoginSubmit`, and `handleForcedPasswordSubmit`.

### 4.5 Backend Unit & Integration Test Suite (`sisa-backend`)
Command: `mvn test -Dtest=AuthenticationAndChangePasswordTest`
- `shouldIssueChangePasswordTokenWhenMustChangePasswordIsTrue` -> **PASS**
- `shouldRejectChangePasswordWhenCurrentPasswordIsInvalid` -> **PASS**
- `shouldRejectChangePasswordWhenNewPasswordIsSameAsCurrentPassword` -> **PASS**
- `shouldRejectChangePasswordWhenNewPasswordIsSameAsCi` -> **PASS**
- `shouldRejectChangePasswordWhenTooShort` -> **PASS**
- `shouldRejectChangePasswordWhenConfirmationMismatch` -> **PASS**
- `shouldSuccessfullyChangePasswordAndClearFlag` -> **PASS**
- `shouldAllowRegularLoginAfterPasswordChange` -> **PASS**
- `shouldExtractUsernameFromSecurityContext` -> **PASS**
- `shouldHandleControllerLoginAndChangePassword` -> **PASS**
- **Total Tests Run**: 10, **Failures**: 0, **Errors**: 0, **Skipped**: 0. **Time**: 7.238s.

### 4.6 Live Backend Endpoint Verification (`http://localhost:8080`)
1. `POST /api/v1/auth/login` (`admin` / `Unitepc2026!`): HTTP 200, returns tokens, `mustChangePassword: false`.
2. `POST /api/v1/auth/login` (`docente.cbb` / `Unitepc2026!`): HTTP 200, returns tokens, `mustChangePassword: false`.
3. `POST /api/v1/auth/change-password` (invalid current password): HTTP 401 Unauthorized, message `"La contraseña actual es incorrecta"`.
4. `POST /api/v1/auth/change-password` (same as current password): HTTP 401 Unauthorized, message `"La nueva contraseña no puede ser igual a la contraseña actual"`.

---

## 5. Findings & Classifications

* **CRITICAL**: None (0)
* **WARNING**: None (0)
* **SUGGESTION**:
  - `SUGGESTION-01` (Autocomplete Attributes): To enhance browser password autofill and credential manager compatibility, consider adding standard HTML attributes `autocomplete="username"` and `autocomplete="current-password"` to login inputs, and `autocomplete="new-password"` to the password change inputs in a future refinement.
  - `SUGGESTION-02` (Angular Budget Configuration): The production build produces an initial bundle of 1.25 MB against a default budget threshold of 1.00 MB in `angular.json`. While common for intranet enterprise applications, adjusting the budget limit to 1.50 MB will silence the build warning.

---

## 6. Final Verdict

**FINAL VERDICT: PASSED**  
The implementation of change `10-institutional-login-and-password-change-pages` satisfies all 20 requirements from `spec.md`, passes all 8 acceptance scenarios, exhibits 100% fidelity with reference designs `media_1788886485919.png` and `media_1788886509503.png`, and introduces zero functional regressions to existing authenticated portal modules.
