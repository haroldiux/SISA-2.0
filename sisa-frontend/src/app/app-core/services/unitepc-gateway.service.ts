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
  DocenteItemDto,
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
   * Retrieves all available teachers (Docentes) from the API.
   */
  public getDocentes(): Observable<DocenteItemDto[]> {
    return this._http.get<DocenteItemDto[]>(SCU_API.CATALOGO_ACADEMICO.DOCENTES).pipe(
      tap(docentes => {
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
   * Retrieves groups filtered by term, branchOffice, career, syllabus, or teacherCi.
   */
  public getGroups(
    term?: string,
    branchOfficeId?: string,
    careerId?: string,
    syllabusCourseId?: string,
    teacherCi?: string
  ): Observable<GroupItemDto[]> {
    let params = new HttpParams();
    if (term) params = params.set('term', term);
    if (branchOfficeId) params = params.set('branchOfficeId', branchOfficeId);
    if (careerId) params = params.set('careerId', careerId);
    if (syllabusCourseId) params = params.set('syllabusCourseId', syllabusCourseId);
    if (teacherCi) params = params.set('teacherCi', teacherCi);

    return this._http.get<GroupItemDto[]>(SCU_API.CATALOGO_ACADEMICO.GROUPS, { params }).pipe(
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
   * Retrieves assigned courses for a specific teacher CI.
   */
  public getDocenteMaterias(ci: string): Observable<CourseDto[]> {
    return this._http.get<CourseDto[]>(`${SCU_API.CATALOGO_ACADEMICO.DOCENTES}/${ci}/materias`).pipe(
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
   * Retrieves all academic timeframes.
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
   * Retrieves active academic timeframe.
   */
  public getActiveTimeFrame(): Observable<TimeFrameDto> {
    return this._http.get<TimeFrameDto>(SCU_API.CATALOGO_ACADEMICO.TIME_FRAMES_ACTIVE).pipe(
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
   * Retrieves academic timeframes by career and branch office.
   */
  public getTimeFrameCareers(branchOfficeCode = 'CBA', careerCode = 'CARCCP'): Observable<TimeFrameDto[]> {
    const params = new HttpParams()
      .set('branchOfficeCode', branchOfficeCode)
      .set('careerCode', careerCode);
    return this._http.get<TimeFrameDto[]>(SCU_API.CATALOGO_ACADEMICO.TIME_FRAME_CAREERS, { params }).pipe(
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
   * Retrieves active academic timeframe for a specific career.
   */
  public getActiveTimeFrameCareer(branchOfficeCode = 'CBA', careerCode = 'CARCCP'): Observable<TimeFrameDto> {
    const params = new HttpParams()
      .set('branchOfficeCode', branchOfficeCode)
      .set('careerCode', careerCode);
    return this._http.get<TimeFrameDto>(SCU_API.CATALOGO_ACADEMICO.TIME_FRAME_CAREERS_ACTIVE, { params }).pipe(
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
   * Retrieves analytical program for a course (handled gracefully if on hold in SEA).
   */
  public getAnalyticalProgram(courseCode: string, branchOfficeCode = 'CBA', careerCode = 'CARCCP'): Observable<any> {
    const params = new HttpParams()
      .set('courseCode', courseCode)
      .set('branchOfficeCode', branchOfficeCode)
      .set('careerCode', careerCode);
    return this._http.get<any>(SCU_API.CATALOGO_ACADEMICO.ANALYTICAL_PROGRAM, { params }).pipe(
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
