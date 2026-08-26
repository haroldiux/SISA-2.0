import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ScuProgramaAnaliticoModel } from '@shared/models/scu-programa-analitico.model';
import { ScuPlanningHttpService } from '../../http/scu-planning.http';

/**
 * Modal dialog for uploading, validating, and importing institutional Programa Analítico Word (.docx) documents.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-programa-docx-modal',
  templateUrl: './scu-programa-docx-modal.component.html',
  styleUrls: ['./scu-programa-docx-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScuProgramaDocxModalComponent implements OnInit, OnDestroy {

  @Input() public visible: boolean = false;
  @Input() public assignmentId: number = 1;

  @Output() public visibleChange = new EventEmitter<boolean>();
  @Output() public scuProgramaImported = new EventEmitter<ScuProgramaAnaliticoModel>();

  public selectedFile: File | null = null;
  public parsedPrograma: ScuProgramaAnaliticoModel | null = null;
  public isUploading: boolean = false;
  public errorMessage: string = '';

  private readonly _destroy$ = new Subject<void>();

  constructor(
    private readonly _planningHttp: ScuPlanningHttpService,
    private readonly _cdr: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this._processFile(input.files[0]);
    }
  }

  public onFileDropped(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this._processFile(event.dataTransfer.files[0]);
    }
  }

  public onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  public onClose(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.selectedFile = null;
    this.parsedPrograma = null;
    this.errorMessage = '';
  }

  public onConfirmImport(): void {
    if (!this.parsedPrograma) {
      this.errorMessage = 'No hay programa analítico parseado para importar.';
      return;
    }

    this.scuProgramaImported.emit(this.parsedPrograma);
    this.onClose();
  }

  private _initialize(): void {
    // Initializer
  }

  private _finalize(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _processFile(file: File): void {
    this.selectedFile = file;
    this.errorMessage = '';
    this.isUploading = true;
    this._cdr.markForCheck();

    this._planningHttp.importProgramaDocxFile(file, this.assignmentId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this.parsedPrograma = res.data;
          this.isUploading = false;
          this._cdr.markForCheck();
        },
        error: (err) => {
          this.isUploading = false;
          this.errorMessage = err.error?.message || err.message || 'Error al procesar el archivo Word (.docx).';
          this._cdr.markForCheck();
        }
      });
  }
}
