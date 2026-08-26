import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  ScuProgramaAnaliticoModel,
  ScuUnidadAprendizajeModel,
  ScuBibliografiaModel,
  ScuApaValidationSummaryModel
} from '@shared/models/scu-programa-analitico.model';
import { ScuAutoSaveStateEnum } from '@shared/models/scu-validation.model';
import { ScuProgramaStateService } from '../../services/scu-programa-state.service';
import { ScuProgramaAnaliticoSaveCmd } from '../../commands/scu-programa-analitico-save.cmd';
import { ScuPlanningHttpService } from '../../http/scu-planning.http';

/**
 * Macro-curricular Programa Analítico editor component.
 *
 * Integrates characterization, macro-competency, evaluation system,
 * dynamic units manager (1..12), APA 7th bibliography manager, and Word ingestion/export.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-programa-analitico-editor',
  templateUrl: './scu-programa-analitico-editor.component.html',
  styleUrls: ['./scu-programa-analitico-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScuProgramaAnaliticoEditorComponent implements OnInit, OnChanges, OnDestroy {

  @Input() public assignmentId: number = 1;
  @Input() public isReadOnly: boolean = false;

  @Output() public scuProgramaSaved = new EventEmitter<ScuProgramaAnaliticoModel>();

  public readonly programa$: Observable<ScuProgramaAnaliticoModel | null> = this._programaStateService.programa$;
  public readonly apaValidation$: Observable<ScuApaValidationSummaryModel> = this._programaStateService.apaValidation$;
  public readonly autoSaveState$: Observable<ScuAutoSaveStateEnum> = this._programaStateService.autoSaveState$;

  public docxModalVisible: boolean = false;
  public isLoading: boolean = false;
  public saveSuccessMessage: string = '';
  public saveErrorMessage: string = '';

  private readonly _destroy$ = new Subject<void>();

  constructor(
    private readonly _programaStateService: ScuProgramaStateService,
    private readonly _programaSaveCmd: ScuProgramaAnaliticoSaveCmd,
    private readonly _planningHttp: ScuPlanningHttpService
  ) {}

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['assignmentId'] && this.assignmentId) {
      this._programaStateService.loadPrograma(this.assignmentId);
    }
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public get currentPrograma(): ScuProgramaAnaliticoModel | null {
    return this._programaStateService.currentPrograma;
  }

  public onFieldChange<K extends keyof ScuProgramaAnaliticoModel>(field: K, value: ScuProgramaAnaliticoModel[K]): void {
    if (this.isReadOnly) return;
    this._programaStateService.updateField(field, value);
  }

  public onAddUnit(): void {
    if (this.isReadOnly) return;
    this._programaStateService.addUnit();
  }

  public onRemoveUnit(index: number): void {
    if (this.isReadOnly) return;
    this._programaStateService.removeUnit(index);
  }

  public onDuplicateUnit(index: number): void {
    if (this.isReadOnly) return;
    this._programaStateService.duplicateUnit(index);
  }

  public onMoveUnit(event: { from: number; to: number }): void {
    if (this.isReadOnly) return;
    this._programaStateService.reorderUnits(event.from, event.to);
  }

  public onUnitsChanged(units: ScuUnidadAprendizajeModel[]): void {
    if (this.isReadOnly) return;
    this._programaStateService.updateField('unidades', units);
  }

  public onAddBibliography(entry: ScuBibliografiaModel): void {
    if (this.isReadOnly) return;
    this._programaStateService.addBibliography(entry);
  }

  public onRemoveBibliography(index: number): void {
    if (this.isReadOnly) return;
    this._programaStateService.removeBibliography(index);
  }

  public onBibliographyChanged(list: ScuBibliografiaModel[]): void {
    if (this.isReadOnly) return;
    this._programaStateService.updateField('bibliografia', list);
  }

  public openDocxModal(): void {
    this.docxModalVisible = true;
  }

  public onProgramaImported(programa: ScuProgramaAnaliticoModel): void {
    this._programaStateService.setPrograma(programa);
    this.saveSuccessMessage = 'Programa Analítico importado desde Word exitosamente.';
    setTimeout(() => { this.saveSuccessMessage = ''; }, 3500);
  }

  public onExportDocx(): void {
    this._planningHttp.exportProgramaDocx(this.assignmentId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (blob) => {
          this._planningHttp.triggerBlobDownload(blob, `Programa_Analitico_${this.assignmentId}.docx`);
        },
        error: () => {
          this.saveErrorMessage = 'Error al exportar el documento Word oficial de Programa Analítico.';
        }
      });
  }

  public onSave(): void {
    if (this.isReadOnly) return;
    const prog = this.currentPrograma;
    if (!prog) return;

    this.isLoading = true;
    this.saveSuccessMessage = '';
    this.saveErrorMessage = '';

    this._programaSaveCmd.execute(prog)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (saved) => {
          this.isLoading = false;
          this._programaStateService.setPrograma(saved);
          this.saveSuccessMessage = 'Programa Analítico guardado exitosamente.';
          this.scuProgramaSaved.emit(saved);
          setTimeout(() => { this.saveSuccessMessage = ''; }, 3500);
        },
        error: (err) => {
          this.isLoading = false;
          this.saveErrorMessage = err.message || 'Error al guardar el Programa Analítico.';
        }
      });
  }

  private _initialize(): void {
    if (this.assignmentId) {
      this._programaStateService.loadPrograma(this.assignmentId);
    }
  }

  private _finalize(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
