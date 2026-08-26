import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ScuAsignacionDocenteModel } from '@shared/models/scu-academic.model';

export interface CohortRow {
  semestre: number;
  totalMaterias: number;
  pacsAprobados: number;
  pacsPendientes: number;
  cumplimientoPorcentaje: number;
  materias: ScuAsignacionDocenteModel[];
}

/**
 * Cohort curriculum progress tracking component (1st to 10th semester).
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-cohort-progress-table',
  templateUrl: './scu-cohort-progress-table.component.html',
  styleUrls: ['./scu-cohort-progress-table.component.scss']
})
export class ScuCohortProgressTableComponent implements OnInit, OnDestroy {

  @Input() public assignments: ScuAsignacionDocenteModel[] = [];
  @Output() public selectSubject = new EventEmitter<ScuAsignacionDocenteModel>();

  public cohortData: CohortRow[] = [];

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public onSelectSubject(item: ScuAsignacionDocenteModel): void {
    this.selectSubject.emit(item);
  }

  private _initialize(): void {
    this._computeCohorts();
  }

  private _finalize(): void {
    // Cleanup
  }

  private _computeCohorts(): void {
    const map = new Map<number, ScuAsignacionDocenteModel[]>();
    for (let sem = 1; sem <= 10; sem++) {
      map.set(sem, []);
    }

    for (const a of this.assignments) {
      const list = map.get(a.semestre) || [];
      list.push(a);
      map.set(a.semestre, list);
    }

    this.cohortData = [];
    for (let sem = 1; sem <= 10; sem++) {
      const mats = map.get(sem) || [];
      const total = mats.length;
      const aprob = Math.floor(total * 0.75); // Mocked progress distribution
      const pend = total - aprob;
      const pct = total > 0 ? Math.round((aprob / total) * 100) : 100;

      this.cohortData.push({
        semestre: sem,
        totalMaterias: total,
        pacsAprobados: aprob,
        pacsPendientes: pend,
        cumplimientoPorcentaje: pct,
        materias: mats
      });
    }
  }
}
