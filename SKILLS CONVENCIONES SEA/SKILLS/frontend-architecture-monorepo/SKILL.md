---
name: Frontend - Architecture: Monorepo Angular
description: Rules and guidelines for Monorepo Angular in the frontend project.
---

# Skill: Monorepo Angular

## Crear nuevo proyecto monorepo
```bash
ng new [project-name] --create-application=false
cd [project-name]
ng generate application [app-name] --routing --style=scss
ng generate library [prefix]-[domain]
```

## angular.json — proyectos clave
```json
{
  "newProjectRoot": "projects",
  "projects": {
    "[app-name]": { 
      "projectType": "application",
      "schematics": {
        "@schematics/angular:component": {
          "style": "scss"
        },
        "@schematics/angular:application": {
          "strict": true
        }
      },
    },
    "[prefix]-[domain]": {
      "projectType": "library",
      "root": "projects/[prefix]-[domain]"
    }
  },
  "defaultProject": "[app-name]"
}
```

## tsconfig.json — path aliases
```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "paths": {
      "dist/[project-name]/[project-name]": [
        "dist/[project-name]/[project-name]",
        "dist/[project-name]"
      ]
    },
    "target": "ES2022",
    "module": "es2020",
    "lib": [
      "es2020",
      "dom"
    ],
    "useDefineForClassFields": false
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

## package.json — scripts estándar
```json
{
  "scripts": {
    "start": "ng serve",
    "build": "ng build",
    "test": "ng test",
    "lint": "ng lint",
    "[prefix]-[domain]": "pnpm run [prefix]-[domain]:package & pnpm run [prefix]-[domain]:publish",
    "[prefix]-[domain]:publish": "pnpm publish ./dist/[prefix]-[domain] --scope=sonatype",
    "[prefix]-[domain]:package": "pnpm build [prefix]-[domain] --configuration production"
  }
}
```

## Construir y publicar librería
```bash
pnpm run [prefix]-[domain]
```
