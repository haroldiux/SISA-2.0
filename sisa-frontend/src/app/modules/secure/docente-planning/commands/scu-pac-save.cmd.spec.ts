import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ScuPacSaveCmd } from './scu-pac-save.cmd';
import { ScuPlanningHttpService } from '../http/scu-planning.http';
import { ScuPlanningStatusEnum } from '@shared/enums/scu-planning-status.enum';
import { ScuPacModel } from '@shared/models/scu-pac.model';

describe('ScuPacSaveCmd', () => {
  let cmd: ScuPacSaveCmd;
  let mockHttp: jasmine.SpyObj<ScuPlanningHttpService>;

  beforeEach(() => {
    mockHttp = jasmine.createSpyObj('ScuPlanningHttpService', ['savePac']);

    TestBed.configureTestingModule({
      providers: [
        ScuPacSaveCmd,
        { provide: ScuPlanningHttpService, useValue: mockHttp }
      ]
    });

    cmd = TestBed.inject(ScuPacSaveCmd);
  });

  it('should call savePac on http service and extract data payload', (done) => {
    const inputPac: ScuPacModel = {
      asignacionId: 1,
      estado: ScuPlanningStatusEnum.BORRADOR,
      matriz7: []
    };

    mockHttp.savePac.and.returnValue(of({ data: { ...inputPac, id: 10 } }));

    cmd.execute(inputPac).subscribe(saved => {
      expect(saved.id).toBe(10);
      expect(saved.estado).toBe(ScuPlanningStatusEnum.BORRADOR);
      expect(mockHttp.savePac).toHaveBeenCalledWith(inputPac);
      done();
    });
  });
});
