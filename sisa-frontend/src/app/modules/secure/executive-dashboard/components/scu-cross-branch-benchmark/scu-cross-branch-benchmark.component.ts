import { Component, OnInit, OnDestroy } from '@angular/core';

export interface SedeBenchmark {
  codigo: string;
  nombre: string;
  docentes: number;
  carreras: number;
  coberturaPac: number;
  auditoriasRealizadas: number;
  indiceConformidad: number;
  casosEscalados: number;
}

/**
 * Cross-Branch (4 Sedes) Institutional Benchmark Component.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-cross-branch-benchmark',
  templateUrl: './scu-cross-branch-benchmark.component.html',
  styleUrls: ['./scu-cross-branch-benchmark.component.scss']
})
export class ScuCrossBranchBenchmarkComponent implements OnInit, OnDestroy {

  public benchmarkList: SedeBenchmark[] = [];

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  private _initialize(): void {
    this.benchmarkList = [
      {
        codigo: 'CBB',
        nombre: 'Sede Central Cochabamba',
        docentes: 240,
        carreras: 12,
        coberturaPac: 96.5,
        auditoriasRealizadas: 380,
        indiceConformidad: 95.8,
        casosEscalados: 1
      },
      {
        codigo: 'LPZ',
        nombre: 'Sede Regional La Paz',
        docentes: 135,
        carreras: 8,
        coberturaPac: 93.2,
        auditoriasRealizadas: 175,
        indiceConformidad: 93.1,
        casosEscalados: 0
      },
      {
        codigo: 'EAL',
        nombre: 'Sede Regional El Alto',
        docentes: 110,
        carreras: 7,
        coberturaPac: 91.8,
        auditoriasRealizadas: 140,
        indiceConformidad: 92.4,
        casosEscalados: 0
      },
      {
        codigo: 'CBJ',
        nombre: 'Sede Regional Cobija',
        docentes: 39,
        carreras: 4,
        coberturaPac: 94.0,
        auditoriasRealizadas: 47,
        indiceConformidad: 96.2,
        casosEscalados: 0
      }
    ];
  }

  private _finalize(): void {
    // Cleanup
  }
}
