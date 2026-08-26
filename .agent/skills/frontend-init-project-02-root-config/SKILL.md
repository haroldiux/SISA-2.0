---
name: Frontend - Init-project: PASO 2: Archivos de configuración raíz
description: Rules and guidelines for PASO 2: Archivos de configuración raíz in the frontend project.
---

# PASO 2: Archivos de configuración raíz

> **Predecesor:** [01-folder-structure.md](./01-folder-structure.md)
> **Sucesor:** [03-app-core.md](./03-app-core.md)

Generar el contenido de todos los archivos de configuración que viven en la raíz del proyecto.

---

## angular.json

```json
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "<n>": {
      "projectType": "application",
      "schematics": {
        "@schematics/angular:component": {
          "style": "scss",
          "changeDetection": "OnPush"
        },
        "@schematics/angular:application": {
          "strict": true
        }
      },
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "outputPath": "dist/<n>",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json",
            "inlineStyleLanguage": "scss",
            "assets": [
              "src/favicon.ico",
              "src/assets"
            ],
            "styles": [
              "src/styles.scss"
            ],
            "scripts": [],
            "allowedCommonJsDependencies": [
              "keycloak-js"
            ]
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kb",
                  "maximumError": "1mb"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "2kb",
                  "maximumError": "4kb"
                }
              ],
              "outputHashing": "all"
            },
            "development": {
              "buildOptimizer": false,
              "optimization": false,
              "vendorChunk": true,
              "extractLicenses": false,
              "sourceMap": true,
              "namedChunks": true
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "configurations": {
            "production": {
              "buildTarget": "<n>:build:production"
            },
            "development": {
              "buildTarget": "<n>:build:development"
            }
          },
          "defaultConfiguration": "development",
          "options": {
            "port": 4200
          }
        },
        "extract-i18n": {
          "builder": "@angular-devkit/build-angular:extract-i18n",
          "options": {
            "buildTarget": "<n>:build"
          }
        },
        "test": {
          "builder": "@angular-devkit/build-angular:karma",
          "options": {
            "polyfills": ["zone.js", "zone.js/testing"],
            "tsConfig": "tsconfig.spec.json",
            "inlineStyleLanguage": "scss",
            "assets": [
              "src/favicon.ico",
              "src/assets"
            ],
            "styles": [
              "src/styles.scss"
            ],
            "scripts": []
          }
        }
      }
    },
    "<prefix>-<domain>": {
      "projectType": "library",
      "schematics": {
        "@schematics/angular:component": {
          "style": "scss",
          "changeDetection": "OnPush"
        }
      },
      "root": "projects/<prefix>-<domain>",
      "sourceRoot": "projects/<prefix>-<domain>/src",
      "prefix": "<prefix>",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:ng-packagr",
          "options": {
            "project": "projects/<prefix>-<domain>/ng-package.json"
          },
          "configurations": {
            "production": {
              "tsConfig": "projects/<prefix>-<domain>/tsconfig.lib.prod.json"
            },
            "development": {
              "tsConfig": "projects/<prefix>-<domain>/tsconfig.lib.json"
            }
          },
          "defaultConfiguration": "production"
        },
        "test": {
          "builder": "@angular-devkit/build-angular:karma",
          "options": {
            "tsConfig": "projects/<prefix>-<domain>/tsconfig.spec.json",
            "polyfills": [
              "zone.js",
              "zone.js/testing"
            ]
          }
        }
      }
    }
  },
  "defaultProject": "<n>"
}
```

---

## package.json (raíz)

```json
{
  "name": "<n>",
  "version": "0.1.0",
  "description": "Angular monorepo project with <Prefix> library",
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
  },
  "private": true,
  "dependencies": {
    "@angular/animations": "^15.2.0",
    "@angular/common": "^15.2.0",
    "@angular/compiler": "^15.2.0",
    "@angular/core": "^15.2.0",
    "@angular/forms": "^15.2.0",
    "@angular/platform-browser": "^15.2.0",
    "@angular/platform-browser-dynamic": "^15.2.0",
    "@angular/router": "^15.2.0",
    "@ngx-translate/core": "^14.0.0",
    "@ngx-translate/http-loader": "^7.0.0",
    "@ngxs/store": "^3.8.1",
    "@ngxs/devtools-plugin": "^3.8.1",
    "@ngxs/logger-plugin": "^3.8.1",
    "keycloak-angular": "^15.0.0",
    "keycloak-js": "^22.0.0",
    "primeng": "^15.4.0",
    "primeicons": "^6.0.1",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.12.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^15.2.0",
    "@angular/cli": "~15.2.0",
    "@angular/compiler-cli": "^15.2.0",
    "@types/jasmine": "~4.3.0",
    "@types/node": "^18.15.0",
    "jasmine-core": "~4.5.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.1.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.0.0",
    "ng-packagr": "^15.2.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "tailwindcss-primeui": "^0.3.0",
    "typescript": "~4.9.0"
  }
}
```

---

## tsconfig.json

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
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
    "target": "ES2022",
    "module": "es2020",
    "lib": ["es2020", "dom"],
    "useDefineForClassFields": false,
    "paths": {
      "<prefix>-<domain>": [
        "dist/<prefix>-<domain>/<prefix>-<domain>",
        "dist/<prefix>-<domain>"
      ],
      "<prefix>-<domain>/*": [
        "dist/<prefix>-<domain>/<prefix>-<domain>/*",
        "dist/<prefix>-<domain>/*"
      ]
    }
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

---

## tsconfig.app.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
  },
  "files": ["src/main.ts"],
  "include": ["src/**/*.d.ts"]
}
```

---

## tsconfig.spec.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": ["jasmine"]
  },
  "include": [
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
```

---

## tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
    './projects/**/*.{html,ts}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwindcss-primeui'),
  ],
};
```

---

## postcss.config.js

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

## .gitignore

```
# See http://help.github.com/ignore-files/ for more about ignoring files.

# Compiled output
/dist
/tmp
/out-tsc
/bazel-out

# Node
/node_modules
pnpm-debug.log
yarn-error.log

# IDEs and editors
.idea/
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# Visual Studio Code
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.history/*

# Miscellaneous
/.angular/cache
.sass-cache/
/connect.lock
/coverage
/libpeerconnection.log
testem.log
/typings

# System files
.DS_Store
Thumbs.db

# Environment
ANTIGRAVITY.local.md
*.tgz
```

---

## README.md

```markdown
# <n>

Angular monorepo project with <Prefix> library.

## Development server

Run `pnpm start` for a dev server. Navigate to `http://localhost:4200/`.

## Build

Run `pnpm run build` to build the project.

## Build Library

Run `pnpm run <prefix>-<domain>:package` to build the library.

## Publish Library

Run `pnpm run <prefix>-<domain>` to build and publish the library.

## Project Structure

- `src/` - Main application
- `projects/<prefix>-<domain>/` - Library
- `docs/` - Documentation
```

---

## CHANGELOG.md

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - YYYY-MM-DD

### Added
- Initial project setup
- Angular monorepo structure
- Keycloak authentication
- NGXS state management
- PrimeNG + TailwindCSS UI
- Welcome module in library
```
