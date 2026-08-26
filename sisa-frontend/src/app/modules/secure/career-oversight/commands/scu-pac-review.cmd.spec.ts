import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ScuPacReviewCmd } from './scu-pac-review.cmd';
import { ScuCareerOversightHttpService } from '../http/scu-career-oversight.http';
import { ScuPlanningStatusEnum } from '@shared/enums/scu-planning-status.enum';
import { ScuPacModel } from '@shared/models/scu-pac.model';

describe('ScuPacReviewCmd', () => {
  let cmd: ScuPacReviewCmd;
  let mockHttp: jasmine.SpyObj<ScuCareerOversightHttpService>;

  beforeEach(() => {
    mockHttp = jasmine.createSpyObj('ScuCareerOversightHttpService', ['reviewPac']);

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
});
