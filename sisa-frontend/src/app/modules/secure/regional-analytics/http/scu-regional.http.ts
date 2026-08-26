import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SCU_API } from '@shared/constants/scu-api.constant';
import { ScuReincidenciaModel } from '@shared/models/scu-audit.model';

/**
 * Regional Analytics and Disciplinary Recurrence HTTP client service.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuRegionalHttpService {

  constructor(private readonly _http: HttpClient) {}

  public getRecurrences(gestionId?: number, docenteId?: number): Observable<{ data: ScuReincidenciaModel[] }> {
    let url = SCU_API.AUDIT.RECURRENCE;
    const params: string[] = [];
    if (gestionId) params.push(`gestionId=${gestionId}`);
    if (docenteId) params.push(`docenteId=${docenteId}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    return this._http.get<{ data: ScuReincidenciaModel[] }>(url);
  }
}
