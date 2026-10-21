# Specification: Docente Materia Cards Highlight

## Requisitos Funcionales

*   **REQ-UI-001**: Las tarjetas de materia deben mostrar claramente su estado (activo/inactivo).
*   **REQ-UI-002**: Al seleccionar una materia, la tarjeta correspondiente debe cambiar visualmente al estado activo y las demás al estado inactivo.
*   **REQ-UI-003**: La tarjeta activa debe mostrar un badge indicando que es la materia activa, con una animación de pulso.
*   **REQ-UI-004**: Las tarjetas inactivas deben mostrar un enlace/badge para invitar a interactuar ("Ver Carga ➔").

## Escenarios BDD

### Escenario 1: Selección de materia
**Given** que el usuario está viendo la lista de materias asignadas
**When** hace clic en una tarjeta de materia
**Then** esa tarjeta pasa al estado "activo" y las demás al estado "inactivo"
**And** el sistema actualiza la vista de carga horaria correspondiente.

### Escenario 2: Transición de clases CSS
**Given** una tarjeta de materia que pasa de inactiva a activa
**When** se actualiza su estado
**Then** debe aplicarse una transición suave (`transition-all duration-200`) en su borde, fondo, sombra y escala (`scale-[1.02]`).

### Escenario 3: Cambio de badge
**Given** que el usuario selecciona una materia
**When** la tarjeta se vuelve activa
**Then** el badge cambia de "Ver Carga ➔" (texto grisáceo) a un badge relleno de color brand con el texto "Activa" y un punto blanco animado (`animate-pulse`).

### Escenario 4: Compatibilidad Dark/Light Mode
**Given** que el usuario cambia el tema de la aplicación
**When** visualiza las tarjetas de materia
**Then** los colores de fondo, bordes y texto deben adaptarse correctamente tanto en modo claro como oscuro usando las clases `dark:` correspondientes.
