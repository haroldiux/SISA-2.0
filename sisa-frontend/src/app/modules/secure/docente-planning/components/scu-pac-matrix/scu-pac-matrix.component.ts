import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ElementRef
} from '@angular/core';
import { ScuPacModel, ScuSesionMatriz7Model } from '@shared/models/scu-pac.model';
import {
  ScuAutoSaveStateEnum,
  ScuValidationIssueModel,
  ScuValidationResultModel
} from '@shared/models/scu-validation.model';

/**
 * 20-Week PAC Matriz 7 Interactive Data Grid Component.
 *
 * Spreadsheet-grade high-density inline editable data grid with row tracking,
 * 12 inline cell editors, action toolbar, and deep-link error focus.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-pac-matrix',
  templateUrl: './scu-pac-matrix.component.html',
  styleUrls: ['./scu-pac-matrix.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScuMatriz7GridComponent implements OnInit, OnDestroy {

  @Input() public pac: ScuPacModel | null = null;
  @Input() public isReadOnly: boolean = false;
  @Input() public validationResult: ScuValidationResultModel | null = null;
  @Input() public autoSaveState: ScuAutoSaveStateEnum = ScuAutoSaveStateEnum.SIN_CAMBIOS;
  @Input() public lastSavedAt: Date | null = null;

  @Output() public scuPacChange = new EventEmitter<ScuPacModel>();
  @Output() public scuSessionSelect = new EventEmitter<ScuSesionMatriz7Model>();
  @Output() public scuManualSave = new EventEmitter<void>();
  @Output() public scuManualSubmit = new EventEmitter<void>();
  @Output() public scuExportExcel = new EventEmitter<number>();
  @Output() public scuOpenImportModal = new EventEmitter<void>();
  @Output() public scuOpenCalendarModal = new EventEmitter<void>();

  // Aliased outputs for backwards compatibility
  @Output() public pacChange = this.scuPacChange;
  @Output() public sessionSelect = this.scuSessionSelect;

  public selectedWeekFilter: number = 0;
  public weekOptions: { label: string; value: number }[] = [];

  public readonly tipoSesionOptions = [
    { label: 'TEÓRICA', value: 'TEORICA' },
    { label: 'PRÁCTICA', value: 'PRACTICA' },
    { label: 'LABORATORIO', value: 'LABORATORIO' },
    { label: 'TALLER', value: 'TALLER' }
  ];

  public readonly instrumentoOptions = [
    { label: 'RÚBRICA', value: 'RUBRICA' },
    { label: 'LISTA DE COTEJO', value: 'LISTA_COTEJO' },
    { label: 'ESCALA ESTIMATIVA', value: 'ESCALA_ESTIMATIVA' },
    { label: 'PRUEBA ESCRITA', value: 'PRUEBA_ESCRITA' },
    { label: 'N/A', value: 'N_A' }
  ];

  public readonly hitoOptions = [
    { label: 'REGULAR', value: 'REGULAR' },
    { label: '1ER PARCIAL', value: 'PRIMER_PARCIAL' },
    { label: '2DO PARCIAL', value: 'SEGUNDO_PARCIAL' },
    { label: 'EXAMEN FINAL', value: 'EXAMEN_FINAL' },
    { label: '2DA INSTANCIA', value: 'SEGUNDA_INSTANCIA' }
  ];

  constructor(private readonly _elementRef: ElementRef) {}

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public trackBySessionNumber(_index: number, item: ScuSesionMatriz7Model): number {
    return item.nroSesion;
  }

  public onCellChange(): void {
    if (!this.pac) return;
    this.scuPacChange.emit(this.pac);
  }

  public onSelectForPlanClase(session: ScuSesionMatriz7Model): void {
    this.scuSessionSelect.emit(session);
  }

  public onAddSession(): void {
    if (!this.pac || this.isReadOnly) return;
    const nextNro = (this.pac.matriz7?.length || 0) + 1;
    const nextSem = Math.min(20, Math.ceil(nextNro / 2));

    const newSesion: ScuSesionMatriz7Model = {
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

    this.pac.matriz7 = [...(this.pac.matriz7 || []), newSesion];
    this.scuPacChange.emit(this.pac);
  }

  public onDuplicateSession(session: ScuSesionMatriz7Model): void {
    if (!this.pac || this.isReadOnly) return;
    const sourceIdx = this.pac.matriz7.findIndex(s => s.nroSesion === session.nroSesion);
    if (sourceIdx < 0) return;

    const clone: ScuSesionMatriz7Model = {
      ...session,
      id: undefined,
      nroSesion: session.nroSesion + 1
    };

    const newMatriz = [
      ...this.pac.matriz7.slice(0, sourceIdx + 1),
      clone,
      ...this.pac.matriz7.slice(sourceIdx + 1)
    ];

    this.pac.matriz7 = this._reindexMatriz(newMatriz);
    this.scuPacChange.emit(this.pac);
  }

  public onRemoveSession(session: ScuSesionMatriz7Model): void {
    if (!this.pac || this.isReadOnly) return;
    const filtered = this.pac.matriz7.filter(s => s.nroSesion !== session.nroSesion);
    this.pac.matriz7 = this._reindexMatriz(filtered);
    this.scuPacChange.emit(this.pac);
  }

  public onAutoSequence(): void {
    if (!this.pac || this.isReadOnly) return;
    this.pac.matriz7 = this._reindexMatriz(this.pac.matriz7);
    this.scuPacChange.emit(this.pac);
  }

  public onTriggerSave(): void {
    this.scuManualSave.emit();
  }

  public onTriggerSubmit(): void {
    this.scuManualSubmit.emit();
  }

  public onTriggerExport(): void {
    if (this.pac?.id) {
      this.scuExportExcel.emit(this.pac.id);
    }
  }

  public onTriggerImportModal(): void {
    this.scuOpenImportModal.emit();
  }

  public onTriggerCalendarModal(): void {
    this.scuOpenCalendarModal.emit();
  }

  public jumpToIssue(issue: ScuValidationIssueModel): void {
    if (!issue.sessionNumber) return;
    const targetElementId = `matriz7-row-${issue.sessionNumber}`;
    const element = document.getElementById(targetElementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('scu-row-highlight');
      setTimeout(() => {
        element.classList.remove('scu-row-highlight');
      }, 2500);

      if (issue.fieldName) {
        const inputElem = element.querySelector(`[data-field="${issue.fieldName}"]`) as HTMLElement;
        if (inputElem) {
          inputElem.focus();
        }
      }
    }
  }

  public hasFieldError(sessionNumber: number, fieldName: string): boolean {
    if (!this.validationResult || !this.validationResult.issues) return false;
    return this.validationResult.issues.some(
      i => i.severity === 'ERROR' && i.sessionNumber === sessionNumber && i.fieldName === fieldName
    );
  }

  public hasFieldWarning(sessionNumber: number, fieldName: string): boolean {
    if (!this.validationResult || !this.validationResult.issues) return false;
    return this.validationResult.issues.some(
      i => i.severity === 'WARNING' && i.sessionNumber === sessionNumber && i.fieldName === fieldName
    );
  }

  public get filteredSessions(): ScuSesionMatriz7Model[] {
    if (!this.pac || !this.pac.matriz7) return [];
    if (this.selectedWeekFilter === 0) return this.pac.matriz7;
    return this.pac.matriz7.filter(s => s.semana === this.selectedWeekFilter);
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

  private _initialize(): void {
    this.weekOptions = [{ label: 'Todas las Semanas (1 - 20)', value: 0 }];
    for (let w = 1; w <= 20; w++) {
      this.weekOptions.push({ label: `Semana ${w}`, value: w });
    }
  }

  private _finalize(): void {
    // Cleanup
  }
}

// Alias for backwards compatibility
export { ScuMatriz7GridComponent as ScuPacMatrixComponent };
