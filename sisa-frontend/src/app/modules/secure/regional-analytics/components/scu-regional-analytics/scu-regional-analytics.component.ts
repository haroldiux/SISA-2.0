import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ScuRegionalHttpService } from '../../http/scu-regional.http';
import { ScuReincidenciaModel } from '@shared/models/scu-audit.model';

/**
 * Regional Analytics & Disciplinary Governance Workspace Component (Frame 4).
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-regional-analytics',
  templateUrl: './scu-regional-analytics.component.html',
  styleUrls: ['./scu-regional-analytics.component.scss']
})
export class ScuRegionalAnalyticsComponent implements OnInit, OnDestroy {

  public recurrences: ScuReincidenciaModel[] = [];
  public isLoading: boolean = false;

  private readonly _destroy$ = new Subject<void>();

  constructor(private readonly _regionalHttp: ScuRegionalHttpService) {}

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public onRecurrenceResolved(id: number | undefined): void {
    if (id) {
      const target = this.recurrences.find(r => r.id === id);
      if (target) {
        target.estado = 'SUBSANADO';
      }
    }
  }

  private _initialize(): void {
    this._loadRecurrences();
  }

  private _finalize(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _loadRecurrences(): void {
    this.isLoading = true;
    this._regionalHttp.getRecurrences(1)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this.recurrences = res.data || [];
          this.isLoading = false;
        },
        error: () => {
          this.recurrences = this._generateDemoRecurrences();
          this.isLoading = false;
        }
      });
  }

  private _generateDemoRecurrences(): ScuReincidenciaModel[] {
    return [
      {
        id: 1,
        docenteId: 10,
        docenteNombre: 'Lic. Juan Carlos Miranda',
        gestionId: 1,
        gestionCodigo: '1-2026',
        nroInfraccion: 1,
        nivel: 'NIVEL_1',
        motivo: 'Atraso grave (> 20 min) registrado en auditoría in situ #42',
        estado: 'NOTIFICADO',
        creadoEn: '2026-02-18T09:30:00Z'
      },
      {
        id: 2,
        docenteId: 12,
        docenteNombre: 'Ing. Marcelo Villarroel',
        gestionId: 1,
        gestionCodigo: '1-2026',
        nroInfraccion: 2,
        nivel: 'NIVEL_2',
        motivo: 'Desviación de contenido: Tema no planificado en sesión #14',
        estado: 'PLAN_ACCION_REQUERIDO',
        planAccionId: 1,
        planCompromisoMejora: 'Compromiso formal de nivelación didáctica y recuperación de 2 horas de laboratorio.',
        planFechaLimite: '2026-03-30',
        planEstado: 'PENDIENTE_APROBACION',
        creadoEn: '2026-02-20T14:15:00Z'
      },
      {
        id: 3,
        docenteId: 15,
        docenteNombre: 'Dr. Roberto Zambrana',
        gestionId: 1,
        gestionCodigo: '1-2026',
        nroInfraccion: 3,
        nivel: 'NIVEL_3',
        motivo: 'Inasistencia injustificada reiterada en 3 ocasiones sucesivas',
        estado: 'ESCALADO_VICERRECTORADO',
        creadoEn: '2026-02-22T11:00:00Z'
      }
    ];
  }
}
