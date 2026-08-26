import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ScuPacModel } from '@shared/models/scu-pac.model';
import { ScuPacReviewCmd } from '../../commands/scu-pac-review.cmd';

/**
 * Career Director PAC Review Decision Modal (Approve / Request Changes).
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-pac-review-modal',
  templateUrl: './scu-pac-review-modal.component.html',
  styleUrls: ['./scu-pac-review-modal.component.scss']
})
export class ScuPacReviewModalComponent implements OnInit, OnDestroy {

  @Input() public visible: boolean = false;
  @Input() public pac: ScuPacModel | null = null;
  @Output() public visibleChange = new EventEmitter<boolean>();
  @Output() public reviewed = new EventEmitter<ScuPacModel>();

  public observaciones: string = '';
  public isProcessing: boolean = false;

  constructor(private readonly _reviewCmd: ScuPacReviewCmd) {}

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public onApprove(): void {
    if (!this.pac) return;
    this._submitDecision('APROBADO');
  }

  public onObserve(): void {
    if (!this.pac || !this.observaciones.trim()) return;
    this._submitDecision('OBSERVADO');
  }

  public onClose(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  private _initialize(): void {
    // Modal initialize
  }

  private _finalize(): void {
    // Cleanup
  }

  private _submitDecision(estado: 'APROBADO' | 'OBSERVADO'): void {
    if (!this.pac) return;

    this.isProcessing = true;
    this._reviewCmd.execute(this.pac.id || 1, {
      nuevoEstado: estado,
      observaciones: this.observaciones
    }).subscribe({
      next: (updatedPac) => {
        this.isProcessing = false;
        this.reviewed.emit(updatedPac);
        this.onClose();
      },
      error: () => {
        this.isProcessing = false;
      }
    });
  }
}
