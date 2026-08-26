import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ScuInSituAuditFormComponent } from './scu-in-situ-audit-form.component';
import { ScuAuditFinalizeCmd } from '../../commands/scu-audit-finalize.cmd';
import { SharedModule } from '@shared/shared.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ScuAuditStatusEnum } from '@shared/enums/scu-audit-status.enum';

describe('ScuInSituAuditFormComponent', () => {
  let component: ScuInSituAuditFormComponent;
  let fixture: ComponentFixture<ScuInSituAuditFormComponent>;

  const mockFinalizeCmd = {
    execute: jasmine.createSpy('execute').and.returnValue(of({
      id: 101,
      asignacionId: 1,
      puntualidadDocente: 'PUNTUAL',
      concordanciaTema: 'CONFORME_PAC',
      momentoObservado: 'DESARROLLO',
      estudiantesPresentes: 28,
      estudiantesInscritos: 32,
      porcentajeAsistencia: 87.5,
      estado: ScuAuditStatusEnum.FINALIZADA_CONFORME,
      hashFirmaDigital: 'mocked_hash_sha256'
    }))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScuInSituAuditFormComponent],
      imports: [SharedModule],
      providers: [
        { provide: ScuAuditFinalizeCmd, useValue: mockFinalizeCmd }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ScuInSituAuditFormComponent);
    component = fixture.componentInstance;
    component.matchedData = {
      asignacionId: 1,
      sesionProgramadaId: 5,
      docenteNombre: 'Carlos Montaño',
      asignaturaNombre: 'Programación III',
      aula: 'Lab-302',
      semanaProgramada: 3,
      temaProgramado: 'Polimorfismo'
    };
    fixture.detectChanges();
  });

  it('should create the In Situ Audit Form Component', () => {
    expect(component).toBeTruthy();
  });

  it('should submit audit and emit finalized event with digital hash', () => {
    spyOn(component.auditFinalized, 'emit');
    component.onSubmitAudit();
    expect(mockFinalizeCmd.execute).toHaveBeenCalled();
    expect(component.auditFinalized.emit).toHaveBeenCalled();
  });
});
