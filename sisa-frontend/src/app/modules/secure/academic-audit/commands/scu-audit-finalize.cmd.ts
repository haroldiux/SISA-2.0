import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ScuAuditHttpService } from '../http/scu-audit.http';
import { ScuAuditoriaInSituModel } from '@shared/models/scu-audit.model';

/**
 * Command for finalizing in situ audit evaluations with digital signature hash.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuAuditFinalizeCmd {

  constructor(private readonly _auditHttp: ScuAuditHttpService) {}

  public execute(auditData: Partial<ScuAuditoriaInSituModel>): Observable<ScuAuditoriaInSituModel> {
    return this._auditHttp.finalizeAudit(auditData).pipe(
      map(res => res.data)
    );
  }
}
