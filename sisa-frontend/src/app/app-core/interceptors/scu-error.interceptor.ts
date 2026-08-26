import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ScuAuthService } from '../services/scu-auth.service';

/**
 * Global HTTP Error Interceptor handling 401 Unauthorized, 403 Forbidden, and 422 Unprocessable Entity.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable()
export class ScuErrorInterceptor implements HttpInterceptor {

  constructor(
    private readonly _authService: ScuAuthService,
    private readonly _router: Router
  ) {}

  public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this._authService.logout();
          this._router.navigate(['/auth/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
