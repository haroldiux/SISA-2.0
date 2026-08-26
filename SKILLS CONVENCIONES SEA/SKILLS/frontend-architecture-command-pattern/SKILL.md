---
name: Frontend - Architecture: Command Pattern
description: Rules and guidelines for Command Pattern in the frontend project.
---

# Skill: Command Pattern

## Propósito
Encapsular operaciones de negocio como clases inyectables. Los componentes no conocen la lógica — solo ejecutan comandos.

## Estructura de archivos
```
commands/
├── [prefix]-[entity]-create.cmd.ts
├── [prefix]-[entities]-load.cmd.ts
├── [prefix]-[entity]-update.cmd.ts
└── [prefix]-[entity]-delete.cmd.ts
```

## Implementación base
```typescript
/**
 * @author Autor
 */
@Injectable()
export class [Prefix]Create[Entity]Cmd extends SyncCommand<void, FormGroup> {

  constructor(private _store: Store) {
    super();
  }

  public onExecute(formGroup: FormGroup): void {
    const request = [Prefix][Entity]RequestBuilder.getInstance()
      .set[Field](formGroup.get('[field]')?.value)
      .build();

    this._store.dispatch(new [Prefix]Create[Entity]Action(request));
  }
}
```

## Uso en componente
```typescript
/**
 * @author Autor
 */
@Component({
  providers: [[Prefix][Entity]CreateCmd]  // ← scope del componente
})
export class [Prefix][Entity]Component {

  constructor(private _prefixEntityCreateCmd: [Prefix][Entity]CreateCmd) {}

  onSave(form: FormGroup): void {
    this._prefixEntityCreateCmd.execute(form);
  }
}
```

## Tipos de comandos
| Tipo | Nombre | Input |
|------|--------|-------|
| Crear | `[Prefix][Entity]CreateCmd` | `FormGroup` |
| Cargar | `[Prefix][Entities]LoadCmd` | `void` o filtros + paginación |
| Actualizar | `[Prefix][Entity]UpdateCmd` | `{id, FormGroup}` |
| Eliminar | `[Prefix][Entity]DeleteCmd` | `string` (id) |
| Otros | `[Prefix][Entity][OtherAction]Cmd` | `void` o `FormGroup` o `tipoEspecifico` |

## Reglas
- Siempre `@Injectable()` sin `providedIn` — se provee en el componente que lo usa
- Un comando = una operación de negocio
- Toda la lógica de construcción del request va en el Builder, no aquí
- Pueden tener atributos setters para asignar algunas variables necesarias.
- Cuando la acción es "Cargar(Load)" puede tener un criterio de busqueda, ejemplo:
```
prefix = scu
entity = groupCourse
action = cargar por id padre
THEN
fileName = scu-group-course-load-by-parent-id.cmd.ts
className = ScuGroupCourseLoadByParentIdCmd
```
