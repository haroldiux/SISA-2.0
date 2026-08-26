---
name: Frontend - Development: Component Development
description: Rules and guidelines for Component Development in the frontend project.
---

# Skill: Component Development

## Template base
```typescript
/**
 * @author Autor
 */
@Component({
  selector: '[prefix]-[entity-name]',
  templateUrl: './[prefix]-[entity-name].component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    [Prefix]Create[Entity]Cmd,
    [Prefix]Load[Entities]Cmd,
  ]
})
export class [Prefix][Entity]Component implements OnInit, OnDestroy {

  // Inputs
  @Input() [inputProp]: [Type];

  // Outputs
  @Output() [eventName] = new EventEmitter<[Type]>();

  // Observables del store (público, con $)
  public items$: Observable<[Prefix][Entity]Response[]>;
  public loading$: Observable<boolean>;

  // Estado local del componente
  public selectedItem: [Prefix][Entity]Response | null = null;

  // Privados (con _)
  private _destroy$ = new Subject<void>();

  constructor(
    private _store: Store,
    private _createCmd: [Prefix]Create[Entity]Cmd,
    private _loadCmd: [Prefix]Load[Entities]Cmd,
  ) {}

  ngOnInit(): void {
    this._setupObservables();
    this._loadCmd.execute();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  // Event handlers públicos (prefijo on)
  public onSave(form: FormGroup): void {
    this._createCmd.execute(form);
  }

  public onSelect(item: [Prefix][Entity]Response): void {
    this.selectedItem = item;
    this.[eventName].emit(item);
  }

  public trackById(_: number, item: [Prefix][Entity]Response): string {
    return item.id;
  }

  private _setupObservables(): void {
    this.items$ = this._store.select([Prefix][Entity]State.items);
    this.loading$ = this._store.select([Prefix][Entity]State.loading);
  }
}
```
- Siempre agregar `@author`

## Template HTML base
```html
<div class="[prefix]-[entity]">

  <!-- Loading -->
  <div *ngIf="loading$ | async" class="flex justify-center p-4">
    <p-progressSpinner strokeWidth="4" />
  </div>

  <!-- Contenido -->
  <ng-container *ngIf="!(loading$ | async)">

    <!-- Vacío -->
    <div *ngIf="(items$ | async)?.length === 0" class="text-center p-8 text-surface-500">
      No hay registros disponibles.
    </div>

    <!-- Lista / tabla -->
    <p-table
      *ngIf="(items$ | async)?.length > 0"
      [value]="items$ | async"
      [rows]="10"
      [paginator]="true"
      [rowTrackBy]="trackById"
    >
      <ng-template pTemplate="header">
        <tr>
          <th>[Campo 1]</th>
          <th>[Campo 2]</th>
          <th>Acciones</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-item>
        <tr>
          <td>{{ item.[field1] }}</td>
          <td>{{ item.[field2] }}</td>
          <td>
            <p-button icon="pi pi-eye" [text]="true" (onClick)="onSelect(item)" />
          </td>
        </tr>
      </ng-template>
    </p-table>

  </ng-container>

</div>
```

## SCSS base
```scss
.[prefix]-[entity] {
  // Usar clases de Tailwind + variables PrimeNG
  // Evitar valores hardcodeados de colores — usar var(--p-*)
}
```

## Reglas de componentes
- Smart components (pages): conectan al store, usan Commands
- Dumb components (presentacionales): solo @Input/@Output, sin store
- Nunca `subscribe()` manual en componentes — siempre `async` pipe
- El `_destroy$` solo es necesario si hay subscripciones manuales inevitables
- La lógica de negocio va en Commands, nunca en el componente
- Archivos SCSS siempre en "assets", 
