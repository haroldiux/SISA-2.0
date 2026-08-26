---
name: Frontend - Deployment: Library Packaging & Deployment
description: Rules and guidelines for Library Packaging & Deployment in the frontend project.
---

# Skill: Library Packaging & Deployment

## package.json de la librería
```json
{
  "name": "@[org]/[prefix]-[domain]",
  "version": "0.1.0",
  "publishConfig": {
    "registry": "[CONFIGURAR: URL Nexus o pnpm registry]"
  },
  "peerDependencies": {
    "@angular/common": "^17.0.0",
    "@angular/core": "^17.0.0"
  },
  "dependencies": {
    "tslib": "^2.3.0"
  },
  "sideEffects": false,
  "private": false
}
```

## ng-package.json de libreria
```json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "dest": "../../dist/[prefix]-[domain]",
  "lib": {
    "entryFile": "src/public-api.ts"
  }
}
```

## Estructura y Scripts en package.json raíz
```json
{
  "name": "[app_name]",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "[prefix]-[domain]": "pnpm run [prefix]-[domain]:package & pnpm run [prefix]-[domain]:publish",
    "[prefix]-[domain]:publish": "pnpm publish ./dist/[prefix]-[domain] --scope=sonatype",
    "[prefix]-[domain]:package": "pnpm build [prefix]-[domain] --configuration production",
    "[prefix]-[domain]:pack-local": "cd dist/[prefix]-[domain] && pnpm pack"
  },
  "private": true,
  "keywords": [
    "keycloak-js"
  ],
  "dependencies": { 
    // all dependencies
  },
  "devDependencies": {
    // all dev dependencies
  }
}
```

## public-api.ts — solo exportar lo público
```typescript
// Solo lo que los consumidores de la librería necesitan
export * from './lib/[prefix]-[domain].module';  // generalmente solo modulos
export * from './lib/services';                  // servicios públicos si se lo requere
// NO exportar: store internals, builders, commands (son internos)
```

## Versionado semántico
| Cambio | Versión | Ejemplo |
|--------|---------|---------|
| Breaking change | MAJOR | 1.0.0 → 2.0.0 |
| Nueva feature compatible | MINOR | 1.0.0 → 1.1.0 |
| Bug fix | PATCH | 1.0.0 → 1.0.1 |
| Release candidate | RC | 1.0.0-RC1 |
| Beta | BETA | 1.0.0-beta.1 |

## Proceso de publicación
```bash
# 1. Bump version
pnpm version [patch|minor|major|prerelease --preid=RC]

# 2. Build y publicar
pnpm run [prefix]-[domain]

# 3. Verificar en registry que la versión esté disponible
```

## Test local antes de publicar
```bash
# Pack local (genera .tgz)
pnpm run [prefix]-[domain]:pack-local

# En el proyecto consumidor, instalar desde archivo local
pnpm install ../[project]/dist/[prefix]-[domain]/[prefix]-[domain]-X.X.X.tgz
```

## Reglas
- Nunca publicar sin haber hecho build de producción
- El `public-api.ts` es el contrato público — pensar bien qué se expone
- No exponer implementaciones internas (builders, commands, store actions)
- Siempre incrementar versión antes de publicar — nunca republicar la misma versión
- Agregar al CHANGELOG.md los cambios de cada versión, para eso leer CHANGELOG.md y describir cambios puntuales
