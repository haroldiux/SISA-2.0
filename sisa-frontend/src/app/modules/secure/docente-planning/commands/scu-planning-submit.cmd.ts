import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { ScuPlanningHttpService } from '../http/scu-planning.http';
import { ScuPacModel } from '@shared/models/scu-pac.model';
import { ScuProgramaAnaliticoModel } from '@shared/models/scu-programa-analitico.model';
import { ScuPlanClaseModel } from '@shared/models/scu-plan-clase.model';
import { ScuPlanningPreflightValidator } from '../utils/scu-planning-preflight-validator';

/**
 * Command for formal submission of the complete Academic Planning Trilogy to Career Directorate.
 *
 * Runs 3-pillar pre-flight audit before triggering backend status transition.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuPlanningSubmitCmd {

  constructor(private readonly _planningHttp: ScuPlanningHttpService) {}

  public execute(
    pac: ScuPacModel,
    programa?: ScuProgramaAnaliticoModel | null,
    planesMap?: Map<number, ScuPlanClaseModel>
  ): Observable<ScuPacModel> {
    if (!pac) {
      return throwError(() => new Error('PAC no definido para envío.'));
    }

    if (programa !== undefined && planesMap !== undefined) {
      const preflight = ScuPlanningPreflightValidator.audit(programa, pac, planesMap);
      if (!preflight.isEligible) {
        const errorMsg = preflight.issues
          .filter(i => i.severity === 'ERROR')
          .map(i => i.message)
          .join('\n');
        return throwError(() => new Error(`Existen inconsistencias bloqueantes antes del envío:\n${errorMsg}`));
      }
    }

    if (pac.id) {
      return this._planningHttp.submitPac(pac.id).pipe(
        map(res => res.data)
      );
    } else {
      return this._planningHttp.submitPlanning(pac.asignacionId).pipe(
        map(res => res.data)
      );
    }
  }
}
