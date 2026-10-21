import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ScuCareerOversightHttpService } from '../http/scu-career-oversight.http';
import { ScuPacModel, ScuPacBatchReviewRequest, ScuPacBatchReviewResponse } from '@shared/models/scu-pac.model';

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

  public execute(pacId: number, decision: { nuevoEstado: string; observaciones?: string }): Observable<ScuPacModel> {
    if (decision.nuevoEstado === 'OBSERVADO' && (!decision.observaciones || decision.observaciones.trim().length < 10)) {
      throw new Error('Las observaciones pedagógicas deben contener al menos 10 caracteres.');
    }

    return this._oversightHttp.reviewPac(pacId, {
      nuevoEstado: decision.nuevoEstado,
      observaciones: decision.observaciones || ''
    }).pipe(
      map(res => res.data)
    );
  }

  public executeBatch(request: ScuPacBatchReviewRequest): Observable<ScuPacBatchReviewResponse> {
    return this._oversightHttp.batchReviewPacs(request).pipe(
      map(res => res.data)
    );
  }
}
