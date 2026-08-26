import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ScuAuthService } from '../services/scu-auth.service';
import { ScuRoleEnum } from '@shared/enums/scu-role.enum';

/**
 * Route protection guard checking matching RBAC role permissions.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuRoleGuard implements CanActivate {

  constructor(
    private readonly _authService: ScuAuthService,
    private readonly _router: Router
  ) {}

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoles: ScuRoleEnum[] = route.data['roles'] || [];
    const currentRole = this._authService.currentRole;

    if (!currentRole || (expectedRoles.length > 0 && !expectedRoles.includes(currentRole))) {
      // If role not matching, redirect to default accessible route
      this._redirectByRole(currentRole);
      return false;
    }

    return true;
  }

  private _redirectByRole(role: ScuRoleEnum | null): void {
    switch (role) {
      case ScuRoleEnum.ROLE_DOCENTE:
        this._router.navigate(['/secure/docente-planning']);
        break;
      case ScuRoleEnum.ROLE_DIR_CARRERA:
        this._router.navigate(['/secure/career-oversight']);
        break;
      case ScuRoleEnum.ROLE_DIR_ACADEMICA:
        this._router.navigate(['/secure/academic-audit']);
        break;
      case ScuRoleEnum.ROLE_VICERRECTOR_SEDE:
        this._router.navigate(['/secure/regional-analytics']);
        break;
      case ScuRoleEnum.ROLE_VICERRECTOR_NACIONAL:
        this._router.navigate(['/secure/executive-dashboard']);
        break;
      default:
        this._router.navigate(['/auth/login']);
        break;
    }
  }
}
