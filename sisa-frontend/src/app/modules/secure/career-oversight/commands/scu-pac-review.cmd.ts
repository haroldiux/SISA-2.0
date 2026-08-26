import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ScuCareerOversightHttpService } from '../http/scu-career-oversight.http';
import { ScuPacModel } from '@shared/models/scu-pac.model';

/**
 * Command for registering Career Director review decisions on PAC submissions.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuPacReviewCmd {

  constructor(private readonly _oversightHttp: ScuCareerOversightHttpService) {}

  public execute(pacId: number, decision: { nuevoEstado: string; observaciones: string }): Observable<ScuPacModel> {
    return this._oversightHttp.reviewPac(pacId, decision).pipe(
      map(res => res.data)
    );
  }
}
