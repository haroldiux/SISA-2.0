import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ScuReincidenciaModel } from '@shared/models/scu-audit.model';
import { ScuActionPlanApproveCmd } from '../../commands/scu-action-plan-approve.cmd';

/**
 * Disciplinary 3-strike recurrence monitor panel component.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-disciplinary-recurrence-panel',
  templateUrl: './scu-disciplinary-recurrence-panel.component.html',
  styleUrls: ['./scu-disciplinary-recurrence-panel.component.scss']
})
export class ScuDisciplinaryRecurrencePanelComponent implements OnInit, OnDestroy {

  @Input() public recurrences: ScuReincidenciaModel[] = [];
  @Output() public resolved = new EventEmitter<number>();

  public actionPlanDialogVisible: boolean = false;
  public selectedRecurrence: ScuReincidenciaModel | null = null;
  public isProcessing: boolean = false;

  constructor(private readonly _approveCmd: ScuActionPlanApproveCmd) {}

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public onViewActionPlan(r: ScuReincidenciaModel): void {
    this.selectedRecurrence = r;
    this.actionPlanDialogVisible = true;
  }

  public onApproveActionPlan(): void {
    if (!this.selectedRecurrence) return;

    this.isProcessing = true;
    this._approveCmd.execute(this.selectedRecurrence.id).subscribe({
      next: () => {
        this.isProcessing = false;
        this.actionPlanDialogVisible = false;
        this.resolved.emit(this.selectedRecurrence?.id);
      },
      error: () => {
        this.isProcessing = false;
      }
    });
  }

  private _initialize(): void {
    // Init
  }

  private _finalize(): void {
    // Cleanup
  }
}
