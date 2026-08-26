import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ScuAsignacionDocenteModel, ScuGestionModel } from '@shared/models/scu-academic.model';

/**
 * Global Academic session and current assignment context service.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuSessionService {

  public readonly activeGestion$: Observable<ScuGestionModel | null>;
  public readonly selectedAssignment$: Observable<ScuAsignacionDocenteModel | null>;

  private readonly _activeGestionSubject: BehaviorSubject<ScuGestionModel | null>;
  private readonly _selectedAssignmentSubject: BehaviorSubject<ScuAsignacionDocenteModel | null>;

  constructor() {
    this._activeGestionSubject = new BehaviorSubject<ScuGestionModel | null>({
      id: 1,
      codigo: '1-2026',
      fechaInicio: '2026-02-02',
      fechaFin: '2026-06-30',
      estado: 'EN_CURSO'
    });
    this._selectedAssignmentSubject = new BehaviorSubject<ScuAsignacionDocenteModel | null>({
      id: 1,
      gestionId: 1,
      gestionCodigo: '1-2026',
      docenteId: 1,
      docenteNombre: 'Carlos Montaño Pérez',
      carreraId: 2,
      carreraNombre: 'Ingeniería de Sistemas',
      asignaturaId: 1,
      asignaturaCodigo: 'SIS-301',
      asignaturaNombre: 'Programación III',
      semestre: 3,
      campusId: 1,
      campusNombre: 'Campus Colonial CBB',
      sedeId: 1,
      sedeNombre: 'Sede Central Cochabamba',
      grupoParalelo: '1A',
      turno: 'MANANA',
      aula: 'Lab-302',
      diasSemana: 'LUNES,MIERCOLES',
      horarioInicio: '07:30:00',
      horarioFin: '10:30:00'
    });

    this.activeGestion$ = this._activeGestionSubject.asObservable();
    this.selectedAssignment$ = this._selectedAssignmentSubject.asObservable();
  }

  public setActiveGestion(gestion: ScuGestionModel): void {
    this._activeGestionSubject.next(gestion);
  }

  public setSelectedAssignment(assignment: ScuAsignacionDocenteModel): void {
    this._selectedAssignmentSubject.next(assignment);
  }

  public get selectedAssignmentValue(): ScuAsignacionDocenteModel | null {
    return this._selectedAssignmentSubject.value;
  }

  public getActiveSedeId(): number | null {
    return this._selectedAssignmentSubject.value?.sedeId ?? null;
  }
}
