import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ScuPacModel, ScuSesionMatriz7Model } from '@shared/models/scu-pac.model';
import { ScuAsignacionDocenteModel } from '@shared/models/scu-academic.model';
import { ScuProgramaAnaliticoModel } from '@shared/models/scu-programa-analitico.model';
import { ScuPreflightResultModel, ScuPreflightIssueModel } from '@shared/models/scu-planning-preflight.model';
import {
  ScuAutoSaveStateEnum,
  ScuValidationIssueModel,
  ScuValidationResultModel
} from '@shared/models/scu-validation.model';
import { ScuPlanningStatusEnum } from '@shared/enums/scu-planning-status.enum';
import { ScuSessionService } from '@core/services/scu-session.service';
import { ScuPlanningHttpService } from '../../http/scu-planning.http';
import { ScuPacStateService } from '../../services/scu-pac-state.service';
import { ScuProgramaStateService } from '../../services/scu-programa-state.service';
import { ScuPlanClaseStateService } from '../../services/scu-plan-clase-state.service';
import { ScuPlanningSubmitCmd } from '../../commands/scu-planning-submit.cmd';
import { ScuPlanningPreflightValidator } from '../../utils/scu-planning-preflight-validator';
import { ScuMatriz7GridComponent } from '../scu-pac-matrix/scu-pac-matrix.component';

/**
 * Docente Planning Workspace Shell Orchestrator.
 *
 * Coordinates 3-tier planning trilogy tabs (Programa Analítico, PAC Matriz 7, Planes de Clase),
 * director review feedback panel, composite preflight compliance audit, and read-only submission locking.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-docente-planning',
  templateUrl: './scu-docente-planning.component.html',
  styleUrls: ['./scu-docente-planning.component.scss']
})
export class ScuDocentePlanningComponent implements OnInit, OnDestroy {

  @ViewChild('matrixGrid') public matrixGrid?: ScuMatriz7GridComponent;

  public activeAssignment: ScuAsignacionDocenteModel | null = null;
  public selectedSessionForPlan: ScuSesionMatriz7Model | null = null;
  public activeTabIndex: number = 1; // Default to PAC Matriz 7
  public isLoading: boolean = false;
  public isSubmitting: boolean = false;
  public alertMessage: string = '';
  public alertType: 'success' | 'info' | 'error' = 'info';

  public calendarModalVisible: boolean = false;
  public excelModalVisible: boolean = false;
  public preflightModalVisible: boolean = false;
  public preflightResult: ScuPreflightResultModel | null = null;

  public readonly AutoSaveState = ScuAutoSaveStateEnum;
  public readonly PlanningStatus = ScuPlanningStatusEnum;

  public readonly pac$: Observable<ScuPacModel | null> = this._pacStateService.pac$;
  public readonly autoSaveState$: Observable<ScuAutoSaveStateEnum> = this._pacStateService.autoSaveState$;
  public readonly validationResult$: Observable<ScuValidationResultModel | null> = this._pacStateService.validationResult$;
  public readonly programa$: Observable<ScuProgramaAnaliticoModel | null> = this._programaStateService.programa$;

  private readonly _destroy$ = new Subject<void>();

  constructor(
    private readonly _planningHttp: ScuPlanningHttpService,
    private readonly _sessionService: ScuSessionService,
    private readonly _pacStateService: ScuPacStateService,
    private readonly _programaStateService: ScuProgramaStateService,
    private readonly _planStateService: ScuPlanClaseStateService,
    private readonly _submitCmd: ScuPlanningSubmitCmd
  ) {}

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public get isReadOnly(): boolean {
    const pac = this._pacStateService.currentPac;
    if (!pac) return false;
    return pac.estado === ScuPlanningStatusEnum.ENVIADO_REVISION ||
           pac.estado === ScuPlanningStatusEnum.APROBADO;
  }

  public get allSessions(): ScuSesionMatriz7Model[] {
    return this._pacStateService.currentPac?.matriz7 || [];
  }

  @HostListener('window:beforeunload', ['$event'])
  public onBeforeUnload(event: BeforeUnloadEvent): void {
    const currentState = this._pacStateService.currentPac;
    if (currentState && (this._pacStateService.currentValidationResult?.hasErrors)) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  public onSessionSelect(session: ScuSesionMatriz7Model): void {
    this.selectedSessionForPlan = session;
    this.activeTabIndex = 2; // Switch to Microplan tab
    this._planStateService.selectSession(session);
  }

  public onPacChange(pac: ScuPacModel): void {
    this._pacStateService.setPac(pac);
    if (pac.matriz7 && pac.matriz7.length > 0) {
      this._planStateService.initializeSessions(pac.matriz7);
    }
  }

  public onDatesGenerated(dates: string[]): void {
    this._pacStateService.applyGeneratedDates(dates);
    this.alertType = 'success';
    this.alertMessage = `Se asignaron ${dates.length} fechas cronológicas a la Matriz 7.`;
  }

  public onPacImported(event: { pac: ScuPacModel; mergeMode: 'REPLACE' | 'APPEND' }): void {
    this._pacStateService.importSessions(event.pac, event.mergeMode);
    const count = event.pac.matriz7?.length || 0;
    this.alertType = 'success';
    this.alertMessage = `${count} sesiones importadas exitosamente (${event.mergeMode === 'REPLACE' ? 'Reemplazo' : 'Anexo'}).`;
  }

  public onJumpToIssue(issue: ScuValidationIssueModel | ScuPreflightIssueModel): void {
    this.preflightModalVisible = false;
    const targetTab = ('tabIndex' in issue && typeof issue.tabIndex === 'number') ? issue.tabIndex : 1;
    this.activeTabIndex = targetTab;

    setTimeout(() => {
      if (targetTab === 1 && this.matrixGrid && 'ruleCode' in issue) {
        this.matrixGrid.jumpToIssue(issue as ScuValidationIssueModel);
      } else if (targetTab === 2 && issue.sessionNumber) {
        const targetSession = this.allSessions.find(s => s.nroSesion === issue.sessionNumber);
        if (targetSession) {
          this.selectedSessionForPlan = targetSession;
          this._planStateService.selectSession(targetSession);
        }
      }
    }, 150);
  }

  public onSavePac(): void {
    if (this.isReadOnly) return;
    this.isLoading = true;
    this.alertMessage = '';
    this._pacStateService.manualSave()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.alertType = 'success';
          this.alertMessage = 'PAC guardado exitosamente en estado BORRADOR.';
        },
        error: (err) => {
          this.isLoading = false;
          this.alertType = 'error';
          this.alertMessage = err.message || 'Error al guardar el PAC.';
        }
      });
  }

  public openPreflightChecker(): void {
    const prog = this._programaStateService.currentPrograma;
    const pac = this._pacStateService.currentPac;
    const planes = this._planStateService.getAllCachedPlans();

    this.preflightResult = ScuPlanningPreflightValidator.audit(prog, pac, planes);
    this.preflightModalVisible = true;
  }

  public onConfirmPreflightSubmit(): void {
    const pac = this._pacStateService.currentPac;
    if (!pac) return;

    const prog = this._programaStateService.currentPrograma;
    const planes = this._planStateService.getAllCachedPlans();

    this.isSubmitting = true;
    this.alertMessage = '';

    this._submitCmd.execute(pac, prog, planes)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (submittedPac) => {
          this.isSubmitting = false;
          this.preflightModalVisible = false;
          this._pacStateService.setPac(submittedPac);
          this.alertType = 'success';
          this.alertMessage = 'Trilogía de Planificación enviada exitosamente a revisión por Dirección de Carrera.';
        },
        error: (err) => {
          this.isSubmitting = false;
          this.alertType = 'error';
          this.alertMessage = err.message || 'Error al enviar la planificación a revisión.';
        }
      });
  }

  public onExportPac(pacId: number): void {
    this._planningHttp.exportPacXlsx(pacId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (blob) => {
          this._planningHttp.triggerBlobDownload(blob, `PAC_Matriz7_${pacId}.xlsx`);
        },
        error: () => {
          this.alertType = 'error';
          this.alertMessage = 'Error al descargar el archivo Excel oficial de Matriz 7.';
        }
      });
  }

  public openCalendarModal(): void {
    this.calendarModalVisible = true;
  }

  public openImportModal(): void {
    this.excelModalVisible = true;
  }

  private _initialize(): void {
    this._sessionService.selectedAssignment$
      .pipe(takeUntil(this._destroy$))
      .subscribe(asig => {
        this.activeAssignment = asig;
        if (asig) {
          this._loadPacHttpRequest(asig.id);
          this._programaStateService.loadPrograma(asig.id).pipe(takeUntil(this._destroy$)).subscribe();
        }
      });
  }

  private _finalize(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _loadPacHttpRequest(assignmentId: number): void {
    this.isLoading = true;
    this._pacStateService.loadPac(assignmentId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (pac) => {
          if (pac.matriz7 && pac.matriz7.length > 0) {
            this.selectedSessionForPlan = pac.matriz7[0];
            this._planStateService.initializeSessions(pac.matriz7);
          }
          this.isLoading = false;
        },
        error: () => {
          const fallback = this._generateDefaultPac(assignmentId);
          this._pacStateService.setPac(fallback);
          if (fallback.matriz7.length > 0) {
            this.selectedSessionForPlan = fallback.matriz7[0];
            this._planStateService.initializeSessions(fallback.matriz7);
          }
          this.isLoading = false;
        }
      });
  }

  private _generateDefaultPac(assignmentId: number): ScuPacModel {
    const sesiones: ScuSesionMatriz7Model[] = [];
    for (let s = 1; s <= 38; s++) {
      const sem = Math.min(20, Math.ceil(s / 2));
      const hito = (s === 14) ? 'PRIMER_PARCIAL' : (s === 28) ? 'SEGUNDO_PARCIAL' : (s === 38) ? 'EXAMEN_FINAL' : 'REGULAR';
      const inst = (hito !== 'REGULAR') ? 'PRUEBA_ESCRITA' : 'RUBRICA';

      sesiones.push({
        semana: sem,
        nroSesion: s,
        fechaProgramada: `2026-03-${s < 10 ? '0' + s : s}`,
        tipoSesion: (s % 2 === 0) ? 'PRACTICA' : 'TEORICA',
        unidadTematica: `Unidad ${Math.min(5, Math.ceil(sem / 4))}: Competencias Módulo ${sem}`,
        contenidoEspecifico: `Desarrollo de contenidos didácticos de la sesión #${s}`,
        saberConceptual: 'Modelado y conceptos teóricos fundamentales',
        saberProcedimental: 'Aplicación en laboratorio y resolución de problemas',
        saberActitudinal: 'Participación y colaboración ética',
        criterioDesempeno: 'Aplica conceptos en código ejecutable',
        evidenciaAprendizaje: `Guía de laboratorio de sesión ${s} entregada`,
        instrumentoEvaluacion: inst,
        hitoEvaluativo: hito
      });
    }

    return {
      asignacionId: assignmentId,
      estado: ScuPlanningStatusEnum.BORRADOR,
      seccionesIdentificacion: {
        sede: 'Cochabamba',
        carrera: 'Ingeniería de Sistemas',
        asignatura: 'Programación III'
      },
      estrategiasMetodologicas: ['Aprendizaje Basado en Proyectos (ABP)', 'Clase Invertida'],
      recursosDidacticos: ['IDE Visual Studio Code / IntelliJ', 'Plataforma LMS UNITEPC'],
      normasCurso: ['Puntualidad de 10 min de tolerancia', 'Asistencia mínima del 80%'],
      matriz7: sesiones
    };
  }
}
