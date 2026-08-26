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
import { ScuSesionMatriz7Model } from '@shared/models/scu-pac.model';

/**
 * Modal dialog for duplicating pedagogical moments and resources from current session to another.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-plan-clase-clone-modal',
  templateUrl: './scu-plan-clase-clone-modal.component.html',
  styleUrls: ['./scu-plan-clase-clone-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScuPlanClaseCloneModalComponent implements OnInit, OnDestroy {

  @Input() public visible: boolean = false;
  @Input() public currentSession: number = 1;
  @Input() public allSessions: ScuSesionMatriz7Model[] = [];

  @Output() public visibleChange = new EventEmitter<boolean>();
  @Output() public scuCloneSession = new EventEmitter<{
    sourceSession: number;
    targetSession: number;
    cloneAll: boolean;
  }>();

  public targetSessionNumber: number | null = null;
  public cloneAll: boolean = true;
  public errorMessage: string = '';

  private readonly _destroy$ = new Subject<void>();

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public get availableTargetSessions(): { label: string; value: number }[] {
    return (this.allSessions || [])
      .filter(s => s.nroSesion !== this.currentSession)
      .map(s => ({
        label: `Sesión #${s.nroSesion} (Semana ${s.semana}) - ${s.unidadTematica || 'Sin Título'}`,
        value: s.nroSesion
      }));
  }

  public onClose(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.errorMessage = '';
    this.targetSessionNumber = null;
  }

  public onConfirmClone(): void {
    if (!this.targetSessionNumber) {
      this.errorMessage = 'Debe seleccionar una sesión de destino para duplicar.';
      return;
    }

    this.scuCloneSession.emit({
      sourceSession: this.currentSession,
      targetSession: this.targetSessionNumber,
      cloneAll: this.cloneAll
    });

    this.onClose();
  }

  private _initialize(): void {
    // Initializer
  }

  private _finalize(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
