---
name: Frontend - Code-conventions: TypeScript Conventions
description: Rules and guidelines for TypeScript Conventions in the frontend project.
---

# Skill: TypeScript Conventions

## Tipado estricto
```typescript
// ❌ Prohibido
const data: any = response;
function process(input): void {}

// ✅ Correcto
const data: ScuUniversityResponse = response;
function process(input: ScuUniversityRequest): Observable<ScuUniversityResponse> {}
```

## Interfaces vs Types
```typescript
// Interfaces — para contratos de datos (request, response, state)
export interface ScuUniversityRequest {
  code: string;
  name: string;
  nit: string;
  aliasName?: string;       // opcional
  readonly id?: string;     // readonly cuando no debe cambiarse
}

// Types — para uniones, aliases, utilidades
type EntityId = string;
type LoadingState = 'idle' | 'loading' | 'success' | 'error';
type Nullable<T> = T | null;
```

## Clases: orden de miembros
```typescript
export class [Prefix][Entity]Component {

  // 1. Inputs / Outputs
  @Input() entity: ScuUniversityResponse;
  @Output() entitySelected = new EventEmitter<ScuUniversityResponse>();

  // 2. Observables públicos
  public items$: Observable<ScuUniversityResponse[]>;

  // 3. Estado local público
  public isDialogVisible = false;

  // 4. Privados
  private _destroy$ = new Subject<void>();

  // 5. Constructor
  constructor(private _store: Store) {}

  // 6. Lifecycle hooks (en orden)
  ngOnInit(): void {}
  ngOnChanges(): void {}
  ngOnDestroy(): void {}

  // 7. Métodos públicos (event handlers primero)
  public onSave(): void {}
  public onCancel(): void {}

  // 8. Métodos privados
  private _initialize(): void {}
}
```

## Null safety
```typescript
// Optional chaining
const name = user?.profile?.name;

// Nullish coalescing
const label = item.aliasName ?? item.name;

// Non-null assertion — solo cuando estás seguro
const element = document.getElementById('app')!;

// Type guards
function isUniversity(obj: unknown): obj is ScuUniversityResponse {
  return typeof obj === 'object' && obj !== null && 'code' in obj;
}
```

## Generics útiles
```typescript
// Respuesta paginada
interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

// Partial para updates
function update(id: string, data: Partial<ScuUniversityRequest>): Observable<ScuUniversityResponse> {}

// Record para mapas tipados
const permissionMap: Record<ScuPermission, boolean> = {
  [ScuPermission.READ]: true,
  [ScuPermission.WRITE]: false,
};
```

## Imports: orden obligatorio
```typescript
// 1. Angular core y common
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// 2. Angular extras
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

// 3. Librerías de terceros
import { Observable, Subject, takeUntil } from 'rxjs';
import { Store } from '@ngxs/store';
import { MessageService } from 'primeng/api';

// 4. Librerías internas (@org/*)
import { ScuUniversityResponse } from '@unitepc/sea-university';

// 5. Imports relativos del mismo módulo
import { ScuUniversityState } from '../../store/scu-university.state';
```

## Enums
```typescript
// Siempre con valores string explícitos (facilita debug y API)
export enum ScuUniversityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}
```

## Reglas rápidas
- `readonly` en propiedades de clases que no cambian después del constructor
- `const` siempre por defecto, `let` solo si hay reasignación
- Funciones puras > métodos con side effects
- Evitar `!` (non-null assertion) — preferir `??` o type guards
- Interfaces exportadas desde `api/contracts/` o `http/`, nunca inline en componentes
