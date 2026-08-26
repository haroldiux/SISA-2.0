import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ScuAuditHttpService } from '../http/scu-audit.http';

/**
 * Command for matching active classroom assignments during in situ spot audits.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuAuditInitiateCmd {

  constructor(private readonly _auditHttp: ScuAuditHttpService) {}

  public execute(params: { campusId: number; aula: string; dia: string; hora?: string }): Observable<any> {
    return this._auditHttp.matchClass(params).pipe(
      map(res => res.data)
    );
  }
}
