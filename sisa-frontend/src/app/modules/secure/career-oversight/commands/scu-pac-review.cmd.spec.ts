import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ScuPacReviewCmd } from './scu-pac-review.cmd';
import { ScuCareerOversightHttpService } from '../http/scu-career-oversight.http';
import { ScuPlanningStatusEnum } from '@shared/enums/scu-planning-status.enum';
import { ScuPacModel, ScuPacBatchReviewRequest, ScuPacBatchReviewResponse } from '@shared/models/scu-pac.model';

describe('ScuPacReviewCmd', () => {
  let cmd: ScuPacReviewCmd;
  let mockHttp: jasmine.SpyObj<ScuCareerOversightHttpService>;

  beforeEach(() => {
    mockHttp = jasmine.createSpyObj('ScuCareerOversightHttpService', ['reviewPac', 'batchReviewPacs', 'getPacsByCareer']);

    TestBed.configureTestingModule({
      providers: [
        ScuPacReviewCmd,
        { provide: ScuCareerOversightHttpService, useValue: mockHttp }
      ]
    });

    cmd = TestBed.inject(ScuPacReviewCmd);
  });

  it('should call reviewPac on http service and return reviewed PAC', (done) => {
    const expectedPac: ScuPacModel = {
      id: 10,
      asignacionId: 1,
      estado: ScuPlanningStatusEnum.APROBADO,
      observacionesRevision: 'Aprobado sin observaciones',
      matriz7: []
    };

    mockHttp.reviewPac.and.returnValue(of({ data: expectedPac }));

    cmd.execute(10, { nuevoEstado: 'APROBADO', observaciones: 'Aprobado sin observaciones' }).subscribe(pac => {
      expect(pac.id).toBe(10);
      expect(pac.estado).toBe(ScuPlanningStatusEnum.APROBADO);
      expect(mockHttp.reviewPac).toHaveBeenCalledWith(10, {
        nuevoEstado: 'APROBADO',
        observaciones: 'Aprobado sin observaciones'
      });
      done();
    });
  });

  it('should reject observation when nuevoEstado is OBSERVADO and characters < 10', () => {
    expect(() => {
      cmd.execute(10, { nuevoEstado: 'OBSERVADO', observaciones: 'Corto' });
    }).toThrowError('Las observaciones pedagógicas deben contener al menos 10 caracteres.');

    expect(() => {
      cmd.execute(10, { nuevoEstado: 'OBSERVADO', observaciones: '         ' });
    }).toThrowError('Las observaciones pedagógicas deben contener al menos 10 caracteres.');
  });

  it('should accept observation when nuevoEstado is OBSERVADO and characters >= 10', (done) => {
    const expectedPac: ScuPacModel = {
      id: 10,
      asignacionId: 1,
      estado: ScuPlanningStatusEnum.OBSERVADO,
      observacionesRevision: 'Observación pedagógica detallada y fundamentada',
      matriz7: []
    };

    mockHttp.reviewPac.and.returnValue(of({ data: expectedPac }));

    cmd.execute(10, { nuevoEstado: 'OBSERVADO', observaciones: 'Observación pedagógica detallada y fundamentada' }).subscribe(pac => {
      expect(pac.id).toBe(10);
      expect(pac.estado).toBe(ScuPlanningStatusEnum.OBSERVADO);
      done();
    });
  });

  it('should dispatch executeBatch to http service and return batch response', (done) => {
    const batchRequest: ScuPacBatchReviewRequest = {
      carreraId: 'CARSIS',
      gestionId: 1,
      semestre: 3,
      pacIds: [101, 102],
      observaciones: 'Certificación en bloque - 3º Semestre'
    };

    const batchResponse: ScuPacBatchReviewResponse = {
      totalReviewed: 2,
      approvedIds: [101, 102],
      carreraId: 'CARSIS',
      semestre: 3,
      revisadoPor: 'Lic. Mariana Rios Vargas',
      revisadoEn: new Date().toISOString()
    };

    mockHttp.batchReviewPacs.and.returnValue(of({ data: batchResponse }));

    cmd.executeBatch(batchRequest).subscribe(res => {
      expect(res.totalReviewed).toBe(2);
      expect(res.approvedIds).toEqual([101, 102]);
      expect(mockHttp.batchReviewPacs).toHaveBeenCalledWith(batchRequest);
      done();
    });
  });
});
