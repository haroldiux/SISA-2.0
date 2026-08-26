import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SCU_API } from '../../constants/scu-api.constant';

/**
 * Reusable Office export trigger button for downloading XLSX and DOCX institutional files.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-office-export-button',
  templateUrl: './scu-office-export-button.component.html',
  styleUrls: ['./scu-office-export-button.component.scss']
})
export class ScuOfficeExportButtonComponent implements OnInit, OnDestroy {

  @Input() public documentType: 'PAC' | 'PLAN_CLASE' | 'PROGRAMA' = 'PAC';
  @Input() public resourceId: number = 0;
  @Input() public label: string = 'Descargar Office';

  public isExporting: boolean = false;

  constructor(private readonly _http: HttpClient) {}

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public onExport(): void {
    if (!this.resourceId) return;

    this.isExporting = true;
    let url = '';
    let defaultFilename = 'documento.xlsx';

    if (this.documentType === 'PAC') {
      url = `${SCU_API.OFFICE.EXPORT_PAC}/${this.resourceId}/export`;
      defaultFilename = `PAC_Matriz7_${this.resourceId}.xlsx`;
    } else if (this.documentType === 'PLAN_CLASE') {
      url = `${SCU_API.OFFICE.EXPORT_PLAN}/${this.resourceId}/export`;
      defaultFilename = `Plan_Clase_${this.resourceId}.xlsx`;
    } else if (this.documentType === 'PROGRAMA') {
      url = `${SCU_API.OFFICE.EXPORT_PROGRAMA}/${this.resourceId}/export`;
      defaultFilename = `Programa_Analitico_${this.resourceId}.docx`;
    }

    this._http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = defaultFilename;
        link.click();
        window.URL.revokeObjectURL(downloadUrl);
        this.isExporting = false;
      },
      error: () => {
        this.isExporting = false;
      }
    });
  }

  private _initialize(): void {
    // Initialization
  }

  private _finalize(): void {
    // Cleanup
  }
}
