import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ScuAutosaveIndicatorComponent } from './scu-autosave-indicator.component';
import { ScuAutoSaveStateEnum } from '@shared/models/scu-validation.model';

@Component({
  template: `
    <scu-autosave-indicator
      [state]="state"
      [lastSavedAt]="lastSavedAt"
      [errorMessage]="errorMessage"
      (scuRetry)="onRetry()">
    </scu-autosave-indicator>
  `
})
class TestHostComponent {
  public state: ScuAutoSaveStateEnum = ScuAutoSaveStateEnum.SIN_CAMBIOS;
  public lastSavedAt: Date | null = null;
  public errorMessage: string = '';
  public retryCalled: boolean = false;

  public onRetry(): void {
    this.retryCalled = true;
  }
}

describe('ScuAutosaveIndicatorComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScuAutosaveIndicatorComponent, TestHostComponent],
      imports: [CommonModule, TagModule, ButtonModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the indicator', () => {
    expect(fixture.nativeElement).toBeTruthy();
  });

  it('should render correct text for SIN_CAMBIOS state', () => {
    hostComponent.state = ScuAutoSaveStateEnum.SIN_CAMBIOS;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Sin cambios pendientes');
  });

  it('should render correct text for GUARDANDO state', () => {
    hostComponent.state = ScuAutoSaveStateEnum.GUARDANDO;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Guardando borrador...');
  });

  it('should render correct text for GUARDADO state', () => {
    hostComponent.state = ScuAutoSaveStateEnum.GUARDADO;
    hostComponent.lastSavedAt = new Date();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Borrador guardado');
  });

  it('should render retry button and emit scuRetry on ERROR state', () => {
    hostComponent.state = ScuAutoSaveStateEnum.ERROR;
    hostComponent.errorMessage = 'Fallo de conexión';
    fixture.detectChanges();

    const retryBtn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(retryBtn).toBeTruthy();
    retryBtn.click();

    expect(hostComponent.retryCalled).toBeTrue();
  });
});
