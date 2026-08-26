import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ScuPacModel } from '@shared/models/scu-pac.model';
import { ScuValidationResultModel } from '@shared/models/scu-validation.model';
import { ScuPlanningHttpService } from '../../http/scu-planning.http';
import { ScuPacValidator } from '../../utils/scu-pac-validator';

/**
 * Institutional Excel ingestion modal dialog with backend POI parsing,
 * diff preview table, and replace/append commit workflows.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-pac-excel-modal',
  templateUrl: './scu-pac-excel-modal.component.html',
  styleUrls: ['./scu-pac-excel-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScuExcelIngestModalComponent implements OnInit, OnDestroy {

  @Input() public visible: boolean = false;
  @Input() public asignacionId: number = 1;
  @Input() public currentSessionsCount: number = 0;

  @Output() public visibleChange = new EventEmitter<boolean>();
  @Output() public scuPacImported = new EventEmitter<{ pac: ScuPacModel; mergeMode: 'REPLACE' | 'APPEND' }>();

  public isParsing: boolean = false;
  public parsedPac: ScuPacModel | null = null;
  public validationPreview: ScuValidationResultModel | null = null;
  public mergeMode: 'REPLACE' | 'APPEND' = 'REPLACE';
  public errorMessage: string = '';
  public selectedFileName: string = '';
  public isDragging: boolean = false;

  private readonly _destroy$ = new Subject<void>();

  constructor(private readonly _planningHttp: ScuPlanningHttpService) {}

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this._processFile(input.files[0]);
    }
  }

  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  public onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  public onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this._processFile(event.dataTransfer.files[0]);
    }
  }

  public onConfirmCommit(): void {
    if (!this.parsedPac) return;
    this.scuPacImported.emit({
      pac: this.parsedPac,
      mergeMode: this.mergeMode
    });
    this.closeDialog();
  }

  public closeDialog(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.parsedPac = null;
    this.validationPreview = null;
    this.errorMessage = '';
    this.selectedFileName = '';
  }

  private _processFile(file: File): void {
    this.errorMessage = '';
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      this.errorMessage = 'Solo se admiten archivos Excel válidos (.xlsx).';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage = 'El archivo excede el tamaño máximo permitido de 10 MB.';
      return;
    }

    this.selectedFileName = file.name;
    this.isParsing = true;

    this._planningHttp.importPacFile(file, this.asignacionId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this.parsedPac = res.data;
          this.validationPreview = ScuPacValidator.validate(this.parsedPac);
          this.isParsing = false;
        },
        error: (err) => {
          this.isParsing = false;
          this.errorMessage = err?.error?.message || 'Error al procesar el archivo PAC institucional.';
        }
      });
  }

  private _initialize(): void {
    // Initialization
  }

  private _finalize(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}

// Backwards compatibility alias
export { ScuExcelIngestModalComponent as ScuPacExcelModalComponent };
