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

## Actions
```typescript
/**
 * @author Autor
 */
export class [Prefix][Entities]LoadAction {
  static readonly type = '[Prefix][Entity] Load [Entities]';
  constructor() {}
}

export class [Prefix][Entities]PageAction {
  static readonly type = '[Prefix][Entity] Load Paged [Entities]';
  constructor(public readonly page: number, public readonly size: number) {}
}

export class [Prefix][Entity]CreateAction {
  static readonly type = '[Prefix][Entity] Create [Entity]';
  constructor(public readonly request: [Prefix][Entity]Request) {}
}
```

## State Model
```typescript
/**
 * @author Autor
 */

export interface [Prefix][Entity]StateModel {
  items: [Prefix][Entity]Response[];
  selected: [Prefix][Entity]Response | null;
  loading: boolean;
  error: string | null;
}

@State<[Prefix][Entity]StateModel>({
  name: '[PrefixEntity]State',
  defaults: {
    items: [],
    selected: null,
    loading: false,
    error: null,
  }
})
@Injectable()
export class [Prefix][Entity]State {

  constructor(private _[prefix][Entity]PageHttp: [Prefix][Entity]PageHttp,
              private _[prefix][Entity]CreateHttp: [Prefix][Entity]CreateHttp,
              private _[prefix][Entity]UpdateHttp: [Prefix][Entity]UpdateHttp,
              private _[prefix][Entity]DeleteHttp: [Prefix][Entity]DeleteHttp) {}
  
  @Selector()
  public static getItems(state: [Prefix][Entity]StateModel): [Prefix][Entity]Response[] {
    return state.items;
  }

  @Selector()
  public static getSelected(state: [Prefix][Entity]StateModel): [Prefix][Entity]Response | null {
    return state.selected;
  }

  @Selector()
  public static getLoading(state: [Prefix][Entity]StateModel): boolean {
    return state.loading;
  }

  @Selector()
  public static getError(state: [Prefix][Entity]StateModel): string | null {
    return state.error;
  }
  
  @Action([Prefix][Entities]PageAction)
  private _load[Entities]({getState, patchState}: StateContext<[Prefix][Entity]StateModel>, {page, size}: [Prefix][Entities]PageAction) {
    patchState({ loading: true, error: null });

    return this._[prefix][Entity]PageHttp.doGet(page, size).pipe(
      tap((response: [Prefix][Entity]Response[]) => {
        patchState({loading: false, items: response.data});  // Or setState(...getState) according to usage
      }),
      catchError((err: HttpErrorResponse) => {
        patchState({ loading: false, error: err });
      })
    );
  }

  @Action([Prefix][Entity]CreateAction)
  private _createEntity({getState, patchState}: StateContext<[Prefix][Entity]StateModel>, {request}: [Prefix][Entities]CreateAction) {
    patchState({ loading: true, error: null });
    const stateItems = getState();
    return this._[prefix][Entity]CreateHttp.doPost(request).pipe(
      tap((response: [Prefix][Entity]Response) => {
        patchState({loading: false, items: stateItems.add(response)});  // add in items array logic
      }),
      catchError((err: HttpErrorResponse) => {
        patchState({ loading: false, error: err });
      }),
      finalize(() => patchState({loading: false}))
    );
  }
}
```

## Registro en el módulo
```typescript
@NgModule({
  imports: [
    NgxsModule.forFeature([[Prefix][Entity]State]),
  ]
})
export class [Prefix][Domain]Module {}
```

## Obtener datos del state

```typescript
import {Selector} from '@ngxs/store';
import {Observable} from 'rxjs';

export class component {
    @Selector([PrefixEntity]State.getItems)
    public itemsSelector!: Observable<[Prefix][Entity]Response[]>; // optar por esta opcion y suscripcion

    constructor(private _store: Store) {
    }
    
    variable: [Prefix][Entity]Response[] = this._store.selectSnapshot(PrefixEntity]State.getItems);
}

```

## Reglas
- Los `state` son los unicos que incluyen su interfaz de modelo `StateModel` en el mismo archivo
- Nunca mutar el estado directamente — siempre `patchState` o `setState`
- Los selectors son `public static` y `@Selector()` — nunca lógica compleja dentro
- El estado de `loading` se activa al inicio y desactiva en Success o Failure
- Success y Failure se controla en el mismo método que ejecuta la acción 
- Las acciones solo de crean segun la acción, ejemplo: Load, solo se crea Action Load, no Success ni Failure
- Generalmente se tiene que hacer el request http, entonces success y failure se controla con pipe(tap()) y catchError
- Verificar siempre el ejemplo de '*.state.ts'
- Los nombres de actions siguen el formato: `'[Prefix][Entity] Verb [Entity]'`
- Todos los métodos que se ejecutan en un "Action" son privados
- Todos los métodos pueden tener `finalize()`, generalmente para obligar al loading a ponerse en false.
- El registro va siempre en el main module de la librería
- Si se requiere la tarea "LOAD" solo se crea load en el state y action, ningún otro método o acción y asi con las tareas (acciones requeridas)
- Si por ejemplo tengo acciones "CREATE y LOAD" pero luego en alguna implementacion de componente o modulo se necesita update, crear solo update
- Para obtener los datos de state, perferible tener en los componentes mediante `@Select` y observable ver @../development/component
- Nunca crear acciones que no tengan que ver con las acciones requeridas
