import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ScuAutoSaveStateEnum } from '@shared/models/scu-validation.model';

/**
 * Non-intrusive header badge indicator for real-time draft persistence state.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-autosave-indicator',
  templateUrl: './scu-autosave-indicator.component.html',
  styleUrls: ['./scu-autosave-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScuAutosaveIndicatorComponent implements OnInit, OnDestroy {

  @Input() public state: ScuAutoSaveStateEnum = ScuAutoSaveStateEnum.SIN_CAMBIOS;
  @Input() public lastSavedAt: Date | null = null;
  @Input() public errorMessage: string = '';

  @Output() public scuRetry = new EventEmitter<void>();

  public readonly AutoSaveState = ScuAutoSaveStateEnum;

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public onRetry(): void {
    this.scuRetry.emit();
  }

  private _initialize(): void {
    // Component lifecycle initialization
  }

  private _finalize(): void {
    // Component lifecycle cleanup
  }
}
