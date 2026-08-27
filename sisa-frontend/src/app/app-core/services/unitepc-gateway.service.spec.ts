import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UnitepcGatewayService } from './unitepc-gateway.service';
import { SCU_API } from '@shared/constants/scu-api.constant';
import { BranchOfficeDto, CareerDto } from '@shared/models/scu-gateway.model';

describe('UnitepcGatewayService', () => {
  let service: UnitepcGatewayService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UnitepcGatewayService]
    });
    service = TestBed.inject(UnitepcGatewayService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created and default to online status', () => {
    expect(service).toBeTruthy();
    expect(service.seaStatus()).toBe('online');
  });

  it('should update seaStatus to online on successful getBranchOffices() call', () => {
    const mockBranches: BranchOfficeDto[] = [
      { id: 'b1', code: 'CBBA', name: 'Cochabamba' },
      { id: 'b2', code: 'LPZ', name: 'La Paz' }
    ];

    service.getBranchOffices().subscribe(branches => {
      expect(branches.length).toBe(2);
      expect(service.seaStatus()).toBe('online');
      expect(service.branchOffices().length).toBe(2);
    });

    const req = httpMock.expectOne(SCU_API.CATALOGO_ACADEMICO.BRANCH_OFFICES);
    expect(req.request.method).toBe('GET');
    req.flush(mockBranches);
  });

  it('should set seaStatus to offline on failed getBranchOffices() call', () => {
    service.getBranchOffices().subscribe({
      next: () => fail('Should have failed'),
      error: () => {
        expect(service.seaStatus()).toBe('offline');
      }
    });

    const req = httpMock.expectOne(SCU_API.CATALOGO_ACADEMICO.BRANCH_OFFICES);
    req.error(new ProgressEvent('Network error'));
  });

  it('should check status endpoint and update signal to online or offline', () => {
    service.checkStatus().subscribe(res => {
      expect(res.status).toBe('online');
      expect(service.seaStatus()).toBe('online');
    });

    const req = httpMock.expectOne(SCU_API.CATALOGO_ACADEMICO.STATUS);
    expect(req.request.method).toBe('GET');
    req.flush({ status: 'online', timestamp: new Date().toISOString() });
  });

  it('should fetch careers with branchOfficeCode parameter', () => {
    const mockCareers: CareerDto[] = [
      { id: 'c1', code: 'SIS', name: 'Ing. Sistemas', branchOfficeCode: 'CBBA' }
    ];

    service.getCareers('CBBA').subscribe(careers => {
      expect(careers.length).toBe(1);
      expect(careers[0].code).toBe('SIS');
    });

    const req = httpMock.expectOne(r =>
      r.url === SCU_API.CATALOGO_ACADEMICO.CAREERS && r.params.get('branchOfficeCode') === 'CBBA'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockCareers);
  });
});
