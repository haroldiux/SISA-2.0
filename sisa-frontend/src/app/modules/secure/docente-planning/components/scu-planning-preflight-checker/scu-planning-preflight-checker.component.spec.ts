import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ScuPlanningPreflightCheckerComponent } from './scu-planning-preflight-checker.component';
import { ScuPreflightResultModel } from '@shared/models/scu-planning-preflight.model';

describe('ScuPlanningPreflightCheckerComponent', () => {
  let component: ScuPlanningPreflightCheckerComponent;
  let fixture: ComponentFixture<ScuPlanningPreflightCheckerComponent>;

  const mockPreflight: ScuPreflightResultModel = {
    isEligible: true,
    pillar1Programa: { isValid: true, title: 'Programa Analítico', unitsCount: 3 },
    pillar2Pac: {
      isValid: true,
      title: 'PAC Matriz 7',
      sessionsCount: 38,
      milestonesFound: { primerParcial: true, segundoParcial: true, examenFinal: true }
    },
    pillar3PlanClase: { isValid: true, title: 'Planes de Clase', totalSessions: 38, validPlansCount: 38 },
    issues: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScuPlanningPreflightCheckerComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ScuPlanningPreflightCheckerComponent);
    component = fixture.componentInstance;
    component.preflightResult = mockPreflight;
    component.visible = true;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit scuConfirmSubmit when confirmed and eligible', () => {
    spyOn(component.scuConfirmSubmit, 'emit');
    component.onConfirm();
    expect(component.scuConfirmSubmit.emit).toHaveBeenCalled();
  });

  it('should not emit submit if not eligible', () => {
    component.preflightResult = {
      ...mockPreflight,
      isEligible: false
    };
    spyOn(component.scuConfirmSubmit, 'emit');
    component.onConfirm();
    expect(component.scuConfirmSubmit.emit).not.toHaveBeenCalled();
  });
});
