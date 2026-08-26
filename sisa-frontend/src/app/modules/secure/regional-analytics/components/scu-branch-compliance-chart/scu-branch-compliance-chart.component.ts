import { Component, OnInit, OnDestroy } from '@angular/core';

/**
 * Regional branch career compliance distribution chart component.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-branch-compliance-chart',
  templateUrl: './scu-branch-compliance-chart.component.html',
  styleUrls: ['./scu-branch-compliance-chart.component.scss']
})
export class ScuBranchComplianceChartComponent implements OnInit, OnDestroy {

  public careerComplianceList = [
    { carrera: 'Medicina', cumplimiento: 94, auditorias: 45, strikes: 1 },
    { carrera: 'Ingeniería de Sistemas', cumplimiento: 91, auditorias: 38, strikes: 2 },
    { carrera: 'Odontología', cumplimiento: 88, auditorias: 32, strikes: 3 },
    { carrera: 'Derecho', cumplimiento: 85, auditorias: 29, strikes: 2 },
    { carrera: 'Fisioterapia y Kinesiología', cumplimiento: 96, auditorias: 24, strikes: 0 },
    { carrera: 'Enfermería', cumplimiento: 92, auditorias: 30, strikes: 1 }
  ];

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  private _initialize(): void {
    // Chart init
  }

  private _finalize(): void {
    // Cleanup
  }
}
