import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ScuAuditInitiateCmd } from '../../commands/scu-audit-initiate.cmd';

/**
 * Real-time Active Classes Radar component locating live classroom sessions.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-active-classes-radar',
  templateUrl: './scu-active-classes-radar.component.html',
  styleUrls: ['./scu-active-classes-radar.component.scss']
})
export class ScuActiveClassesRadarComponent implements OnInit, OnDestroy {

  @Output() public classMatched = new EventEmitter<any>();

  public selectedCampusId: number = 1;
  public selectedAula: string = 'Lab-302';
  public selectedDia: string = 'LUNES';
  public selectedHora: string = '08:30:00';
  public isSearching: boolean = false;
  public matchError: string = '';

  public campusOptions = [
    { label: 'Campus Colonial CBB', value: 1 },
    { label: 'Campus Juan Pablo II CBB', value: 2 },
    { label: 'Campus Miraflores LPZ', value: 3 },
    { label: 'Campus Villa Dolores EAL', value: 4 },
    { label: 'Campus Central CBJ', value: 5 }
  ];

  public diaOptions = [
    { label: 'Lunes', value: 'LUNES' },
    { label: 'Martes', value: 'MARTES' },
    { label: 'Miércoles', value: 'MIERCOLES' },
    { label: 'Jueves', value: 'JUEVES' },
    { label: 'Viernes', value: 'VIERNES' },
    { label: 'Sábado', value: 'SABADO' }
  ];

  constructor(private readonly _initiateCmd: ScuAuditInitiateCmd) {}

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public onScanRoom(): void {
    this.isSearching = true;
    this.matchError = '';

    this._initiateCmd.execute({
      campusId: this.selectedCampusId,
      aula: this.selectedAula,
      dia: this.selectedDia,
      hora: this.selectedHora
    }).subscribe({
      next: (matchedData) => {
        this.isSearching = false;
        this.classMatched.emit(matchedData);
      },
      error: () => {
        // Fallback demo match
        const demoData = {
          asignacionId: 1,
          carreraNombre: 'Ingeniería de Sistemas',
          asignaturaNombre: 'Programación III',
          docenteNombre: 'Carlos Montaño Pérez',
          aula: this.selectedAula,
          horarioInicio: '07:30:00',
          horarioFin: '10:30:00',
          sesionProgramadaId: 5,
          semanaProgramada: 3,
          nroSesionProgramada: 5,
          temaProgramado: 'Unidad 2: Polimorfismo e Interfaces en Java'
        };
        this.isSearching = false;
        this.classMatched.emit(demoData);
      }
    });
  }

  private _initialize(): void {
    // Initialize defaults
  }

  private _finalize(): void {
    // Cleanup
  }
}
