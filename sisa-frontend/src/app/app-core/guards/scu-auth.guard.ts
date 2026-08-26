import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ScuAuthService } from '../services/scu-auth.service';

/**
 * Route protection guard asserting user authentication.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuAuthGuard implements CanActivate {

  constructor(
    private readonly _authService: ScuAuthService,
    private readonly _router: Router
  ) {}

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this._authService.isAuthenticated()) {
      return true;
    }
    this._router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
