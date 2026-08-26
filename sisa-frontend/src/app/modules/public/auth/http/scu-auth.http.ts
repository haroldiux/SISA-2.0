import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SCU_API } from '@shared/constants/scu-api.constant';
import { ScuAuthResponseModel } from '@shared/models/scu-user.model';

/**
 * Authentication HTTP client service.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuAuthHttpService {

  constructor(private readonly _http: HttpClient) {}

  public login(credentials: { username: string; password: string }): Observable<{ data: ScuAuthResponseModel }> {
    return this._http.post<{ data: ScuAuthResponseModel }>(SCU_API.AUTH.LOGIN, credentials);
  }

  public refreshToken(token: string): Observable<{ data: ScuAuthResponseModel }> {
    return this._http.post<{ data: ScuAuthResponseModel }>(SCU_API.AUTH.REFRESH, { refreshToken: token });
  }
}
