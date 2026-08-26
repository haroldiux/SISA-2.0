import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SCU_API } from '@shared/constants/scu-api.constant';
import { ScuSedeModel } from '@shared/models/scu-academic.model';

/**
 * National Executive Dashboard HTTP service.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuExecutiveHttpService {

  constructor(private readonly _http: HttpClient) {}

  public getSedes(): Observable<{ data: ScuSedeModel[] }> {
    return this._http.get<{ data: ScuSedeModel[] }>(SCU_API.ACADEMIC.SEDES);
  }
}
