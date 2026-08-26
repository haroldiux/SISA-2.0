import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  ScuDateAutoFillHelper,
  UNITEPC_2026_HOLIDAYS
} from '../../utils/scu-date-autofill.helper';

/**
 * Calendar generator modal component for auto-calculating and projecting
 * weekly session dates with holiday exclusion.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component({
  selector: 'scu-pac-calendar-generator',
  templateUrl: './scu-pac-calendar-generator.component.html',
  styleUrls: ['./scu-pac-calendar-generator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScuPacCalendarGeneratorComponent implements OnInit, OnDestroy, OnChanges {

  @Input() public visible: boolean = false;
  @Input() public totalSessions: number = 36;

  @Output() public visibleChange = new EventEmitter<boolean>();
  @Output() public scuDatesGenerated = new EventEmitter<string[]>();

  public startDate: string = '2026-02-16';
  public selectedDays: number[] = [1, 3]; // Default: Lunes & Miércoles
  public excludeHolidays: boolean = true;
  public generatedPreviewDates: string[] = [];

  public readonly weekdayOptions = [
    { label: 'Lunes', value: 1 },
    { label: 'Martes', value: 2 },
    { label: 'Miércoles', value: 3 },
    { label: 'Jueves', value: 4 },
    { label: 'Viernes', value: 5 },
    { label: 'Sábado', value: 6 }
  ];

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.onGeneratePreview();
    }
  }

  public toggleDay(day: number): void {
    const idx = this.selectedDays.indexOf(day);
    if (idx >= 0) {
      if (this.selectedDays.length > 1) {
        this.selectedDays = this.selectedDays.filter(d => d !== day);
      }
    } else {
      this.selectedDays = [...this.selectedDays, day].sort((a, b) => a - b);
    }
    this.onGeneratePreview();
  }

  public isDaySelected(day: number): boolean {
    return this.selectedDays.includes(day);
  }

  public onGeneratePreview(): void {
    const holidays = this.excludeHolidays ? UNITEPC_2026_HOLIDAYS : [];
    this.generatedPreviewDates = ScuDateAutoFillHelper.generateDates(
      this.startDate,
      this.selectedDays,
      this.totalSessions || 36,
      holidays
    );
  }

  public onConfirm(): void {
    if (this.generatedPreviewDates.length > 0) {
      this.scuDatesGenerated.emit(this.generatedPreviewDates);
    }
    this.closeDialog();
  }

  public closeDialog(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  private _initialize(): void {
    this.onGeneratePreview();
  }

  private _finalize(): void {
    // Cleanup
  }
}
