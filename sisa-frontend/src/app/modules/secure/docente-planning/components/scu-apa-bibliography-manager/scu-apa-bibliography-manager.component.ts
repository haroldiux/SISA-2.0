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
import {
  ScuBibliografiaModel,
  ScuApaValidationItemResultModel,
  ScuApaValidationSummaryModel
} from '@shared/models/scu-programa-analitico.model';
import { ScuApaValidator } from '../../utils/scu-apa-validator';

/**
 * Interactive APA 7th Edition bibliography manager.
 *
 * Segregates Basic and Complementary literature with real-time regex syntax verification.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-apa-bibliography-manager',
  templateUrl: './scu-apa-bibliography-manager.component.html',
  styleUrls: ['./scu-apa-bibliography-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScuApaBibliographyManagerComponent implements OnInit, OnDestroy {

  @Input() public bibliography: ScuBibliografiaModel[] = [];
  @Input() public isReadOnly: boolean = false;

  @Output() public scuBibliographyChanged = new EventEmitter<ScuBibliografiaModel[]>();
  @Output() public scuAddBibliography = new EventEmitter<ScuBibliografiaModel>();
  @Output() public scuRemoveBibliography = new EventEmitter<number>();

  public builderModalVisible: boolean = false;
  public builderDefaultTipo: 'BASICA' | 'COMPLEMENTARIA' = 'BASICA';

  public newQuickCitation: string = '';
  public quickTipo: 'BASICA' | 'COMPLEMENTARIA' = 'BASICA';

  private readonly _destroy$ = new Subject<void>();

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public get basicaList(): ScuBibliografiaModel[] {
    return (this.bibliography || []).filter(b => b.tipo === 'BASICA');
  }

  public get complementariaList(): ScuBibliografiaModel[] {
    return (this.bibliography || []).filter(b => b.tipo === 'COMPLEMENTARIA');
  }

  public get validationSummary(): ScuApaValidationSummaryModel {
    return ScuApaValidator.validateBibliographyList(this.bibliography || []);
  }

  public validateCitation(citation: string): ScuApaValidationItemResultModel {
    return ScuApaValidator.validateCitation(citation);
  }

  public openBuilder(tipo: 'BASICA' | 'COMPLEMENTARIA' = 'BASICA'): void {
    this.builderDefaultTipo = tipo;
    this.builderModalVisible = true;
  }

  public onCitationGenerated(entry: ScuBibliografiaModel): void {
    this.scuAddBibliography.emit(entry);
  }

  public onQuickAdd(): void {
    if (!this.newQuickCitation || this.newQuickCitation.trim().length === 0) return;

    const entry: ScuBibliografiaModel = {
      tipo: this.quickTipo,
      citaApa: this.newQuickCitation.trim()
    };

    this.scuAddBibliography.emit(entry);
    this.newQuickCitation = '';
  }

  public onRemove(item: ScuBibliografiaModel): void {
    if (this.isReadOnly) return;
    const index = this.bibliography.indexOf(item);
    if (index >= 0) {
      this.scuRemoveBibliography.emit(index);
    }
  }

  public onToggleTipo(item: ScuBibliografiaModel): void {
    if (this.isReadOnly) return;
    item.tipo = item.tipo === 'BASICA' ? 'COMPLEMENTARIA' : 'BASICA';
    this.scuBibliographyChanged.emit(this.bibliography);
  }

  public onCitationChange(): void {
    if (this.isReadOnly) return;
    this.scuBibliographyChanged.emit(this.bibliography);
  }

  private _initialize(): void {
    // Initializer
  }

  private _finalize(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
