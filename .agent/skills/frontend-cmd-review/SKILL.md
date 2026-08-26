---
name: Frontend - Cmd: /project:review
description: Scaffolding instructions and command reference for /project:review in the frontend project.
---

# Comando: /project:review

Revisa el código antes de hacer commit verificando todos los lineamientos del proyecto.

## Uso
```
/project:review
```
O pasar archivos específicos:
```
/project:review src/app/features/university/
```

## Checklist que verifica

### TypeScript
- [ ] No hay uso de `any`
- [ ] Todas las funciones tienen tipos de retorno explícitos
- [ ] Los parámetros están tipados
- [ ] Se usan interfaces para contratos de datos

### Angular
- [ ] Todos los componentes usan `ChangeDetectionStrategy.OnPush`
- [ ] Los observables se consumen con `async` pipe (no `subscribe` manual)
- [ ] Hay `trackBy` en todos los `*ngFor`
- [ ] No hay lógica de negocio en componentes (va en Commands)

### Patrones del proyecto
- [ ] Los nombres siguen las convenciones (prefijo, kebab-case, etc.)
- [ ] Los privados tienen prefijo `_`
- [ ] Los observables tienen sufijo `$`
- [ ] Los Commands no tienen lógica de construcción de objetos (va en Builders)
- [ ] El State no hace llamadas HTTP directas (las hace el Service)

### Calidad
- [ ] No hay `console.log` sin comentar
- [ ] No hay imports no utilizados
- [ ] No hay código comentado sin razón
- [ ] Los métodos son cortos y con una sola responsabilidad

### Tests
- [ ] Hay tests para el nuevo código
- [ ] Los tests cubren casos de error además del happy path

## Output
El comando retorna:
- Lista de problemas encontrados con ubicación exacta
- Sugerencias de corrección para cada problema
- Resumen: ✅ listo para commit / ⚠️ hay items por resolver
