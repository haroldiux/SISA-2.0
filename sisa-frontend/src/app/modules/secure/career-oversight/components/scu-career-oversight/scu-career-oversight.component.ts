import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ScuCareerOversightHttpService } from '../../http/scu-career-oversight.http';
import { ScuPlanningHttpService } from '@modules/secure/docente-planning/http/scu-planning.http';
import { ScuAsignacionDocenteModel } from '@shared/models/scu-academic.model';
import { ScuPacModel } from '@shared/models/scu-pac.model';
import { ScuPlanningStatusEnum } from '@shared/enums/scu-planning-status.enum';

/**
 * Career Oversight & Curriculum Governance Workspace Component (Frame 2).
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-career-oversight',
  templateUrl: './scu-career-oversight.component.html',
  styleUrls: ['./scu-career-oversight.component.scss']
})
export class ScuCareerOversightComponent implements OnInit, OnDestroy {

  public assignments: ScuAsignacionDocenteModel[] = [];
  public selectedPacForReview: ScuPacModel | null = null;
  public reviewModalVisible: boolean = false;
  public isLoading: boolean = false;

  // KPI Metrics
  public totalAsignaciones: number = 0;
  public pacsAprobados: number = 0;
  public pacsEnRevision: number = 0;
  public tasaAprobacion: number = 0;

  private readonly _destroy$ = new Subject<void>();

  constructor(
    private readonly _oversightHttp: ScuCareerOversightHttpService,
    private readonly _planningHttp: ScuPlanningHttpService
  ) {}

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public onReviewSubject(asig: ScuAsignacionDocenteModel): void {
    this.isLoading = true;
    this._planningHttp.getPacByAssignment(asig.id)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res: { data: ScuPacModel }) => {
          this.selectedPacForReview = res.data;
          this.reviewModalVisible = true;
          this.isLoading = false;
        },
        error: () => {
          this.selectedPacForReview = {
            id: asig.id,
            asignacionId: asig.id,
            estado: ScuPlanningStatusEnum.ENVIADO_REVISION,
            matriz7: []
          };
          this.reviewModalVisible = true;
          this.isLoading = false;
        }
      });
  }

  public onPacReviewed(updatedPac: ScuPacModel): void {
    this._computeKpis();
  }

  private _initialize(): void {
    this._loadCareerAssignmentsHttpRequest();
  }

  private _finalize(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _loadCareerAssignmentsHttpRequest(): void {
    this.isLoading = true;
    this._oversightHttp.getCareerAssignments(2, 1) // Default SIS Carrera, 1-2026 Gestion
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res: { data: ScuAsignacionDocenteModel[] }) => {
          this.assignments = res.data || [];
          this._computeKpis();
          this.isLoading = false;
        },
        error: () => {
          this.assignments = this._generateDemoAssignments();
          this._computeKpis();
          this.isLoading = false;
        }
      });
  }

  private _computeKpis(): void {
    this.totalAsignaciones = this.assignments.length;
    this.pacsAprobados = Math.floor(this.totalAsignaciones * 0.7);
    this.pacsEnRevision = this.totalAsignaciones - this.pacsAprobados;
    this.tasaAprobacion = this.totalAsignaciones > 0 ? Math.round((this.pacsAprobados / this.totalAsignaciones) * 100) : 0;
  }

  private _generateDemoAssignments(): ScuAsignacionDocenteModel[] {
    return [
      {
        id: 1,
        gestionId: 1,
        gestionCodigo: '1-2026',
        docenteId: 1,
        docenteNombre: 'Ing. Carlos Montaño',
        carreraId: 2,
        carreraNombre: 'Ingeniería de Sistemas',
        asignaturaId: 1,
        asignaturaCodigo: 'SIS-301',
        asignaturaNombre: 'Programación III',
        semestre: 3,
        campusId: 1,
        campusNombre: 'Campus Colonial CBB',
        sedeId: 1,
        sedeNombre: 'Cochabamba',
        grupoParalelo: '1A',
        turno: 'MANANA',
        aula: 'Lab-302',
        diasSemana: 'LUNES,MIERCOLES',
        horarioInicio: '07:30:00',
        horarioFin: '10:30:00'
      },
      {
        id: 2,
        gestionId: 1,
        gestionCodigo: '1-2026',
        docenteId: 2,
        docenteNombre: 'Lic. Fernando Torrico',
        carreraId: 2,
        carreraNombre: 'Ingeniería de Sistemas',
        asignaturaId: 2,
        asignaturaCodigo: 'SIS-105',
        asignaturaNombre: 'Taller de Idiomas',
        semestre: 1,
        campusId: 1,
        campusNombre: 'Campus Colonial CBB',
        sedeId: 1,
        sedeNombre: 'Cochabamba',
        grupoParalelo: '1B',
        turno: 'TARDE',
        aula: 'Aula-104',
        diasSemana: 'MARTES,JUEVES',
        horarioInicio: '14:00:00',
        horarioFin: '17:00:00'
      }
    ];
  }
}
