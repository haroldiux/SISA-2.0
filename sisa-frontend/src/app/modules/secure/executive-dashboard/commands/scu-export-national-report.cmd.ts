import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

/**
 * Command for exporting cross-sede institutional benchmark reports.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuExportNationalReportCmd {

  public execute(format: 'PDF' | 'XLSX'): Observable<{ success: boolean; filename: string }> {
    return of({
      success: true,
      filename: `SISA_Reporte_Nacional_2026.${format.toLowerCase()}`
    }).pipe(delay(600));
  }
}
