import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ScuDirectorFeedbackViewerComponent } from './scu-director-feedback-viewer.component';
import { ScuPlanningStatusEnum } from '@shared/enums/scu-planning-status.enum';

describe('ScuDirectorFeedbackViewerComponent', () => {
  let component: ScuDirectorFeedbackViewerComponent;
  let fixture: ComponentFixture<ScuDirectorFeedbackViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScuDirectorFeedbackViewerComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ScuDirectorFeedbackViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should render alert when status is OBSERVADO', () => {
    component.status = ScuPlanningStatusEnum.OBSERVADO;
    component.reviewerName = 'Ing. Carlos Villarroel';
    component.observationNotes = 'Ajustar horas en Unidad 2';

    expect(component.isObservado).toBeTrue();
    expect(component.shouldDisplay).toBeTrue();
  });

  it('should render alert when status is ENVIADO_REVISION', () => {
    component.status = ScuPlanningStatusEnum.ENVIADO_REVISION;

    expect(component.isEnviado).toBeTrue();
    expect(component.shouldDisplay).toBeTrue();
  });

  it('should not display banner when status is BORRADOR', () => {
    component.status = ScuPlanningStatusEnum.BORRADOR;

    expect(component.shouldDisplay).toBeFalse();
  });
});
