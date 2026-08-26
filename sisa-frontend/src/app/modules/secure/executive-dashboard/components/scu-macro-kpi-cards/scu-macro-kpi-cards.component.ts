import { Component, OnInit, OnDestroy } from '@angular/core';

/**
 * Institutional Macro KPI summary cards component.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-macro-kpi-cards',
  templateUrl: './scu-macro-kpi-cards.component.html',
  styleUrls: ['./scu-macro-kpi-cards.component.scss']
})
export class ScuMacroKpiCardsComponent implements OnInit, OnDestroy {

  public totalDocentesNacional = 524;
  public materiasMapeadas = 1860;
  public cumplimientoPacGlobal = 93.8;
  public auditoriasEjecutadas = 742;
  public tasaConformidadAudit = 94.2;

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  private _initialize(): void {
    // KPI init
  }

  private _finalize(): void {
    // Cleanup
  }
}
