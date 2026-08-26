import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ScuPlanClaseEditorComponent } from './scu-plan-clase-editor.component';
import { ScuPlanClaseStateService } from '../../services/scu-plan-clase-state.service';
import { ScuPlanClaseSaveCmd } from '../../commands/scu-plan-clase-save.cmd';
import { ScuPlanningHttpService } from '../../http/scu-planning.http';
import { ScuSesionMatriz7Model } from '@shared/models/scu-pac.model';

describe('ScuPlanClaseEditorComponent', () => {
  let component: ScuPlanClaseEditorComponent;
  let fixture: ComponentFixture<ScuPlanClaseEditorComponent>;

  const mockSession: ScuSesionMatriz7Model = {
    nroSesion: 1,
    semana: 1,
    fechaProgramada: '2026-03-02',
    tipoSesion: 'TEORICA',
    unidadTematica: 'Unidad 1',
    contenidoEspecifico: 'Fundamentos',
    saberConceptual: 'Conceptos',
    saberProcedimental: 'Procedimientos',
    saberActitudinal: 'Actitudes',
    criterioDesempeno: 'Criterio',
    evidenciaAprendizaje: 'Evidencia',
    instrumentoEvaluacion: 'RUBRICA',
    hitoEvaluativo: 'REGULAR'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScuPlanClaseEditorComponent],
      imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule],
      providers: [
        ScuPlanClaseStateService,
        ScuPlanClaseSaveCmd,
        ScuPlanningHttpService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ScuPlanClaseEditorComponent);
    component = fixture.componentInstance;
    component.session = mockSession;
    component.allSessions = [mockSession];
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should display active plan with default moments', () => {
    expect(component.activePlan).toBeTruthy();
    expect(component.getMoment('INICIO')?.duracionMin).toBe(25);
    expect(component.getMoment('DESARROLLO')?.duracionMin).toBe(100);
    expect(component.getMoment('CIERRE')?.duracionMin).toBe(55);
  });

  it('should toggle didactic resources on click', () => {
    // 'Proyector Multimedia' is not in initial default resources ('Pizarra Interactiva', 'Presentación Multimedia', 'Guía de Práctica')
    expect(component.isResourceSelected('Proyector Multimedia')).toBeFalse();

    component.onToggleResource('Proyector Multimedia');
    expect(component.isResourceSelected('Proyector Multimedia')).toBeTrue();

    component.onToggleResource('Proyector Multimedia');
    expect(component.isResourceSelected('Proyector Multimedia')).toBeFalse();
  });

  it('should apply standard template', () => {
    component.onApplyStandardTemplate();
    expect(component.getMoment('INICIO')?.duracionMin).toBe(25);
    expect(component.saveSuccessMessage).toContain('Plantilla estándar UNITEPC');
  });
});
