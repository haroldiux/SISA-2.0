import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ScuAuthGuard } from './scu-auth.guard';
import { ScuAuthService } from '../services/scu-auth.service';

describe('ScuAuthGuard', () => {
  let guard: ScuAuthGuard;
  let authServiceSpy: jasmine.SpyObj<ScuAuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('ScuAuthService', ['isAuthenticated']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        ScuAuthGuard,
        { provide: ScuAuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(ScuAuthGuard);
  });

  it('should allow access if user is authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    const result = guard.canActivate({} as any, { url: '/secure/docente-planning' } as any);
    expect(result).toBeTrue();
  });

  it('should redirect to /auth/login if user is not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    const result = guard.canActivate({} as any, { url: '/secure/docente-planning' } as any);
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login'], { queryParams: { returnUrl: '/secure/docente-planning' } });
  });
});
