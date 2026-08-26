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
import { ScuPlanClaseModel } from '@shared/models/scu-plan-clase.model';
import { ScuPlanningHttpService } from '../../http/scu-planning.http';
import { ScuDurationValidator } from '../../utils/scu-duration-validator';

/**
 * Modal dialog for uploading, validating, and importing institutional Plan de Clase Excel spreadsheets.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-plan-clase-excel-modal',
  templateUrl: './scu-plan-clase-excel-modal.component.html',
  styleUrls: ['./scu-plan-clase-excel-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScuPlanClaseExcelModalComponent implements OnInit, OnDestroy {

  @Input() public visible: boolean = false;
  @Input() public currentSessionId?: number;

  @Output() public visibleChange = new EventEmitter<boolean>();
  @Output() public scuPlanesImported = new EventEmitter<{
    planes: ScuPlanClaseModel[];
    mode: 'REPLACE' | 'APPEND';
  }>();

  public selectedFile: File | null = null;
  public parsedPlanes: ScuPlanClaseModel[] = [];
  public isUploading: boolean = false;
  public errorMessage: string = '';
  public importMode: 'REPLACE' | 'APPEND' = 'REPLACE';

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
    this.parsedPlanes = [];
    this.errorMessage = '';
  }

  public onConfirmImport(): void {
    if (this.parsedPlanes.length === 0) {
      this.errorMessage = 'No hay planes de clase parseados para importar.';
      return;
    }

    this.scuPlanesImported.emit({
      planes: this.parsedPlanes,
      mode: this.importMode
    });

    this.onClose();
  }

  public getMomentDuration(plan: ScuPlanClaseModel, tipo: 'INICIO' | 'DESARROLLO' | 'CIERRE'): number {
    return plan.momentos?.find(m => m.tipoMomento === tipo)?.duracionMin || 0;
  }

  public isPlanBalanced(plan: ScuPlanClaseModel): boolean {
    const ini = this.getMomentDuration(plan, 'INICIO');
    const des = this.getMomentDuration(plan, 'DESARROLLO');
    const cie = this.getMomentDuration(plan, 'CIERRE');
    return ScuDurationValidator.validate(ini, des, cie, plan.duracionTotalMin || 180).isValid;
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

    this._planningHttp.importPlanClaseFile(file, this.currentSessionId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this.parsedPlanes = res.data || [];
          this.isUploading = false;
          this._cdr.markForCheck();
        },
        error: (err) => {
          this.isUploading = false;
          this.errorMessage = err.error?.message || err.message || 'Error al procesar el archivo Excel.';
          this._cdr.markForCheck();
        }
      });
  }
}
