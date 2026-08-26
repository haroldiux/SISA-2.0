import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ScuAuthLoginCmd } from '../../commands/scu-auth-login.cmd';
import { ScuAuthService } from '@core/services/scu-auth.service';
import { ScuRoleEnum } from '@shared/enums/scu-role.enum';

/**
 * Authentication login view component.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-login',
  templateUrl: './scu-login.component.html',
  styleUrls: ['./scu-login.component.scss']
})
export class ScuLoginComponent implements OnInit, OnDestroy {

  public loginForm!: FormGroup;
  public isLoading: boolean = false;
  public errorMessage: string = '';

  private readonly _destroy$ = new Subject<void>();

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _loginCmd: ScuAuthLoginCmd,
    private readonly _authService: ScuAuthService,
    private readonly _router: Router
  ) {}

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this._loginCmd.execute(this.loginForm.value)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (authData) => {
          this.isLoading = false;
          this._redirectUser(authData.user.role);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Error al iniciar sesión. Verifique sus credenciales.';
        }
      });
  }

  public onDirectDemoLogin(role: string): void {
    this._authService.switchRolePersona(role as ScuRoleEnum);
    this._redirectUser(role as ScuRoleEnum);
  }

  private _initialize(): void {
    this.loginForm = this._fb.group({
      username: ['docente.cbb', [Validators.required]],
      password: ['Unitepc2026!', [Validators.required]]
    });
  }

  private _finalize(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _redirectUser(role: ScuRoleEnum): void {
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
        this._router.navigate(['/secure/docente-planning']);
        break;
    }
  }
}
