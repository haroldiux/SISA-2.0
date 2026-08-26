---
name: Frontend - Init-project: PASO 6: Archivos de Environment
description: Rules and guidelines for PASO 6: Archivos de Environment in the frontend project.
---

# PASO 6: Archivos de Environment

> **Predecesor:** [05-module-secure.md](./05-module-secure.md)
> **Sucesor:** [07-assets.md](./07-assets.md)

Generar los archivos de configuración de entorno (development y production).

> ⚠️ **Importante:** Los valores de Keycloak en `environment.ts` son placeholders para desarrollo local. Deben actualizarse con los valores reales antes de ejecutar la aplicación. Ver sección Post-ejecución en [SKILL.md](../SKILL.md).

---

## src/environments/environment.ts

```typescript
/**
 * @author <Author>
 */
export const environment = {
  production: false,
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'master',
    clientId: '<n>-client',
  },
};
```

---

## src/environments/environment.prod.ts

```typescript
/**
 * @author <Author>
 */
export const environment = {
  production: true,
  keycloak: {
    url: 'https://keycloak.example.com',
    realm: 'production',
    clientId: '<n>-client',
  },
};
```
