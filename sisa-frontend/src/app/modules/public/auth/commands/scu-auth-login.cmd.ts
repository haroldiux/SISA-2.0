import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ScuAuthHttpService } from '../http/scu-auth.http';
import { ScuAuthService } from '@core/services/scu-auth.service';
import { ScuAuthResponseModel } from '@shared/models/scu-user.model';

/**
 * Authentication login command orchestrating HTTP call and session store.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuAuthLoginCmd {

  constructor(
    private readonly _authHttp: ScuAuthHttpService,
    private readonly _authService: ScuAuthService
  ) {}

  public execute(credentials: { username: string; password: string }): Observable<ScuAuthResponseModel> {
    return this._authHttp.login(credentials).pipe(
      map(res => res.data),
      tap(authData => this._authService.setSession(authData))
    );
  }
}
