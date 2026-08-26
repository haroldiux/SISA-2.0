import { Component, OnInit, OnDestroy } from '@angular/core';
import { ScuAuditoriaInSituModel } from '@shared/models/scu-audit.model';
import { ScuAuditStatusEnum } from '@shared/enums/scu-audit-status.enum';

/**
 * Academic Audit Workspace Component (Frame 3).
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-academic-audit',
  templateUrl: './scu-academic-audit.component.html',
  styleUrls: ['./scu-academic-audit.component.scss']
})
export class ScuAcademicAuditComponent implements OnInit, OnDestroy {

  public matchedClassData: any = null;
  public recentAudits: ScuAuditoriaInSituModel[] = [];

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public onClassMatched(data: any): void {
    this.matchedClassData = data;
  }

  public onAuditFinalized(audit: ScuAuditoriaInSituModel): void {
    this.recentAudits.unshift(audit);
  }

  private _initialize(): void {
    this._loadRecentAudits();
  }

  private _finalize(): void {
    // Cleanup
  }

  private _loadRecentAudits(): void {
    this.recentAudits = [
      {
        id: 100,
        asignacionId: 1,
        asignaturaNombre: 'Programación III',
        docenteNombre: 'Carlos Montaño Pérez',
        carreraNombre: 'Ingeniería de Sistemas',
        sedeNombre: 'Cochabamba',
        aula: 'Lab-302',
        puntualidadDocente: 'PUNTUAL',
        concordanciaTema: 'CONFORME_PAC',
        momentoObservado: 'DESARROLLO',
        estudiantesPresentes: 30,
        estudiantesInscritos: 32,
        porcentajeAsistencia: 93.75,
        estado: ScuAuditStatusEnum.FINALIZADA_CONFORME,
        hashFirmaDigital: '7d8b5a8e3f2c1b0a9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c',
        fechaHoraAuditoria: '2026-08-25T08:45:00Z'
      }
    ];
  }
}
