import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { debounceTime, filter, switchMap, catchError, tap } from 'rxjs/operators';
import {
  ScuProgramaAnaliticoModel,
  ScuUnidadAprendizajeModel,
  ScuBibliografiaModel,
  ScuApaValidationSummaryModel
} from '@shared/models/scu-programa-analitico.model';
import { ScuAutoSaveStateEnum } from '@shared/models/scu-validation.model';
import { ScuPlanningStatusEnum } from '@shared/enums/scu-planning-status.enum';
import { ScuApaValidator } from '../utils/scu-apa-validator';
import { ScuPlanningHttpService } from '../http/scu-planning.http';

/**
 * Reactive state management service for Macrocurricular Programa Analítico.
 *
 * Implements Learning Units CRUD (bounded 1..12), APA bibliography validation,
 * unit re-indexing, and debounced autosave.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuProgramaStateService {

  public static readonly MIN_UNITS = 1;
  public static readonly MAX_UNITS = 12;

  private readonly _programa$ = new BehaviorSubject<ScuProgramaAnaliticoModel | null>(null);
  private readonly _apaValidation$ = new BehaviorSubject<ScuApaValidationSummaryModel>({
    hasBasica: false,
    validBasicaCount: 0,
    validTotalCount: 0,
    allValid: false
  });
  private readonly _autoSaveState$ = new BehaviorSubject<ScuAutoSaveStateEnum>(ScuAutoSaveStateEnum.SIN_CAMBIOS);
  private readonly _changeTrigger$ = new BehaviorSubject<ScuProgramaAnaliticoModel | null>(null);
  private _isDirty = false;

  public readonly programa$: Observable<ScuProgramaAnaliticoModel | null> = this._programa$.asObservable();
  public readonly apaValidation$: Observable<ScuApaValidationSummaryModel> = this._apaValidation$.asObservable();
  public readonly autoSaveState$: Observable<ScuAutoSaveStateEnum> = this._autoSaveState$.asObservable();

  constructor(private readonly _planningHttp: ScuPlanningHttpService) {
    this._initAutosavePipeline();
  }

  public get currentPrograma(): ScuProgramaAnaliticoModel | null {
    return this._programa$.getValue();
  }

  public get currentApaValidation(): ScuApaValidationSummaryModel {
    return this._apaValidation$.getValue();
  }

  public loadPrograma(assignmentId: number): Observable<ScuProgramaAnaliticoModel> {
    const httpCall = this._planningHttp?.getProgramaAnalitico?.(assignmentId);
    if (!httpCall) {
      const defaultProg = this._createDefaultPrograma(assignmentId);
      this.setPrograma(defaultProg);
      this._isDirty = false;
      return of(defaultProg);
    }

    return httpCall.pipe(
      tap((res: { data: ScuProgramaAnaliticoModel }) => {
        if (res && res.data) {
          this.setPrograma(res.data);
        }
        this._isDirty = false;
        this._autoSaveState$.next(ScuAutoSaveStateEnum.SIN_CAMBIOS);
      }),
      catchError(() => {
        const defaultProg = this._createDefaultPrograma(assignmentId);
        this.setPrograma(defaultProg);
        this._isDirty = false;
        return of(defaultProg);
      }),
      switchMap(() => of(this.currentPrograma!))
    );
  }

  public setPrograma(programa: ScuProgramaAnaliticoModel): void {
    if (!programa) return;

    const validated = this._reindexUnits(programa);
    this._programa$.next(validated);
    this._recalculateApaValidation(validated.bibliografia || []);
  }

  public updateField<K extends keyof ScuProgramaAnaliticoModel>(field: K, value: ScuProgramaAnaliticoModel[K]): void {
    const current = this._programa$.getValue();
    if (!current) return;

    const updated: ScuProgramaAnaliticoModel = {
      ...current,
      [field]: value,
      actualizadoEn: new Date().toISOString()
    };

    this._isDirty = true;
    this._programa$.next(updated);
    this._autoSaveState$.next(ScuAutoSaveStateEnum.CAMBIOS_PENDIENTES);
    this._changeTrigger$.next(updated);
  }

  public addUnit(): void {
    const current = this._programa$.getValue();
    if (!current) return;

    const units = [...(current.unidades || [])];
    if (units.length >= ScuProgramaStateService.MAX_UNITS) return;

    const nextNum = units.length + 1;
    units.push({
      numeroUnidad: nextNum,
      titulo: `Unidad ${nextNum}: Nueva Unidad Temática`,
      saberesConceptuales: 'Fundamentos, principios teóricos y conceptos clave.',
      saberesProcedimentales: 'Métodos, algoritmos, implementación y resolución de casos.',
      saberesActitudinales: 'Responsabilidad, criterio profesional y trabajo colaborativo.',
      criteriosDesempeno: 'Demuestra dominio técnico aplicando los conceptos en situaciones reales.',
      horasAcademicas: 20
    });

    this.updateField('unidades', units);
  }

  public removeUnit(index: number): void {
    const current = this._programa$.getValue();
    if (!current) return;

    const units = [...(current.unidades || [])];
    if (units.length <= ScuProgramaStateService.MIN_UNITS) return;
    if (index < 0 || index >= units.length) return;

    units.splice(index, 1);
    const reindexed = units.map((u, i) => ({ ...u, numeroUnidad: i + 1 }));
    this.updateField('unidades', reindexed);
  }

  public reorderUnits(fromIndex: number, toIndex: number): void {
    const current = this._programa$.getValue();
    if (!current) return;

    const units = [...(current.unidades || [])];
    if (fromIndex < 0 || fromIndex >= units.length || toIndex < 0 || toIndex >= units.length) return;

    const [moved] = units.splice(fromIndex, 1);
    units.splice(toIndex, 0, moved);

    const reindexed = units.map((u, i) => ({ ...u, numeroUnidad: i + 1 }));
    this.updateField('unidades', reindexed);
  }

  public duplicateUnit(index: number): void {
    const current = this._programa$.getValue();
    if (!current) return;

    const units = [...(current.unidades || [])];
    if (units.length >= ScuProgramaStateService.MAX_UNITS) return;
    if (index < 0 || index >= units.length) return;

    const source = units[index];
    const nextNum = units.length + 1;
    units.push({
      ...source,
      id: undefined,
      numeroUnidad: nextNum,
      titulo: `${source.titulo} (Copia)`
    });

    this.updateField('unidades', units);
  }

  public updateUnit(index: number, unit: ScuUnidadAprendizajeModel): void {
    const current = this._programa$.getValue();
    if (!current) return;

    const units = [...(current.unidades || [])];
    if (index < 0 || index >= units.length) return;

    units[index] = { ...unit, numeroUnidad: index + 1 };
    this.updateField('unidades', units);
  }

  public addBibliography(entry: ScuBibliografiaModel): void {
    const current = this._programa$.getValue();
    if (!current) return;

    const bib = [...(current.bibliografia || []), entry];
    this.updateField('bibliografia', bib);
    this._recalculateApaValidation(bib);
  }

  public updateBibliography(index: number, entry: ScuBibliografiaModel): void {
    const current = this._programa$.getValue();
    if (!current) return;

    const bib = [...(current.bibliografia || [])];
    if (index < 0 || index >= bib.length) return;

    bib[index] = entry;
    this.updateField('bibliografia', bib);
    this._recalculateApaValidation(bib);
  }

  public removeBibliography(index: number): void {
    const current = this._programa$.getValue();
    if (!current) return;

    const bib = [...(current.bibliografia || [])];
    if (index < 0 || index >= bib.length) return;

    bib.splice(index, 1);
    this.updateField('bibliografia', bib);
    this._recalculateApaValidation(bib);
  }

  public manualSave(): Observable<ScuProgramaAnaliticoModel> {
    const current = this._programa$.getValue();
    if (!current) {
      return throwError(() => new Error('No hay Programa Analítico para guardar'));
    }

    this._autoSaveState$.next(ScuAutoSaveStateEnum.GUARDANDO);

    const httpCall = this._planningHttp?.saveProgramaAnalitico?.(current);
    if (!httpCall) {
      this._autoSaveState$.next(ScuAutoSaveStateEnum.GUARDADO);
      return of(current);
    }

    return httpCall.pipe(
      tap((res: { data: ScuProgramaAnaliticoModel }) => {
        this._isDirty = false;
        this.setPrograma(res.data);
        this._autoSaveState$.next(ScuAutoSaveStateEnum.GUARDADO);
      }),
      catchError((err: Error) => {
        this._autoSaveState$.next(ScuAutoSaveStateEnum.ERROR);
        return throwError(() => err);
      }),
      switchMap((res: { data: ScuProgramaAnaliticoModel }) => of(res.data))
    );
  }

  private _initAutosavePipeline(): void {
    this._changeTrigger$.pipe(
      filter((prog): prog is ScuProgramaAnaliticoModel => prog !== null),
      debounceTime(1500),
      filter(() => this._isDirty),
      switchMap(prog => {
        const httpCall = this._planningHttp?.saveProgramaAnalitico?.(prog);
        if (!httpCall) return of(null);

        this._autoSaveState$.next(ScuAutoSaveStateEnum.GUARDANDO);
        return httpCall.pipe(
          catchError(() => {
            this._autoSaveState$.next(ScuAutoSaveStateEnum.ERROR);
            return of(null);
          })
        );
      })
    ).subscribe((res: { data: ScuProgramaAnaliticoModel } | null) => {
      if (res && res.data) {
        this._isDirty = false;
        this._autoSaveState$.next(ScuAutoSaveStateEnum.GUARDADO);
      }
    });
  }

  private _recalculateApaValidation(bib: ScuBibliografiaModel[]): ScuApaValidationSummaryModel {
    const summary = ScuApaValidator.validateBibliographyList(bib);
    this._apaValidation$.next(summary);
    return summary;
  }

  private _reindexUnits(prog: ScuProgramaAnaliticoModel): ScuProgramaAnaliticoModel {
    const units = (prog.unidades || []).map((u, idx) => ({
      ...u,
      numeroUnidad: idx + 1
    }));
    return {
      ...prog,
      unidades: units
    };
  }

  private _createDefaultPrograma(assignmentId: number): ScuProgramaAnaliticoModel {
    return {
      asignacionId: assignmentId,
      estado: ScuPlanningStatusEnum.BORRADOR,
      caracterizacion: 'Asignatura fundamental del plan curricular orientada al desarrollo de competencias analíticas y prácticas.',
      macroCompetencia: 'Diseña, modela e implementa soluciones integrales de software aplicando buenas prácticas de ingeniería y estándares internacionales.',
      sistemaEvaluacion: 'Evaluación formativa continua basada en evidencias de desempeño, resolución de problemas y proyectos aplicados.',
      unidades: [
        {
          numeroUnidad: 1,
          titulo: 'Unidad 1: Fundamentos y Arquitectura de Software',
          saberesConceptuales: 'Principios SOLID, patrones de diseño, desacoplamiento y modularidad.',
          saberesProcedimentales: 'Diseño e implementación de componentes modulares y pruebas automatizadas.',
          saberesActitudinales: 'Rigor técnico, calidad en el código y buenas prácticas de documentación.',
          criteriosDesempeno: 'Implementa arquitecturas limpias y código mantenible según estándares.',
          horasAcademicas: 24
        }
      ],
      bibliografia: [
        {
          tipo: 'BASICA',
          citaApa: 'Sommerville, I. (2019). Software Engineering (10th ed.). Pearson.',
          autor: 'Ian Sommerville',
          anio: 2019,
          titulo: 'Software Engineering'
        }
      ]
    };
  }
}
