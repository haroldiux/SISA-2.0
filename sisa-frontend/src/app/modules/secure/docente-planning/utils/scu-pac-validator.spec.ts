import { ScuPacModel, ScuSesionMatriz7Model } from '@shared/models/scu-pac.model';
import { ScuPlanningStatusEnum } from '@shared/enums/scu-planning-status.enum';
import { ScuPacValidator } from './scu-pac-validator';

describe('ScuPacValidator', () => {

  const createCanonicalPac = (): ScuPacModel => {
    const sesiones: ScuSesionMatriz7Model[] = [];
    for (let s = 1; s <= 38; s++) {
      const sem = Math.min(20, Math.ceil(s / 2));
      const hito = (s === 14) ? 'PRIMER_PARCIAL' : (s === 28) ? 'SEGUNDO_PARCIAL' : (s === 38) ? 'EXAMEN_FINAL' : 'REGULAR';
      const inst = (hito !== 'REGULAR') ? 'PRUEBA_ESCRITA' : 'RUBRICA';

      sesiones.push({
        semana: sem,
        nroSesion: s,
        fechaProgramada: `2026-03-${s < 10 ? '0' + s : s}`,
        tipoSesion: (s % 2 === 0) ? 'PRACTICA' : 'TEORICA',
        unidadTematica: `Unidad ${Math.min(5, Math.ceil(sem / 4))}`,
        contenidoEspecifico: `Contenido específico de la sesión #${s}`,
        saberConceptual: 'Saberes conceptuales fundamentales',
        saberProcedimental: 'Procedimientos y desarrollo práctico',
        saberActitudinal: 'Actitud responsable y colaborativa',
        criterioDesempeno: 'Desempeño demostrado según rúbrica',
        evidenciaAprendizaje: `Evidencia entregable de sesión ${s}`,
        instrumentoEvaluacion: inst,
        hitoEvaluativo: hito
      });
    }

    return {
      asignacionId: 101,
      estado: ScuPlanningStatusEnum.BORRADOR,
      matriz7: sesiones
    };
  };

  it('should pass validation for a canonical 38-session PAC with all 3 milestones', () => {
    const pac = createCanonicalPac();
    const result = ScuPacValidator.validate(pac);

    expect(result.isValid).toBeTrue();
    expect(result.hasErrors).toBeFalse();
    expect(result.totalErrors).toBe(0);
    expect(result.milestonesFound.primerParcial).toBeTrue();
    expect(result.milestonesFound.segundoParcial).toBeTrue();
    expect(result.milestonesFound.examenFinal).toBeTrue();
  });

  it('should flag ERROR when Primer Parcial is missing', () => {
    const pac = createCanonicalPac();
    pac.matriz7[13].hitoEvaluativo = 'REGULAR'; // Session 14 was Primer Parcial

    const result = ScuPacValidator.validate(pac);

    expect(result.isValid).toBeFalse();
    expect(result.hasErrors).toBeTrue();
    expect(result.milestonesFound.primerParcial).toBeFalse();
    expect(result.issues.some(i => i.id === 'val-02-missing-pp')).toBeTrue();
  });

  it('should flag ERROR when Segundo Parcial is placed in week 3 instead of week 14', () => {
    const pac = createCanonicalPac();
    pac.matriz7[5].hitoEvaluativo = 'SEGUNDO_PARCIAL'; // Session 6, Week 3
    pac.matriz7[27].hitoEvaluativo = 'REGULAR'; // Remove from Week 14

    const result = ScuPacValidator.validate(pac);

    expect(result.hasErrors).toBeTrue();
    expect(result.issues.some(i => i.id === 'val-02-pos-sp-6')).toBeTrue();
  });

  it('should flag ERROR when session date is earlier than preceding session date (chronology inversion)', () => {
    const pac = createCanonicalPac();
    pac.matriz7[4].fechaProgramada = '2026-03-15';
    pac.matriz7[5].fechaProgramada = '2026-03-10'; // Inversion

    const result = ScuPacValidator.validate(pac);

    expect(result.hasErrors).toBeTrue();
    expect(result.issues.some(i => i.ruleCode === 'VAL-01-CHRONOLOGY' && i.sessionNumber === 6)).toBeTrue();
  });

  it('should flag ERROR when date is empty or outside semester bounds', () => {
    const pac = createCanonicalPac();
    pac.matriz7[0].fechaProgramada = '';
    pac.matriz7[1].fechaProgramada = '2025-12-01'; // Out of bounds

    const result = ScuPacValidator.validate(pac);

    expect(result.hasErrors).toBeTrue();
    expect(result.issues.some(i => i.id === 'val-01-empty-date-1')).toBeTrue();
    expect(result.issues.some(i => i.id === 'val-01-range-2')).toBeTrue();
  });

  it('should flag ERROR when evaluative milestone has instrument N_A or empty evidence', () => {
    const pac = createCanonicalPac();
    pac.matriz7[13].instrumentoEvaluacion = 'N_A';
    pac.matriz7[13].evidenciaAprendizaje = '';

    const result = ScuPacValidator.validate(pac);

    expect(result.hasErrors).toBeTrue();
    expect(result.issues.some(i => i.id === 'val-04-inst-14')).toBeTrue();
    expect(result.issues.some(i => i.id === 'val-04-evid-14')).toBeTrue();
  });

  it('should flag WARNING when tripartite saberes or unit fields are empty', () => {
    const pac = createCanonicalPac();
    pac.matriz7[2].saberConceptual = '';
    pac.matriz7[2].unidadTematica = '';

    const result = ScuPacValidator.validate(pac);

    expect(result.hasWarnings).toBeTrue();
    expect(result.issues.some(i => i.id === 'val-03-saberConceptual-3')).toBeTrue();
    expect(result.issues.some(i => i.id === 'val-03-unidadTematica-3')).toBeTrue();
  });

  it('should flag WARNING when total sessions count is under 36 or over 54', () => {
    const pacLow = createCanonicalPac();
    pacLow.matriz7 = pacLow.matriz7.slice(0, 20); // 20 sessions

    const resultLow = ScuPacValidator.validate(pacLow);
    expect(resultLow.hasWarnings).toBeTrue();
    expect(resultLow.issues.some(i => i.id === 'val-05-min-density')).toBeTrue();

    const pacHigh = createCanonicalPac();
    const extraSessions = [...pacHigh.matriz7];
    for (let i = 39; i <= 60; i++) {
      extraSessions.push({ ...extraSessions[0], nroSesion: i, fechaProgramada: '2026-06-01' });
    }
    pacHigh.matriz7 = extraSessions;

    const resultHigh = ScuPacValidator.validate(pacHigh);
    expect(resultHigh.hasWarnings).toBeTrue();
    expect(resultHigh.issues.some(i => i.id === 'val-05-max-density')).toBeTrue();
  });

  it('should handle null or undefined PAC safely', () => {
    const resultNull = ScuPacValidator.validate(null);
    expect(resultNull.isValid).toBeFalse();
    expect(resultNull.hasErrors).toBeTrue();

    const resultUndef = ScuPacValidator.validate(undefined);
    expect(resultUndef.isValid).toBeFalse();
  });
});
