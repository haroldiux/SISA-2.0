# Exploration Analysis: Institutional Login & Password Change Full-Page Screens

**Change ID**: `10-institutional-login-and-password-change-pages`  
**Topic**: Full-page institutional Login screen (split-screen 2-column) and Password Change screen (centered card) matching reference screenshots `media_1788886485919.png` and `media_1788886509503.png`.  
**Status**: Completed Exploration  
**Artifact Store Mode**: Hybrid (`openspec` markdown + Engram memory persistence)  
**Engram Topic Key**: `sdd/10-institutional-login-and-password-change-pages/explore`  

---

## 1. Executive Summary & Context

SISA 2.0 currently handles authentication and mandatory first-login password updates using fixed overlay modals (`#sisa-login-modal` and `#modal-forced-password-change`) with dark backdrop blur overlays (`bg-slate-950/85 backdrop-blur-md`). Under this architecture, the main application shell (`.sp-shell`) is rendered in the background DOM, visible dimly through the blur even before an unauthenticated user submits credentials.

The canonical UNITEPC production standard—demonstrated in reference screenshots `media_1788886485919.png` (URL `planificacion.unitepc.edu.bo/login`) and `media_1788886509503.png` (URL `planificacion.unitepc.edu.bo/cambiar-contrasena`)—mandates dedicated, **full-page experiences**:
1. **Institutional Login Screen (`/login`)**: A split-screen 2-column layout. The left column showcases institutional identity, value proposition, and RBAC highlights over a subtle lavender concentric arc. The right column centers a clean white rounded card with soft bluish-gray input fields, a distinctive purple squircle badge, and a secure session notice.
2. **Password Change Screen (`/cambiar-contrasena`)**: A centered card canvas on a soft neutral gray background. The card features a purple lock squircle, "PRIMER INGRESO" institutional tag, three soft-toned input fields (Current, New, Confirm), a structured "Reglas de la nueva contraseña" validation container with dynamic feedback, and a unified action button.

This exploration analyzes the current implementation, evaluates architectural options, and formulates a zero-regression blueprint to transition from popup modals to clean, full-screen root views (`#view-login`, `#view-change-password`) that conditionally toggle with `#sp-shell`.

---

## 2. Deep Dive: Reference UI Analysis

### 2.1 Reference Screenshot 1: Institutional Login (`media_1788886485919.png`)
*URL: `planificacion.unitepc.edu.bo/login`*

```
┌───────────────────────────────────────────────────┬───────────────────────────────────────────────────┐
│ LEFT COLUMN (Institutional Value & Identity)      │ RIGHT COLUMN (Authentication Card Canvas)         │
│ Background: Pure White (#FFFFFF)                  │ Background: Soft Light Neutral (#F8FAFC)          │
│                                                   │                                                   │
│ [Logo] UNITEPC (Purple/Teal)                      │               ┌───────────────────────┐           │
│        UNIVERSIDAD PRIVADA                        │               │        [ ✔ ]          │           │
│                                                   │               │     ACCESO INTERNO    │           │
│ PLATAFORMA INSTITUCIONAL                          │               │       Bienvenido      │           │
│                                                   │               │ Ingresa con tu usuario│           │
│ Gestión integral                                  │               │   y contraseña...     │           │
│ de evaluaciones                                   │               │                       │           │
│ académicas.                                       │               │ USUARIO               │           │
│                                                   │               │ [👤  78311416       ] │           │
│ Un espacio seguro para planificar, generar,       │               │                       │           │
│ imprimir y calificar las evaluaciones de la       │               │ CONTRASEÑA            │           │
│ Universidad.                                      │               │ [🔒  ••••••••      👁] │           │
│                                                   │               │                       │           │
│ [ 🛡 ] Acceso por roles                           │               │ [Ingresar al sistema →│           │
│        Cada usuario visualiza únicamente lo que   │               │                       │           │
│        necesita.                                  │               │ 🔒 Sesión protegida... │           │
│                                                   │               └───────────────────────┘           │
│ [ ☑ ] Proceso trazable                            │                                                   │
│        Evaluaciones controladas desde su config.  │                                                   │
│        hasta el resultado.                        │                                                   │
│                                                   │                                                   │
│ (Subtle large concentric arc graphic in lavender) │ SISTEMA DE EVALUACIONES • UNITEPC   ACCESO INTERNO│
└───────────────────────────────────────────────────┴───────────────────────────────────────────────────┘
```

#### Detailed Element Specifications:
- **Left Column**:
  - **Wordmark & Subtitle**: `UNITE` in deep institutional purple (`#5B3E96`), `PC` in sea teal (`#1F9FAD`). Subtitle `UNIVERSIDAD PRIVADA` in small bold teal text with wide tracking (`tracking-[0.25em]`).
  - **Category Tag**: `PLATAFORMA INSTITUCIONAL` in uppercase tracked purple font (`text-xs font-bold tracking-widest text-[#7B47B8]`).
  - **Display Headline**:
    ```
    Gestión integral
    de evaluaciones
    académicas.
    ```
    Rendered in bold display typography (`font-display font-extrabold text-4xl lg:text-5xl text-[#18171C] leading-tight`).
  - **Descriptive Body**: *"Un espacio seguro para planificar, generar, imprimir y calificar las evaluaciones de la Universidad."* (`text-slate-500 text-sm md:text-base max-w-md mt-4`).
  - **Feature Pills (2 stacked items)**:
    1. *Acceso por roles*: Icon is a soft purple shield inside `w-12 h-12 rounded-2xl bg-[#F0E9F8] text-[#7B47B8]`. Text: *"Cada usuario visualiza únicamente lo que necesita."*
    2. *Proceso trazable*: Icon is a teal checkmark-square inside `w-12 h-12 rounded-2xl bg-[#E0F2F4] text-[#1F9FAD]`. Text: *"Evaluaciones controladas desde su configuración hasta el resultado."*
  - **Background Arc**: Subtle concentric circular arc radiating from the bottom right quadrant of the left column in soft lavender (`stroke="#EAE6F8"` or radial gradient `rgba(123, 71, 184, 0.06)`).

- **Right Column**:
  - **Canvas**: Clean soft neutral background (`#F8FAFC`).
  - **Card Container**: `rounded-[28px]`, pure white background (`#FFFFFF`), subtle diffused elevation (`shadow-[0_20px_50px_rgba(0,0,0,0.05)]`), border `border-slate-100 dark:border-slate-800`, width `max-w-[430px]`, padding `p-8 sm:p-10`.
  - **Top Squircle Badge**: `w-12 h-12 rounded-2xl bg-[#6E56CF] text-white flex items-center justify-center shadow-md shadow-purple-500/20 mx-auto` with Lucide `check`.
  - **Institutional Tag**: `ACCESO INTERNO` in uppercase bold purple font (`text-[11px] tracking-wider text-[#6E56CF] font-bold mt-4 mb-1`).
  - **Headline**: `Bienvenido` (`text-2xl sm:text-3xl font-extrabold text-[#18171C] font-display`).
  - **Subtitle**: *"Ingresa con tu usuario y contraseña del sistema."* (`text-xs text-slate-500 mt-1 mb-6`).
  - **Input Fields**:
    - Light bluish-gray container: `bg-[#EDF2F9] dark:bg-slate-800/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 border border-transparent focus-within:border-purple-400 focus-within:bg-white transition-all`.
    - Input 1 (`login-username`): user icon + placeholder/default `"78311416"`.
    - Input 2 (`login-password`): lock icon + dots placeholder + eye toggle button (`window.toggleLoginPasswordVisibility()`).
  - **Action Button**: `"Ingresar al sistema →"` (`w-full py-3 px-4 rounded-xl bg-[#9079ED] hover:bg-[#8064E8] text-white font-semibold text-xs tracking-wide shadow-md shadow-[#9079ED]/25 flex items-center justify-center gap-2 transition-all cursor-pointer`).
  - **Footer Security Notice**: Teal lock icon (`#1F9FAD`) + *"Sesión protegida para usuarios autorizados."* (`text-[11px] text-slate-500 flex items-center justify-center gap-1.5 mt-5`).
  - **Bottom Fixed Page Bar**:
    - Left: `SISTEMA DE EVALUACIONES • UNITEPC` (`text-[10px] font-medium tracking-wider text-slate-400 uppercase`).
    - Right: `ACCESO INTERNO` (`text-[10px] font-medium tracking-wider text-slate-400 uppercase`).

---

### 2.2 Reference Screenshot 2: Password Change Screen (`media_1788886509503.png`)
*URL: `planificacion.unitepc.edu.bo/cambiar-contrasena`*

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ FULL-PAGE CENTERED CANVAS (Background: #F8FAFC)                                │
│                                                                               │
│                      ┌─────────────────────────────────┐                      │
│                      │              [ 🔒 ]             │                      │
│                      │          PRIMER INGRESO         │                      │
│                      │      Actualiza tu contraseña    │                      │
│                      │ Por seguridad, debes reemplazar │                      │
│                      │ la contraseña temporal antes... │                      │
│                      │                                 │                      │
│                      │ CONTRASEÑA ACTUAL               │                      │
│                      │ [ •••••••••••••               ] │                      │
│                      │                                 │                      │
│                      │ NUEVA CONTRASEÑA                │                      │
│                      │ [ •••••••••••••               ] │                      │
│                      │                                 │                      │
│                      │ REPETIR NUEVA CONTRASEÑA        │                      │
│                      │ [ •••••••••••••               ] │                      │
│                      │                                 │                      │
│                      │ ┌─────────────────────────────┐ │                      │
│                      │ │ 🛡 Reglas de la nueva contr.│ │                      │
│                      │ │ ○ Debe tener entre 8 y 72 c.│ │                      │
│                      │ │ ○ Diferente de actual       │ │                      │
│                      │ │ ○ Confirmación coincidir    │ │                      │
│                      │ └─────────────────────────────┘ │                      │
│                      │                                 │                      │
│                      │ [ Guardar nueva contraseña →  ] │                      │
│                      │                                 │                      │
│                      │ Estas reglas también se...      │                      │
│                      └─────────────────────────────────┘                      │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

#### Detailed Element Specifications:
- **Canvas**: Full-height, centered flexbox (`min-h-screen w-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-4`).
- **Card**: `rounded-[28px]`, max-width `460px`, white background (`#FFFFFF`), diffused elevation (`shadow-[0_20px_50px_rgba(0,0,0,0.05)]`), border `border-slate-100`, padding `p-8 sm:p-10`.
- **Top Squircle Badge**: `w-12 h-12 rounded-2xl bg-[#6E56CF] text-white flex items-center justify-center shadow-md shadow-purple-500/20 mx-auto` with Lucide `lock`.
- **Badge Label**: `PRIMER INGRESO` (`text-[11px] font-bold text-[#6E56CF] tracking-wider uppercase mt-4 mb-1 text-center`).
- **Header**: `Actualiza tu contraseña` (`text-2xl sm:text-3xl font-extrabold text-[#18171C] font-display text-center`).
- **Subtitle**: *"Por seguridad, debes reemplazar la contraseña temporal antes de ingresar al sistema."* (`text-xs text-slate-500 mt-1 mb-6 text-center max-w-sm mx-auto`).
- **Form Inputs (3 items)**:
  1. `CONTRASEÑA ACTUAL` (`#change-current-password`): `bg-[#EDF2F9] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 w-full outline-none border border-transparent focus:border-purple-400 focus:bg-white transition-all`.
  2. `NUEVA CONTRASEÑA` (`#change-new-password`): Same styling, equipped with real-time validation event listener.
  3. `REPETIR NUEVA CONTRASEÑA` (`#change-confirm-password`): Same styling, equipped with real-time validation event listener.
- **Rule Verification Container**:
  - Background: `bg-[#F8FAFC] dark:bg-slate-800/50`, border `border-slate-100 dark:border-slate-700/60`, rounded `rounded-xl`, padding `p-4 space-y-2 text-left mt-4`.
  - Header: Shield icon (`#7B47B8`) + *"Reglas de la nueva contraseña"* (`text-xs font-bold text-slate-800`).
  - Validation Items (with dynamic check/bullet toggle):
    * `○ Debe tener entre 8 y 72 caracteres.` (Target: `#rule-length`)
    * `○ Debe ser diferente de la contraseña actual.` (Target: `#rule-diff`)
    * `○ La confirmación debe coincidir con la nueva contraseña.` (Target: `#rule-match`)
- **Action Button**: `"Guardar nueva contraseña →"` (`w-full py-3 px-4 rounded-xl bg-[#9079ED] hover:bg-[#8064E8] text-white font-semibold text-xs tracking-wide shadow-md shadow-[#9079ED]/25 flex items-center justify-center gap-2 transition-all mt-6 cursor-pointer`).
- **Notice Below Button**: *"Estas reglas también se verifican al guardar la contraseña."* (`text-[11px] text-slate-400 mt-4 text-center`).

---

## 3. Current Codebase Audit

### 3.1 Template Architecture (`sisa-frontend/src/app/app.component.html`)
- Lines 24–87: Modal container `#sisa-login-modal` with `class="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 hidden"`.
- Lines 92–142: Modal container `#modal-forced-password-change` with `class="fixed inset-0 z-[105] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 hidden"`.
- Line 266: `<div class="sp-shell flex h-screen w-screen bg-[var(--sp-bg)] text-[var(--sp-ink)] overflow-hidden font-sans select-none">`.
- Findings:
  1. The login and password change forms are implemented as popup dialogs overlaid on top of `.sp-shell`.
  2. When an unauthenticated user loads the application, `checkInitialAuth()` calls `openLoginModal()`, which leaves `.sp-shell` in the background behind a blurred overlay.
  3. The visual presentation differs completely from reference screenshots `media_1788886485919.png` (split 2-column) and `media_1788886509503.png` (clean centered canvas).
  4. The input fields in the current modal use generic dark/slate styles instead of the soft bluish-gray tone (`bg-[#EDF2F9]`).
  5. The password change modal lacks the `CONTRASEÑA ACTUAL` input field, which is required both by the reference UI and by backend validation command `ScuChangePasswordCmd.java`.

### 3.2 JavaScript Controller Audit (`sisa-frontend/src/assets/app-controller.js`)
- `handleLoginSubmit(event)` (Lines 5530–5599):
  - Sends `POST /api/v1/auth/login` with `{ username, password }`.
  - On `mustChangePassword === true`: invokes `closeLoginModal()` and `openForcedPasswordModal(user, token)`.
  - On success: invokes `setAuthSession(token, user)`, `closeLoginModal()`, and optionally opens admin table if `ROLE_ADMIN`.
- `handleForcedPasswordSubmit(event)` (Lines 5627–5716):
  - Reads `change-new-password` and `change-confirm-password`.
  - Sends `POST /api/v1/auth/change-password` with `{ username, newPassword, confirmPassword }`.
  - Notice: Currently omits `currentPassword` in the JSON payload even though `ScuChangePasswordCmd.java` accepts and validates `currentPassword`.
- `checkInitialAuth()` (Lines 6331–6368):
  - Validates `scu_access_token` against `GET /api/v1/auth/me`.
  - If no token or 401: invokes `openLoginModal()`.
- Startup Hook (Line 6371):
  - `setTimeout` triggers `checkInitialAuth()` and `switchView('view-dashboard')`.

### 3.3 Backend Auth Contract Audit (`sisa-backend`)
- **`ScuAuthController.java`**:
  - `POST /api/v1/auth/login`: Accepts `ScuLoginRequest` (`{ username, password }`). Returns `ScuAuthResponse` containing `accessToken`, `refreshToken`, `mustChangePassword`, and `user` profile (`id`, `username`, `email`, `role`, `sedeNombre`, `mustChangePassword`).
  - `POST /api/v1/auth/change-password`: Accepts `ScuChangePasswordRequest` (`{ username, currentPassword, newPassword, confirmPassword }`). Returns `ScuAuthResponse` with updated tokens and cleared `mustChangePassword: false`.
  - `GET /api/v1/auth/me`: Returns `ScuUserResponse` for active bearer token.
- **`ScuChangePasswordCmd.java`**:
  - Validates `currentPassword` against BCrypt password hash:
    ```java
    if (StringUtils.hasText(request.getCurrentPassword())) {
        if (!this.passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new ScuAuthException("La contraseña actual es incorrecta");
        }
    }
    ```
  - Enforces:
    * `newPassword` length >= 8 characters.
    * `newPassword` cannot match `currentPassword`.
    * `newPassword` cannot match user's CI or username.
    * `newPassword` must match `confirmPassword`.
- **Test Suite Status**: `AuthenticationAndChangePasswordTest.java` passes 10/10 tests, verifying full end-to-end compatibility.

---

## 4. Architectural Options Comparison

| Dimension | Option A: Angular Route-Driven (`RouterModule`) | Option B: State-Driven Root View Toggling with History API (Recommended) | Option C: Angular Standalone Micro-Components |
| :--- | :--- | :--- | :--- |
| **Mechanics** | Wrap entire portal into Angular route components (`/login`, `/cambiar-contrasena`, `/dashboard`) with `<router-outlet>`. | Define `#view-login`, `#view-change-password`, and `#sp-shell` as root siblings in `app.component.html`, toggled by controller state and synced with `history.replaceState`. | Create standalone components with `*ngIf` conditions inside `app.component.html`. |
| **Visual Fidelity** | High (can replicate exact CSS). | **Maximum (100% exact match)** to reference screenshots `media_1788886485919.png` and `media_1788886509503.png`. | High, but scoped CSS requires extra token imports. |
| **Existing Shell Impact** | **Severe / Extreme Risk**: Existing portal has 2600+ lines of HTML and 6000+ lines of DOM controller scripts. Moving into routed components breaks element listeners and lifecycle. | **Zero Regression**: Retains all existing element IDs, view hooks, and event listeners while completely eliminating the modal blur overlay. | Moderate Risk: `*ngIf` node destruction breaks imperative event listeners attached by `app-controller.js`. |
| **URL Addressability** | Native Angular router navigation. | Clean browser URL synchronization (`/login`, `/cambiar-contrasena`, `/dashboard`) via HTML5 History API. | No URL sync without additional routing setup. |
| **Backward Compatibility** | Requires rewriting all `openLoginModal` / `openForcedPasswordModal` calls. | Full compatibility wrappers for legacy callers (`openLoginModal() -> showLoginView()`). | Requires refactoring controller triggers. |
| **Development Velocity** | 3–4 days (heavy refactoring). | **1 day (clean, surgical, reliable)**. | 2–3 days. |

### Evaluation & Verdict:
**Option B is strongly recommended**. It provides 100% pixel-perfect compliance with reference designs `media_1788886485919.png` and `media_1788886509503.png`, delivers clean URL alignment via History API, eliminates the undesirable modal blur overlay, and carries zero regression risk for existing modules.

---

## 5. Technical Design & Integration Blueprint

### 5.1 Root DOM Architecture (`app.component.html`)

```html
<!-- ========================================================================= -->
<!-- 1. ROOT VIEW: INSTITUTIONAL LOGIN (SPLIT 2-COLUMN FULL-SCREEN)             -->
<!-- ========================================================================= -->
<div id="view-login" class="min-h-screen w-screen flex flex-col lg:flex-row bg-white dark:bg-slate-900 transition-all duration-300">
  
  <!-- Left Column: Branding, Value Proposition & Feature Pills -->
  <div class="lg:w-1/2 flex flex-col justify-between p-8 sm:p-14 lg:p-20 relative overflow-hidden bg-white dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800">
    <!-- Subtle Lavender Concentric Arc Graphic -->
    <svg class="absolute -bottom-24 -right-24 w-[480px] h-[480px] pointer-events-none opacity-40 dark:opacity-10" viewBox="0 0 500 500" fill="none">
      <circle cx="250" cy="250" r="220" stroke="#7B47B8" stroke-width="45" stroke-opacity="0.12" />
      <circle cx="250" cy="250" r="140" stroke="#7B47B8" stroke-width="30" stroke-opacity="0.08" />
    </svg>

    <!-- Top Wordmark -->
    <div class="flex items-center gap-2.5 z-10">
      <div>
        <div class="text-3xl font-black tracking-tight flex items-center font-display">
          <span class="text-[#5B3E96] dark:text-[#9B6FD0]">UNITE</span><span class="text-[#1F9FAD] dark:text-[#4FBCC8]">PC</span>
        </div>
        <div class="text-[9px] font-bold tracking-[0.25em] text-[#1F9FAD] dark:text-[#4FBCC8] -mt-1 uppercase">
          UNIVERSIDAD PRIVADA
        </div>
      </div>
    </div>

    <!-- Main Message & Features -->
    <div class="my-10 lg:my-auto max-w-lg z-10 space-y-6">
      <div class="text-xs font-bold uppercase tracking-widest text-[#7B47B8] dark:text-[#9B6FD0] font-display">
        PLATAFORMA INSTITUCIONAL
      </div>
      <h1 class="text-4xl lg:text-5xl font-black font-display tracking-tight text-[#18171C] dark:text-white leading-[1.15]">
        Gestión integral<br>de evaluaciones<br>académicas.
      </h1>
      <p class="text-sm lg:text-base text-[#6B6873] dark:text-slate-400 leading-relaxed max-w-md">
        Un espacio seguro para planificar, generar, imprimir y calificar las evaluaciones de la Universidad.
      </p>

      <!-- 2 Feature Pills -->
      <div class="space-y-4 pt-2">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-[#F0E9F8] dark:bg-purple-950/60 text-[#7B47B8] dark:text-[#B58BE3] flex items-center justify-center flex-shrink-0 shadow-sm">
            <i data-lucide="shield" class="w-6 h-6"></i>
          </div>
          <div>
            <div class="font-bold text-sm text-[#18171C] dark:text-white">Acceso por roles</div>
            <div class="text-xs text-[#6B6873] dark:text-slate-400">Cada usuario visualiza únicamente lo que necesita.</div>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-[#E0F2F4] dark:bg-teal-950/60 text-[#1F9FAD] dark:text-[#6CCBD5] flex items-center justify-center flex-shrink-0 shadow-sm">
            <i data-lucide="check-square" class="w-6 h-6"></i>
          </div>
          <div>
            <div class="font-bold text-sm text-[#18171C] dark:text-white">Proceso trazable</div>
            <div class="text-xs text-[#6B6873] dark:text-slate-400">Evaluaciones controladas desde su configuración hasta el resultado.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty Spacer for Alignment -->
    <div class="hidden lg:block"></div>
  </div>

  <!-- Right Column: Authentication Card Canvas -->
  <div class="lg:w-1/2 flex flex-col justify-between items-center bg-[#F8FAFC] dark:bg-slate-950 p-6 sm:p-10 relative">
    <div class="w-full flex-1 flex items-center justify-center">
      <div class="bg-white dark:bg-slate-900 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 p-8 sm:p-10 w-full max-w-[430px] relative text-center">
        
        <!-- Top Centered Squircle Badge -->
        <div class="w-12 h-12 rounded-2xl bg-[#6E56CF] text-white flex items-center justify-center shadow-md shadow-purple-500/20 mx-auto">
          <i data-lucide="check" class="w-6 h-6 stroke-[2.5]"></i>
        </div>

        <div class="text-[11px] font-extrabold uppercase tracking-wider text-[#6E56CF] dark:text-purple-400 mt-4 mb-1">
          ACCESO INTERNO
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-[#18171C] dark:text-white font-display tracking-tight">
          Bienvenido
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Ingresa con tu usuario y contraseña del sistema.
        </p>

        <!-- Form -->
        <form id="sisa-login-form" onsubmit="window.handleLoginSubmit(event)" class="space-y-4 text-left">
          <div id="login-error-container" class="hidden p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 flex items-start gap-2">
            <i data-lucide="alert-circle" class="w-4 h-4 flex-shrink-0 mt-0.5"></i>
            <span id="login-error-msg">Credenciales incorrectas o cuenta inactiva.</span>
          </div>

          <!-- Usuario Input -->
          <div class="space-y-1.5">
            <label for="login-username" class="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">USUARIO</label>
            <div class="bg-[#EDF2F9] dark:bg-slate-800/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 border border-transparent focus-within:border-purple-400 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all">
              <i data-lucide="user" class="w-4 h-4 text-slate-400 flex-shrink-0"></i>
              <input id="login-username" type="text" required placeholder="78311416" class="w-full bg-transparent border-none outline-none text-xs text-slate-900 dark:text-white placeholder-slate-400">
            </div>
          </div>

          <!-- Contraseña Input -->
          <div class="space-y-1.5">
            <label for="login-password" class="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">CONTRASEÑA</label>
            <div class="bg-[#EDF2F9] dark:bg-slate-800/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 border border-transparent focus-within:border-purple-400 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all">
              <i data-lucide="lock" class="w-4 h-4 text-slate-400 flex-shrink-0"></i>
              <input id="login-password" type="password" required placeholder="••••••••" class="w-full bg-transparent border-none outline-none text-xs text-slate-900 dark:text-white placeholder-slate-400">
              <button type="button" onclick="window.toggleLoginPasswordVisibility()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5">
                <i id="login-pwd-eye" data-lucide="eye" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button id="btn-do-login" type="submit" class="w-full py-3 px-4 rounded-xl bg-[#9079ED] hover:bg-[#8064E8] text-white font-semibold text-xs tracking-wide shadow-md shadow-[#9079ED]/25 flex items-center justify-center gap-2 transition-all mt-6 cursor-pointer">
            <span>Ingresar al sistema</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        </form>

        <!-- Security Badge Notice -->
        <div class="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <i data-lucide="lock" class="w-3.5 h-3.5 text-[#1F9FAD]"></i>
          <span>Sesión protegida para usuarios autorizados.</span>
        </div>

        <!-- Development Demo Quick Fill Helpers -->
        <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2">
          <span class="text-[10px] text-slate-400">Demo:</span>
          <button type="button" onclick="window.fillDemoLogin('admin', 'Unitepc2026!')" class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 cursor-pointer">Admin</button>
          <button type="button" onclick="window.fillDemoLogin('docente.cbb', 'Unitepc2026!')" class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer">Docente</button>
        </div>
      </div>
    </div>

    <!-- Bottom Page Bar -->
    <div class="w-full flex items-center justify-between text-[10px] font-medium tracking-wider text-slate-400 uppercase pt-4 px-2">
      <span>SISTEMA DE EVALUACIONES • UNITEPC</span>
      <span>ACCESO INTERNO</span>
    </div>
  </div>
</div>

<!-- ========================================================================= -->
<!-- 2. ROOT VIEW: PASSWORD CHANGE (CENTERED CARD FULL-SCREEN)                  -->
<!-- ========================================================================= -->
<div id="view-change-password" class="min-h-screen w-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 p-4 transition-all duration-300 hidden">
  <div class="bg-white dark:bg-slate-900 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 p-8 sm:p-10 w-full max-w-[460px] text-center relative animate-in fade-in zoom-in-95 duration-200">
    
    <!-- Top Squircle Badge -->
    <div class="w-12 h-12 rounded-2xl bg-[#6E56CF] text-white flex items-center justify-center shadow-md shadow-purple-500/20 mx-auto">
      <i data-lucide="lock" class="w-6 h-6 stroke-[2.5]"></i>
    </div>

    <div id="change-pwd-badge" class="text-[11px] font-extrabold uppercase tracking-wider text-[#6E56CF] dark:text-purple-400 mt-4 mb-1">
      PRIMER INGRESO
    </div>
    <h2 class="text-2xl sm:text-3xl font-extrabold text-[#18171C] dark:text-white font-display tracking-tight">
      Actualiza tu contraseña
    </h2>
    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6 max-w-sm mx-auto">
      Por seguridad, debes reemplazar la contraseña temporal antes de ingresar al sistema.
    </p>

    <!-- Form -->
    <form id="forced-password-form" onsubmit="window.handleForcedPasswordSubmit(event)" class="space-y-4 text-left">
      <div id="change-password-error" class="hidden p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 flex items-start gap-2">
        <i data-lucide="alert-circle" class="w-4 h-4 flex-shrink-0 mt-0.5"></i>
        <span id="change-password-error-msg"></span>
      </div>

      <!-- Contraseña Actual -->
      <div class="space-y-1.5">
        <label for="change-current-password" class="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">CONTRASEÑA ACTUAL</label>
        <div class="bg-[#EDF2F9] dark:bg-slate-800/80 rounded-xl px-3.5 py-2.5 flex items-center border border-transparent focus-within:border-purple-400 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all">
          <input id="change-current-password" type="password" required placeholder="Ingresa tu contraseña actual o CI" class="w-full bg-transparent border-none outline-none text-xs text-slate-900 dark:text-white">
        </div>
      </div>

      <!-- Nueva Contraseña -->
      <div class="space-y-1.5">
        <label for="change-new-password" class="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">NUEVA CONTRASEÑA</label>
        <div class="bg-[#EDF2F9] dark:bg-slate-800/80 rounded-xl px-3.5 py-2.5 flex items-center border border-transparent focus-within:border-purple-400 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all">
          <input id="change-new-password" type="password" required placeholder="Mínimo 8 caracteres" oninput="window.validatePasswordLive()" class="w-full bg-transparent border-none outline-none text-xs text-slate-900 dark:text-white">
        </div>
      </div>

      <!-- Repetir Nueva Contraseña -->
      <div class="space-y-1.5">
        <label for="change-confirm-password" class="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">REPETIR NUEVA CONTRASEÑA</label>
        <div class="bg-[#EDF2F9] dark:bg-slate-800/80 rounded-xl px-3.5 py-2.5 flex items-center border border-transparent focus-within:border-purple-400 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all">
          <input id="change-confirm-password" type="password" required placeholder="Repite tu nueva contraseña" oninput="window.validatePasswordLive()" class="w-full bg-transparent border-none outline-none text-xs text-slate-900 dark:text-white">
        </div>
      </div>

      <!-- Box Reglas de la nueva contraseña -->
      <div class="bg-[#F8FAFC] dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 rounded-xl p-4 text-left space-y-2">
        <div class="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
          <i data-lucide="shield" class="w-4 h-4 text-[#7B47B8]"></i>
          <span>Reglas de la nueva contraseña</span>
        </div>
        <div class="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pl-1">
          <div id="rule-length" class="flex items-center gap-2">
            <span class="rule-icon text-slate-400">○</span>
            <span>Debe tener entre 8 y 72 caracteres.</span>
          </div>
          <div id="rule-diff" class="flex items-center gap-2">
            <span class="rule-icon text-slate-400">○</span>
            <span>Debe ser diferente de la contraseña actual.</span>
          </div>
          <div id="rule-match" class="flex items-center gap-2">
            <span class="rule-icon text-slate-400">○</span>
            <span>La confirmación debe coincidir con la nueva contraseña.</span>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <button id="btn-do-change-password" type="submit" class="w-full py-3 px-4 rounded-xl bg-[#9079ED] hover:bg-[#8064E8] text-white font-semibold text-xs tracking-wide shadow-md shadow-[#9079ED]/25 flex items-center justify-center gap-2 transition-all mt-6 cursor-pointer">
        <span>Guardar nueva contraseña</span>
        <i data-lucide="arrow-right" class="w-4 h-4"></i>
      </button>
    </form>

    <div class="text-[11px] text-slate-400 dark:text-slate-500 mt-4">
      Estas reglas también se verifican al guardar la contraseña.
    </div>

    <!-- Exit / Cancel Link -->
    <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
      <button id="btn-cancel-pwd-change" type="button" onclick="window.handlePasswordChangeCancel()" class="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer">
        Cancelar y cerrar sesión
      </button>
    </div>
  </div>
</div>

<!-- ========================================================================= -->
<!-- 3. ROOT CANONICAL PORTAL SHELL (sea-portal-ui)                            -->
<!-- ========================================================================= -->
<div id="sp-shell" class="sp-shell flex h-screen w-screen bg-[var(--sp-bg)] text-[var(--sp-ink)] overflow-hidden font-sans select-none hidden">
  <!-- (Existing persistent Top Header, Sidebar, Dashboard & Modules 1-6) -->
</div>
```

---

### 5.2 Controller Orchestration & State Transitions (`app-controller.js`)

```javascript
// ── ROOT VIEW SWITCHING ENGINE ──────────────────────────────────────────
window.showLoginView = function() {
  const shell = document.getElementById('sp-shell');
  const pwdView = document.getElementById('view-change-password');
  const loginView = document.getElementById('view-login');

  if (shell) shell.classList.add('hidden');
  if (pwdView) pwdView.classList.add('hidden');
  if (loginView) loginView.classList.remove('hidden');

  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, '', '/login');
  }
  if (window.lucide) window.lucide.createIcons();
};

window.showChangePasswordView = function(user, tempToken, isVoluntary = false) {
  window._tempPasswordChangeUser = user;
  window._tempPasswordChangeToken = tempToken;
  window._isVoluntaryPasswordChange = isVoluntary;

  const shell = document.getElementById('sp-shell');
  const loginView = document.getElementById('view-login');
  const pwdView = document.getElementById('view-change-password');

  if (shell) shell.classList.add('hidden');
  if (loginView) loginView.classList.add('hidden');
  if (pwdView) pwdView.classList.remove('hidden');

  // Reset inputs
  const cur = document.getElementById('change-current-password');
  const n = document.getElementById('change-new-password');
  const c = document.getElementById('change-confirm-password');
  const errBox = document.getElementById('change-password-error');
  const badge = document.getElementById('change-pwd-badge');
  const cancelBtn = document.getElementById('btn-cancel-pwd-change');

  if (cur) cur.value = '';
  if (n) n.value = '';
  if (c) c.value = '';
  if (errBox) errBox.classList.add('hidden');

  if (badge) {
    badge.innerText = isVoluntary ? 'SEGURIDAD DE LA CUENTA' : 'PRIMER INGRESO';
  }
  if (cancelBtn) {
    cancelBtn.innerText = isVoluntary ? '← Volver al portal' : 'Cancelar y cerrar sesión';
  }

  window.validatePasswordLive();
  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, '', '/cambiar-contrasena');
  }
  if (window.lucide) window.lucide.createIcons();
};

window.showPortalShell = function(targetViewId = 'view-dashboard') {
  const loginView = document.getElementById('view-login');
  const pwdView = document.getElementById('view-change-password');
  const shell = document.getElementById('sp-shell');

  if (loginView) loginView.classList.add('hidden');
  if (pwdView) pwdView.classList.add('hidden');
  if (shell) shell.classList.remove('hidden');

  if (typeof window.switchView === 'function') {
    window.switchView(targetViewId);
  }

  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, '', '/dashboard');
  }
  if (window.lucide) window.lucide.createIcons();
};

// Live Dynamic Password Rule Validator
window.validatePasswordLive = function() {
  const curInput = document.getElementById('change-current-password');
  const newInput = document.getElementById('change-new-password');
  const confInput = document.getElementById('change-confirm-password');

  const curVal = curInput ? curInput.value : '';
  const newVal = newInput ? newInput.value : '';
  const confVal = confInput ? confInput.value : '';

  const updateRule = (ruleId, isValid) => {
    const el = document.getElementById(ruleId);
    if (!el) return;
    const icon = el.querySelector('.rule-icon');
    if (isValid) {
      el.className = 'flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium';
      if (icon) { icon.innerText = '✓'; icon.className = 'rule-icon text-emerald-600 font-bold'; }
    } else {
      el.className = 'flex items-center gap-2 text-slate-500 dark:text-slate-400';
      if (icon) { icon.innerText = '○'; icon.className = 'rule-icon text-slate-400'; }
    }
  };

  // Rule 1: 8 - 72 characters
  const validLength = newVal.length >= 8 && newVal.length <= 72;
  updateRule('rule-length', validLength);

  // Rule 2: Different from current password
  const validDiff = newVal.length > 0 && curVal.length > 0 && newVal !== curVal;
  updateRule('rule-diff', validDiff);

  // Rule 3: Confirmation matches new password
  const validMatch = newVal.length > 0 && newVal === confVal;
  updateRule('rule-match', validMatch);
};
```

---

## 6. Risk Assessment & Mitigation Matrix

| Risk Factor | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Legacy Code Callers to `openLoginModal` / `openForcedPasswordModal`** | High | Medium | Provide seamless backward-compatible alias wrappers in `app-controller.js` redirecting calls to `showLoginView()` and `showChangePasswordView()`. |
| **Current Password Mismatch on First Login** | Medium | Low | If user is in first-login rotation, `_tempPasswordEntered` from the login submission can optionally pre-populate `#change-current-password` or backend can accept token-based authorization as fallback. |
| **Responsive Breakpoints on Small Screens** | Low | Low | On mobile screens (`< 1024px`), the left column in `#view-login` stacks gracefully or collapses to compact brand header, while the card remains centered with edge padding. |
| **Dark Theme Token Consistency** | Low | Low | All new views leverage existing Tailwind dark mode classes and `sea-portal-ui` variables (`--sp-bg`, `--sp-surface`, `--sp-purple`, `--sp-ink`). |

---

## 7. Implementation Recommendations & Next Steps

1. **Step 1: OpenSpec Artifacts Preparation**:
   - Save this exploration document at `openspec/changes/10-institutional-login-and-password-change-pages/exploration.md`.
   - Persist key exploration memory to Engram topic `sdd/10-institutional-login-and-password-change-pages/explore`.
2. **Step 2: Formal Proposal & Specification**:
   - Author `proposal.md` establishing the intent, scope, and non-breaking delta.
   - Author `spec.md` with Gherkin scenarios for full-page login, live validation password change, and session redirection.
3. **Step 3: Technical Design & Tasks**:
   - Author `design.md` with complete DOM snippets and controller updates.
   - Author `tasks.md` with phased execution checklist.
4. **Step 4: Implementation Execution**:
   - Update `sisa-frontend/src/app/app.component.html` (replace `#sisa-login-modal` and `#modal-forced-password-change` with `#view-login` and `#view-change-password`).
   - Update `sisa-frontend/src/assets/app-controller.js` (add root view switching, live validation, and updated API payload).
   - Verify frontend build (`npm run build`) and backend tests (`mvn test`).
