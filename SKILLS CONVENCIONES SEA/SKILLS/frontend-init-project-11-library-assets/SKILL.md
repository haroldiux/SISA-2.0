---
name: Frontend - Init-project: PASO 11: Assets y estilos de la librería
description: Rules and guidelines for PASO 11: Assets y estilos de la librería in the frontend project.
---

# PASO 11: Assets y estilos de la librería

> **Predecesor:** [10-library-welcome.md](./10-library-welcome.md)
> **Sucesor:** ninguno (último paso — ver Post-ejecución en [SKILL.md](../SKILL.md))

Generar la cadena de archivos SCSS de la librería. La estructura en cascada permite agregar estilos de componentes de forma modular sin tocar los archivos raíz.

## Cadena de importaciones

```
<prefix>-<domain>-styles.scss
  └── styles/<prefix>-styles.scss
        └── styles/<prefix>-styles-components.scss
              └── styles/components/<prefix>-styles-components.scss
                    └── (aquí se agregan los estilos de cada componente)
```

---

## projects/\<prefix\>-\<domain\>/assets/\<prefix\>-\<domain\>-styles.scss

```scss
/**
 * Main entry point for <Prefix> styles
 * @author <Author>
 */

@import 'styles/<prefix>-styles';
```

---

## projects/\<prefix\>-\<domain\>/assets/styles/\<prefix\>-styles.scss

```scss
/**
 * <Prefix> styles
 * @author <Author>
 */

@import '<prefix>-styles-components';
```

---

## projects/\<prefix\>-\<domain\>/assets/styles/\<prefix\>-styles-components.scss

```scss
/**
 * <Prefix> component styles
 * @author <Author>
 */

@import 'components/<prefix>-styles-components';
```

---

## projects/\<prefix\>-\<domain\>/assets/styles/components/\<prefix\>-styles-components.scss

```scss
/**
 * <Prefix> component styles aggregator
 * @author <Author>
 */

// Agregar aquí los estilos de cada componente de la librería:
// @import 'resources/<prefix>-welcome.component';
```

> 💡 **Convención:** Cada nuevo componente de la librería debe agregar su propio archivo de estilos en `assets/styles/components/resources/` e importarlo aquí con `@import`.
