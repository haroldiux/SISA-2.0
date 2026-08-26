import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ScuAuthService } from '../../services/scu-auth.service';
import { ScuRoleEnum } from '@shared/enums/scu-role.enum';
import { ScuUserModel } from '@shared/models/scu-user.model';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  role: ScuRoleEnum;
  frameBadge: string;
}

/**
 * Main application layout shell providing responsive navigation and desktop framing (1440x1024).
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-layout-shell',
  templateUrl: './scu-layout-shell.component.html',
  styleUrls: ['./scu-layout-shell.component.scss']
})
export class ScuLayoutShellComponent implements OnInit, OnDestroy {

  public currentUser: ScuUserModel | null = null;
  public navItems: NavItem[] = [];

  private readonly _destroy$ = new Subject<void>();

  constructor(private readonly _authService: ScuAuthService) {}

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  private _initialize(): void {
    this._setupNavItems();
    this._authService.currentUser$
      .pipe(takeUntil(this._destroy$))
      .subscribe(user => this.currentUser = user);
  }

  private _finalize(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _setupNavItems(): void {
    this.navItems = [
      {
        label: 'Planificación Docente',
        icon: 'pi pi-book',
        route: '/secure/docente-planning',
        role: ScuRoleEnum.ROLE_DOCENTE,
        frameBadge: 'F1'
      },
      {
        label: 'Supervisión de Carrera',
        icon: 'pi pi-check-square',
        route: '/secure/career-oversight',
        role: ScuRoleEnum.ROLE_DIR_CARRERA,
        frameBadge: 'F2'
      },
      {
        label: 'Auditoría Académica',
        icon: 'pi pi-eye',
        route: '/secure/academic-audit',
        role: ScuRoleEnum.ROLE_DIR_ACADEMICA,
        frameBadge: 'F3'
      },
      {
        label: 'Analítica Regional',
        icon: 'pi pi-chart-bar',
        route: '/secure/regional-analytics',
        role: ScuRoleEnum.ROLE_VICERRECTOR_SEDE,
        frameBadge: 'F4'
      },
      {
        label: 'Dashboard Ejecutivo',
        icon: 'pi pi-globe',
        route: '/secure/executive-dashboard',
        role: ScuRoleEnum.ROLE_VICERRECTOR_NACIONAL,
        frameBadge: 'F5'
      }
    ];
  }
}
