import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SCU_THEME } from '@shared/constants/scu-theme.constant';

/**
 * Theme manager service supporting Light and Dark modes.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuThemeService {

  public readonly isDarkMode$: Observable<boolean>;

  private readonly _isDarkModeSubject: BehaviorSubject<boolean>;

  constructor() {
    const savedTheme = localStorage.getItem(SCU_THEME.STORAGE_KEY);
    const isDark = savedTheme === SCU_THEME.DARK;
    this._isDarkModeSubject = new BehaviorSubject<boolean>(isDark);
    this.isDarkMode$ = this._isDarkModeSubject.asObservable();
    this._applyTheme(isDark);
  }

  public toggleTheme(): void {
    const nextState = !this._isDarkModeSubject.value;
    this._isDarkModeSubject.next(nextState);
    localStorage.setItem(SCU_THEME.STORAGE_KEY, nextState ? SCU_THEME.DARK : SCU_THEME.LIGHT);
    this._applyTheme(nextState);
  }

  private _applyTheme(isDark: boolean): void {
    if (isDark) {
      document.body.classList.remove(SCU_THEME.LIGHT);
      document.body.classList.add(SCU_THEME.DARK);
    } else {
      document.body.classList.remove(SCU_THEME.DARK);
      document.body.classList.add(SCU_THEME.LIGHT);
    }
  }
}
