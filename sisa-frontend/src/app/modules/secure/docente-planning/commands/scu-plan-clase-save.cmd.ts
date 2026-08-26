import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { ScuPlanningHttpService } from '../http/scu-planning.http';
import { ScuPlanClaseModel } from '@shared/models/scu-plan-clase.model';
import { ScuDurationValidator } from '../utils/scu-duration-validator';

/**
 * Command for validating 180-minute balance invariant and persisting Plan de Clases microdidactics.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuPlanClaseSaveCmd {

  constructor(private readonly _planningHttp: ScuPlanningHttpService) {}

  public execute(plan: ScuPlanClaseModel): Observable<ScuPlanClaseModel> {
    if (!plan) {
      return throwError(() => new Error('Plan de clase no definido.'));
    }

    const ini = plan.momentos?.find(m => m.tipoMomento === 'INICIO')?.duracionMin || 0;
    const des = plan.momentos?.find(m => m.tipoMomento === 'DESARROLLO')?.duracionMin || 0;
    const cie = plan.momentos?.find(m => m.tipoMomento === 'CIERRE')?.duracionMin || 0;
    const target = plan.duracionTotalMin || 180;

    const validation = ScuDurationValidator.validate(ini, des, cie, target);
    if (!validation.isValid) {
      return throwError(() => new Error(`Desbalance de duración en Plan de Clase: ${validation.message}`));
    }

    return this._planningHttp.savePlanClase(plan).pipe(
      map(res => res.data)
    );
  }
}
