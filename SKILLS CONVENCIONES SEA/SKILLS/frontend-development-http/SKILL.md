---
name: Frontend - Development: Http Files Development
description: Rules and guidelines for Http Files Development in the frontend project.
---

# Skill: Http Files Development

## HTTP
```typescript
/**
 * @author Autor
 */
export class [Prefix]Create[Entity]Http extends [HttpServiceGenerated] {

  constructor(private _userLoggedService: ScuLoggedService,
              private _injector: Injector) {
    super();
  }

  public path(): string {
    return '[Request Path]';
  }

  public doPost(requestType: RequestType): Observable<Response> {

    const headers: HttpHeaders = new HttpHeaders({
      userId: this._getUserId()
    });

    // necessary logic and body

    return this.gatewayServer().httpClient().post<Response>(this.getUrl(), body, {headers});
  } // according with http sending method: GET, POST, PUT, DELETE

  protected injector(): Injector {
    return this._injector;
  }

  private _getUserId(): string {

    const userId: number = this._userLoggedService.userLogged.userId;

    return userId.toString();
  }
}
```

```typescript
/**
 * @author Autor
 */

export const httpProviders: Provider[] = [
    // All http files to provide
];
```

## Reglas
- Los servicios HTTP no hacen `catchError` — lo hace el State (NGXS)
- Sin `providedIn` para estos servicios http
- Nunca lógica de transformación en el State — hacerlo en el servicio o en un builder
- Los tipos de request van en `http/body-request`, y de respuesta en `api/response/`, nunca inline
- Siempre agregar `@author`
- Solo un archivo proveedor de los `http`, como constante

