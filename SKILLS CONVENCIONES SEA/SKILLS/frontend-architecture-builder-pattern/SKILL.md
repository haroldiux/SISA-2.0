---
name: Frontend - Architecture: Builder Pattern
description: Rules and guidelines for Builder Pattern in the frontend project.
---

# Skill: Builder Pattern

## Propósito
Construir objetos request/response/option de forma fluida y validada. Separa la construcción de objetos de la lógica de negocio.

## Tipos de builders
- **RequestBuilder** — para enviar al API
- **ResponseBuilder** — para transformar respuestas del API (raro)

## Implementación
```typescript
// interfaz build
/**
 * @author Autor
 */
export interface [Prefix][Entity]Build<T> {
  set[Field](value: string): [Prefix][Entity]Build<T>;
  build(): T;
}

// Builder concreto (clase)
/**
 * @author Autor
 */
export class [Prefix][Entity]RequestBuilder
  implements [Prefix][Entity]Build<[Prefix][Entity]Request> {

  private readonly _request: [Prefix][Entity]Request;

  private constructor() {
    this._request = new [Prefix][Entity]Request();
  }

  public static getInstance(): [Prefix][Entity]Build<[Prefix][Entity]Request> {
    return new [Prefix][Entity]RequestBuilder();
  }

  public set[Field](value: string): [Prefix][Entity]Build<[Prefix][Entity]Request> {
    this._request.[field] = value;
    return this;
  }

  public build(): [Prefix][Entity]Request {
    this._validate();
    return this._request;
  }

  private _validate(): void {
    if (!this._request.[requiredField]) {
      throw new Error('[Entity] [requiredField] is required');
    }
  }
}
```

## Uso
```typescript
const request = [Prefix][Entity]RequestBuilder.getInstance()
  .set[Field1](value1)
  .set[Field2](value2)
  .build();
```

## Reglas
- Siempre usar `getInstance()` como factory estático (nunca `new` desde fuera)
- Validar campos requeridos en `build()`, nunca en los setters
- Inmutable: cada setter retorna `this` pero no muta estado externo
- Un builder por tipo de objeto (Request, Response son builders distintos)
- Build y builder van en archivos separados
