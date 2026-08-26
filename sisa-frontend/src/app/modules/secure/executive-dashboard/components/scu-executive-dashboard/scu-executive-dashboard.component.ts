import { Component, OnInit, OnDestroy } from '@angular/core';
import { ScuExportNationalReportCmd } from '../../commands/scu-export-national-report.cmd';

/**
 * National Executive Dashboard Workspace Component (Frame 5).
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-executive-dashboard',
  templateUrl: './scu-executive-dashboard.component.html',
  styleUrls: ['./scu-executive-dashboard.component.scss']
})
export class ScuExecutiveDashboardComponent implements OnInit, OnDestroy {

  public isExporting: boolean = false;
  public exportSuccess: string = '';

  constructor(private readonly _exportReportCmd: ScuExportNationalReportCmd) {}

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public onExportReport(format: 'PDF' | 'XLSX'): void {
    this.isExporting = true;
    this.exportSuccess = '';

    this._exportReportCmd.execute(format).subscribe({
      next: (res) => {
        this.isExporting = false;
        this.exportSuccess = `Reporte institucional descargado: ${res.filename}`;
      },
      error: () => {
        this.isExporting = false;
      }
    });
  }

  private _initialize(): void {
    // Executive dashboard init
  }

  private _finalize(): void {
    // Cleanup
  }
}
