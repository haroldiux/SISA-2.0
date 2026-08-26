---
name: Frontend - Init-project: /init-project:monorepo
description: Rules and guidelines for /init-project:monorepo in the frontend project.
---

# Skill: /init-project:monorepo

## Propósito
Inicializar un proyecto monorepo Angular completo con toda la estructura base, configuración de Keycloak, NGXS, PrimeNG, TailwindCSS y una librería interna con un módulo de bienvenida.

## Cuándo usar
- Al crear un proyecto Angular nuevo desde cero
- Cuando se necesita la estructura base completa con autenticación, estado y UI

## Cuándo NO usar
- Para agregar features a un proyecto existente (usar `/project:new-feature`)
- Para crear solo una librería (usar `/project:new-library`)

## Parámetros de entrada
```typescript
interface InitProjectParams {
  name: string;      // Nombre del proyecto (kebab-case)
  prefix: string;    // Prefijo 2-3 letras (ej: spp)
  domain: string;    // Dominio de la librería (ej: payment-pos)
  author?: string;   // Nombre del autor (opcional, default: "Developer")
  org?: string;      // Organización pnpm (opcional, default: "organization")
}
```

## Archivos que componen este skill

| Archivo | Responsabilidad |
|---|---|
| `SKILL.md` | Este archivo — punto de entrada, índice y orquestación |
| `steps/01-folder-structure.md` | PASO 1 — Creación de carpetas y archivos vacíos |
| `steps/02-root-config.md` | PASO 2 — Archivos de configuración raíz (`angular.json`, `package.json`, `tsconfig*`, `tailwind`, etc.) |
| `steps/03-app-core.md` | PASO 3 — Archivos del core de la app (`main.ts`, `index.html`, `app.module.ts`, routing, guards) |
| `steps/04-module-public.md` | PASO 4 — Módulo `public` (login con Keycloak) |
| `steps/05-module-secure.md` | PASO 5 — Módulo `secure` (layout con menú y logout) |
| `steps/06-environments.md` | PASO 6 — Archivos de environment (dev y prod) |
| `steps/07-assets.md` | PASO 7 — i18n (`es.json`) y estilos globales (`styles.scss`) |
| `steps/08-library-config.md` | PASO 8 — Configuración de la librería (`package.json`, `ng-package.json`, `tsconfig*`, `public-api.ts`) |
| `steps/09-library-modules.md` | PASO 9 — Módulos raíz de la librería (`<prefix>-main`, `<prefix>-shared`) |
| `steps/10-library-welcome.md` | PASO 10 — Módulo Welcome de la librería (componente, routing, estilos) |
| `steps/11-library-assets.md` | PASO 11 — Assets y estilos de la librería |

## Orden de ejecución

```
PASO 1  → steps/01-folder-structure.md   (crear toda la estructura de carpetas)
PASO 2  → steps/02-root-config.md        (rellenar configs raíz)
PASO 3  → steps/03-app-core.md           (core de la app)
PASO 4  → steps/04-module-public.md      (módulo public/login)
PASO 5  → steps/05-module-secure.md      (módulo secure/layout)
PASO 6  → steps/06-environments.md       (environments)
PASO 7  → steps/07-assets.md             (i18n + estilos)
PASO 8  → steps/08-library-config.md     (config de la librería)
PASO 9  → steps/09-library-modules.md    (módulos main y shared)
PASO 10 → steps/10-library-welcome.md    (módulo welcome)
PASO 11 → steps/11-library-assets.md     (assets de la librería)
```

## Post-ejecución

Después de generar todos los archivos:

1. **Instalar dependencias**:
   ```bash
   cd <n> && pnpm install
   ```

2. **Configurar Keycloak** en `src/environments/environment.ts`:
   ```typescript
   keycloak: {
     url: 'https://tu-keycloak-server',
     realm: 'tu-realm',
     clientId: 'tu-client-id'
   }
   ```

3. **Iniciar desarrollo**:
   ```bash
   pnpm start
   ```

4. **Verificar** que el proyecto compila sin errores

5. **Crear nuevas features** con:
   ```
   /project:new-feature
   ```

## Notas importantes

- El comando debe ejecutarse con los parámetros: `--name`, `--prefix`, `--domain`
- Opcionalmente: `--author` y `--org`
- Todos los archivos se generan con contenido real y funcional
- La estructura sigue las convenciones del proyecto `sea-payment-pos-ui`
- El módulo Welcome muestra el mensaje "BIENVENIDO" y pasos a seguir
- No se generan servicios HTTP ni comandos — usar `/project:new-feature`
- El prefijo `<prefix>` se reemplaza por el valor proporcionado (ej: spp)
- El nombre `<n>` se reemplaza por el valor capitalizado
- El autor `<Author>` se reemplaza por el valor proporcionado o "Developer"
