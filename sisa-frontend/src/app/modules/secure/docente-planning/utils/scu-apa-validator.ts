import {
  ScuBibliografiaModel,
  ScuApaValidationItemResultModel,
  ScuApaValidationSummaryModel
} from '@shared/models/scu-programa-analitico.model';

/**
 * Pure regex and syntax validator for APA 7th Edition bibliographic citations.
 *
 * Pattern standard: Author(s) (Year). Title of work (edition/extra). Publisher/Source. [DOI/URL]
 *
 * @author GentleAI SISA Architecture Team
 */
export class ScuApaValidator {
  public static readonly APA_7_REGEX =
    /^([A-ZÁÉÍÓÚÑa-záéíóúñ0-9\s\.\,\&\-]+)\s\((\d{4}[a-z]?)\)\.\s+(.+?)\.\s+([A-ZÁÉÍÓÚÑa-záéíóúñ0-9\s\.\,\&\-]+?)(?:\.\s*(https?:\/\/[^\s]+|doi:[^\s]+))?\.?$/;

  public static validateCitation(citation: string | null | undefined): ScuApaValidationItemResultModel {
    if (!citation || citation.trim().length === 0) {
      return {
        citation: citation || '',
        isValid: false,
        errorMessage: 'La cita bibliográfica no puede estar vacía.'
      };
    }

    const trimmed = citation.trim();
    const match = trimmed.match(ScuApaValidator.APA_7_REGEX);

    if (!match) {
      return {
        citation: trimmed,
        isValid: false,
        errorMessage: 'Formato inválido. Estructura esperada: Autor, A. A. (Año). Título de la obra. Editorial. [DOI/URL]'
      };
    }

    return {
      citation: trimmed,
      isValid: true,
      authorMatched: match[1].trim(),
      yearMatched: parseInt(match[2], 10),
      titleMatched: match[3].trim(),
      publisherMatched: match[4].trim(),
      urlOrDoiMatched: match[5] ? match[5].trim() : undefined
    };
  }

  public static validateBibliographyList(
    list: ScuBibliografiaModel[] = []
  ): ScuApaValidationSummaryModel {
    const safeList = list || [];
    const basica = safeList.filter(b => b.tipo === 'BASICA');
    const validBasica = basica.filter(b => ScuApaValidator.validateCitation(b.citaApa).isValid);
    const validTotal = safeList.filter(b => ScuApaValidator.validateCitation(b.citaApa).isValid);

    const hasBasica = basica.length > 0;
    const allValid = safeList.length > 0 && validTotal.length === safeList.length && validBasica.length > 0;

    return {
      hasBasica,
      validBasicaCount: validBasica.length,
      validTotalCount: validTotal.length,
      allValid
    };
  }

  public static buildCitation(params: {
    authors: string;
    year: string | number;
    title: string;
    edition?: string;
    publisher: string;
    urlOrDoi?: string;
  }): string {
    const authors = (params.authors || '').trim();
    const year = (params.year || '').toString().trim();
    let title = (params.title || '').trim();
    if (params.edition && params.edition.trim()) {
      const ed = params.edition.trim();
      title += ` (${ed})`;
    }
    const publisher = (params.publisher || '').trim();
    const urlOrDoi = (params.urlOrDoi || '').trim();

    let citation = `${authors} (${year}). ${title}. ${publisher}.`;
    if (urlOrDoi) {
      citation += ` ${urlOrDoi}`;
    }
    return citation;
  }
}
