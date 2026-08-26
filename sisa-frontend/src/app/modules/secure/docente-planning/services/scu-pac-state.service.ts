import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ScuPacModel, ScuSesionMatriz7Model } from '@shared/models/scu-pac.model';
import {
  ScuAutoSaveStateEnum,
  ScuValidationResultModel
} from '@shared/models/scu-validation.model';
import { ScuPacValidator } from '../utils/scu-pac-validator';
import { ScuPlanningHttpService } from '../http/scu-planning.http';
import { ScuPacSaveCmd } from '../commands/scu-pac-save.cmd';
import { ScuPacSubmitCmd } from '../commands/scu-pac-submit.cmd';

export interface ScuPacStateModel {
  pac: ScuPacModel | null;
  autoSaveState: ScuAutoSaveStateEnum;
  lastSavedAt: Date | null;
  lastError: string | null;
  validationResult: ScuValidationResultModel | null;
  isSavingOrSubmitting: boolean;
  history: ScuPacModel[];
}

/**
 * Reactive state management service for PAC Matriz 7 curriculum planning.
 *
 * Manages immutable state transitions, 1500ms debounced persistence, validation triggering,
 * and concurrency locks for manual saves and formal submissions.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuPacStateService implements OnDestroy {

  private readonly _state$ = new BehaviorSubject<ScuPacStateModel>({
    pac: null,
    autoSaveState: ScuAutoSaveStateEnum.SIN_CAMBIOS,
    lastSavedAt: null,
    lastError: null,
    validationResult: null,
    isSavingOrSubmitting: false,
    history: []
  });

  private readonly _autoSaveSubject$ = new Subject<ScuPacModel>();
  private readonly _destroy$ = new Subject<void>();

  public readonly state$: Observable<ScuPacStateModel> = this._state$.asObservable();
  public readonly pac$: Observable<ScuPacModel | null> = this._state$.pipe(map(s => s.pac));
  public readonly autoSaveState$: Observable<ScuAutoSaveStateEnum> = this._state$.pipe(map(s => s.autoSaveState));
  public readonly validationResult$: Observable<ScuValidationResultModel | null> = this._state$.pipe(map(s => s.validationResult));
  public readonly isSavingOrSubmitting$: Observable<boolean> = this._state$.pipe(map(s => s.isSavingOrSubmitting));

  constructor(
    private readonly _planningHttp: ScuPlanningHttpService,
    private readonly _pacSaveCmd: ScuPacSaveCmd,
    private readonly _pacSubmitCmd: ScuPacSubmitCmd
  ) {
    this._setupAutoSavePipeline();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public get currentPac(): ScuPacModel | null {
    return this._state$.value.pac;
  }

  public get currentValidationResult(): ScuValidationResultModel | null {
    return this._state$.value.validationResult;
  }

  // --- State Initialization & Loading ---

  public setPac(pac: ScuPacModel): void {
    const valResult = ScuPacValidator.validate(pac);
    this._patchState({
      pac: { ...pac, matriz7: pac.matriz7 ? [...pac.matriz7] : [] },
      validationResult: valResult,
      autoSaveState: ScuAutoSaveStateEnum.SIN_CAMBIOS,
      lastError: null,
      history: [{ ...pac, matriz7: pac.matriz7 ? [...pac.matriz7] : [] }]
    });
  }

  public loadPac(assignmentId: number): Observable<ScuPacModel> {
    this._patchState({ isSavingOrSubmitting: true });
    return this._planningHttp.getPacByAssignment(assignmentId).pipe(
      map(res => res.data),
      tap(pac => {
        this.setPac(pac);
        this._patchState({ isSavingOrSubmitting: false });
      }),
      catchError(err => {
        this._patchState({
          isSavingOrSubmitting: false,
          lastError: err.message || 'Error al cargar el PAC'
        });
        return throwError(() => err);
      })
    );
  }

  // --- State Mutation Reducers ---

  public updateSession(updatedSession: ScuSesionMatriz7Model): void {
    const currentPac = this._state$.value.pac;
    if (!currentPac) return;

    const newMatriz = currentPac.matriz7.map(s =>
      s.nroSesion === updatedSession.nroSesion ? { ...updatedSession } : s
    );

    this._applyPacMutation({ ...currentPac, matriz7: newMatriz });
  }

  public addSession(): void {
    const currentPac = this._state$.value.pac;
    if (!currentPac) return;

    const nextNro = currentPac.matriz7.length + 1;
    const nextSem = Math.min(20, Math.ceil(nextNro / 2));

    const newSession: ScuSesionMatriz7Model = {
      semana: nextSem,
      nroSesion: nextNro,
      fechaProgramada: '2026-03-01',
      tipoSesion: 'TEORICA',
      unidadTematica: `Unidad ${Math.min(5, Math.ceil(nextSem / 4))}`,
      contenidoEspecifico: 'Contenido específico de la sesión',
      saberConceptual: 'Saberes conceptuales',
      saberProcedimental: 'Saberes procedimentales',
      saberActitudinal: 'Saberes actitudinales',
      criterioDesempeno: 'Criterio de desempeño evaluativo',
      evidenciaAprendizaje: 'Evidencia de aprendizaje entregada',
      instrumentoEvaluacion: 'RUBRICA',
      hitoEvaluativo: 'REGULAR'
    };

    this._applyPacMutation({
      ...currentPac,
      matriz7: [...currentPac.matriz7, newSession]
    });
  }

  public duplicateSession(sessionNumber: number): void {
    const currentPac = this._state$.value.pac;
    if (!currentPac) return;

    const sourceIdx = currentPac.matriz7.findIndex(s => s.nroSesion === sessionNumber);
    if (sourceIdx < 0) return;

    const source = currentPac.matriz7[sourceIdx];
    const clone: ScuSesionMatriz7Model = {
      ...source,
      id: undefined,
      nroSesion: sessionNumber + 1
    };

    const newMatriz = [
      ...currentPac.matriz7.slice(0, sourceIdx + 1),
      clone,
      ...currentPac.matriz7.slice(sourceIdx + 1)
    ];

    const reindexed = this._reindexMatriz(newMatriz);
    this._applyPacMutation({ ...currentPac, matriz7: reindexed });
  }

  public removeSession(sessionNumber: number): void {
    const currentPac = this._state$.value.pac;
    if (!currentPac) return;

    const filtered = currentPac.matriz7.filter(s => s.nroSesion !== sessionNumber);
    const reindexed = this._reindexMatriz(filtered);
    this._applyPacMutation({ ...currentPac, matriz7: reindexed });
  }

  public autoSequenceSessions(): void {
    const currentPac = this._state$.value.pac;
    if (!currentPac) return;

    const reindexed = this._reindexMatriz(currentPac.matriz7);
    this._applyPacMutation({ ...currentPac, matriz7: reindexed });
  }

  public applyGeneratedDates(dates: string[]): void {
    const currentPac = this._state$.value.pac;
    if (!currentPac || !dates || dates.length === 0) return;

    const updatedMatriz = currentPac.matriz7.map((ses, idx) => ({
      ...ses,
      fechaProgramada: dates[idx] || ses.fechaProgramada
    }));

    this._applyPacMutation({ ...currentPac, matriz7: updatedMatriz });
  }

  public importSessions(importedPac: ScuPacModel, mergeMode: 'REPLACE' | 'APPEND'): void {
    const currentPac = this._state$.value.pac;
    if (!currentPac) return;

    let targetMatriz: ScuSesionMatriz7Model[];
    if (mergeMode === 'REPLACE') {
      targetMatriz = this._reindexMatriz(importedPac.matriz7 || []);
    } else {
      targetMatriz = this._reindexMatriz([...currentPac.matriz7, ...(importedPac.matriz7 || [])]);
    }

    this._applyPacMutation({ ...currentPac, matriz7: targetMatriz });
  }

  // --- Persistence & Concurrency Workflows ---

  public manualSave(): Observable<ScuPacModel> {
    const currentPac = this._state$.value.pac;
    if (!currentPac) {
      return throwError(() => new Error('No PAC available to save'));
    }

    this._patchState({
      autoSaveState: ScuAutoSaveStateEnum.GUARDANDO,
      isSavingOrSubmitting: true
    });

    return this._pacSaveCmd.execute(currentPac).pipe(
      tap(saved => {
        const valResult = ScuPacValidator.validate(saved);
        this._patchState({
          pac: saved,
          autoSaveState: ScuAutoSaveStateEnum.GUARDADO,
          lastSavedAt: new Date(),
          lastError: null,
          validationResult: valResult,
          isSavingOrSubmitting: false
        });
      }),
      catchError(err => {
        this._patchState({
          autoSaveState: ScuAutoSaveStateEnum.ERROR,
          lastError: err.message || 'Error al guardar borrador',
          isSavingOrSubmitting: false
        });
        return throwError(() => err);
      })
    );
  }

  public submitForReview(): Observable<ScuPacModel> {
    const currentPac = this._state$.value.pac;
    if (!currentPac) {
      return throwError(() => new Error('No PAC available to submit'));
    }

    const valResult = ScuPacValidator.validate(currentPac);
    if (valResult.hasErrors) {
      return throwError(() => new Error(`No se puede enviar a revisión: existen ${valResult.totalErrors} errores bloqueantes.`));
    }

    this._patchState({
      autoSaveState: ScuAutoSaveStateEnum.GUARDANDO,
      isSavingOrSubmitting: true
    });

    return this._pacSubmitCmd.execute(currentPac).pipe(
      tap(submitted => {
        const valResultSubmitted = ScuPacValidator.validate(submitted);
        this._patchState({
          pac: submitted,
          autoSaveState: ScuAutoSaveStateEnum.GUARDADO,
          lastSavedAt: new Date(),
          lastError: null,
          validationResult: valResultSubmitted,
          isSavingOrSubmitting: false
        });
      }),
      catchError(err => {
        this._patchState({
          autoSaveState: ScuAutoSaveStateEnum.ERROR,
          lastError: err.message || 'Error al enviar a revisión',
          isSavingOrSubmitting: false
        });
        return throwError(() => err);
      })
    );
  }

  // --- Private Helpers ---

  private _applyPacMutation(newPac: ScuPacModel): void {
    const valResult = ScuPacValidator.validate(newPac);
    const newHistory = [...this._state$.value.history, newPac].slice(-20); // Keep last 20 snapshots

    this._patchState({
      pac: newPac,
      validationResult: valResult,
      autoSaveState: ScuAutoSaveStateEnum.CAMBIOS_PENDIENTES,
      history: newHistory
    });

    this._autoSaveSubject$.next(newPac);
  }

  private _setupAutoSavePipeline(): void {
    this._autoSaveSubject$.pipe(
      debounceTime(1500),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      filter(() => !this._state$.value.isSavingOrSubmitting),
      tap(() => this._patchState({ autoSaveState: ScuAutoSaveStateEnum.GUARDANDO })),
      switchMap(pacToSave =>
        this._pacSaveCmd.execute(pacToSave).pipe(
          tap(saved => {
            const valResult = ScuPacValidator.validate(saved);
            this._patchState({
              pac: saved,
              autoSaveState: ScuAutoSaveStateEnum.GUARDADO,
              lastSavedAt: new Date(),
              lastError: null,
              validationResult: valResult
            });
          }),
          catchError(err => {
            this._patchState({
              autoSaveState: ScuAutoSaveStateEnum.ERROR,
              lastError: err.message || 'Error en autoguardado'
            });
            return of(null);
          })
        )
      ),
      takeUntil(this._destroy$)
    ).subscribe();
  }

  private _reindexMatriz(sessions: ScuSesionMatriz7Model[]): ScuSesionMatriz7Model[] {
    return sessions.map((ses, index) => {
      const nroSesion = index + 1;
      const semana = Math.min(20, Math.ceil(nroSesion / 2));
      return {
        ...ses,
        nroSesion,
        semana
      };
    });
  }

  private _patchState(patch: Partial<ScuPacStateModel>): void {
    this._state$.next({
      ...this._state$.value,
      ...patch
    });
  }

  private _finalize(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
