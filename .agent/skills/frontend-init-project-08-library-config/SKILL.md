---
name: Frontend - Init-project: PASO 8: Configuración de la librería
description: Rules and guidelines for PASO 8: Configuración de la librería in the frontend project.
---

# PASO 8: Configuración de la librería

> **Predecesor:** [07-assets.md](./07-assets.md)
> **Sucesor:** [09-library-modules.md](./09-library-modules.md)

Generar los archivos de configuración de la librería Angular (`ng-packagr`, tsconfigs, public API).

---

## projects/\<prefix\>-\<domain\>/package.json

```json
{
  "name": "@<org>/<prefix>-<domain>",
  "version": "0.1.0",
  "description": "<Prefix> library for <n>",
  "publishConfig": {
    "registry": "https://registry.npmjs.org/"
  },
  "peerDependencies": {
    "@angular/common": "^15.0.0",
    "@angular/core": "^15.0.0"
  },
  "dependencies": {
    "tslib": "^2.3.0"
  },
  "sideEffects": false,
  "private": false
}
```

---

## projects/\<prefix\>-\<domain\>/ng-package.json

```json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "dest": "../../dist/<prefix>-<domain>",
  "lib": {
    "entryFile": "src/public-api.ts"
  }
}
```

---

## projects/\<prefix\>-\<domain\>/tsconfig.lib.json

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "../../out-tsc/lib",
    "declaration": true,
    "declarationMap": true,
    "inlineSources": true,
    "types": []
  },
  "exclude": [
    "src/**/*.spec.ts"
  ]
}
```

---

## projects/\<prefix\>-\<domain\>/tsconfig.lib.prod.json

```json
{
  "extends": "./tsconfig.lib.json",
  "compilerOptions": {
    "declarationMap": false
  },
  "angularCompilerOptions": {
    "compilationMode": "partial"
  }
}
```

---

## projects/\<prefix\>-\<domain\>/tsconfig.spec.json

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "../../out-tsc/spec",
    "types": ["jasmine"]
  },
  "include": [
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
```

---

## projects/\<prefix\>-\<domain\>/public-api.ts

```typescript
/**
 * Public API Surface of <prefix>-<domain>
 * @author <Author>
 */

export * from './src/lib/<prefix>-<domain>.module';
export * from './src/lib/modules/<prefix>-main.module';
export * from './src/lib/modules/<prefix>-main.component';
```

---

## projects/\<prefix\>-\<domain\>/src/public-api.ts

```typescript
/**
 * Public API Surface of <prefix>-<domain>
 * @author <Author>
 */
export * from './lib/public-api';
```

---

## projects/\<prefix\>-\<domain\>/src/lib/\<prefix\>-\<domain\>.module.ts

```typescript
/**
 * @author <Author>
 */
import { NgModule } from '@angular/core';
import { <Prefix>MainModule } from './modules/<prefix>-main.module';

@NgModule({
  imports: [<Prefix>MainModule],
  exports: [<Prefix>MainModule],
})
export class <Prefix><Domain>Module {}
```
