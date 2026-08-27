---
Change Name: 03-docente-materia-cards-highlight
Project: SISA
Status: COMPLETED
Store Mode: Hybrid
---

# Intent & Executive Summary
Mejorar drásticamente el feedback visual y la accesibilidad de la tarjeta de materia activa del docente en la vista principal. Esto permitirá al docente identificar rápidamente en qué materia está trabajando o gestionando actualmente, mejorando la usabilidad y la experiencia general de la interfaz de usuario.

# Scope

## In Scope
* **Resalte visual prominente**: Aplicación de clases CSS para la tarjeta activa: `ring-4 ring-brand-500/20`, fondo con tinte de color brand, borde `brand-600`, transformación de escala a `1.02`, y sombra ampliada `shadow-lg`.
* **Badge dinámico**: 
  * Tarjeta Activa: Indicador visual y de texto (ej. pulsante) "● ACTIVA / EN GESTIÓN".
  * Tarjetas Inactivas: Texto indicador "Ver Carga ➔".
* **Actualización dinámica**: Modificación de la lógica de actualización del DOM en `window.selectDocenteMateria` dentro de `sisa-frontend/src/assets/app-controller.js` y adaptación en `index.html`.
* **Soporte de Temas**: Soporte perfecto para tema Claro y Oscuro (Dark/Light mode) para asegurar contraste y legibilidad en todos los estados.

## Out of Scope
* Modificación de endpoints backend o API REST.
* Cambios en servicios de base de datos o estructura de tablas.

# Success Criteria
1. Al hacer clic en una tarjeta de materia, esta recibe el resalte visual especificado al instante sin recarga de página.
2. El badge dinámico refleja correctamente el estado "ACTIVA" o "Ver Carga" dependiendo de la selección.
3. La interfaz se visualiza correctamente en modo oscuro y claro manteniendo la coherencia de la marca.
4. No ocurren regresiones en otras interacciones de la UI de la vista docente.
