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
import {
  ScuPreflightResultModel,
  ScuPreflightIssueModel
} from '@shared/models/scu-planning-preflight.model';

/**
 * 3-Pillar Pre-Flight Compliance Audit Modal component.
 *
 * Provides composite status overview of Programa Analítico, PAC Matriz 7, and Planes de Clase
 * before formal submission to Career Direction.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-planning-preflight-checker',
  templateUrl: './scu-planning-preflight-checker.component.html',
  styleUrls: ['./scu-planning-preflight-checker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScuPlanningPreflightCheckerComponent implements OnInit, OnDestroy {

  @Input() public visible: boolean = false;
  @Input() public preflightResult: ScuPreflightResultModel | null = null;
  @Input() public isSubmitting: boolean = false;

  @Output() public visibleChange = new EventEmitter<boolean>();
  @Output() public scuJumpToIssue = new EventEmitter<ScuPreflightIssueModel>();
  @Output() public scuConfirmSubmit = new EventEmitter<void>();

  private readonly _destroy$ = new Subject<void>();

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public onClose(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  public onJumpToIssue(issue: ScuPreflightIssueModel): void {
    this.scuJumpToIssue.emit(issue);
    this.onClose();
  }

  public onConfirm(): void {
    if (!this.preflightResult?.isEligible) return;
    this.scuConfirmSubmit.emit();
  }

  private _initialize(): void {
    // Initializer
  }

  private _finalize(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
