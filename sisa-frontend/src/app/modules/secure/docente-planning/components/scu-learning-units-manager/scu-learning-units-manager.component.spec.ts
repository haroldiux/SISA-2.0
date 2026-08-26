import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ScuLearningUnitsManagerComponent } from './scu-learning-units-manager.component';
import { ScuUnidadAprendizajeModel } from '@shared/models/scu-programa-analitico.model';

describe('ScuLearningUnitsManagerComponent', () => {
  let component: ScuLearningUnitsManagerComponent;
  let fixture: ComponentFixture<ScuLearningUnitsManagerComponent>;

  const mockUnits: ScuUnidadAprendizajeModel[] = [
    {
      numeroUnidad: 1,
      titulo: 'Unidad 1',
      saberesConceptuales: 'Conceptos 1',
      saberesProcedimentales: 'Proc 1',
      saberesActitudinales: 'Act 1',
      criteriosDesempeno: 'Crit 1',
      horasAcademicas: 20
    },
    {
      numeroUnidad: 2,
      titulo: 'Unidad 2',
      saberesConceptuales: 'Conceptos 2',
      saberesProcedimentales: 'Proc 2',
      saberesActitudinales: 'Act 2',
      criteriosDesempeno: 'Crit 2',
      horasAcademicas: 24
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScuLearningUnitsManagerComponent],
      imports: [FormsModule],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ScuLearningUnitsManagerComponent);
    component = fixture.componentInstance;
    component.units = [...mockUnits];
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate total academic hours correctly', () => {
    expect(component.totalHoras).toBe(44);
  });

  it('should emit scuAddUnit when canAdd is true', () => {
    spyOn(component.scuAddUnit, 'emit');
    component.onAdd();
    expect(component.scuAddUnit.emit).toHaveBeenCalled();
  });

  it('should emit scuRemoveUnit when onRemove is invoked', () => {
    spyOn(component.scuRemoveUnit, 'emit');
    component.onRemove(1);
    expect(component.scuRemoveUnit.emit).toHaveBeenCalledWith(1);
  });

  it('should emit scuMoveUnit when onMoveUp/onMoveDown is invoked', () => {
    spyOn(component.scuMoveUnit, 'emit');
    component.onMoveUp(1);
    expect(component.scuMoveUnit.emit).toHaveBeenCalledWith({ from: 1, to: 0 });
  });
});
