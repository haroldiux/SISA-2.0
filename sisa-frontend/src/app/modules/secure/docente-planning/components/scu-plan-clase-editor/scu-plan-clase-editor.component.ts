import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  HostListener
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  ScuPlanClaseModel,
  ScuMomentoPedagogicoModel,
  ScuTipoMomentoPedagogico,
  ScuDurationValidationResultModel
} from '@shared/models/scu-plan-clase.model';
import { ScuSesionMatriz7Model } from '@shared/models/scu-pac.model';
import { ScuAutoSaveStateEnum } from '@shared/models/scu-validation.model';
import { ScuPlanClaseStateService } from '../../services/scu-plan-clase-state.service';
import { ScuPlanClaseSaveCmd } from '../../commands/scu-plan-clase-save.cmd';
import { ScuPlanningHttpService } from '../../http/scu-planning.http';
import { ScuDurationValidator } from '../../utils/scu-duration-validator';

/**
 * Plan de Clase 3-moments microdidactic editor component.
 *
 * Implements session navigation ribbon, 3 pedagogical moment cards,
 * real-time 180 min balance badge, standard template applier, and Excel ingestion/export.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-plan-clase-editor',
  templateUrl: './scu-plan-clase-editor.component.html',
  styleUrls: ['./scu-plan-clase-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScuPlanClaseEditorComponent implements OnInit, OnChanges, OnDestroy {

  @Input() public session: ScuSesionMatriz7Model | null = null;
  @Input() public allSessions: ScuSesionMatriz7Model[] = [];
  @Input() public isReadOnly: boolean = false;

  @Output() public scuPlanSaved = new EventEmitter<ScuPlanClaseModel>();
  @Output() public scuSessionSelected = new EventEmitter<ScuSesionMatriz7Model>();

  public readonly activePlan$: Observable<ScuPlanClaseModel | null> = this._planStateService.activePlan$;
  public readonly durationValidation$: Observable<ScuDurationValidationResultModel> = this._planStateService.durationValidation$;
  public readonly autoSaveState$: Observable<ScuAutoSaveStateEnum> = this._planStateService.autoSaveState$;

  public cloneModalVisible: boolean = false;
  public excelModalVisible: boolean = false;
  public isLoading: boolean = false;
  public saveSuccessMessage: string = '';
  public saveErrorMessage: string = '';

  public predefinedResources: string[] = [
    'Pizarra Interactiva',
    'Proyector Multimedia',
    'Laboratorio de Computación',
    'Software Especializado (IDE / Simulador)',
    'Plataforma LMS UNITEPC',
    'Guía de Práctica / Taller',
    'Artículos Científicos / Lecturas APA',
    'Calculadora / Tablas Técnicas'
  ];

  private readonly _destroy$ = new Subject<void>();

  constructor(
    private readonly _planStateService: ScuPlanClaseStateService,
    private readonly _planSaveCmd: ScuPlanClaseSaveCmd,
    private readonly _planningHttp: ScuPlanningHttpService
  ) {}

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['allSessions'] && this.allSessions.length > 0) {
      this._planStateService.initializeSessions(this.allSessions);
    }
    if (changes['session'] && this.session) {
      this._planStateService.selectSession(this.session);
    }
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  @HostListener('window:keydown', ['$event'])
  public onKeyDown(event: KeyboardEvent): void {
    if (event.altKey && event.key === 'ArrowLeft') {
      this.onPrevSession();
    } else if (event.altKey && event.key === 'ArrowRight') {
      this.onNextSession();
    }
  }

  public get activePlan(): ScuPlanClaseModel | null {
    return this._planStateService.currentPlan;
  }

  public get activeSessionIndex(): number {
    if (!this.session || !this.allSessions) return -1;
    return this.allSessions.findIndex(s => s.nroSesion === this.session!.nroSesion);
  }

  public get hasPrevSession(): boolean {
    return this.activeSessionIndex > 0;
  }

  public get hasNextSession(): boolean {
    return this.activeSessionIndex >= 0 && this.activeSessionIndex < this.allSessions.length - 1;
  }

  public getMoment(tipo: ScuTipoMomentoPedagogico): ScuMomentoPedagogicoModel | undefined {
    return this.activePlan?.momentos?.find(m => m.tipoMomento === tipo);
  }

  public onSelectSessionRibbon(session: ScuSesionMatriz7Model): void {
    this._planStateService.selectSession(session);
    this.scuSessionSelected.emit(session);
  }

  public onPrevSession(): void {
    if (this.hasPrevSession) {
      const prev = this.allSessions[this.activeSessionIndex - 1];
      this.onSelectSessionRibbon(prev);
    }
  }

  public onNextSession(): void {
    if (this.hasNextSession) {
      const next = this.allSessions[this.activeSessionIndex + 1];
      this.onSelectSessionRibbon(next);
    }
  }

  public onDurationChange(tipo: ScuTipoMomentoPedagogico, value: number): void {
    if (this.isReadOnly) return;
    this._planStateService.updateMomentDuration(tipo, value);
  }

  public onMomentDurationInput(): void {
    if (this.isReadOnly) return;
    const current = this.activePlan;
    if (current) {
      this._planStateService.updatePlan(current);
    }
  }

  public getMomentColorClass(tipo: string): string {
    switch (tipo) {
      case 'INTRODUCCION':
      case 'INICIO':
        return 'moment-inicio';
      case 'RESULTADOS_LOGROS':
        return 'moment-resultados';
      case 'CONTENIDOS':
        return 'moment-contenidos';
      case 'CUERPO':
      case 'DESARROLLO':
        return 'moment-desarrollo';
      case 'CONCLUSION':
      case 'CIERRE':
        return 'moment-cierre';
      default:
        return 'moment-default';
    }
  }

  public onFieldChange(): void {
    if (this.isReadOnly) return;
    const current = this.activePlan;
    if (current) {
      this._planStateService.updatePlan(current);
    }
  }

  public onApplyStandardTemplate(): void {
    if (this.isReadOnly) return;
    this._planStateService.applyStandardTemplate();
    this.saveSuccessMessage = 'Plantilla estándar UNITEPC (25m / 100m / 55m) aplicada exitosamente.';
    setTimeout(() => { this.saveSuccessMessage = ''; }, 3500);
  }

  public onToggleResource(resource: string): void {
    if (this.isReadOnly || !this.activePlan) return;

    const currentResources = [...(this.activePlan.recursosDidacticos || [])];
    const index = currentResources.indexOf(resource);

    if (index >= 0) {
      currentResources.splice(index, 1);
    } else {
      currentResources.push(resource);
    }

    this._planStateService.updatePlan({
      ...this.activePlan,
      recursosDidacticos: currentResources
    });
  }

  public isResourceSelected(resource: string): boolean {
    return (this.activePlan?.recursosDidacticos || []).includes(resource);
  }

  public openCloneModal(): void {
    this.cloneModalVisible = true;
  }

  public onCloneSession(event: { sourceSession: number; targetSession: number; cloneAll: boolean }): void {
    this._planStateService.cloneSession(event.sourceSession, event.targetSession, event.cloneAll);
    this.saveSuccessMessage = `Plan de clase duplicado exitosamente a la Sesión #${event.targetSession}.`;
    setTimeout(() => { this.saveSuccessMessage = ''; }, 3500);
  }

  public openExcelModal(): void {
    this.excelModalVisible = true;
  }

  public onPlanesImported(event: { planes: ScuPlanClaseModel[]; mode: 'REPLACE' | 'APPEND' }): void {
    this._planStateService.importPlanes(event.planes, event.mode);
    this.saveSuccessMessage = `${event.planes.length} Plan(es) de Clase importados exitosamente.`;
    setTimeout(() => { this.saveSuccessMessage = ''; }, 3500);
  }

  public onExportExcel(): void {
    const plan = this.activePlan;
    if (!plan) return;

    const sesId = plan.sesionId || plan.nroSesion || 1;
    this._planningHttp.exportPlanClaseXlsx(sesId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (blob) => {
          this._planningHttp.triggerBlobDownload(blob, `Plan_Clase_Sesion_${plan.nroSesion || sesId}.xlsx`);
        },
        error: () => {
          this.saveErrorMessage = 'Error al exportar el archivo Excel oficial de Plan de Clase.';
        }
      });
  }

  public onSave(): void {
    if (this.isReadOnly) return;
    this.isLoading = true;
    this.saveSuccessMessage = '';
    this.saveErrorMessage = '';

    this._planStateService.manualSave()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (saved) => {
          this.isLoading = false;
          this.saveSuccessMessage = 'Plan de clase guardado exitosamente.';
          this.scuPlanSaved.emit(saved);
          setTimeout(() => { this.saveSuccessMessage = ''; }, 3500);
        },
        error: (err) => {
          this.isLoading = false;
          this.saveErrorMessage = err.message || 'Error al guardar el plan de clase.';
        }
      });
  }

  public getSessionRibbonStatus(session: ScuSesionMatriz7Model): 'COMPLETO' | 'DESBALANCEADO' | 'VACIO' {
    const plan = this._planStateService.getPlanForSession(session.nroSesion);
    if (!plan || !plan.momentos || plan.momentos.length === 0) {
      return 'VACIO';
    }

    const ini = plan.momentos.find(m => m.tipoMomento === 'INICIO')?.duracionMin || 0;
    const des = plan.momentos.find(m => m.tipoMomento === 'DESARROLLO')?.duracionMin || 0;
    const cie = plan.momentos.find(m => m.tipoMomento === 'CIERRE')?.duracionMin || 0;

    const val = ScuDurationValidator.validate(ini, des, cie, plan.duracionTotalMin || 180);
    return val.isValid ? 'COMPLETO' : 'DESBALANCEADO';
  }

  private _initialize(): void {
    if (this.allSessions && this.allSessions.length > 0) {
      this._planStateService.initializeSessions(this.allSessions);
    }
    if (this.session) {
      this._planStateService.selectSession(this.session);
    }
  }

  private _finalize(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
