import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SCU_API } from '@shared/constants/scu-api.constant';
import { ScuAsignacionDocenteModel } from '@shared/models/scu-academic.model';
import { ScuPacModel, ScuPacBatchReviewRequest, ScuPacBatchReviewResponse } from '@shared/models/scu-pac.model';

/**
 * Career oversight HTTP service for Director de Carrera.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuCareerOversightHttpService {

  constructor(private readonly _http: HttpClient) {}

  public getCareerAssignments(careerId: number, gestionId: number): Observable<{ data: ScuAsignacionDocenteModel[] }> {
    return this._http.get<{ data: ScuAsignacionDocenteModel[] }>(
      `${SCU_API.ACADEMIC.ASSIGNMENTS}?carreraId=${careerId}&gestionId=${gestionId}`
    );
  }

  public getPacsByCareer(careerId: number | string, gestionId: number | string = 1): Observable<{ data: ScuPacModel[] }> {
    return this._http.get<{ data: ScuPacModel[] }>(
      `/api/v1/planificaciones/pac/by-carrera/${careerId}?gestionId=${gestionId}`
    );
  }

  public reviewPac(pacId: number, decision: { nuevoEstado: string; observaciones: string }): Observable<{ data: ScuPacModel }> {
    return this._http.post<{ data: ScuPacModel }>(`${SCU_API.PLANNING.PAC}/${pacId}/review`, decision);
  }

  public batchReviewPacs(batchCmd: ScuPacBatchReviewRequest): Observable<{ data: ScuPacBatchReviewResponse }> {
    return this._http.post<{ data: ScuPacBatchReviewResponse }>(
      `/api/v1/planificaciones/pac/batch-review`,
      batchCmd
    );
  }
}
