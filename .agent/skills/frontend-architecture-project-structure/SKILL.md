---
name: Frontend - Architecture: Project Structure
description: Rules and guidelines for Project Structure in the frontend project.
---

# Skill: Project Structure

## Monorepo Structure
```
[project-name]/
├── ANTIGRAVITY.md                    # Instrucciones para ANTIGRAVITY Code
├── ANTIGRAVITY.local.md              # Overrides personales (gitignored)
├── .ANTIGRAVITY/                     # Skills y configuración
│   ├── skills/
│   ├── commands/
│   └── settings.local.json
├── src/                         # Main application
│   ├── app/
│   |    ├── bootstrap/           # Configuración
│   |    |   └── core/
│   |    ├── http/                # Módulo core (singleton services)
│   |    ├── integration/              # Módulo shared (componentes reutilizables)
│   |    ├── modules/             # Features de la app principal
│   |    ├── routes/
│   |    ├── services/
│   |    ├── shared/
│   |    ├── app.component.html
│   |    ├── app.component.ts
│   |    └── app.module.ts
|   ├── assets/
|   └── environments/
│       ├── properties/
│       |   └── dev/
│       |       ├── common.properties.ts
│       |       └── [project-name].properties.ts
│       ├── environment.prod.ts
│       └── environment.ts
├── projects/                    # Librerías del monorepo
│   └── [project-prefix]-[domain]/       # Librería por dominio
│       ├── src/
│       │   ├── lib/
│       │   |   ├── api/             # Contratos, modelos, enums
│       │   │   ├── bootstrap/       # Inicialización y configuración
│       │   │   ├── builders/        # Builder pattern
│       │   │   ├── commands/        # Command pattern
│       │   │   ├── http/            # Estructuras HTTP request/response
│       │   │   ├── modules/         # Feature modules
│       │   │   ├── services/        # Business services
│       │   │   ├── store/           # NGXS state, actions, selectors
│       │   │   ├── spp-http-provider.constant.ts
│       │   │   ├── public-api.ts
│       │   │   └── [project-prefix]-[domain].module.ts
│       │   └── public-api.ts
│       ├── assets/
│       ├── CHANGELOG.md
│       ├── ng-package.json
│       ├── package.json
│       ├── tsconfig.lib.json
│       ├── tsconfig.lib.prod.json
│       └── tsconfig.specs.json
├── .gitignore
├── angular.json
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.specs.json
└── docs/                        # Documentación técnica
```

## Project Library Internal Structure
```
[project-prefix]-[domain]/
├── src/lib/
│    ├── api/
│    │   ├── constants/               # Constantes
│    │   |   └── [prefix]-[entity].response.ts
│    │   ├── enums/                   # Enumeraciones del dominio
│    │   |   └── [prefix]-[entity].enum.ts
│    │   ├── models/                  # Modelos de datos
│    │   |   └── [prefix]-[entity].model.ts
│    │   └── response/                # Response type que se recibe del servidor
│    │       └── [prefix]-[entity].service.ts
│    ├── bootstrap/
│    │   └── [prefix]-[domain].config.ts
│    ├── builders/
│    │   └── [entity]/
│    │       ├── [prefix]-[entity]-request.builder.ts
│    │       └── [prefix]-[entity]-option.builder.ts
│    ├── commands/
│    │   ├── [prefix]-create-[entity].cmd.ts
│    │   ├── [prefix]-load-[entities].cmd.ts
│    │   ├── [prefix]-update-[entity].cmd.ts
│    │   └── [prefix]-delete-[entity].cmd.ts
│    ├── http/
│    │   ├── body-request/
│    │   |    └── [prefix]-[entity].request.ts
│    │   └── [prefix]-create-[entity].http.ts
│    ├── integration/
│    │   └── configs/
│    │       ├── constants/
│    │       └── gateway/
│    ├── modules/
│    │   └── [prefix]-[feature]/
│    │       ├── components/
│    │       │   └── [prefix]-[entity]/
│    │       │       ├── [prefix]-[entity].component.ts
│    │       │       ├── [prefix]-[entity].component.html
│    │       │       └── [prefix]-[entity].component.scss
│    │       ├── routes/
│    │       └── [prefix]-[feature].module.ts
│    ├── services/
│    │   └── [prefix]-[entity].service.ts
│    ├── store/
│    │   └── [entity]/
│    │       ├── [prefix]-[entity].actions.ts
│    │       └── [prefix]-[entity].state.ts
│    ├── utils/
│    └── [prefix]-[domain].module.ts
└── assets/
    ├── images/
    ├── styles/
    │   ├── components/
    │   |   ├── resources/
    │   |   |   └── _[prefix]-[entity].component.scss
    │   |   └── [prefix]-styles-components.scss
    │   └── [prefix]-styles.scss
    └── [project-prefix]-[domain]-styles.scss

```

## Microfrontend Structure
```
[mfe-name]/
├── ANTIGRAVITY.md
├── .ANTIGRAVITY/
├── src/
│   └── app/
│       ├── core/
│       ├── shared/
│       └── features/
│           └── [feature]/
│               ├── components/
│               ├── pages/       # Componentes de ruta (smart components)
│               ├── services/
│               └── [feature].module.ts
└── webpack.config.js            # Module Federation config
```

## Reglas de organización
- Un módulo por feature/dominio, sin excepciones
- Los servicios HTTP viven en `http/`, nunca en componentes
- Los componentes solo hablan con Commands y Selectors
- Los comandos ejecutan `dispatch` del store
- Los archivos `.state.ts` son los unicos que importan y tienen como atributos privados del constuctor a los archivos `http`.
- `public-api.ts` es la única puerta de salida de una librería
- Los "models/, response/, enums/, constants/" van en `api/`, nunca inline
- Todos los estilos van en `assets/styles/components/resources` como `_[prefix]-[entity].component.scss`
- `[prefix]-[domain]-styles.scss` exporta `[prefix]-styles.scss`
- `[prefix]-styles.scss` exporta `[prefix]-styles-components.scss`
- `[prefix]-styles-components.scss` exporta todos los archivos scss en `resources/`
