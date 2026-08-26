import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ScuPlanningHttpService } from '../http/scu-planning.http';
import { ScuPacModel } from '@shared/models/scu-pac.model';
import { ScuPlanningStatusEnum } from '@shared/enums/scu-planning-status.enum';

/**
 * Command for formal submission of PAC to Career Directorate for review.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuPacSubmitCmd {

  constructor(private readonly _planningHttp: ScuPlanningHttpService) {}

  public execute(pac: ScuPacModel): Observable<ScuPacModel> {
    const payload: ScuPacModel = {
      ...pac,
      estado: ScuPlanningStatusEnum.ENVIADO_REVISION
    };
    return this._planningHttp.savePac(payload).pipe(
      map(res => res.data)
    );
  }
}
