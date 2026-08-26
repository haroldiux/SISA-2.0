---
name: Frontend - Cmd: /init-project:monorepo
description: Scaffolding instructions and command reference for /init-project:monorepo in the frontend project.
---

# Command: /init-project:monorepo

## Descripción
Inicializa un proyecto monorepo Angular completo con la estructura base, configuración de Keycloak, NGXS, PrimeNG, TailwindCSS y una librería interna con un módulo de bienvenida.

**Skill de referencia:** .agents/skills/init-project.md

## Uso
```
/init-project:monorepo --name=<project-name> --prefix=<prefix> --domain=<domain> [--author=<author>] [--org=<org>]
```

### Parámetros
| Parámetro | Requerido | Descripción | Ejemplo |
|-----------|-----------|-------------|---------|
| `--name` | Sí | Nombre del proyecto (kebab-case) | `sea-payment-pos-ui` |
| `--prefix` | Sí | Prefijo 2-3 letras para archivos/clases | `spp` |
| `--domain` | Sí | Dominio de la librería | `payment-pos` |
| `--author` | No | Nombre del autor (default: "Developer") | `Juan Saavedra` |
| `--org` | No | Organización pnpm (default: "organization") | `@unitepc` |

### Ejemplo completo
```
/init-project:monorepo --name=sea-payment-pos-ui --prefix=spp --domain=payment-pos --author="Juan Saavedra" --org=@unitepc
```

## Qué genera (estructura completa)

### Archivos de configuración raíz
```
<name>/
├── angular.json                    # Configuración Angular Workspace
├── package.json                    # Scripts y dependencias
├── tsconfig.json                   # TypeScript paths y configuración
├── tsconfig.app.json              # Config app
├── tsconfig.spec.json             # Config tests
├── tailwind.config.js             # Tailwind + PrimeUI
├── postcss.config.js              # PostCSS
├── .gitignore                     # Git ignore
├── README.md                      # Documentación
├── CHANGELOG.md                   # Changelog
├── ANTIGRAVITY.md                      # Plantilla de instrucciones
└── ANTIGRAVITY.local.md                # Overrides personales (creado vacío)
```

### App Principal (`src/`)
```
src/
├── index.html
├── main.ts
├── styles.scss
├── app/
│   ├── app.component.ts            # Root component (router-outlet)
│   ├── app.component.html
│   ├── app.component.scss
│   ├── app.module.ts               # Bootstrap: NGXS, Keycloak, i18n
│   ├── routes/
│   │   ├── app-routing.module.ts   # Routing root (forRoot)
│   │   └── app-routes.constant.ts  # Definición de rutas
│   ├── services/
│   │   ├── public-auth-guard.service.ts   # Guard para rutas públicas
│   │   └── secure-auth-guard.service.ts   # Guard para rutas protegidas
│   ├── modules/
│   │   ├── public/                 # Módulo público (sin auth)
│   │   │   ├── public.module.ts
│   │   │   ├── public-routing.module.ts
│   │   │   └── components/
│   │   │       └── login/
│   │   │           ├── login.component.ts
│   │   │           ├── login.component.html
│   │   │           └── login.component.scss
│   │   └── secure/                 # Módulo protegido (con auth)
│   │       ├── secure.module.ts
│   │       ├── secure-routing.module.ts
│   │       └── components/
│   │           └── layout/
│   │               ├── layout.component.ts
│   │               ├── layout.component.html
│   │               └── layout.component.scss
│   ├── http/
│   ├── bootstrap/
│   │   └── core/
│   └── integration/
├── assets/
│   └── i18n/
│       └── es.json                 # Traducciones español
└── environments/
    ├── environment.ts              # Configuración desarrollo
    ├── environment.prod.ts         # Configuración producción
    └── properties/
        └── dev/
            ├── common.properties.ts
            └── <name>.properties.ts
```

### Librería (`projects/<prefix>-<domain>/`)
```
projects/<prefix>-<domain>/
├── package.json                    # Package de la librería
├── ng-package.json                 # Configuración ng-packagr
├── tsconfig.lib.json              # Config TypeScript librería
├── tsconfig.lib.prod.json         # Config TypeScript producción
├── tsconfig.spec.json             # Config TypeScript tests
├── public-api.ts                   # Barrel exports públicos
└── src/
    ├── public-api.ts
    ├── lib/
    │   ├── <prefix>-<domain>.module.ts    # Módulo raíz de librería
    │   ├── modules/
    │   │   ├── <prefix>-main.module.ts     # Módulo raíz de módulos
    │   │   ├── <prefix>-main.component.ts  # Componente shell
    │   │   ├── <prefix>-main-routing.module.ts # Routing raíz (forChild)
    │   │   ├── <prefix>-welcome/           # Módulo de bienvenida
    │   │   │   ├── <prefix>-welcome.module.ts
    │   │   │   ├── components/
    │   │   │   │   └── <prefix>-welcome/
    │   │   │   │       ├── <prefix>-welcome.component.ts    # Componente BIENVENIDO
    │   │   │   │       ├── <prefix>-welcome.component.html
    │   │   │   │       └── <prefix>-welcome.component.scss
    │   │   │   └── routes/
    │   │   │       └── <prefix>-welcome-routing.module.ts
    │   │   └── <prefix>-shared/            # Módulo compartido interno
    │   │       └── <prefix>-shared.module.ts
    │   ├── api/                      # Contratos, modelos, enums (estructura base)
    │   │   ├── constants/
    │   │   ├── enums/
    │   │   ├── models/
    │   │   └── response/
    │   ├── bootstrap/                # Inicialización (estructura base)
    │   ├── builders/                   # Builders (estructura base)
    │   ├── commands/                   # Commands (estructura base)
    │   ├── http/                       # HTTP services (estructura base)
    │   ├── services/                   # Business services (estructura base)
    │   └── store/                      # NGXS states (estructura base)
    └── assets/
        ├── <prefix>-<domain>-styles.scss
        └── styles/
            ├── <prefix>-styles.scss
            ├── <prefix>-styles-components.scss
            └── components/
                └── <prefix>-styles-components.scss
```

### Documentación (`docs/`)
```
docs/
└── .gitkeep
```

## Scripts generados en package.json

```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "lint": "ng lint",
    "<prefix>-<domain>": "pnpm run <prefix>-<domain>:package && pnpm run <prefix>-<domain>:publish",
    "<prefix>-<domain>:package": "ng build <prefix>-<domain> --configuration production",
    "<prefix>-<domain>:publish": "pnpm publish ./dist/<prefix>-<domain>",
    "<prefix>-<domain>:pack-local": "cd dist/<prefix>-<domain> && pnpm pack"
  }
}
```

## Dependencias incluidas

### Producción
- Angular 15.2+ (@angular/*)
- NGXS 3.8+ (@ngxs/*)
- ngx-translate 14+ (@ngx-translate/*)
- Keycloak Angular 15+ / Keycloak JS 22+
- PrimeNG 15.4+ / PrimeIcons 6+
- RxJS 7.8+

### Desarrollo
- Angular CLI 15.2+
- TailwindCSS 3.4+
- PostCSS + Autoprefixer
- tailwindcss-primeui
- ng-packagr

## Configuración incluida

### Keycloak (en `app.module.ts`)
```typescript
function initializeKeycloak(keycloak: KeycloakService) {
  return () => keycloak.init({
    config: {
      url: environment.keycloak.url,
      realm: environment.keycloak.realm,
      clientId: environment.keycloak.clientId,
    },
    initOptions: {
      onLoad: 'login-required',
      checkLoginIframe: false,
    },
  });
}
```

### NGXS (en `app.module.ts`)
```typescript
NgxsModule.forRoot([], { developmentMode: !environment.production }),
NgxsLoggerPluginModule.forRoot({ disabled: environment.production }),
NgxsReduxDevtoolsPluginModule.forRoot({ disabled: environment.production }),
```

### i18n (en `app.module.ts`)
```typescript
TranslateModule.forRoot({
  loader: { /* TranslateHttpLoader factory */ },
  defaultLanguage: 'es',
}),
```

### TailwindCSS + PrimeNG (en `styles.scss`)
```scss
@tailwind base;
@tailwind components;
@tailwind utilities;
@import 'primeicons/primeicons.css';
```

## Componente de Bienvenida

El módulo Welcome incluye un componente que muestra:

1. **Icono de éxito** grande y centrado
2. **Título**: "¡BIENVENIDO!"
3. **Subtítulo**: "Ahora crea tus módulos o componentes y dale funcionalidad a tu aplicación"
4. **Lista de próximos pasos**:
   - Usa `/project:new-feature` para crear nuevas features
   - Configura Keycloak en `environments/environment.ts`
   - Agrega módulos a la librería según necesites
5. **Botón**: "Empezar"
6. **Mensaje**: Referencia al comando `/project:new-feature`

## Post-inicialización obligatoria

Después de ejecutar el comando:

### 1. Instalar dependencias
```bash
cd <name>
pnpm install
```

### 2. Configurar Keycloak
Editar `src/environments/environment.ts`:
```typescript
keycloak: {
  url: 'https://tu-keycloak-server',  // Cambiar
  realm: 'tu-realm',                   // Cambiar
  clientId: 'tu-client-id',           // Cambiar
}
```

### 3. Iniciar desarrollo
```bash
pnpm start
```

### 4. Acceder a la app
- Navegar a `http://localhost:4200`
- Redirige a login (Keycloak)
- Al autenticar, muestra el módulo Welcome con "BIENVENIDO"

### 5. Crear nuevas features
```
/project:new-feature
```

## Convenciones aplicadas

| Aspecto | Convención | Ejemplo |
|---------|------------|---------|
| Prefijo archivos | `<prefix>-` | `spp-welcome.component.ts` |
| Prefijo clases | `<Prefix>` | `SppWelcomeComponent` |
| Prefijo selectores | `<prefix>-` | `spp-welcome` |
| Rutas librería | `/secure/<prefix>/*` | `/secure/spp/welcome` |
| Estado NGXS | `<Prefix>[Entity]State` | `SppWelcomeState` |
| Autor | `@author <Author>` | `@author Juan Saavedra` |

## Notas importantes

- El proyecto se crea con **ChangeDetectionStrategy.OnPush** en todos los componentes
- La librería se importa en `secure.module.ts` usando ruta relativa
- El módulo Welcome está integrado en el menú del layout
- **No se generan** servicios HTTP, commands, ni state NGXS - usar `/project:new-feature`
- El archivo `ANTIGRAVITY.local.md` se crea vacío para que el usuario agregue sus overrides
- Los archivos de tests (`.spec.ts`) no se generan inicialmente

## Flujo de trabajo post-inicialización

```
1. /init-project:monorepo --name=X --prefix=Y --domain=Z
2. cd X && pnpm install
3. Configurar Keycloak
4. pnpm start
5. Verificar que compila y muestra "BIENVENIDO"
6. /project:new-feature  (para cada feature nueva)
7. Desarrollar...
8. pnpm run X-Y:publish   (para publicar librería)
```

## Troubleshooting

### Error: Cannot find module 'keycloak-js'
**Solución**: Asegurar que `pnpm install` se ejecutó completamente

### Error: Keycloak initialization failed
**Solución**: Verificar configuración en `environment.ts`

### Error: Cannot resolve '<prefix>-<domain>'
**Solución**: Verificar que el path en `tsconfig.json` está correcto

### Error: Tailwind classes not working
**Solución**: Verificar que `tailwind.config.js` incluye los paths correctos
