import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ScuAuthService } from '@core/services/scu-auth.service';
import { ScuRoleEnum } from '@shared/enums/scu-role.enum';
import { ScuUserModel } from '@shared/models/scu-user.model';

interface RoleOption {
  label: string;
  role: ScuRoleEnum;
  icon: string;
  route: string;
  badge: string;
}

/**
 * 5-tier dynamic role switcher component enabling instant persona switching.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-role-switcher',
  templateUrl: './scu-role-switcher.component.html',
  styleUrls: ['./scu-role-switcher.component.scss']
})
export class ScuRoleSwitcherComponent implements OnInit, OnDestroy {

  public currentUser: ScuUserModel | null = null;
  public selectedRole: ScuRoleEnum = ScuRoleEnum.ROLE_DOCENTE;
  public roleOptions: RoleOption[] = [];

  private readonly _destroy$ = new Subject<void>();

  constructor(
    private readonly _authService: ScuAuthService,
    private readonly _router: Router
  ) {}

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public onRoleChange(newRole: ScuRoleEnum): void {
    this._authService.switchRolePersona(newRole);
    const target = this.roleOptions.find(o => o.role === newRole);
    if (target) {
      this._router.navigate([target.route]);
    }
  }

  private _initialize(): void {
    this._roleOptionsSetup();
    this._authService.currentUser$
      .pipe(takeUntil(this._destroy$))
      .subscribe((user: ScuUserModel | null) => {
        this.currentUser = user;
        if (user) {
          this.selectedRole = user.role;
        }
      });
  }

  private _finalize(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _roleOptionsSetup(): void {
    this.roleOptions = [
      {
        label: '1. Docente (Planificación)',
        role: ScuRoleEnum.ROLE_DOCENTE,
        icon: 'pi pi-book',
        route: '/secure/docente-planning',
        badge: 'Frame 1'
      },
      {
        label: '2. Director de Carrera (Revisión)',
        role: ScuRoleEnum.ROLE_DIR_CARRERA,
        icon: 'pi pi-check-square',
        route: '/secure/career-oversight',
        badge: 'Frame 2'
      },
      {
        label: '3. Director Académico (Auditoría)',
        role: ScuRoleEnum.ROLE_DIR_ACADEMICA,
        icon: 'pi pi-eye',
        route: '/secure/academic-audit',
        badge: 'Frame 3'
      },
      {
        label: '4. Vicerrector de Sede (Regional)',
        role: ScuRoleEnum.ROLE_VICERRECTOR_SEDE,
        icon: 'pi pi-chart-bar',
        route: '/secure/regional-analytics',
        badge: 'Frame 4'
      },
      {
        label: '5. Vicerrector Nacional (Dashboard)',
        role: ScuRoleEnum.ROLE_VICERRECTOR_NACIONAL,
        icon: 'pi pi-globe',
        route: '/secure/executive-dashboard',
        badge: 'Frame 5'
      }
    ];
  }
}
