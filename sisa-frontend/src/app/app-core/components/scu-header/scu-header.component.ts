import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ScuAuthService } from '@core/services/scu-auth.service';
import { ScuThemeService } from '@core/services/scu-theme.service';
import { ScuUserModel } from '@shared/models/scu-user.model';

/**
 * Top navigation header component containing institutional identity and user profile.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-header',
  templateUrl: './scu-header.component.html',
  styleUrls: ['./scu-header.component.scss']
})
export class ScuHeaderComponent implements OnInit, OnDestroy {

  public currentUser: ScuUserModel | null = null;
  public isDarkMode: boolean = false;

  private readonly _destroy$ = new Subject<void>();

  constructor(
    private readonly _authService: ScuAuthService,
    private readonly _themeService: ScuThemeService
  ) {}

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public toggleTheme(): void {
    this._themeService.toggleTheme();
  }

  public onLogout(): void {
    this._authService.logout();
  }

  private _initialize(): void {
    this._authService.currentUser$
      .pipe(takeUntil(this._destroy$))
      .subscribe((user: ScuUserModel | null) => this.currentUser = user);

    this._themeService.isDarkMode$
      .pipe(takeUntil(this._destroy$))
      .subscribe((isDark: boolean) => this.isDarkMode = isDark);
  }

  private _finalize(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
