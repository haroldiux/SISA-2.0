---
name: Frontend - Code-conventions: Naming Conventions
description: Rules and guidelines for Naming Conventions in the frontend project.
---

# Skill: Naming Conventions

## Archivos
| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Componente | `[p]-[feature][-sub].component.ts` | `scu-university-list.component.ts` |
| Template | `[p]-[feature][-sub].component.html` | `scu-university-list.component.html` |
| Estilos | `[p]-[feature][-sub].component.scss` | `_scu-university-list.component.scss` |
| Servicio | `[p]-[feature].service.ts` | `scu-university.service.ts` |
| Comando | `[p]-[verb]-[entity].cmd.ts` | `scu-create-university.cmd.ts` |
| Builder | `[p]-[entity]-[type].builder.ts` | `scu-university-request.builder.ts` |
| Actions | `[p]-[entity].actions.ts` | `scu-university.actions.ts` |
| State | `[p]-[entity].state.ts` | `scu-university.state.ts` |
| Model | `[p]-[entity].model.ts` | `scu-university.model.ts` |
| Enum | `[p]-[entity].enum.ts` | `scu-university-status.enum.ts` |
| Guard | `[p]-[name].guard.ts` | `scu-permission.guard.ts` |
| Interceptor | `[name].interceptor.ts` | `auth.interceptor.ts` |
| Constantes | `[p]-[domain].constants.ts` | `scu-university.constants.ts` |
| Test | `[mismo-nombre].spec.ts` | `scu-university.service.spec.ts` |

> `[p]` = prefijo (ej: `scu`, `app`, `mfe`)

## Clases TypeScript
| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Componente | `[P][Feature][Sub?]Component` | `ScuUniversityListComponent` |
| Servicio | `[P][Feature]Service` | `ScuUniversityService` |
| Comando | `[P][Verb][Entity]Cmd` | `ScuCreateUniversityCmd` |
| Builder | `[P][Entity][Type]Builder` | `ScuUniversityRequestBuilder` |
| State | `[P][Entity]State` | `ScuUniversityState` |
| Action | `[P][Verb][Entity]Action` | `ScuLoadUniversitiesAction` |
| Interface Request | `[P][Entity]Request` | `ScuUniversityRequest` |
| Interface Response | `[P][Entity]Response` | `ScuUniversityResponse` |
| Interface State | `[P][Entity]StateModel` | `ScuUniversityStateModel` |
| Enum | `[P][Entity][Type]` | `ScuUniversityStatus` |
| Módulo | `[P][Feature]Module` | `ScuAcademyModule` |
| Guard | `[P][Name]Guard` | `ScuPermissionGuard` |

## Variables y propiedades
```typescript
// Públicas — camelCase
public universities: ScuUniversityResponse[];
public isLoading: boolean;

// Privadas — con _ (underscore)
private _destroy$: Subject<void>;
private _universityService: ScuUniversityService;

// Observables — con $ (dollar)
public universities$: Observable<ScuUniversityResponse[]>;
public isLoading$: Observable<boolean>;

// Constantes — UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_PATH = '/api/v1';
```

## Selectores Angular (HTML)
```typescript
// App principal
selector: 'app-[feature]'          // app-dashboard, app-user-list

// Librería con prefijo
selector: '[prefix]-[feature]'     // scu-university, scu-campus-detail

// Microfrontend
selector: '[mfe-name]-[feature]'   // users-mfe-profile
```

## Rutas de módulos (NGXS action type)
```typescript
// Formato: '[Prefix][Entity] Verb [Target]'
static readonly type = '[ScuUniversity] Load Universities';
static readonly type = '[ScuUniversity] Create University';
static readonly type = '[ScuUniversity] Load Universities Success';
static readonly type = '[ScuUniversity] Load Universities Failure';
```
