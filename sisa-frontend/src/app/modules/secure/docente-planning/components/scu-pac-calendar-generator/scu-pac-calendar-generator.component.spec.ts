import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ScuPacCalendarGeneratorComponent } from './scu-pac-calendar-generator.component';

describe('ScuPacCalendarGeneratorComponent', () => {
  let component: ScuPacCalendarGeneratorComponent;
  let fixture: ComponentFixture<ScuPacCalendarGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScuPacCalendarGeneratorComponent],
      imports: [
        CommonModule,
        FormsModule,
        NoopAnimationsModule,
        DialogModule,
        ButtonModule,
        InputTextModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ScuPacCalendarGeneratorComponent);
    component = fixture.componentInstance;
    component.visible = true;
    component.totalSessions = 36;
    fixture.detectChanges();
  });

  it('should create the calendar generator component', () => {
    expect(component).toBeTruthy();
  });

  it('should generate preview dates on init and weekday toggle', () => {
    expect(component.generatedPreviewDates.length).toBeGreaterThan(0);

    // Toggle Thursday (4)
    component.toggleDay(4);
    expect(component.selectedDays).toContain(4);
    expect(component.generatedPreviewDates.length).toBe(36);
  });

  it('should emit scuDatesGenerated and close dialog on confirm', () => {
    spyOn(component.scuDatesGenerated, 'emit');
    spyOn(component.visibleChange, 'emit');

    component.onConfirm();

    expect(component.scuDatesGenerated.emit).toHaveBeenCalledWith(component.generatedPreviewDates);
    expect(component.visible).toBeFalse();
    expect(component.visibleChange.emit).toHaveBeenCalledWith(false);
  });
});
