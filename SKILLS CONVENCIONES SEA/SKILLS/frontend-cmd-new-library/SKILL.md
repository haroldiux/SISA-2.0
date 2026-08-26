---
name: Frontend - Cmd: /project:new-library
description: Scaffolding instructions and command reference for /project:new-library in the frontend project.
---

# Comando: /project:new-library

Genera una nueva librería Angular en el monorepo con toda la estructura base.

## Uso
```
/project:new-library
```

## Qué hace
Pregunta:
1. ¿Nombre del dominio? (ej: finance, hr, logistics)
2. ¿Prefijo de clases? (ej: Fin, Hr, Log)
3. ¿Organización pnpm? (ej: @myorg)

Luego ejecuta:
```bash
ng generate library [prefix]-[domain]
```

Y genera la estructura interna completa:
```
src/lib/
├── api/contracts/
├── bootstrap/
├── builders/
├── commands/
├── http/
├── modules/
├── services/
├── store/
└── [prefix]-[domain].module.ts
```

Más los archivos de configuración:
- `ng-package.json`
- `package.json` de la librería
- `src/public-api.ts`
- Actualiza `tsconfig.json` con el path alias

Sigue el skill:
.agents/skills/architecture/monorepo.md
.agents/skills/architecture/project-structure.md
.agents/skills/deployment/library-packaging.md
