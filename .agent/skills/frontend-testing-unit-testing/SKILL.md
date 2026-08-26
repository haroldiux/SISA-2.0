---
name: Frontend - Testing: Unit Testing
description: Rules and guidelines for Unit Testing in the frontend project.
---

# Skill: Unit Testing

## Setup de servicio HTTP
```typescript
describe('[Prefix][Entity]Service', () => {
  let service: [Prefix][Entity]Service;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [[Prefix][Entity]Service],
    });
    service = TestBed.inject([Prefix][Entity]Service);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should load all items', () => {
    const mock: [Prefix][Entity]Response[] = [{ id: '1', name: 'Test' }];

    service.loadAll().subscribe(result => expect(result).toEqual(mock));

    http.expectOne('/api/[endpoint]').flush(mock);
  });

  it('should handle create', () => {
    const request: [Prefix][Entity]Request = { name: 'New', code: 'N01' };
    const response: [Prefix][Entity]Response = { id: '1', ...request };

    service.create(request).subscribe(result => expect(result).toEqual(response));

    const req = http.expectOne('/api/[endpoint]');
    expect(req.request.method).toBe('POST');
    req.flush(response);
  });
});
```

## Setup de componente con Store
```typescript
describe('[Prefix][Entity]Component', () => {
  let component: [Prefix][Entity]Component;
  let fixture: ComponentFixture<[Prefix][Entity]Component>;
  let store: MockStore;

  const initialState = {
    [prefixEntity]: {
      items: [],
      selected: null,
      loading: false,
      error: null,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [[Prefix][Entity]Component],
      providers: [
        provideMockStore({ initialState }),
        { provide: [Prefix]Create[Entity]Cmd, useValue: { execute: jest.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent([Prefix][Entity]Component);
    component = fixture.componentInstance;
    store = TestBed.inject<MockStore>(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should select items from store', () => {
    store.setState({ [prefixEntity]: { ...initialState.[prefixEntity], items: [mockItem] } });
    fixture.detectChanges();

    component.items$.subscribe(items => expect(items.length).toBe(1));
  });
});
```

## Testing de Commands
```typescript
describe('[Prefix]Create[Entity]Cmd', () => {
  let cmd: [Prefix]Create[Entity]Cmd;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [[Prefix]Create[Entity]Cmd, provideMockStore()],
    });
    cmd = TestBed.inject([Prefix]Create[Entity]Cmd);
    store = TestBed.inject<MockStore>(MockStore);
  });

  it('should dispatch create action', () => {
    const dispatch = jest.spyOn(store, 'dispatch');
    const form = new FormGroup({
      name: new FormControl('Test'),
      code: new FormControl('TST-01'),
    });

    cmd.execute(form);

    expect(dispatch).toHaveBeenCalledWith(
      expect.any([Prefix]Create[Entity]Action)
    );
  });
});
```

## Testing de Builders
```typescript
describe('[Prefix][Entity]RequestBuilder', () => {
  it('should build valid request', () => {
    const result = [Prefix][Entity]RequestBuilder.getInstance()
      .setName('Test')
      .setCode('TST-01')
      .build();

    expect(result.name).toBe('Test');
    expect(result.code).toBe('TST-01');
  });

  it('should throw when required field is missing', () => {
    expect(() =>
      [Prefix][Entity]RequestBuilder.getInstance().build()
    ).toThrow();
  });
});
```

## Helpers comunes
```typescript
// Factory de mock data
const createMock[Entity] = (overrides = {}): [Prefix][Entity]Response => ({
  id: '1',
  name: 'Test Entity',
  code: 'TST-01',
  ...overrides,
});
```

## Reglas
- Un `describe` por clase, un `it` por comportamiento
- Nombres de tests: "should [comportamiento esperado]"
- Siempre `afterEach(() => http.verify())` en tests HTTP
- Usar `jest.fn()` o jasmine `spy` para mocks de métodos
- No testear implementación interna — testear comportamiento observable
- Cobertura mínima: services 90%, commands 80%, components 70%
