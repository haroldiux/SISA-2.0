import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SCU_API } from '@shared/constants/scu-api.constant';
import {
  BranchOfficeDto,
  CareerDto,
  CourseDto,
  GroupItemDto,
  StudentItemDto,
  CampusDto,
  TimeFrameDto,
  SeaGatewayStatus
} from '@shared/models/scu-gateway.model';

/**
 * Service managing communication with the UNITEPC SEA Gateway proxy endpoints.
 * Utilizes Angular Signals to reactively broadcast gateway connection health (online, offline, sync).
 *
 * @author GentleAI SISA Architecture Team
 */
@Injectable({
  providedIn: 'root'
})
export class UnitepcGatewayService {

  /** Reactive signal tracking real-time SEA Gateway connectivity status */
  public readonly seaStatus = signal<SeaGatewayStatus>('online');

  /** Reactive signal tracking last timestamp of connection verification */
  public readonly lastChecked = signal<Date>(new Date());

  /** Cached list of active branch offices */
  public readonly branchOffices = signal<BranchOfficeDto[]>([]);

  constructor(private readonly _http: HttpClient) {
    this._syncGlobalWindowStatus();
  }

  /**
   * Explicitly updates the SEA Gateway status signal and window object for prototype bridge.
   */
  public setSeaStatus(status: SeaGatewayStatus): void {
    this.seaStatus.set(status);
    this.lastChecked.set(new Date());
    this._syncGlobalWindowStatus();
  }

  /**
   * Checks Gateway health status from backend proxy.
   */
  public checkStatus(): Observable<{ status: string; timestamp?: string }> {
    this.seaStatus.set('sync');
    return this._http.get<{ status: string; timestamp?: string }>(SCU_API.CATALOGO_ACADEMICO.STATUS).pipe(
      tap(res => {
        const nextStatus: SeaGatewayStatus = (res && res.status === 'online') ? 'online' : 'offline';
        this.seaStatus.set(nextStatus);
        this.lastChecked.set(new Date());
        this._syncGlobalWindowStatus();
      }),
      catchError(() => {
        this.seaStatus.set('offline');
        this.lastChecked.set(new Date());
        this._syncGlobalWindowStatus();
        return of({ status: 'offline' });
      })
    );
  }

  /**
   * Retrieves list of all branch offices (Sedes).
   */
  public getBranchOffices(): Observable<BranchOfficeDto[]> {
    return this._http.get<BranchOfficeDto[]>(SCU_API.CATALOGO_ACADEMICO.BRANCH_OFFICES).pipe(
      tap(data => {
        this.branchOffices.set(data || []);
        this.seaStatus.set('online');
        this.lastChecked.set(new Date());
        this._syncGlobalWindowStatus();
      }),
      catchError(err => {
        this.seaStatus.set('offline');
        this._syncGlobalWindowStatus();
        throw err;
      })
    );
  }

  /**
   * Retrieves careers filtered optionally by branch office code.
   */
  public getCareers(branchOfficeCode?: string): Observable<CareerDto[]> {
    let params = new HttpParams();
    if (branchOfficeCode) {
      params = params.set('branchOfficeCode', branchOfficeCode);
    }
    return this._http.get<CareerDto[]>(SCU_API.CATALOGO_ACADEMICO.CAREERS, { params }).pipe(
      tap(() => {
        this.seaStatus.set('online');
        this.lastChecked.set(new Date());
        this._syncGlobalWindowStatus();
      }),
      catchError(err => {
        this.seaStatus.set('offline');
        this._syncGlobalWindowStatus();
        throw err;
      })
    );
  }

  /**
   * Retrieves courses filtered by branch office and career code.
   */
  public getCourses(branchOfficeCode?: string, careerCode?: string): Observable<CourseDto[]> {
    let params = new HttpParams();
    if (branchOfficeCode) {
      params = params.set('branchOfficeCode', branchOfficeCode);
    }
    if (careerCode) {
      params = params.set('careerCode', careerCode);
    }
    return this._http.get<CourseDto[]>(SCU_API.CATALOGO_ACADEMICO.COURSES, { params }).pipe(
      tap(() => {
        this.seaStatus.set('online');
        this.lastChecked.set(new Date());
        this._syncGlobalWindowStatus();
      }),
      catchError(err => {
        this.seaStatus.set('offline');
        this._syncGlobalWindowStatus();
        throw err;
      })
    );
  }

  /**
   * Retrieves enrolled students for a specific group.
   */
  public getStudentsByGroup(groupId: string): Observable<StudentItemDto[]> {
    const params = new HttpParams().set('groupId', groupId);
    return this._http.get<StudentItemDto[]>(SCU_API.CATALOGO_ACADEMICO.STUDENTS_BY_GROUP, { params }).pipe(
      tap(() => {
        this.seaStatus.set('online');
        this.lastChecked.set(new Date());
        this._syncGlobalWindowStatus();
      }),
      catchError(err => {
        this.seaStatus.set('offline');
        this._syncGlobalWindowStatus();
        throw err;
      })
    );
  }

  /**
   * Retrieves campuses filtered optionally by branch office ID.
   */
  public getCampuses(branchOfficeId?: string): Observable<CampusDto[]> {
    let params = new HttpParams();
    if (branchOfficeId) {
      params = params.set('branchOfficeId', branchOfficeId);
    }
    return this._http.get<CampusDto[]>(SCU_API.CATALOGO_ACADEMICO.CAMPUSES, { params }).pipe(
      tap(() => {
        this.seaStatus.set('online');
        this.lastChecked.set(new Date());
        this._syncGlobalWindowStatus();
      }),
      catchError(err => {
        this.seaStatus.set('offline');
        this._syncGlobalWindowStatus();
        throw err;
      })
    );
  }

  /**
   * Retrieves active academic timeframes.
   */
  public getTimeFrames(): Observable<TimeFrameDto[]> {
    return this._http.get<TimeFrameDto[]>(SCU_API.CATALOGO_ACADEMICO.TIME_FRAMES).pipe(
      tap(() => {
        this.seaStatus.set('online');
        this.lastChecked.set(new Date());
        this._syncGlobalWindowStatus();
      }),
      catchError(err => {
        this.seaStatus.set('offline');
        this._syncGlobalWindowStatus();
        throw err;
      })
    );
  }

  /**
   * Bridges status to window context for prototype controller synchronization.
   */
  private _syncGlobalWindowStatus(): void {
    if (typeof window !== 'undefined') {
      (window as any).__SEA_STATUS__ = this.seaStatus();
      if (typeof (window as any).updateSeaGatewayStatus === 'function') {
        (window as any).updateSeaGatewayStatus(this.seaStatus());
      }
    }
  }
}
