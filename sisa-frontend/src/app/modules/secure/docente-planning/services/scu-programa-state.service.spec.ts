import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { ScuProgramaStateService } from './scu-programa-state.service';
import { ScuPlanningHttpService } from '../http/scu-planning.http';
import { ScuProgramaAnaliticoModel } from '@shared/models/scu-programa-analitico.model';
import { ScuPlanningStatusEnum } from '@shared/enums/scu-planning-status.enum';

describe('ScuProgramaStateService', () => {
  let service: ScuProgramaStateService;
  let httpSpy: jasmine.SpyObj<ScuPlanningHttpService>;

  const mockPrograma: ScuProgramaAnaliticoModel = {
    asignacionId: 1,
    estado: ScuPlanningStatusEnum.BORRADOR,
    caracterizacion: 'Caracterización de asignatura',
    macroCompetencia: 'Macrocompetencia profesional',
    sistemaEvaluacion: 'Sistema de evaluación',
    unidades: [
      {
        numeroUnidad: 1,
        titulo: 'Unidad 1: POO Avanzada',
        saberesConceptuales: 'Conceptos',
        saberesProcedimentales: 'Procedimientos',
        saberesActitudinales: 'Actitudes',
        criteriosDesempeno: 'Criterios',
        horasAcademicas: 20
      }
    ],
    bibliografia: [
      {
        tipo: 'BASICA',
        citaApa: 'Sommerville, I. (2019). Software Engineering (10th ed.). Pearson.'
      }
    ]
  };

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('ScuPlanningHttpService', ['getProgramaAnalitico', 'saveProgramaAnalitico']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ScuProgramaStateService,
        { provide: ScuPlanningHttpService, useValue: httpSpy }
      ]
    });

    service = TestBed.inject(ScuProgramaStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a learning unit and re-index sequence', () => {
    service.setPrograma(mockPrograma);
    service.addUnit();

    const prog = service.currentPrograma;
    expect(prog?.unidades.length).toBe(2);
    expect(prog?.unidades[1].numeroUnidad).toBe(2);
  });

  it('should remove a unit and re-index remaining sequentially', () => {
    service.setPrograma(mockPrograma);
    service.addUnit(); // 2 units now
    service.addUnit(); // 3 units now

    service.removeUnit(0); // Remove unit 1

    const prog = service.currentPrograma;
    expect(prog?.unidades.length).toBe(2);
    expect(prog?.unidades[0].numeroUnidad).toBe(1);
    expect(prog?.unidades[1].numeroUnidad).toBe(2);
  });

  it('should reorder units and update numbers', () => {
    service.setPrograma(mockPrograma);
    service.addUnit(); // Unit 2

    const progBefore = service.currentPrograma!;
    progBefore.unidades[0].titulo = 'Primero';
    progBefore.unidades[1].titulo = 'Segundo';

    service.reorderUnits(0, 1);

    const progAfter = service.currentPrograma!;
    expect(progAfter.unidades[0].titulo).toBe('Segundo');
    expect(progAfter.unidades[0].numeroUnidad).toBe(1);
    expect(progAfter.unidades[1].titulo).toBe('Primero');
    expect(progAfter.unidades[1].numeroUnidad).toBe(2);
  });

  it('should enforce minimum 1 unit (cannot remove when length == 1)', () => {
    service.setPrograma(mockPrograma);
    service.removeUnit(0);

    expect(service.currentPrograma?.unidades.length).toBe(1);
  });

  it('should add, update, and remove APA bibliography entries', () => {
    service.setPrograma(mockPrograma);

    service.addBibliography({
      tipo: 'COMPLEMENTARIA',
      citaApa: 'Martin, R. C. (2017). Clean Architecture. Prentice Hall.'
    });

    expect(service.currentPrograma?.bibliografia.length).toBe(2);
    expect(service.currentApaValidation.validTotalCount).toBe(2);

    service.removeBibliography(1);
    expect(service.currentPrograma?.bibliografia.length).toBe(1);
  });
});
