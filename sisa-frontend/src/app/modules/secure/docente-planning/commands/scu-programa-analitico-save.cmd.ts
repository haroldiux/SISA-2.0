import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { ScuPlanningHttpService } from '../http/scu-planning.http';
import { ScuProgramaAnaliticoModel } from '@shared/models/scu-programa-analitico.model';
import { ScuApaValidator } from '../utils/scu-apa-validator';

/**
 * Command for validating macrocompetencies, units, and APA citations before persisting Programa Analítico.
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class ScuProgramaAnaliticoSaveCmd {

  constructor(private readonly _planningHttp: ScuPlanningHttpService) {}

  public execute(programa: ScuProgramaAnaliticoModel): Observable<ScuProgramaAnaliticoModel> {
    if (!programa) {
      return throwError(() => new Error('Programa analítico no definido.'));
    }

    if (!programa.macroCompetencia || programa.macroCompetencia.trim().length < 20) {
      return throwError(() => new Error('La Macro-Competencia debe contener al menos 20 caracteres.'));
    }

    if (!programa.unidades || programa.unidades.length === 0) {
      return throwError(() => new Error('Debe registrar al menos 1 Unidad de Aprendizaje.'));
    }

    if (programa.unidades.length > 12) {
      return throwError(() => new Error('El Programa Analítico no puede exceder 12 Unidades de Aprendizaje.'));
    }

    const bibValidation = ScuApaValidator.validateBibliographyList(programa.bibliografia || []);
    if (!bibValidation.hasBasica || bibValidation.validBasicaCount === 0) {
      return throwError(() => new Error('Debe incluir al menos 1 Bibliografía Básica en formato válido APA 7.'));
    }

    return this._planningHttp.saveProgramaAnalitico(programa).pipe(
      map(res => res.data)
    );
  }
}
