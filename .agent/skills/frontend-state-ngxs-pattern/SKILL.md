---
name: Frontend - State: NGXS State Management
description: Rules and guidelines for NGXS State Management in the frontend project.
---

# Skill: NGXS State Management

## Estructura de archivos
```
store/
└── [entity]/
    ├── [prefix]-[entity].actions.ts
    └── [prefix]-[entity].state.ts
```

---

## Actions (`[prefix]-[entity].actions.ts`)

### Reglas de actions
- `public static readonly type` — siempre con esta firma exacta
- El formato del type es: `'[Prefix][Entity] Verb Entity'` (ej: `'[ScsStudents] Load All Students by criteria'`)
- Solo se crea la acción que corresponde al verbo requerido: **nunca** `...SuccessAction` ni `...FailureAction`
- Si la acción no lleva parámetros, el `constructor` va vacío
- Los parámetros del constructor son siempre `public readonly`

```typescript
/**
 * @author Autor
 */

// Acción sin parámetros
export class [Prefix][Entity]LoadAction {
  public static readonly type = '[Prefix][Entity] Load [Entities]';
  constructor() {}
}

// Acción con paginación y criterio opcional
export class [Prefix]Load[Entities]ByCriteriaAction {
  public static readonly type = '[Prefix][Entity] Load [Entities] By Criteria';
  constructor(
    public readonly page?: number,
    public readonly size?: number,
    public readonly criteria?: [Prefix][Entity]CriteriaRequest
  ) {}
}

// Acción de creación
export class [Prefix]Create[Entity]Action {
  public static readonly type = '[Prefix][Entity] Create [Entity]';
  constructor(public readonly [entity]Request: [Prefix][Entity]Request) {}
}

// Acción de lectura por ID
export class [Prefix]Read[Entity]Action {
  public static readonly type = '[Prefix][Entity] Read [Entity]';
  constructor(public readonly [entity]Id: string) {}
}

// Acción de actualización
export class [Prefix]Update[Entity]Action {
  public static readonly type = '[Prefix][Entity] Update [Entity]';
  constructor(public readonly [entity]Request: [Prefix][Entity]Request) {}
}

// Acción de reset (sin parámetros)
export class [Prefix]Reset[Entity]Action {
  public static readonly type = '[Prefix][Entity] Reset [Entity]';
  constructor() {}
}
```

> **Importante:** Solo se generan las acciones que el feature requiere. Si el feature solo necesita Load y Create, solo se crean esas dos acciones.

---

## State (`[prefix]-[entity].state.ts`)

### StateModel
- La interfaz `StateModel` se declara **en el mismo archivo** que el state
- Siempre incluye `loading`, `error`, y los campos de datos necesarios
- `loaded` es opcional, se incluye si el feature lo necesita
- Para paginación se incluye `totalRecords`, `page`, `size`

```typescript
export interface [Prefix][Entity]StateModel {
  [entities]: [Prefix][Entity]Response[];
  [entity]: [Prefix][Entity]Response | null;
  totalRecords?: number;
  page?: number;
  size?: number;
  loading: boolean;
  loaded: boolean;
  error?: any;
}
```

### Clase State

```typescript
/**
 * @author Autor
 */
@State<[Prefix][Entity]StateModel>({
  name: '[Prefix][Entity]State',
  defaults: {
    [entities]: [],
    [entity]: null,
    page: 0,
    size: 25,
    loading: false,
    loaded: false,
    error: null,
  }
})
@Injectable()
export class [Prefix][Entity]State {

  constructor(
    private _[prefix]Load[Entity]Http: [Prefix]Load[Entity]Http,
    private _[prefix]Create[Entity]Http: [Prefix]Create[Entity]Http,
    private _[prefix]Read[Entity]Http: [Prefix]Read[Entity]Http,
  ) {}

  // ─── Selectors ───────────────────────────────────────────────────────────────

  @Selector()
  public static get[Entities]Selector({ [entities] }: [Prefix][Entity]StateModel): [Prefix][Entity]Response[] {
    return [entities];
  }

  @Selector()
  public static get[Entity]Selector({ [entity] }: [Prefix][Entity]StateModel): [Prefix][Entity]Response | null {
    return [entity];
  }

  @Selector()
  public static getLoadingSelector({ loading }: [Prefix][Entity]StateModel): boolean {
    return loading;
  }

  @Selector()
  public static getLoadedSelector({ loaded }: [Prefix][Entity]StateModel): boolean {
    return loaded;
  }

  @Selector()
  public static getErrorSelector({ error }: [Prefix][Entity]StateModel): any {
    return error;
  }

  // Selectores de paginación (solo si aplica)
  @Selector()
  public static pageSelector({ page }: [Prefix][Entity]StateModel): number {
    return page ?? 0;
  }

  @Selector()
  public static sizeSelector({ size }: [Prefix][Entity]StateModel): number {
    return size ?? 25;
  }

  @Selector()
  public static totalRecordsSelector({ totalRecords }: [Prefix][Entity]StateModel): number | undefined {
    return totalRecords;
  }

  // ─── Actions ─────────────────────────────────────────────────────────────────

  @Action([Prefix]Load[Entities]ByCriteriaAction)
  private _load[Entities](
    { getState, setState }: StateContext<[Prefix][Entity]StateModel>,
    { page, size, criteria }: [Prefix]Load[Entities]ByCriteriaAction
  ) {
    setState({ ...getState(), loading: true, loaded: false, error: null });

    return this._[prefix]Load[Entity]Http.doGet(page, size, criteria).pipe(
      tap(({ content, totalElements }: [Prefix]PaginationResponse<[Prefix][Entity]Response>) => {
        setState({
          ...getState(),
          [entities]: content,
          totalRecords: totalElements,
          loaded: true,
        });
      }),
      catchError((error: HttpErrorResponse) => {
        setState({ ...getState(), error });
        return of(error);
      }),
      finalize(() => setState({ ...getState(), loading: false }))
    );
  }

  @Action([Prefix]Create[Entity]Action)
  private _create[Entity](
    { getState, setState }: StateContext<[Prefix][Entity]StateModel>,
    { [entity]Request }: [Prefix]Create[Entity]Action
  ) {
    setState({ ...getState(), loading: true, loaded: false, error: null });

    return this._[prefix]Create[Entity]Http.doPost([entity]Request).pipe(
      tap((response: [Prefix][Entity]Response) => {
        const [entities] = getState().[entities];
        setState({
          ...getState(),
          [entities]: [response, ...[entities]],
          [entity]: response,
          loaded: true,
        });
      }),
      catchError((error: HttpErrorResponse) => {
        setState({ ...getState(), error });
        return of(error);
      }),
      finalize(() => setState({ ...getState(), loading: false }))
    );
  }

  @Action([Prefix]Read[Entity]Action)
  private _read[Entity](
    { getState, setState }: StateContext<[Prefix][Entity]StateModel>,
    { [entity]Id }: [Prefix]Read[Entity]Action
  ) {
    setState({ ...getState(), loading: true, loaded: false, error: null });

    return this._[prefix]Read[Entity]Http.doGet([entity]Id).pipe(
      tap((response: [Prefix][Entity]Response) => {
        setState({
          ...getState(),
          [entity]: response,
          loaded: true,
        });
      }),
      catchError((error: HttpErrorResponse) => {
        setState({ ...getState(), error });
        return of(error);
      }),
      finalize(() => setState({ ...getState(), loading: false }))
    );
  }

  @Action([Prefix]Reset[Entity]Action)
  private _reset[Entity]({ getState, setState }: StateContext<[Prefix][Entity]StateModel>) {
    setState({ ...getState(), [entity]: null, error: null });
  }
}
```

---

## Patrón `pipe()` en detalle

Cada método con llamada HTTP sigue **siempre** esta estructura:

```typescript
return this._httpService.doGet(/* params */).pipe(
  tap((response: [ResponseType]) => {
    // ✅ Solo asignación/modificación del estado — sin lógica de loading aquí
    setState({ ...getState(), data: response, loaded: true });
  }),
  catchError((error: HttpErrorResponse) => {
    // ❌ No patchear loading aquí — lo maneja finalize()
    setState({ ...getState(), error });
    return of(error); // o return EMPTY si no se quiere propagar
  }),
  finalize(() => {
    // ✅ Aquí siempre se resetea el loading
    setState({ ...getState(), loading: false });
  })
);
```

| Operador      | Responsabilidad                                              |
|---------------|--------------------------------------------------------------|
| `tap`         | Asignar datos al estado cuando el HTTP responde OK           |
| `catchError`  | Asignar el error al estado — retornar `of(error)` o `EMPTY` |
| `finalize`    | Siempre poner `loading: false`, sin importar el resultado    |

> **Nota:** `loading: false` **no** se pone dentro del `tap()` ni del `catchError()` — se centraliza en `finalize()`.

---

## Destructuring obligatorio

Los parámetros del método que ejecuta un `@Action` **siempre** se desestructuran:

```typescript
// ✅ Correcto
@Action(ScsCreateStudentAction)
private _createStudent(
  { getState, setState }: StateContext<StudentStateModel>,
  { studentRequest }: ScsCreateStudentAction
) { ... }

// ❌ Incorrecto
@Action(ScsCreateStudentAction)
private _createStudent(ctx: StateContext<StudentStateModel>, action: ScsCreateStudentAction) { ... }
```

Se usan `getState` y `setState` juntos (con spread `...getState()`) cuando se actualiza el estado parcialmente sin perder otros campos. Se puede usar `patchState` solo si el método **no** necesita el estado actual para construir el nuevo.

---

## Registro en el módulo

```typescript
@NgModule({
  imports: [
    NgxsModule.forFeature([[Prefix][Entity]State]),
  ]
})
export class [Prefix][Domain]Module {}
```

---

## Obtener datos en componentes

Preferir siempre `@Select` con `Observable` sobre `selectSnapshot`:

```typescript
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

@Component({ ... })
export class [Prefix][Entity]Component {

  // ✅ Preferido — reactivo
  @Select([Prefix][Entity]State.get[Entities]Selector)
  public [entities]$!: Observable<[Prefix][Entity]Response[]>;

  @Select([Prefix][Entity]State.getLoadingSelector)
  public loading$!: Observable<boolean>;

  // ⚠️ Solo usar si se necesita el valor en el momento exacto (no reactivo)
  private _snapshot = this._store.selectSnapshot([Prefix][Entity]State.get[Entities]Selector);

  constructor(private _store: Store) {}
}
```

---

## Reglas generales

- Solo se crean las acciones que el feature **explícitamente** requiere — ni más, ni menos
- **Nunca** se crean `...SuccessAction` ni `...FailureAction`
- El `StateModel` va siempre en el mismo archivo que el state (`*.state.ts`)
- Nunca mutar el estado directamente — siempre `patchState` o `setState`
- Los `@Selector()` son `public static` y sin lógica compleja
- Todos los métodos `@Action` son `private`
- Los parámetros de `StateContext` y de la `Action` se desestructuran siempre
- `loading: true` se activa al inicio del método, `loading: false` va en `finalize()`
- El error se asigna en `catchError` al campo `error` del state model
- El registro del state va en el `main module` de la librería/feature
- Si un nuevo feature solo necesita `Update`, se crea solo `Update` — no se duplican acciones ya existentes