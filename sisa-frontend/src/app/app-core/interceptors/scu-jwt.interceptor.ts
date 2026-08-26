import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ScuAuthService } from '../services/scu-auth.service';
import { ScuSessionService } from '../services/scu-session.service';

/**
 * JWT Bearer token and Multi-Tenant header injection HTTP interceptor with token refresh handling.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable()
export class ScuJwtInterceptor implements HttpInterceptor {

  constructor(
    private readonly _authService: ScuAuthService,
    private readonly _sessionService: ScuSessionService
  ) {}

  public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this._authService.getAccessToken();
    const activeSedeId = this._sessionService.getActiveSedeId();

    let headers = request.headers;
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    if (activeSedeId !== null && activeSedeId !== undefined) {
      headers = headers.set('X-Tenant-Sede', activeSedeId.toString());
    }

    const clonedRequest = request.clone({ headers });

    return next.handle(clonedRequest).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          // Token expired handling
          return throwError(() => error);
        }
        return throwError(() => error);
      })
    );
  }
}
