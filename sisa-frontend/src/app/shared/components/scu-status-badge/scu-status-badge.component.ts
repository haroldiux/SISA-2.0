import { Component, Input, OnInit, OnDestroy } from '@angular/core';

/**
 * Status badge component displaying status tags with semantic colors.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-status-badge',
  templateUrl: './scu-status-badge.component.html',
  styleUrls: ['./scu-status-badge.component.scss']
})
export class ScuStatusBadgeComponent implements OnInit, OnDestroy {

  @Input() public status: string = '';
  @Input() public label: string = '';

  public badgeClass: string = 'scu-badge-default';

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  private _initialize(): void {
    this._computeBadgeClass();
  }

  private _finalize(): void {
    // Cleanup if needed
  }

  private _computeBadgeClass(): void {
    const s = this.status ? this.status.toUpperCase() : '';
    if (s.includes('APROBADO') || s.includes('CONFORME') || s.includes('PUNTUAL') || s.includes('SUBSANADO')) {
      this.badgeClass = 'scu-badge-success';
    } else if (s.includes('OBSERVAD') || s.includes('PLAN_ACCION') || s.includes('ATRASO_LEVE')) {
      this.badgeClass = 'scu-badge-warning';
    } else if (s.includes('AUSENTE') || s.includes('ATRASO_GRAVE') || s.includes('ESCALADO') || s.includes('INCUMPLIDO')) {
      this.badgeClass = 'scu-badge-danger';
    } else if (s.includes('ENVIADO') || s.includes('PENDIENTE') || s.includes('EN_CURSO')) {
      this.badgeClass = 'scu-badge-info';
    } else {
      this.badgeClass = 'scu-badge-neutral';
    }
  }
}
