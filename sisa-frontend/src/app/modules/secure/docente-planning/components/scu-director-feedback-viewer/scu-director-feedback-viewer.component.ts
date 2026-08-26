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
import { ScuPlanningStatusEnum } from '@shared/enums/scu-planning-status.enum';

/**
 * Career Director review feedback viewer component.
 *
 * Renders prominent alert banners and remediation guidance when planning status is
 * OBSERVADO, RECHAZADO, ENVIADO_REVISION, or APROBADO.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-director-feedback-viewer',
  templateUrl: './scu-director-feedback-viewer.component.html',
  styleUrls: ['./scu-director-feedback-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScuDirectorFeedbackViewerComponent implements OnInit, OnDestroy {

  @Input() public status: ScuPlanningStatusEnum = ScuPlanningStatusEnum.BORRADOR;
  @Input() public reviewerName?: string;
  @Input() public reviewDate?: string;
  @Input() public observationNotes?: string;
  @Input() public observedComponents?: string[];

  @Output() public scuStartRemediation = new EventEmitter<void>();

  public readonly PlanningStatus = ScuPlanningStatusEnum;

  private readonly _destroy$ = new Subject<void>();

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public get isObservado(): boolean {
    return this.status === ScuPlanningStatusEnum.OBSERVADO;
  }

  public get isRechazado(): boolean {
    return this.status === ScuPlanningStatusEnum.RECHAZADO;
  }

  public get isAprobado(): boolean {
    return this.status === ScuPlanningStatusEnum.APROBADO;
  }

  public get isEnviado(): boolean {
    return this.status === ScuPlanningStatusEnum.ENVIADO_REVISION;
  }

  public get shouldDisplay(): boolean {
    return this.isObservado || this.isRechazado || this.isAprobado || this.isEnviado;
  }

  private _initialize(): void {
    // Initializer
  }

  private _finalize(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
