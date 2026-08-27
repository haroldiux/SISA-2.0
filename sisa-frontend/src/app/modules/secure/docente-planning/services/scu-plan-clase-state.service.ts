import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { debounceTime, filter, switchMap, catchError, tap } from 'rxjs/operators';
import {
  ScuPlanClaseModel,
  ScuMomentoPedagogicoModel,
  ScuTipoMomentoPedagogico,
  ScuDurationValidationResultModel
} from '@shared/models/scu-plan-clase.model';
import { ScuSesionMatriz7Model } from '@shared/models/scu-pac.model';
import { ScuAutoSaveStateEnum } from '@shared/models/scu-validation.model';
import { ScuPlanningStatusEnum } from '@shared/enums/scu-planning-status.enum';
import { ScuDurationValidator } from '../utils/scu-duration-validator';
import { ScuPlanningHttpService } from '../http/scu-planning.http';

/**
 * Reactive state management service for Micro-Lesson Plans (Planes de Clase).
 *
 * Implements per-session Map caching, zero-data-loss switching, debounced autosave,
 * and real-time 180 min duration balance validation.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuPlanClaseStateService {

  private readonly _plansCache = new Map<number, ScuPlanClaseModel>();
  private readonly _dirtySessions = new Set<number>();

  private readonly _activePlan$ = new BehaviorSubject<ScuPlanClaseModel | null>(null);
  private readonly _durationValidation$ = new BehaviorSubject<ScuDurationValidationResultModel>(
    ScuDurationValidator.validate(25, 100, 55, 180)
  );
  private readonly _autoSaveState$ = new BehaviorSubject<ScuAutoSaveStateEnum>(ScuAutoSaveStateEnum.SIN_CAMBIOS);
  private readonly _activeSession$ = new BehaviorSubject<ScuSesionMatriz7Model | null>(null);

  // Autosave trigger stream
  private readonly _changeTrigger$ = new BehaviorSubject<ScuPlanClaseModel | null>(null);

  public readonly activePlan$: Observable<ScuPlanClaseModel | null> = this._activePlan$.asObservable();
  public readonly durationValidation$: Observable<ScuDurationValidationResultModel> = this._durationValidation$.asObservable();
  public readonly autoSaveState$: Observable<ScuAutoSaveStateEnum> = this._autoSaveState$.asObservable();
  public readonly activeSession$: Observable<ScuSesionMatriz7Model | null> = this._activeSession$.asObservable();

  constructor(private readonly _planningHttp: ScuPlanningHttpService) {
    this._initAutosavePipeline();
  }

  public get currentPlan(): ScuPlanClaseModel | null {
    return this._activePlan$.getValue();
  }

  public get currentValidation(): ScuDurationValidationResultModel {
    return this._durationValidation$.getValue();
  }

  public get dirtySessions(): Set<number> {
    return new Set(this._dirtySessions);
  }

  public getAllCachedPlans(): Map<number, ScuPlanClaseModel> {
    return new Map(this._plansCache);
  }

  public getPlanForSession(sessionNumber: number): ScuPlanClaseModel | undefined {
    return this._plansCache.get(sessionNumber);
  }

  /**
   * Pre-populates the cache with default plans for all given sessions if not already cached.
   */
  public initializeSessions(sessions: ScuSesionMatriz7Model[]): void {
    if (!sessions || sessions.length === 0) return;

    sessions.forEach(s => {
      if (!this._plansCache.has(s.nroSesion)) {
        const defaultPlan = this._createDefaultPlan(s);
        this._plansCache.set(s.nroSesion, defaultPlan);
      }
    });

    if (!this._activePlan$.getValue() && sessions.length > 0) {
      this.selectSession(sessions[0]);
    }
  }

  /**
   * Switches active session smoothly, preserving current session state in cache.
   */
  public selectSession(session: ScuSesionMatriz7Model): void {
    if (!session) return;

    // Save current plan into cache before switching
    const current = this._activePlan$.getValue();
    if (current && current.nroSesion !== undefined) {
      this._plansCache.set(current.nroSesion, { ...current });
    }

    this._activeSession$.next(session);

    // Check if session is in cache
    let plan = this._plansCache.get(session.nroSesion);
    if (!plan) {
      plan = this._createDefaultPlan(session);
      this._plansCache.set(session.nroSesion, plan);
    }

    this._activePlan$.next({ ...plan });
    this._recalculateValidation(plan);
  }

  /**
   * Updates active plan model in state and cache.
   */
  public updatePlan(plan: ScuPlanClaseModel): void {
    if (!plan) return;

    const updated: ScuPlanClaseModel = {
      ...plan,
      actualizadoEn: new Date().toISOString()
    };

    if (updated.nroSesion !== undefined) {
      this._plansCache.set(updated.nroSesion, updated);
      this._dirtySessions.add(updated.nroSesion);
    }

    this._activePlan$.next(updated);
    this._recalculateValidation(updated);
    this._autoSaveState$.next(ScuAutoSaveStateEnum.CAMBIOS_PENDIENTES);
    this._changeTrigger$.next(updated);
  }

  /**
   * Updates duration for a specific moment (INICIO, DESARROLLO, CIERRE).
   */
  public updateMomentDuration(tipo: ScuTipoMomentoPedagogico, minutes: number): void {
    const plan = this._activePlan$.getValue();
    if (!plan) return;

    const safeMinutes = Math.max(0, Number(minutes) || 0);
    const momentos = plan.momentos.map(m => {
      if (m.tipoMomento === tipo) {
        return { ...m, duracionMin: safeMinutes };
      }
      return m;
    });

    this.updatePlan({
      ...plan,
      momentos
    });
  }

  /**
   * Updates activities and evaluation indicator for a moment.
   */
  public updateMomentActivities(
    tipo: ScuTipoMomentoPedagogico,
    docente: string,
    estudiante: string,
    indicador: string
  ): void {
    const plan = this._activePlan$.getValue();
    if (!plan) return;

    const momentos = plan.momentos.map(m => {
      if (m.tipoMomento === tipo) {
        return {
          ...m,
          actividadesDocente: docente,
          actividadesEstudiante: estudiante,
          indicadorEvaluacion: indicador
        };
      }
      return m;
    });

    this.updatePlan({
      ...plan,
      momentos
    });
  }

  /**
   * Applies the UNITEPC canonical competency-based distribution (25m / 100m / 55m).
   */
  public applyStandardTemplate(): void {
    const plan = this._activePlan$.getValue();
    if (!plan) return;

    const standardMomentos: ScuMomentoPedagogicoModel[] = [
      {
        tipoMomento: 'INICIO',
        duracionMin: 25,
        actividadesDocente: 'Presentación del objetivo, motivación situacional y reactivación de conocimientos previos.',
        actividadesEstudiante: 'Participación activa, respuesta a preguntas orientadoras y reflexión inicial.',
        indicadorEvaluacion: 'Reconocimiento y formulación de ideas clave previas.'
      },
      {
        tipoMomento: 'DESARROLLO',
        duracionMin: 100,
        actividadesDocente: 'Exposición magistral dialógica, resolución de casos modelo y supervisión de taller práctico.',
        actividadesEstudiante: 'Trabajo colaborativo en grupos, desarrollo de ejercicios guiados y formulación de preguntas.',
        indicadorEvaluacion: 'Resolución correcta de problemas aplicando los principios expuestos.'
      },
      {
        tipoMomento: 'CIERRE',
        duracionMin: 55,
        actividadesDocente: 'Síntesis conceptual de la clase, retroalimentación grupal y asignación de actividades autónomas.',
        actividadesEstudiante: 'Presentación de conclusiones de grupo y entrega de producto didáctico.',
        indicadorEvaluacion: 'Evaluación formativa y coevaluación del producto obtenido.'
      }
    ];

    this.updatePlan({
      ...plan,
      duracionTotalMin: 180,
      momentos: standardMomentos
    });
  }

  /**
   * Clones moments and optionally objective/resources from source session to target session.
   */
  public cloneSession(sourceSessionNum: number, targetSessionNum: number, cloneAll: boolean = true): void {
    const sourcePlan = this._plansCache.get(sourceSessionNum) || this._activePlan$.getValue();
    if (!sourcePlan) return;

    const targetPlan = this._plansCache.get(targetSessionNum) || {
      sesionId: targetSessionNum,
      nroSesion: targetSessionNum,
      estado: ScuPlanningStatusEnum.BORRADOR,
      duracionTotalMin: 180,
      objetivoSesion: '',
      momentos: []
    };

    const clonedMomentos: ScuMomentoPedagogicoModel[] = sourcePlan.momentos.map(m => ({
      tipoMomento: m.tipoMomento,
      duracionMin: m.duracionMin,
      actividadesDocente: m.actividadesDocente,
      actividadesEstudiante: m.actividadesEstudiante,
      indicadorEvaluacion: m.indicadorEvaluacion
    }));

    const newTargetPlan: ScuPlanClaseModel = {
      ...targetPlan,
      nroSesion: targetSessionNum,
      duracionTotalMin: sourcePlan.duracionTotalMin,
      momentos: clonedMomentos,
      objetivoSesion: cloneAll ? sourcePlan.objetivoSesion : targetPlan.objetivoSesion,
      recursosDidacticos: cloneAll ? [...(sourcePlan.recursosDidacticos || [])] : targetPlan.recursosDidacticos,
      actualizadoEn: new Date().toISOString()
    };

    this._plansCache.set(targetSessionNum, newTargetPlan);
    this._dirtySessions.add(targetSessionNum);

    // If currently viewing target session, update active plan
    const active = this._activePlan$.getValue();
    if (active && active.nroSesion === targetSessionNum) {
      this._activePlan$.next(newTargetPlan);
      this._recalculateValidation(newTargetPlan);
    }
  }

  /**
   * Imports batch planes into cache.
   */
  public importPlanes(planes: ScuPlanClaseModel[], mode: 'REPLACE' | 'APPEND' = 'REPLACE'): void {
    if (!planes || planes.length === 0) return;

    if (mode === 'REPLACE') {
      this._plansCache.clear();
      this._dirtySessions.clear();
    }

    planes.forEach(p => {
      const sesNum = p.nroSesion || p.sesionId;
      this._plansCache.set(sesNum, p);
      this._dirtySessions.add(sesNum);
    });

    const active = this._activePlan$.getValue();
    if (active && active.nroSesion !== undefined && this._plansCache.has(active.nroSesion)) {
      const reloaded = this._plansCache.get(active.nroSesion)!;
      this._activePlan$.next(reloaded);
      this._recalculateValidation(reloaded);
    }
  }

  /**
   * Manually persists the active plan via HTTP.
   */
  public manualSave(): Observable<ScuPlanClaseModel> {
    const plan = this._activePlan$.getValue();
    if (!plan) {
      return throwError(() => new Error('No hay plan activo para guardar'));
    }

    const val = this._recalculateValidation(plan);
    if (!val.isValid) {
      return throwError(() => new Error(`No se puede guardar: ${val.message}`));
    }

    this._autoSaveState$.next(ScuAutoSaveStateEnum.GUARDANDO);

    const httpCall = this._planningHttp?.savePlanClase?.(plan);
    if (!httpCall) {
      this._autoSaveState$.next(ScuAutoSaveStateEnum.GUARDADO);
      return of(plan);
    }

    return httpCall.pipe(
      tap((res: { data: ScuPlanClaseModel }) => {
        const saved = res.data;
        if (saved.nroSesion !== undefined) {
          this._plansCache.set(saved.nroSesion, saved);
          this._dirtySessions.delete(saved.nroSesion);
        }
        this._activePlan$.next(saved);
        this._autoSaveState$.next(ScuAutoSaveStateEnum.GUARDADO);
      }),
      catchError((err: Error) => {
        this._autoSaveState$.next(ScuAutoSaveStateEnum.ERROR);
        return throwError(() => err);
      }),
      switchMap((res: { data: ScuPlanClaseModel }) => of(res.data))
    );
  }

  private _initAutosavePipeline(): void {
    this._changeTrigger$.pipe(
      filter((plan): plan is ScuPlanClaseModel => plan !== null),
      debounceTime(1500),
      filter(plan => {
        const val = this._recalculateValidation(plan);
        return val.isValid && plan.nroSesion !== undefined && this._dirtySessions.has(plan.nroSesion);
      }),
      switchMap(plan => {
        const httpCall = this._planningHttp?.savePlanClase?.(plan);
        if (!httpCall) return of(null);

        this._autoSaveState$.next(ScuAutoSaveStateEnum.GUARDANDO);
        return httpCall.pipe(
          catchError(() => {
            this._autoSaveState$.next(ScuAutoSaveStateEnum.ERROR);
            return of(null);
          })
        );
      })
    ).subscribe((res: { data: ScuPlanClaseModel } | null) => {
      if (res && res.data) {
        if (res.data.nroSesion !== undefined) {
          this._dirtySessions.delete(res.data.nroSesion);
        }
        this._autoSaveState$.next(ScuAutoSaveStateEnum.GUARDADO);
      }
    });
  }

  private _recalculateValidation(plan: ScuPlanClaseModel): ScuDurationValidationResultModel {
    const result = ScuDurationValidator.validateMoments(plan.momentos, plan.duracionTotalMin || 180);
    this._durationValidation$.next(result);
    return result;
  }

  private _createDefaultPlan(session: ScuSesionMatriz7Model): ScuPlanClaseModel {
    return {
      sesionId: session.id || session.nroSesion,
      semana: session.semana,
      nroSesion: session.nroSesion,
      unidadTematica: session.unidadTematica,
      estado: ScuPlanningStatusEnum.BORRADOR,
      duracionTotalMin: 180,
      objetivoSesion: session.contenidoEspecifico
        ? `Al finalizar la sesión, el estudiante será capaz de: ${session.contenidoEspecifico}`
        : `Desarrollar los saberes previstos para la sesión #${session.nroSesion}`,
      recursosDidacticos: ['Pizarra Interactiva', 'Presentación Multimedia', 'Guía de Práctica'],
      momentos: [
        {
          tipoMomento: 'INTRODUCCION',
          nombreMomento: '1. INTRODUCCIÓN',
          duracionMin: 25,
          actividadesDocente: 'Activación cognitiva, motivación situacional y reactivación de conocimientos previos.',
          actividadesEstudiante: 'Participación activa, respuesta a preguntas orientadoras y reflexión inicial.',
          indicadorEvaluacion: 'Reconocimiento y formulación de ideas clave previas.'
        },
        {
          tipoMomento: 'RESULTADOS_LOGROS',
          nombreMomento: '2. RESULTADOS DE APRENDIZAJE / LOGROS ESPERADOS',
          duracionMin: 0,
          actividadesDocente: session.criterioDesempeno || 'Socialización de resultados de aprendizaje y logros esperados.',
          actividadesEstudiante: 'Comprensión y alineación con los objetivos y criterios de evaluación de la sesión.',
          indicadorEvaluacion: 'Claridad en metas de aprendizaje.'
        },
        {
          tipoMomento: 'CONTENIDOS',
          nombreMomento: '3. CONTENIDOS DE LA CLASE',
          duracionMin: 0,
          actividadesDocente: session.saberConceptual || session.contenidoEspecifico || 'Presentación del esquema temático y conceptos clave.',
          actividadesEstudiante: 'Identificación de conceptos estructurantes y toma de apuntes.',
          indicadorEvaluacion: 'Mapeo conceptual de la temática.'
        },
        {
          tipoMomento: 'CUERPO',
          nombreMomento: '4. CUERPO DE CONTENIDOS',
          duracionMin: 100,
          actividadesDocente: 'Exposición magistral dialógica, resolución de casos modelo y supervisión de taller práctico.',
          actividadesEstudiante: 'Trabajo colaborativo en grupos, desarrollo de ejercicios guiados y formulación de preguntas.',
          indicadorEvaluacion: 'Resolución correcta de problemas aplicando los principios expuestos.'
        },
        {
          tipoMomento: 'CONCLUSION',
          nombreMomento: '5. CONCLUSIÓN O CIERRE',
          duracionMin: 55,
          actividadesDocente: 'Síntesis conceptual de la clase, retroalimentación grupal y evaluación formativa.',
          actividadesEstudiante: 'Presentación de conclusiones de grupo y entrega de producto didáctico.',
          indicadorEvaluacion: 'Evaluación formativa y coevaluación del producto obtenido.'
        }
      ]
    };
  }
}
