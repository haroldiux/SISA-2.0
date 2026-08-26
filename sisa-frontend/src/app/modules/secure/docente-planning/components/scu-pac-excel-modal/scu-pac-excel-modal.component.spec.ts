import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { of } from 'rxjs';
import { ScuExcelIngestModalComponent } from './scu-pac-excel-modal.component';
import { ScuPlanningHttpService } from '../../http/scu-planning.http';
import { ScuPacModel } from '@shared/models/scu-pac.model';
import { ScuPlanningStatusEnum } from '@shared/enums/scu-planning-status.enum';

describe('ScuExcelIngestModalComponent', () => {
  let component: ScuExcelIngestModalComponent;
  let fixture: ComponentFixture<ScuExcelIngestModalComponent>;
  let mockHttp: jasmine.SpyObj<ScuPlanningHttpService>;

  const mockPac: ScuPacModel = {
    id: 1,
    asignacionId: 101,
    estado: ScuPlanningStatusEnum.BORRADOR,
    matriz7: [
      {
        semana: 1,
        nroSesion: 1,
        fechaProgramada: '2026-02-18',
        tipoSesion: 'TEORICA',
        unidadTematica: 'Unidad 1',
        contenidoEspecifico: 'Contenido 1',
        saberConceptual: 'Saberes',
        saberProcedimental: 'Procedimientos',
        saberActitudinal: 'Actitudes',
        criterioDesempeno: 'Criterio',
        evidenciaAprendizaje: 'Evidencia',
        instrumentoEvaluacion: 'RUBRICA',
        hitoEvaluativo: 'REGULAR'
      }
    ]
  };

  beforeEach(async () => {
    mockHttp = jasmine.createSpyObj('ScuPlanningHttpService', ['importPacFile']);

    await TestBed.configureTestingModule({
      declarations: [ScuExcelIngestModalComponent],
      imports: [
        CommonModule,
        FormsModule,
        NoopAnimationsModule,
        DialogModule,
        ButtonModule,
        TableModule,
        TagModule,
        ProgressBarModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: ScuPlanningHttpService, useValue: mockHttp }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ScuExcelIngestModalComponent);
    component = fixture.componentInstance;
    component.visible = true;
    component.asignacionId = 101;
    fixture.detectChanges();
  });

  it('should create the Excel ingest modal component', () => {
    expect(component).toBeTruthy();
  });

  it('should reject non-xlsx files client-side', () => {
    const fakePdf = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });
    const event = { target: { files: [fakePdf] } } as unknown as Event;

    component.onFileChange(event);

    expect(component.errorMessage).toContain('archivos Excel válidos');
    expect(mockHttp.importPacFile).not.toHaveBeenCalled();
  });

  it('should upload valid xlsx file and populate preview table', () => {
    mockHttp.importPacFile.and.returnValue(of({ data: mockPac }));
    const fakeXlsx = new File(['dummy xlsx binary'], 'PAC_Test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const event = { target: { files: [fakeXlsx] } } as unknown as Event;

    component.onFileChange(event);

    expect(mockHttp.importPacFile).toHaveBeenCalled();
    expect(component.parsedPac).toEqual(mockPac);
    expect(component.isParsing).toBeFalse();
  });

  it('should emit scuPacImported on confirm commit', () => {
    component.parsedPac = mockPac;
    component.mergeMode = 'REPLACE';

    spyOn(component.scuPacImported, 'emit');
    component.onConfirmCommit();

    expect(component.scuPacImported.emit).toHaveBeenCalledWith({
      pac: mockPac,
      mergeMode: 'REPLACE'
    });
  });
});
