import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';
import { Subject } from 'rxjs';
import { ScuBibliografiaModel } from '@shared/models/scu-programa-analitico.model';
import { ScuApaValidator } from '../../utils/scu-apa-validator';

/**
 * Guided modal dialog for synthesizing standard APA 7th Edition citations.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-apa-builder-modal',
  templateUrl: './scu-apa-builder-modal.component.html',
  styleUrls: ['./scu-apa-builder-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScuApaBuilderModalComponent implements OnInit, OnDestroy {

  @Input() public visible: boolean = false;
  @Input() public defaultTipo: 'BASICA' | 'COMPLEMENTARIA' = 'BASICA';

  @Output() public visibleChange = new EventEmitter<boolean>();
  @Output() public scuCitationGenerated = new EventEmitter<ScuBibliografiaModel>();

  public tipo: 'BASICA' | 'COMPLEMENTARIA' = 'BASICA';
  public authors: string = '';
  public year: string = new Date().getFullYear().toString();
  public title: string = '';
  public edition: string = '';
  public publisher: string = '';
  public urlOrDoi: string = '';

  public copied: boolean = false;
  public errorMessage: string = '';

  private readonly _destroy$ = new Subject<void>();

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public get generatedCitation(): string {
    return ScuApaValidator.buildCitation({
      authors: this.authors,
      year: this.year,
      title: this.title,
      edition: this.edition,
      publisher: this.publisher,
      urlOrDoi: this.urlOrDoi
    });
  }

  public get isValidCitation(): boolean {
    const val = ScuApaValidator.validateCitation(this.generatedCitation);
    return val.isValid;
  }

  public onClose(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.errorMessage = '';
    this.copied = false;
  }

  public onInsert(): void {
    const val = ScuApaValidator.validateCitation(this.generatedCitation);
    if (!val.isValid) {
      this.errorMessage = val.errorMessage || 'Formato APA 7 inválido. Verifique autores, año, título y editorial.';
      return;
    }

    const model: ScuBibliografiaModel = {
      tipo: this.tipo,
      citaApa: this.generatedCitation,
      autor: this.authors,
      anio: parseInt(this.year, 10) || new Date().getFullYear(),
      titulo: this.title,
      editorialUrl: this.publisher + (this.urlOrDoi ? ` - ${this.urlOrDoi}` : '')
    };

    this.scuCitationGenerated.emit(model);
    this._resetForm();
    this.onClose();
  }

  public onCopyToClipboard(): void {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(this.generatedCitation);
      this.copied = true;
      setTimeout(() => { this.copied = false; }, 2000);
    }
  }

  private _initialize(): void {
    this.tipo = this.defaultTipo;
  }

  private _finalize(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _resetForm(): void {
    this.authors = '';
    this.year = new Date().getFullYear().toString();
    this.title = '';
    this.edition = '';
    this.publisher = '';
    this.urlOrDoi = '';
    this.errorMessage = '';
  }
}
