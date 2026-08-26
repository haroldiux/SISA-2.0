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
import { ScuUnidadAprendizajeModel } from '@shared/models/scu-programa-analitico.model';

/**
 * Dynamic Learning Units manager for Programa Analítico (bounded 1 to 12 units).
 *
 * Implements unit creation, sequential re-indexing, cloning, and position reordering.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-learning-units-manager',
  templateUrl: './scu-learning-units-manager.component.html',
  styleUrls: ['./scu-learning-units-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScuLearningUnitsManagerComponent implements OnInit, OnDestroy {

  public static readonly MIN_UNITS = 1;
  public static readonly MAX_UNITS = 12;

  @Input() public units: ScuUnidadAprendizajeModel[] = [];
  @Input() public isReadOnly: boolean = false;

  @Output() public scuUnitsChanged = new EventEmitter<ScuUnidadAprendizajeModel[]>();
  @Output() public scuAddUnit = new EventEmitter<void>();
  @Output() public scuRemoveUnit = new EventEmitter<number>();
  @Output() public scuDuplicateUnit = new EventEmitter<number>();
  @Output() public scuMoveUnit = new EventEmitter<{ from: number; to: number }>();

  public activeUnitIndex: number = 0;

  private readonly _destroy$ = new Subject<void>();

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public get canAdd(): boolean {
    return !this.isReadOnly && (this.units?.length || 0) < ScuLearningUnitsManagerComponent.MAX_UNITS;
  }

  public get canRemove(): boolean {
    return !this.isReadOnly && (this.units?.length || 0) > ScuLearningUnitsManagerComponent.MIN_UNITS;
  }

  public get totalHoras(): number {
    return (this.units || []).reduce((acc, u) => acc + (Number(u.horasAcademicas) || 0), 0);
  }

  public onAdd(): void {
    if (!this.canAdd) return;
    this.scuAddUnit.emit();
    this.activeUnitIndex = (this.units?.length || 0);
  }

  public onRemove(index: number, event?: Event): void {
    if (event) event.stopPropagation();
    if (!this.canRemove) return;
    this.scuRemoveUnit.emit(index);
    if (this.activeUnitIndex >= (this.units.length - 1)) {
      this.activeUnitIndex = Math.max(0, this.units.length - 2);
    }
  }

  public onDuplicate(index: number, event?: Event): void {
    if (event) event.stopPropagation();
    if (!this.canAdd) return;
    this.scuDuplicateUnit.emit(index);
    this.activeUnitIndex = (this.units?.length || 0);
  }

  public onMoveUp(index: number, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.isReadOnly || index <= 0) return;
    this.scuMoveUnit.emit({ from: index, to: index - 1 });
    this.activeUnitIndex = index - 1;
  }

  public onMoveDown(index: number, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.isReadOnly || index >= (this.units.length - 1)) return;
    this.scuMoveUnit.emit({ from: index, to: index + 1 });
    this.activeUnitIndex = index + 1;
  }

  public onUnitFieldChange(): void {
    if (this.isReadOnly) return;
    this.scuUnitsChanged.emit(this.units);
  }

  private _initialize(): void {
    // Initializer
  }

  private _finalize(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
