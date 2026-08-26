import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ScuRoleEnum } from '@shared/enums/scu-role.enum';
import { ScuAuthResponseModel, ScuUserModel } from '@shared/models/scu-user.model';

/**
 * Authentication and Persona session manager service.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuAuthService {

  public readonly currentUser$: Observable<ScuUserModel | null>;

  private readonly _currentUserSubject: BehaviorSubject<ScuUserModel | null>;
  private readonly _TOKEN_KEY = 'scu_access_token';
  private readonly _REFRESH_KEY = 'scu_refresh_token';
  private readonly _USER_KEY = 'scu_user_info';

  constructor() {
    const savedUser = localStorage.getItem(this._USER_KEY);
    const initialUser: ScuUserModel | null = savedUser ? JSON.parse(savedUser) : this._getDemoDefaultUser();
    this._currentUserSubject = new BehaviorSubject<ScuUserModel | null>(initialUser);
    this.currentUser$ = this._currentUserSubject.asObservable();
  }

  public get currentUserValue(): ScuUserModel | null {
    return this._currentUserSubject.value;
  }

  public get currentRole(): ScuRoleEnum | null {
    return this._currentUserSubject.value ? this._currentUserSubject.value.role : null;
  }

  public getAccessToken(): string | null {
    return localStorage.getItem(this._TOKEN_KEY) || 'demo_token';
  }

  public setSession(authData: ScuAuthResponseModel): void {
    localStorage.setItem(this._TOKEN_KEY, authData.accessToken);
    localStorage.setItem(this._REFRESH_KEY, authData.refreshToken);
    localStorage.setItem(this._USER_KEY, JSON.stringify(authData.user));
    this._currentUserSubject.next(authData.user);
  }

  public switchRolePersona(role: ScuRoleEnum): void {
    const user = this._getPersonaForRole(role);
    localStorage.setItem(this._USER_KEY, JSON.stringify(user));
    this._currentUserSubject.next(user);
  }

  public logout(): void {
    localStorage.removeItem(this._TOKEN_KEY);
    localStorage.removeItem(this._REFRESH_KEY);
    localStorage.removeItem(this._USER_KEY);
    this._currentUserSubject.next(null);
  }

  public isAuthenticated(): boolean {
    return this._currentUserSubject.value !== null;
  }

  public hasRole(role: ScuRoleEnum): boolean {
    return this._currentUserSubject.value?.role === role;
  }

  private _getDemoDefaultUser(): ScuUserModel {
    return this._getPersonaForRole(ScuRoleEnum.ROLE_DOCENTE);
  }

  private _getPersonaForRole(role: ScuRoleEnum): ScuUserModel {
    switch (role) {
      case ScuRoleEnum.ROLE_DOCENTE:
        return {
          id: 1,
          username: 'docente.cbb',
          email: 'docente.cbb@unitepc.edu.bo',
          role: ScuRoleEnum.ROLE_DOCENTE,
          sedeId: 1,
          sedeNombre: 'Sede Central Cochabamba',
          nombres: 'Carlos',
          apellidos: 'Montaño Pérez',
          nombreCompleto: 'Ing. Carlos Montaño Pérez'
        };
      case ScuRoleEnum.ROLE_DIR_CARRERA:
        return {
          id: 2,
          username: 'dir.carrera.sis',
          email: 'dir.sistemas@unitepc.edu.bo',
          role: ScuRoleEnum.ROLE_DIR_CARRERA,
          sedeId: 1,
          sedeNombre: 'Sede Central Cochabamba',
          nombres: 'Mariana',
          apellidos: 'Rios Vargas',
          nombreCompleto: 'Lic. Mariana Rios Vargas'
        };
      case ScuRoleEnum.ROLE_DIR_ACADEMICA:
        return {
          id: 3,
          username: 'dir.academica.cbb',
          email: 'dir.academica.cbb@unitepc.edu.bo',
          role: ScuRoleEnum.ROLE_DIR_ACADEMICA,
          sedeId: 1,
          sedeNombre: 'Sede Central Cochabamba',
          nombres: 'Gonzalo',
          apellidos: 'Gutiérrez Morales',
          nombreCompleto: 'Dr. Gonzalo Gutiérrez Morales'
        };
      case ScuRoleEnum.ROLE_VICERRECTOR_SEDE:
        return {
          id: 4,
          username: 'vicerrector.cbb',
          email: 'vicerrector.cbb@unitepc.edu.bo',
          role: ScuRoleEnum.ROLE_VICERRECTOR_SEDE,
          sedeId: 1,
          sedeNombre: 'Sede Central Cochabamba',
          nombres: 'Rodrigo',
          apellidos: 'Vallejos Salinas',
          nombreCompleto: 'Mgr. Rodrigo Vallejos Salinas'
        };
      case ScuRoleEnum.ROLE_VICERRECTOR_NACIONAL:
        return {
          id: 5,
          username: 'vicerrector.nacional',
          email: 'vicerrector.nacional@unitepc.edu.bo',
          role: ScuRoleEnum.ROLE_VICERRECTOR_NACIONAL,
          sedeId: null,
          sedeNombre: 'Vicerrectorado Nacional',
          nombres: 'Hernán',
          apellidos: 'García Romero',
          nombreCompleto: 'Dr. Hernán García Romero'
        };
      default:
        return this._getPersonaForRole(ScuRoleEnum.ROLE_DOCENTE);
    }
  }
}
