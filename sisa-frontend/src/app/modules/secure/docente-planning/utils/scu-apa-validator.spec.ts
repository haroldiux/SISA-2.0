import { ScuApaValidator } from './scu-apa-validator';
import { ScuBibliografiaModel } from '@shared/models/scu-programa-analitico.model';

describe('ScuApaValidator', () => {

  it('should validate canonical APA 7 book citation', () => {
    const citation = "Pressman, R. S., & Maxim, B. R. (2020). Software Engineering: A Practitioner's Approach (9th ed.). McGraw-Hill.";
    const result = ScuApaValidator.validateCitation(citation);

    expect(result.isValid).toBeTrue();
    expect(result.authorMatched).toBe('Pressman, R. S., & Maxim, B. R.');
    expect(result.yearMatched).toBe(2020);
    expect(result.titleMatched).toContain("Software Engineering");
    expect(result.publisherMatched).toContain('McGraw-Hill');
  });

  it('should validate APA 7 citation with DOI or URL', () => {
    const citation = "Sommerville, I. (2019). Software Engineering (10th ed.). Pearson. https://doi.org/10.1007/978-3-030-00000-0";
    const result = ScuApaValidator.validateCitation(citation);

    expect(result.isValid).toBeTrue();
    expect(result.yearMatched).toBe(2019);
    expect(result.urlOrDoiMatched).toContain('https://doi.org');
  });

  it('should reject empty or whitespace citation', () => {
    const result = ScuApaValidator.validateCitation('   ');

    expect(result.isValid).toBeFalse();
    expect(result.errorMessage).toBe('La cita bibliográfica no puede estar vacía.');
  });

  it('should reject malformed non-APA citations', () => {
    const result = ScuApaValidator.validateCitation('Libro de Redes Tanenbaum 2018');

    expect(result.isValid).toBeFalse();
    expect(result.errorMessage).toContain('Formato inválido');
  });

  it('should validate bibliography list checking for at least 1 valid basic entry', () => {
    const list: ScuBibliografiaModel[] = [
      {
        tipo: 'BASICA',
        citaApa: 'Bloch, J. (2018). Effective Java (3rd ed.). Addison-Wesley.'
      },
      {
        tipo: 'COMPLEMENTARIA',
        citaApa: 'Martin, R. C. (2017). Clean Architecture. Prentice Hall.'
      }
    ];

    const summary = ScuApaValidator.validateBibliographyList(list);

    expect(summary.hasBasica).toBeTrue();
    expect(summary.validBasicaCount).toBe(1);
    expect(summary.validTotalCount).toBe(2);
    expect(summary.allValid).toBeTrue();
  });

  it('should flag summary invalid if basic bibliography is missing or invalid', () => {
    const list: ScuBibliografiaModel[] = [
      {
        tipo: 'COMPLEMENTARIA',
        citaApa: 'Martin, R. C. (2017). Clean Architecture. Prentice Hall.'
      }
    ];

    const summary = ScuApaValidator.validateBibliographyList(list);

    expect(summary.hasBasica).toBeFalse();
    expect(summary.validBasicaCount).toBe(0);
    expect(summary.allValid).toBeFalse();
  });

  it('should synthesize citation string via buildCitation', () => {
    const built = ScuApaValidator.buildCitation({
      authors: 'Gamma, E., Helm, R., Johnson, R., & Vlissides, J.',
      year: 1994,
      title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      edition: '1st ed.',
      publisher: 'Addison-Wesley',
      urlOrDoi: 'https://doi.org/10.1007/test'
    });

    expect(built).toBe(
      'Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). Design Patterns: Elements of Reusable Object-Oriented Software (1st ed.). Addison-Wesley. https://doi.org/10.1007/test'
    );
    expect(ScuApaValidator.validateCitation(built).isValid).toBeTrue();
  });
});
