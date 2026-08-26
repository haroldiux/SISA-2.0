import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { ScuPlanClaseStateService } from './scu-plan-clase-state.service';
import { ScuPlanningHttpService } from '../http/scu-planning.http';
import { ScuSesionMatriz7Model } from '@shared/models/scu-pac.model';
import { ScuPlanClaseModel } from '@shared/models/scu-plan-clase.model';
import { ScuPlanningStatusEnum } from '@shared/enums/scu-planning-status.enum';

describe('ScuPlanClaseStateService', () => {
  let service: ScuPlanClaseStateService;
  let httpSpy: jasmine.SpyObj<ScuPlanningHttpService>;

  const mockSession1: ScuSesionMatriz7Model = {
    nroSesion: 1,
    semana: 1,
    fechaProgramada: '2026-03-02',
    tipoSesion: 'TEORICA',
    unidadTematica: 'Unidad 1',
    contenidoEspecifico: 'Fundamentos',
    saberConceptual: 'Conceptos',
    saberProcedimental: 'Procedimientos',
    saberActitudinal: 'Actitudes',
    criterioDesempeno: 'Criterio',
    evidenciaAprendizaje: 'Evidencia',
    instrumentoEvaluacion: 'RUBRICA',
    hitoEvaluativo: 'REGULAR'
  };

  const mockSession2: ScuSesionMatriz7Model = {
    ...mockSession1,
    nroSesion: 2,
    contenidoEspecifico: 'Patrones de Diseño'
  };

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('ScuPlanningHttpService', ['savePlanClase', 'getPlanClaseBySession']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ScuPlanClaseStateService,
        { provide: ScuPlanningHttpService, useValue: httpSpy }
      ]
    });

    service = TestBed.inject(ScuPlanClaseStateService);
  });

  it('should be created and have initial state', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize sessions and select first session automatically', () => {
    service.initializeSessions([mockSession1, mockSession2]);

    expect(service.currentPlan).toBeTruthy();
    expect(service.currentPlan?.nroSesion).toBe(1);
    expect(service.getAllCachedPlans().size).toBe(2);
  });

  it('should switch active session without losing cached data', () => {
    service.initializeSessions([mockSession1, mockSession2]);

    // Modify Session 1
    service.updateMomentDuration('INICIO', 30);
    service.updateMomentDuration('DESARROLLO', 95);
    service.updateMomentDuration('CIERRE', 55);

    // Switch to Session 2
    service.selectSession(mockSession2);
    expect(service.currentPlan?.nroSesion).toBe(2);

    // Switch back to Session 1
    service.selectSession(mockSession1);
    expect(service.currentPlan?.nroSesion).toBe(1);
    const inicio = service.currentPlan?.momentos.find(m => m.tipoMomento === 'INICIO');
    expect(inicio?.duracionMin).toBe(30);
  });

  it('should recalculate duration validation reactively on duration change', (done) => {
    service.initializeSessions([mockSession1]);

    service.durationValidation$.subscribe(val => {
      if (val.sum === 200) {
        expect(val.isValid).toBeFalse();
        expect(val.status).toBe('EXCESO');
        expect(val.difference).toBe(20);
        done();
      }
    });

    // Make imbalanced (30 + 115 + 55 = 200)
    service.updateMomentDuration('INICIO', 30);
    service.updateMomentDuration('DESARROLLO', 115);
  });

  it('should apply standard template (25m / 100m / 55m)', () => {
    service.initializeSessions([mockSession1]);
    service.applyStandardTemplate();

    const plan = service.currentPlan;
    expect(plan?.duracionTotalMin).toBe(180);
    expect(plan?.momentos.find(m => m.tipoMomento === 'INICIO')?.duracionMin).toBe(25);
    expect(plan?.momentos.find(m => m.tipoMomento === 'DESARROLLO')?.duracionMin).toBe(100);
    expect(plan?.momentos.find(m => m.tipoMomento === 'CIERRE')?.duracionMin).toBe(55);
    expect(service.currentValidation.isValid).toBeTrue();
  });

  it('should clone moments to another session index', () => {
    service.initializeSessions([mockSession1, mockSession2]);
    service.selectSession(mockSession1);
    service.applyStandardTemplate();

    service.cloneSession(1, 2, true);

    const targetPlan = service.getPlanForSession(2);
    expect(targetPlan).toBeTruthy();
    expect(targetPlan?.momentos.find(m => m.tipoMomento === 'INICIO')?.duracionMin).toBe(25);
    expect(targetPlan?.momentos.find(m => m.tipoMomento === 'DESARROLLO')?.duracionMin).toBe(100);
  });

  it('should manually persist plan via HTTP when valid', (done) => {
    service.initializeSessions([mockSession1]);
    service.applyStandardTemplate();

    const expectedSaved: ScuPlanClaseModel = {
      ...service.currentPlan!,
      id: 99
    };
    httpSpy.savePlanClase.and.returnValue(of({ data: expectedSaved }));

    service.manualSave().subscribe(saved => {
      expect(saved.id).toBe(99);
      expect(httpSpy.savePlanClase).toHaveBeenCalled();
      done();
    });
  });
});
