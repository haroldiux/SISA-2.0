import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ScuPlanningHttpService } from '../http/scu-planning.http';
import { ScuPacModel } from '@shared/models/scu-pac.model';

/**
 * Command for persisting PAC Matriz 7 curriculum planning.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuPacSaveCmd {

  constructor(private readonly _planningHttp: ScuPlanningHttpService) {}

  public execute(pac: ScuPacModel): Observable<ScuPacModel> {
    return this._planningHttp.savePac(pac).pipe(
      map(res => res.data)
    );
  }
}
