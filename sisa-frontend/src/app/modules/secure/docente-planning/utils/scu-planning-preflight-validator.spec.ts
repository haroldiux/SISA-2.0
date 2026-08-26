import { ScuPlanningPreflightValidator } from './scu-planning-preflight-validator';
import { ScuProgramaAnaliticoModel } from '@shared/models/scu-programa-analitico.model';
import { ScuPacModel, ScuSesionMatriz7Model } from '@shared/models/scu-pac.model';
import { ScuPlanClaseModel } from '@shared/models/scu-plan-clase.model';
import { ScuPlanningStatusEnum } from '@shared/enums/scu-planning-status.enum';

describe('ScuPlanningPreflightValidator', () => {

  const createValidPrograma = (): ScuProgramaAnaliticoModel => ({
    asignacionId: 1,
    estado: ScuPlanningStatusEnum.BORRADOR,
    caracterizacion: 'Asignatura troncal de formación profesional para desarrollo de software.',
    macroCompetencia: 'Diseña, modela e implementa arquitecturas de software empresariales escalables.',
    sistemaEvaluacion: 'Evaluación formativa y sumativa por competencias.',
    unidades: [
      {
        numeroUnidad: 1,
        titulo: 'Unidad 1: Arquitectura de Software',
        saberesConceptuales: 'Principios SOLID, patrones y modularidad.',
        saberesProcedimentales: 'Implementación práctica de arquitecturas desacopladas.',
        saberesActitudinales: 'Rigor técnico, calidad y ética.',
        criteriosDesempeno: 'Escribe código modular testeable.',
        horasAcademicas: 24
      }
    ],
    bibliografia: [
      {
        tipo: 'BASICA',
        citaApa: 'Sommerville, I. (2019). Software Engineering (10th ed.). Pearson.'
      }
    ]
  });

  const createValidPac = (numSessions = 38): ScuPacModel => {
    const sesiones: ScuSesionMatriz7Model[] = [];
    for (let s = 1; s <= numSessions; s++) {
      const sem = Math.min(20, Math.ceil(s / 2));
      const hito = (s === 14) ? 'PRIMER_PARCIAL' : (s === 28) ? 'SEGUNDO_PARCIAL' : (s === 38) ? 'EXAMEN_FINAL' : 'REGULAR';
      const inst = (hito !== 'REGULAR') ? 'PRUEBA_ESCRITA' : 'RUBRICA';

      sesiones.push({
        semana: sem,
        nroSesion: s,
        fechaProgramada: `2026-03-${s < 10 ? '0' + s : s}`,
        tipoSesion: 'TEORICA',
        unidadTematica: `Unidad 1: Sesión #${s}`,
        contenidoEspecifico: `Contenido de sesión #${s}`,
        saberConceptual: 'Saberes conceptuales',
        saberProcedimental: 'Saberes procedimentales',
        saberActitudinal: 'Saberes actitudinales',
        criterioDesempeno: 'Criterio observable',
        evidenciaAprendizaje: `Guía #${s} completada`,
        instrumentoEvaluacion: inst,
        hitoEvaluativo: hito
      });
    }

    return {
      asignacionId: 1,
      estado: ScuPlanningStatusEnum.BORRADOR,
      matriz7: sesiones
    };
  };

  const createValidPlanesMap = (pac: ScuPacModel): Map<number, ScuPlanClaseModel> => {
    const map = new Map<number, ScuPlanClaseModel>();
    (pac.matriz7 || []).forEach(s => {
      map.set(s.nroSesion, {
        sesionId: s.nroSesion,
        nroSesion: s.nroSesion,
        semana: s.semana,
        estado: ScuPlanningStatusEnum.BORRADOR,
        duracionTotalMin: 180,
        objetivoSesion: `Objetivo de sesión #${s.nroSesion}`,
        momentos: [
          {
            tipoMomento: 'INICIO',
            duracionMin: 25,
            actividadesDocente: 'Motivación',
            actividadesEstudiante: 'Participación',
            indicadorEvaluacion: 'Diagnóstico'
          },
          {
            tipoMomento: 'DESARROLLO',
            duracionMin: 100,
            actividadesDocente: 'Exposición',
            actividadesEstudiante: 'Taller',
            indicadorEvaluacion: 'Formativa'
          },
          {
            tipoMomento: 'CIERRE',
            duracionMin: 55,
            actividadesDocente: 'Síntesis',
            actividadesEstudiante: 'Conclusiones',
            indicadorEvaluacion: 'Sumativa'
          }
        ]
      });
    });
    return map;
  };

  it('should pass audit when all 3 pillars are complete and valid', () => {
    const prog = createValidPrograma();
    const pac = createValidPac(38);
    const planes = createValidPlanesMap(pac);

    const result = ScuPlanningPreflightValidator.audit(prog, pac, planes);

    expect(result.isEligible).toBeTrue();
    expect(result.pillar1Programa.isValid).toBeTrue();
    expect(result.pillar2Pac.isValid).toBeTrue();
    expect(result.pillar3PlanClase.isValid).toBeTrue();
    expect(result.issues.length).toBe(0);
  });

  it('should fail Pillar 1 when Programa Analitico has no basic bibliography', () => {
    const prog = createValidPrograma();
    prog.bibliografia = [];
    const pac = createValidPac(38);
    const planes = createValidPlanesMap(pac);

    const result = ScuPlanningPreflightValidator.audit(prog, pac, planes);

    expect(result.isEligible).toBeFalse();
    expect(result.pillar1Programa.isValid).toBeFalse();
    expect(result.issues.some(i => i.pillar === 'PROGRAMA')).toBeTrue();
  });

  it('should fail Pillar 3 when any session microplan duration is imbalanced', () => {
    const prog = createValidPrograma();
    const pac = createValidPac(38);
    const planes = createValidPlanesMap(pac);

    // Make Session 5 imbalanced (200 min)
    const plan5 = planes.get(5)!;
    plan5.momentos.find(m => m.tipoMomento === 'DESARROLLO')!.duracionMin = 120; // 25 + 120 + 55 = 200

    const result = ScuPlanningPreflightValidator.audit(prog, pac, planes);

    expect(result.isEligible).toBeFalse();
    expect(result.pillar3PlanClase.isValid).toBeFalse();
    expect(result.issues.some(i => i.pillar === 'PLAN_CLASE' && i.sessionNumber === 5)).toBeTrue();
  });

  it('should fail Pillar 3 when a session microplan is missing', () => {
    const prog = createValidPrograma();
    const pac = createValidPac(38);
    const planes = createValidPlanesMap(pac);
    planes.delete(10); // Remove Session 10 plan

    const result = ScuPlanningPreflightValidator.audit(prog, pac, planes);

    expect(result.isEligible).toBeFalse();
    expect(result.pillar3PlanClase.isValid).toBeFalse();
    expect(result.issues.some(i => i.pillar === 'PLAN_CLASE' && i.sessionNumber === 10)).toBeTrue();
  });
});
