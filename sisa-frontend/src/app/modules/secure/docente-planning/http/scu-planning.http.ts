import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SCU_API } from '@shared/constants/scu-api.constant';
import { ScuPacModel } from '@shared/models/scu-pac.model';
import { ScuProgramaAnaliticoModel } from '@shared/models/scu-programa-analitico.model';
import { ScuPlanClaseModel } from '@shared/models/scu-plan-clase.model';

/**
 * Academic planning and Office ingestion/export HTTP client service.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuPlanningHttpService {

  constructor(private readonly _http: HttpClient) {}

  public getPacByAssignment(assignmentId: number): Observable<{ data: ScuPacModel }> {
    return this._http.get<{ data: ScuPacModel }>(`${SCU_API.PLANNING.PAC_BY_ASSIGNMENT}/${assignmentId}`);
  }

  public getPacById(pacId: number): Observable<{ data: ScuPacModel }> {
    return this._http.get<{ data: ScuPacModel }>(`${SCU_API.PLANNING.PAC}/${pacId}`);
  }

  public savePac(pac: ScuPacModel): Observable<{ data: ScuPacModel }> {
    return this._http.post<{ data: ScuPacModel }>(SCU_API.PLANNING.PAC, pac);
  }

  public submitPac(pacId: number): Observable<{ data: ScuPacModel }> {
    return this._http.post<{ data: ScuPacModel }>(`${SCU_API.PLANNING.PAC_SUBMIT}/${pacId}/submit`, {});
  }

  public submitPlanning(asignacionId: number): Observable<{ data: ScuPacModel }> {
    return this._http.post<{ data: ScuPacModel }>(SCU_API.PLANNING.SUBMIT, { asignacionId });
  }

  public getProgramaAnalitico(assignmentId: number): Observable<{ data: ScuProgramaAnaliticoModel }> {
    return this._http.get<{ data: ScuProgramaAnaliticoModel }>(`${SCU_API.PLANNING.PROGRAMA_BY_ASSIGNMENT}/${assignmentId}`);
  }

  public saveProgramaAnalitico(programa: ScuProgramaAnaliticoModel): Observable<{ data: ScuProgramaAnaliticoModel }> {
    return this._http.post<{ data: ScuProgramaAnaliticoModel }>(SCU_API.PLANNING.PROGRAMA, programa);
  }

  public getPlanClaseBySession(sessionId: number): Observable<{ data: ScuPlanClaseModel }> {
    return this._http.get<{ data: ScuPlanClaseModel }>(`${SCU_API.PLANNING.PLAN_CLASE_BY_SESSION}/${sessionId}`);
  }

  public savePlanClase(plan: ScuPlanClaseModel): Observable<{ data: ScuPlanClaseModel }> {
    return this._http.post<{ data: ScuPlanClaseModel }>(SCU_API.PLANNING.PLAN_CLASE, plan);
  }

  public importPacFile(file: File, asignacionId: number): Observable<{ data: ScuPacModel }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('asignacionId', asignacionId.toString());
    return this._http.post<{ data: ScuPacModel }>(SCU_API.OFFICE.IMPORT_PAC, formData);
  }

  public exportPacFile(pacId: number): Observable<Blob> {
    return this._http.get(`${SCU_API.OFFICE.EXPORT_PAC}/${pacId}`, {
      responseType: 'blob'
    });
  }

  public exportPacXlsx(pacId: number): Observable<Blob> {
    return this.exportPacFile(pacId);
  }

  public importPlanClaseFile(file: File, sesionId?: number): Observable<{ data: ScuPlanClaseModel[] }> {
    const formData = new FormData();
    formData.append('file', file);
    if (sesionId !== undefined) {
      formData.append('sesionId', sesionId.toString());
    }
    return this._http.post<{ data: ScuPlanClaseModel[] }>(SCU_API.OFFICE.IMPORT_PLAN, formData);
  }

  public exportPlanFile(sesionId: number): Observable<Blob> {
    return this._http.get(`${SCU_API.OFFICE.EXPORT_PLAN}/${sesionId}`, {
      responseType: 'blob'
    });
  }

  public exportPlanClaseXlsx(sesionId: number): Observable<Blob> {
    return this.exportPlanFile(sesionId);
  }

  public importProgramaDocxFile(file: File, asignacionId: number): Observable<{ data: ScuProgramaAnaliticoModel }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('asignacionId', asignacionId.toString());
    return this._http.post<{ data: ScuProgramaAnaliticoModel }>(SCU_API.OFFICE.IMPORT_PROGRAMA, formData);
  }

  public exportProgramaFile(asignacionId: number): Observable<Blob> {
    return this._http.get(`${SCU_API.OFFICE.EXPORT_PROGRAMA}/${asignacionId}`, {
      responseType: 'blob'
    });
  }

  public exportProgramaDocx(asignacionId: number): Observable<Blob> {
    return this.exportProgramaFile(asignacionId);
  }

  public triggerBlobDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
