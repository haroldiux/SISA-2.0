import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ScuDocentePlanningComponent } from './scu-docente-planning.component';
import { ScuPlanningHttpService } from '../../http/scu-planning.http';
import { ScuSessionService } from '../../../../../app-core/services/scu-session.service';
import { ScuPacSaveCmd } from '../../commands/scu-pac-save.cmd';
import { ScuPacSubmitCmd } from '../../commands/scu-pac-submit.cmd';
import { ScuPacStateService } from '../../services/scu-pac-state.service';
import { ScuProgramaStateService } from '../../services/scu-programa-state.service';
import { ScuPlanClaseStateService } from '../../services/scu-plan-clase-state.service';
import { ScuPlanningSubmitCmd } from '../../commands/scu-planning-submit.cmd';
import { SharedModule } from '@shared/shared.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ScuDocentePlanningComponent', () => {
  let component: ScuDocentePlanningComponent;
  let fixture: ComponentFixture<ScuDocentePlanningComponent>;

  const mockPlanningHttp = {
    getPacByAssignment: jasmine.createSpy('getPacByAssignment').and.returnValue(of({
      data: {
        id: 1,
        asignacionId: 1,
        estado: 'BORRADOR',
        matriz7: []
      }
    })),
    savePac: jasmine.createSpy('savePac').and.returnValue(of({
      data: {
        id: 1,
        asignacionId: 1,
        estado: 'BORRADOR',
        matriz7: []
      }
    })),
    getProgramaAnalitico: jasmine.createSpy('getProgramaAnalitico').and.returnValue(of({
      data: {
        id: 1,
        asignacionId: 1,
        estado: 'BORRADOR',
        unidades: [],
        bibliografia: []
      }
    })),
    saveProgramaAnalitico: jasmine.createSpy('saveProgramaAnalitico').and.returnValue(of({
      data: {
        id: 1,
        asignacionId: 1,
        estado: 'BORRADOR',
        unidades: [],
        bibliografia: []
      }
    })),
    savePlanClase: jasmine.createSpy('savePlanClase').and.returnValue(of({
      data: {
        id: 1,
        sesionId: 1,
        estado: 'BORRADOR',
        duracionTotalMin: 180,
        momentos: []
      }
    })),
    submitPac: jasmine.createSpy('submitPac').and.returnValue(of({
      data: {
        id: 1,
        asignacionId: 1,
        estado: 'ENVIADO_REVISION',
        matriz7: []
      }
    })),
    exportPacXlsx: jasmine.createSpy('exportPacXlsx').and.returnValue(of(new Blob())),
    triggerBlobDownload: jasmine.createSpy('triggerBlobDownload')
  };

  const mockPacSaveCmd = {
    execute: jasmine.createSpy('execute').and.returnValue(of({ id: 1, estado: 'BORRADOR', matriz7: [] }))
  };

  const mockPacSubmitCmd = {
    execute: jasmine.createSpy('execute').and.returnValue(of({ id: 1, estado: 'ENVIADO_REVISION', matriz7: [] }))
  };

  const mockSubmitCmd = {
    execute: jasmine.createSpy('execute').and.returnValue(of({ id: 1, estado: 'ENVIADO_REVISION', matriz7: [] }))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScuDocentePlanningComponent],
      imports: [SharedModule, HttpClientTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ScuPlanningHttpService, useValue: mockPlanningHttp },
        { provide: ScuPacSaveCmd, useValue: mockPacSaveCmd },
        { provide: ScuPacSubmitCmd, useValue: mockPacSubmitCmd },
        { provide: ScuPlanningSubmitCmd, useValue: mockSubmitCmd },
        ScuPacStateService,
        ScuProgramaStateService,
        ScuPlanClaseStateService,
        ScuSessionService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ScuDocentePlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the Docente Planning Component', () => {
    expect(component).toBeTruthy();
  });

  it('should switch to Microplan tab when a session is selected', () => {
    const mockSession = {
      semana: 1,
      nroSesion: 1,
      fechaProgramada: '2026-02-02',
      tipoSesion: 'TEORICA' as const,
      unidadTematica: 'U1',
      contenidoEspecifico: 'C1',
      saberConceptual: 'S1',
      saberProcedimental: 'P1',
      saberActitudinal: 'A1',
      criterioDesempeno: 'D1',
      evidenciaAprendizaje: 'E1',
      instrumentoEvaluacion: 'RUBRICA' as const,
      hitoEvaluativo: 'REGULAR' as const
    };
    component.onSessionSelect(mockSession);
    expect(component.selectedSessionForPlan).toEqual(mockSession);
    expect(component.activeTabIndex).toBe(2);
  });

  it('should toggle calendar and import modals', () => {
    expect(component.calendarModalVisible).toBeFalse();
    expect(component.excelModalVisible).toBeFalse();

    component.openCalendarModal();
    expect(component.calendarModalVisible).toBeTrue();

    component.openImportModal();
    expect(component.excelModalVisible).toBeTrue();
  });
});
