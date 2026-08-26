import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SCU_API } from '@shared/constants/scu-api.constant';
import { ScuAuditoriaInSituModel } from '@shared/models/scu-audit.model';

/**
 * Academic Audit HTTP service for In Situ inspections and digital signatures.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuAuditHttpService {

  constructor(private readonly _http: HttpClient) {}

  public matchClass(params: { campusId: number; aula: string; dia: string; hora?: string }): Observable<{ data: any }> {
    let url = `${SCU_API.AUDIT.MATCH}?campusId=${params.campusId}&aula=${encodeURIComponent(params.aula)}&dia=${encodeURIComponent(params.dia)}`;
    if (params.hora) {
      url += `&hora=${encodeURIComponent(params.hora)}`;
    }
    return this._http.get<{ data: any }>(url);
  }

  public finalizeAudit(auditData: Partial<ScuAuditoriaInSituModel>): Observable<{ data: ScuAuditoriaInSituModel }> {
    return this._http.post<{ data: ScuAuditoriaInSituModel }>(SCU_API.AUDIT.FINALIZE, auditData);
  }

  public signAudit(auditId: number, signData: { conformidadDocente: string; observacionesDocente?: string }): Observable<{ data: ScuAuditoriaInSituModel }> {
    return this._http.post<{ data: ScuAuditoriaInSituModel }>(`${SCU_API.AUDIT.SIGN}/${auditId}/sign`, signData);
  }
}
