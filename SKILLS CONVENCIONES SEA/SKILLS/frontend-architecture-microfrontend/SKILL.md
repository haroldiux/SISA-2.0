---
name: Frontend - Architecture: Microfrontend (Module Federation)
description: Rules and guidelines for Microfrontend (Module Federation) in the frontend project.
---

# Skill: Microfrontend (Module Federation)

## Setup básico
```bash
ng add @angular-architects/module-federation --project [mfe-name] --port [PORT] --type remote
```

## webpack.config.js — Remote (MFE)
```javascript
const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: '[mfe-name]',
  exposes: {
    './Module': './src/app/features/[feature]/[feature].module.ts',
  },
  shared: {
    ...shareAll({
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto'
    }),
  },
});
```

## webpack.config.js — Shell (Host)
```javascript
module.exports = withModuleFederationPlugin({
  remotes: {
    '[mfe-name]': 'http://localhost:[PORT]/remoteEntry.js',
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },
});
```

## Routing en el Shell
```typescript
const routes: Routes = [
  {
    path: '[feature]',
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: environment.[mfeName]Url + '/remoteEntry.js',
        exposedModule: './Module',
      }).then(m => m.[Feature]Module),
  },
];
```

## Compartir estado entre MFEs
- No compartir Store directamente entre MFEs
- Comunicación vía eventos del DOM (`CustomEvent`) o un shared state service
- Usar `localStorage` / `sessionStorage` solo para datos de sesión (tokens)

## Reglas
- Cada MFE es completamente independiente — tiene su propio `package.json`
- Las librerías compartidas (`@org/shared`) se marcan como `singleton: true`
- Keycloak se inicializa solo en el Shell, los MFEs reciben el token
- No exponer componentes sueltos, siempre exponer módulos completos
- Los entornos de URL de remotes van en `environment.ts`

## environment.ts del Shell
```typescript
export const environment = {
  production: false,
  [mfe1Name]Url: 'http://localhost:[PORT1]',
  [mfe2Name]Url: 'http://localhost:[PORT2]',
};
```
