import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ScuApaBibliographyManagerComponent } from './scu-apa-bibliography-manager.component';
import { ScuBibliografiaModel } from '@shared/models/scu-programa-analitico.model';

describe('ScuApaBibliographyManagerComponent', () => {
  let component: ScuApaBibliographyManagerComponent;
  let fixture: ComponentFixture<ScuApaBibliographyManagerComponent>;

  const mockBib: ScuBibliografiaModel[] = [
    {
      tipo: 'BASICA',
      citaApa: 'Sommerville, I. (2019). Software Engineering (10th ed.). Pearson.'
    },
    {
      tipo: 'COMPLEMENTARIA',
      citaApa: 'Martin, R. C. (2017). Clean Architecture. Prentice Hall.'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScuApaBibliographyManagerComponent],
      imports: [FormsModule],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ScuApaBibliographyManagerComponent);
    component = fixture.componentInstance;
    component.bibliography = mockBib.map(b => ({ ...b }));
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should segregate basic and complementary lists', () => {
    expect(component.basicaList.length).toBe(1);
    expect(component.complementariaList.length).toBe(1);
  });

  it('should emit scuAddBibliography on quick add', () => {
    spyOn(component.scuAddBibliography, 'emit');
    component.newQuickCitation = 'Bloch, J. (2018). Effective Java (3rd ed.). Addison-Wesley.';
    component.quickTipo = 'BASICA';

    component.onQuickAdd();

    expect(component.scuAddBibliography.emit).toHaveBeenCalledWith({
      tipo: 'BASICA',
      citaApa: 'Bloch, J. (2018). Effective Java (3rd ed.). Addison-Wesley.'
    });
  });

  it('should toggle item type between BASICA and COMPLEMENTARIA', () => {
    spyOn(component.scuBibliographyChanged, 'emit');
    const item = component.bibliography[0];

    component.onToggleTipo(item);

    expect(item.tipo).toBe('COMPLEMENTARIA');
    expect(component.scuBibliographyChanged.emit).toHaveBeenCalled();
  });
});
