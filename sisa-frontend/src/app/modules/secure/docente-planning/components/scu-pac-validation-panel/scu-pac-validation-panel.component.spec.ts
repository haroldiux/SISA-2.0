import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ScuValidationPanelComponent } from './scu-pac-validation-panel.component';
import { ScuValidationIssueModel, ScuValidationResultModel } from '@shared/models/scu-validation.model';

describe('ScuValidationPanelComponent', () => {
  let component: ScuValidationPanelComponent;
  let fixture: ComponentFixture<ScuValidationPanelComponent>;

  const mockResult: ScuValidationResultModel = {
    isValid: false,
    hasErrors: true,
    hasWarnings: true,
    totalErrors: 1,
    totalWarnings: 1,
    issues: [
      {
        id: 'val-01-inversion-6',
        ruleCode: 'VAL-01-CHRONOLOGY',
        severity: 'ERROR',
        sessionNumber: 6,
        fieldName: 'fechaProgramada',
        message: 'Inversión cronológica detectada'
      },
      {
        id: 'val-03-saber-3',
        ruleCode: 'VAL-03-DIDACTIC',
        severity: 'WARNING',
        sessionNumber: 3,
        fieldName: 'saberConceptual',
        message: 'Saber conceptual incompleto'
      }
    ],
    milestonesFound: {
      primerParcial: true,
      segundoParcial: false,
      examenFinal: true
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScuValidationPanelComponent],
      imports: [CommonModule, NoopAnimationsModule, ButtonModule, TagModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ScuValidationPanelComponent);
    component = fixture.componentInstance;
    component.validationResult = mockResult;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
  });

  it('should create the validation panel', () => {
    expect(component).toBeTruthy();
  });

  it('should render milestone checkmarks and error badges accordingly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('1er Parcial');
    expect(compiled.textContent).toContain('2do Parcial');
    expect(compiled.textContent).toContain('Ex. Final');
  });

  it('should emit scuJumpToIssue when an issue item is clicked', () => {
    spyOn(component.scuJumpToIssue, 'emit');
    const issueToJump = mockResult.issues[0];
    component.onJumpToIssue(issueToJump);

    expect(component.scuJumpToIssue.emit).toHaveBeenCalledWith(issueToJump);
  });

  it('should toggle panel expansion state', () => {
    expect(component.isExpanded).toBeTrue();
    component.togglePanel();
    expect(component.isExpanded).toBeFalse();
  });
});
