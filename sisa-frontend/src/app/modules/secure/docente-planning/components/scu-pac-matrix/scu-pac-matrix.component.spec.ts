import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ScuMatriz7GridComponent } from './scu-pac-matrix.component';
import { ScuPacModel, ScuSesionMatriz7Model } from '@shared/models/scu-pac.model';
import { ScuPlanningStatusEnum } from '@shared/enums/scu-planning-status.enum';

describe('ScuMatriz7GridComponent', () => {
  let component: ScuMatriz7GridComponent;
  let fixture: ComponentFixture<ScuMatriz7GridComponent>;

  const createTestPac = (): ScuPacModel => {
    const sesiones: ScuSesionMatriz7Model[] = [
      {
        semana: 1,
        nroSesion: 1,
        fechaProgramada: '2026-02-18',
        tipoSesion: 'TEORICA',
        unidadTematica: 'Unidad 1',
        contenidoEspecifico: 'Introducción',
        saberConceptual: 'Conceptos',
        saberProcedimental: 'Procedimientos',
        saberActitudinal: 'Actitudes',
        criterioDesempeno: 'Criterio',
        evidenciaAprendizaje: 'Evidencia',
        instrumentoEvaluacion: 'RUBRICA',
        hitoEvaluativo: 'REGULAR'
      },
      {
        semana: 1,
        nroSesion: 2,
        fechaProgramada: '2026-02-20',
        tipoSesion: 'PRACTICA',
        unidadTematica: 'Unidad 1',
        contenidoEspecifico: 'Ejercicios',
        saberConceptual: 'Conceptos',
        saberProcedimental: 'Procedimientos',
        saberActitudinal: 'Actitudes',
        criterioDesempeno: 'Criterio',
        evidenciaAprendizaje: 'Evidencia',
        instrumentoEvaluacion: 'RUBRICA',
        hitoEvaluativo: 'REGULAR'
      }
    ];

    return {
      id: 1,
      asignacionId: 101,
      estado: ScuPlanningStatusEnum.BORRADOR,
      matriz7: sesiones
    };
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScuMatriz7GridComponent],
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        TableModule,
        DropdownModule,
        ButtonModule,
        TooltipModule,
        TagModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ScuMatriz7GridComponent);
    component = fixture.componentInstance;
    component.pac = createTestPac();
    fixture.detectChanges();
  });

  it('should create the grid component', () => {
    expect(component).toBeTruthy();
  });

  it('should render rows matching the PAC matriz7 sessions', () => {
    expect(component.filteredSessions.length).toBe(2);
    const compiled = fixture.nativeElement as HTMLElement;
    const row = compiled.querySelector('#matriz7-row-1');
    expect(row).toBeTruthy();
  });

  it('should append a new row when onAddSession is called and emit scuPacChange', () => {
    spyOn(component.scuPacChange, 'emit');
    component.onAddSession();

    expect(component.pac?.matriz7.length).toBe(3);
    expect(component.pac?.matriz7[2].nroSesion).toBe(3);
    expect(component.scuPacChange.emit).toHaveBeenCalled();
  });

  it('should duplicate a row when onDuplicateSession is called', () => {
    spyOn(component.scuPacChange, 'emit');
    const targetSession = component.pac!.matriz7[0];
    component.onDuplicateSession(targetSession);

    expect(component.pac?.matriz7.length).toBe(3);
    expect(component.pac?.matriz7[1].contenidoEspecifico).toBe(targetSession.contenidoEspecifico);
    expect(component.scuPacChange.emit).toHaveBeenCalled();
  });

  it('should remove a row when onRemoveSession is called', () => {
    spyOn(component.scuPacChange, 'emit');
    const targetSession = component.pac!.matriz7[0];
    component.onRemoveSession(targetSession);

    expect(component.pac?.matriz7.length).toBe(1);
    expect(component.pac?.matriz7[0].nroSesion).toBe(1);
    expect(component.scuPacChange.emit).toHaveBeenCalled();
  });

  it('should emit toolbar actions correctly', () => {
    spyOn(component.scuManualSave, 'emit');
    spyOn(component.scuManualSubmit, 'emit');
    spyOn(component.scuExportExcel, 'emit');
    spyOn(component.scuOpenCalendarModal, 'emit');
    spyOn(component.scuOpenImportModal, 'emit');

    component.onTriggerSave();
    expect(component.scuManualSave.emit).toHaveBeenCalled();

    component.onTriggerSubmit();
    expect(component.scuManualSubmit.emit).toHaveBeenCalled();

    component.onTriggerExport();
    expect(component.scuExportExcel.emit).toHaveBeenCalledWith(1);

    component.onTriggerCalendarModal();
    expect(component.scuOpenCalendarModal.emit).toHaveBeenCalled();

    component.onTriggerImportModal();
    expect(component.scuOpenImportModal.emit).toHaveBeenCalled();
  });
});
