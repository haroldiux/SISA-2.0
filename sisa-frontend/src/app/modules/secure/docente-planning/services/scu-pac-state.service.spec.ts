import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ScuPacStateService } from './scu-pac-state.service';
import { ScuPlanningHttpService } from '../http/scu-planning.http';
import { ScuPacSaveCmd } from '../commands/scu-pac-save.cmd';
import { ScuPacSubmitCmd } from '../commands/scu-pac-submit.cmd';
import { ScuPacModel, ScuSesionMatriz7Model } from '@shared/models/scu-pac.model';
import { ScuPlanningStatusEnum } from '@shared/enums/scu-planning-status.enum';
import { ScuAutoSaveStateEnum } from '@shared/models/scu-validation.model';

describe('ScuPacStateService', () => {
  let service: ScuPacStateService;
  let mockHttp: jasmine.SpyObj<ScuPlanningHttpService>;
  let mockSaveCmd: jasmine.SpyObj<ScuPacSaveCmd>;
  let mockSubmitCmd: jasmine.SpyObj<ScuPacSubmitCmd>;

  const createTestPac = (): ScuPacModel => {
    const sesiones: ScuSesionMatriz7Model[] = [];
    for (let s = 1; s <= 38; s++) {
      const sem = Math.min(20, Math.ceil(s / 2));
      const hito = (s === 14) ? 'PRIMER_PARCIAL' : (s === 28) ? 'SEGUNDO_PARCIAL' : (s === 38) ? 'EXAMEN_FINAL' : 'REGULAR';
      const inst = (hito !== 'REGULAR') ? 'PRUEBA_ESCRITA' : 'RUBRICA';

      sesiones.push({
        semana: sem,
        nroSesion: s,
        fechaProgramada: `2026-03-${s < 10 ? '0' + s : s}`,
        tipoSesion: 'TEORICA',
        unidadTematica: `Unidad ${sem}`,
        contenidoEspecifico: `Contenido #${s}`,
        saberConceptual: 'Saberes conceptuales',
        saberProcedimental: 'Saberes procedimentales',
        saberActitudinal: 'Saberes actitudinales',
        criterioDesempeno: 'Criterio desempeño',
        evidenciaAprendizaje: 'Evidencia',
        instrumentoEvaluacion: inst,
        hitoEvaluativo: hito
      });
    }

    return {
      id: 10,
      asignacionId: 101,
      estado: ScuPlanningStatusEnum.BORRADOR,
      matriz7: sesiones
    };
  };

  beforeEach(() => {
    mockHttp = jasmine.createSpyObj('ScuPlanningHttpService', ['getPacByAssignment', 'savePac']);
    mockSaveCmd = jasmine.createSpyObj('ScuPacSaveCmd', ['execute']);
    mockSubmitCmd = jasmine.createSpyObj('ScuPacSubmitCmd', ['execute']);

    TestBed.configureTestingModule({
      providers: [
        ScuPacStateService,
        { provide: ScuPlanningHttpService, useValue: mockHttp },
        { provide: ScuPacSaveCmd, useValue: mockSaveCmd },
        { provide: ScuPacSubmitCmd, useValue: mockSubmitCmd }
      ]
    });

    service = TestBed.inject(ScuPacStateService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should initialize with default state and update on setPac', () => {
    const pac = createTestPac();
    service.setPac(pac);

    expect(service.currentPac).toBeDefined();
    expect(service.currentPac?.matriz7.length).toBe(38);
    expect(service.currentValidationResult?.isValid).toBeTrue();
  });

  it('should add a session and mark state as CAMBIOS_PENDIENTES', () => {
    const pac = createTestPac();
    service.setPac(pac);

    service.addSession();

    expect(service.currentPac?.matriz7.length).toBe(39);
    expect(service.currentPac?.matriz7[38].nroSesion).toBe(39);
  });

  it('should duplicate a session and re-index correctly', () => {
    const pac = createTestPac();
    service.setPac(pac);

    service.duplicateSession(5);

    expect(service.currentPac?.matriz7.length).toBe(39);
    expect(service.currentPac?.matriz7[5].nroSesion).toBe(6);
    expect(service.currentPac?.matriz7[5].contenidoEspecifico).toBe(pac.matriz7[4].contenidoEspecifico);
  });

  it('should remove a session and re-index sequence', () => {
    const pac = createTestPac();
    service.setPac(pac);

    service.removeSession(10);

    expect(service.currentPac?.matriz7.length).toBe(37);
    expect(service.currentPac?.matriz7[9].nroSesion).toBe(10);
  });

  it('should debounce auto-save triggers by 1500ms during rapid editing', fakeAsync(() => {
    const pac = createTestPac();
    service.setPac(pac);
    mockSaveCmd.execute.and.returnValue(of(pac));

    // Rapid edits
    service.updateSession({ ...pac.matriz7[0], contenidoEspecifico: 'Edit 1' });
    tick(500);
    service.updateSession({ ...pac.matriz7[0], contenidoEspecifico: 'Edit 2' });
    tick(500);
    service.updateSession({ ...pac.matriz7[0], contenidoEspecifico: 'Edit 3' });
    tick(500);

    // Only 500ms since last edit -> save should not have been called yet
    expect(mockSaveCmd.execute).not.toHaveBeenCalled();

    // Elapse remaining 1000ms
    tick(1000);

    expect(mockSaveCmd.execute).toHaveBeenCalledTimes(1);
  }));

  it('should execute manualSave immediately bypassing debounce', () => {
    const pac = createTestPac();
    service.setPac(pac);
    mockSaveCmd.execute.and.returnValue(of(pac));

    let result: ScuPacModel | null = null;
    service.manualSave().subscribe(res => {
      result = res;
    });

    expect(mockSaveCmd.execute).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
  });

  it('should block submitForReview when validation errors exist', (done) => {
    const pac = createTestPac();
    // Invert dates to force validation error
    pac.matriz7[5].fechaProgramada = '2026-01-01';
    service.setPac(pac);

    service.submitForReview().subscribe({
      next: () => {
        fail('Should have failed due to validation errors');
      },
      error: (err) => {
        expect(err.message).toContain('errores bloqueantes');
        expect(mockSubmitCmd.execute).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('should allow submitForReview when valid and update state to GUARDADO', (done) => {
    const pac = createTestPac();
    service.setPac(pac);
    const submittedPac = { ...pac, estado: ScuPlanningStatusEnum.ENVIADO_REVISION };
    mockSubmitCmd.execute.and.returnValue(of(submittedPac));

    service.submitForReview().subscribe({
      next: (res) => {
        expect(res.estado).toBe(ScuPlanningStatusEnum.ENVIADO_REVISION);
        expect(mockSubmitCmd.execute).toHaveBeenCalledTimes(1);
        done();
      },
      error: () => {
        fail('Should not fail');
      }
    });
  });

  it('should transition to ERROR state when manualSave fails', (done) => {
    const pac = createTestPac();
    service.setPac(pac);
    mockSaveCmd.execute.and.returnValue(throwError(() => new Error('Server 500')));

    service.manualSave().subscribe({
      next: () => fail('Should fail'),
      error: () => {
        service.autoSaveState$.subscribe(st => {
          if (st === ScuAutoSaveStateEnum.ERROR) {
            expect(st).toBe(ScuAutoSaveStateEnum.ERROR);
            done();
          }
        });
      }
    });
  });
});
