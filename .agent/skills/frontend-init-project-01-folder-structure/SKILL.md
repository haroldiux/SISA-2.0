---
name: Frontend - Init-project: PASO 1: Crear estructura de carpetas
description: Rules and guidelines for PASO 1: Crear estructura de carpetas in the frontend project.
---

# PASO 1: Crear estructura de carpetas

> **Predecesor:** ninguno (primer paso)
> **Sucesor:** [02-root-config.md](./02-root-config.md)

Ejecutar en orden los siguientes comandos para crear toda la estructura de directorios y archivos vacíos del proyecto.

## 1.1 Directorios

```bash
mkdir -p <n>/{src/{app/{modules/{public/{components/login,guards},secure/{components/layout,guards}},routes,services,http,bootstrap/core,integration},assets/{i18n,images},environments/properties/dev},projects/<prefix>-<domain>/src/lib/{modules/{<prefix>-welcome/{components/<prefix>-welcome,routes},<prefix>-shared},api/{constants,enums,models,response},bootstrap,builders,commands,http,services,store},docs}
```

## 1.2 Archivos de configuración raíz

```bash
touch <n>/angular.json
touch <n>/package.json
touch <n>/tsconfig.json
touch <n>/tsconfig.app.json
touch <n>/tsconfig.spec.json
touch <n>/tailwind.config.js
touch <n>/postcss.config.js
touch <n>/.gitignore
touch <n>/README.md
touch <n>/CHANGELOG.md
touch <n>/ANTIGRAVITY.md
touch <n>/ANTIGRAVITY.local.md
```

## 1.3 Archivos src/app

```bash
touch <n>/src/app/app.module.ts
touch <n>/src/app/app.component.ts
touch <n>/src/app/app.component.html
touch <n>/src/app/app.component.scss
touch <n>/src/app/routes/app-routing.module.ts
touch <n>/src/app/routes/app-routes.constant.ts
touch <n>/src/app/services/public-auth-guard.service.ts
touch <n>/src/app/services/secure-auth-guard.service.ts
```

## 1.4 Módulo public

```bash
touch <n>/src/app/modules/public/public.module.ts
touch <n>/src/app/modules/public/public-routing.module.ts
touch <n>/src/app/modules/public/components/login/login.component.ts
touch <n>/src/app/modules/public/components/login/login.component.html
touch <n>/src/app/modules/public/components/login/login.component.scss
```

## 1.5 Módulo secure

```bash
touch <n>/src/app/modules/secure/secure.module.ts
touch <n>/src/app/modules/secure/secure-routing.module.ts
touch <n>/src/app/modules/secure/components/layout/layout.component.ts
touch <n>/src/app/modules/secure/components/layout/layout.component.html
touch <n>/src/app/modules/secure/components/layout/layout.component.scss
```

## 1.6 Environments

```bash
touch <n>/src/environments/environment.ts
touch <n>/src/environments/environment.prod.ts
touch <n>/src/environments/properties/dev/common.properties.ts
touch <n>/src/environments/properties/dev/<n>.properties.ts
```

## 1.7 Assets e i18n

```bash
touch <n>/src/assets/i18n/es.json
touch <n>/src/styles.scss
```

## 1.8 Librería — configuración

```bash
touch <n>/projects/<prefix>-<domain>/package.json
touch <n>/projects/<prefix>-<domain>/ng-package.json
touch <n>/projects/<prefix>-<domain>/tsconfig.lib.json
touch <n>/projects/<prefix>-<domain>/tsconfig.lib.prod.json
touch <n>/projects/<prefix>-<domain>/tsconfig.spec.json
touch <n>/projects/<prefix>-<domain>/public-api.ts
```

## 1.9 Librería — módulo raíz

```bash
touch <n>/projects/<prefix>-<domain>/src/public-api.ts
touch <n>/projects/<prefix>-<domain>/src/lib/<prefix>-<domain>.module.ts
```

## 1.10 Librería — módulos main y shared

```bash
touch <n>/projects/<prefix>-<domain>/src/lib/modules/<prefix>-main.module.ts
touch <n>/projects/<prefix>-<domain>/src/lib/modules/<prefix>-main.component.ts
touch <n>/projects/<prefix>-<domain>/src/lib/modules/<prefix>-main-routing.module.ts
touch <n>/projects/<prefix>-<domain>/src/lib/modules/<prefix>-shared/<prefix>-shared.module.ts
```

## 1.11 Librería — módulo welcome

```bash
touch <n>/projects/<prefix>-<domain>/src/lib/modules/<prefix>-welcome/<prefix>-welcome.module.ts
touch <n>/projects/<prefix>-<domain>/src/lib/modules/<prefix>-welcome/components/<prefix>-welcome/<prefix>-welcome.component.ts
touch <n>/projects/<prefix>-<domain>/src/lib/modules/<prefix>-welcome/components/<prefix>-welcome/<prefix>-welcome.component.html
touch <n>/projects/<prefix>-<domain>/src/lib/modules/<prefix>-welcome/components/<prefix>-welcome/<prefix>-welcome.component.scss
touch <n>/projects/<prefix>-<domain>/src/lib/modules/<prefix>-welcome/routes/<prefix>-welcome-routing.module.ts
```

## 1.12 Librería — assets

```bash
touch <n>/projects/<prefix>-<domain>/assets/<prefix>-<domain>-styles.scss
touch <n>/projects/<prefix>-<domain>/assets/styles/<prefix>-styles.scss
touch <n>/projects/<prefix>-<domain>/assets/styles/<prefix>-styles-components.scss
touch <n>/projects/<prefix>-<domain>/assets/styles/components/<prefix>-styles-components.scss
```
