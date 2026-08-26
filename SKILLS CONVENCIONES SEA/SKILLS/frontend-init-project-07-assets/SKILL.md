---
name: Frontend - Init-project: PASO 7: Assets — i18n y estilos globales
description: Rules and guidelines for PASO 7: Assets — i18n y estilos globales in the frontend project.
---

# PASO 7: Assets — i18n y estilos globales

> **Predecesor:** [06-environments.md](./06-environments.md)
> **Sucesor:** [08-library-config.md](./08-library-config.md)

Generar el archivo de traducciones en español y el archivo de estilos globales de la aplicación.

---

## src/assets/i18n/es.json

```json
{
  "LOGIN": {
    "TITLE": "Bienvenido",
    "SUBTITLE": "Sistema de <n>",
    "BUTTON": "Iniciar sesión"
  },
  "WELCOME": {
    "TITLE": "¡BIENVENIDO!",
    "SUBTITLE": "Ahora crea tus módulos o componentes y dale funcionalidad a tu aplicación",
    "MESSAGE": "Usa el comando /project:new-feature para generar nuevas features"
  }
}
```

---

## src/styles.scss

```scss
// Tailwind CSS
@tailwind base;
@tailwind components;
@tailwind utilities;

// PrimeNG Icons
@import 'primeicons/primeicons.css';

// Librería styles
@import 'projects/<prefix>-<domain>/assets/<prefix>-<domain>-styles';

// Global styles
html {
  font-family: var(--font-family);
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--surface-ground);
}
```
