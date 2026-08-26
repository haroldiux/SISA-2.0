import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecureComponent } from './secure.component';
import { ScuAuthGuard } from '@core/guards/scu-auth.guard';
import { ScuRoleGuard } from '@core/guards/scu-role.guard';
import { ScuRoleEnum } from '@shared/enums/scu-role.enum';

const routes: Routes = [
  {
    path: '',
    component: SecureComponent,
    canActivate: [ScuAuthGuard],
    children: [
      {
        path: 'docente-planning',
        loadChildren: () => import('./docente-planning/docente-planning.module').then(m => m.DocentePlanningModule),
        canActivate: [ScuRoleGuard],
        data: { roles: [ScuRoleEnum.ROLE_DOCENTE, ScuRoleEnum.ROLE_DIR_CARRERA, ScuRoleEnum.ROLE_DIR_ACADEMICA, ScuRoleEnum.ROLE_VICERRECTOR_SEDE, ScuRoleEnum.ROLE_VICERRECTOR_NACIONAL] }
      },
      {
        path: 'career-oversight',
        loadChildren: () => import('./career-oversight/career-oversight.module').then(m => m.CareerOversightModule),
        canActivate: [ScuRoleGuard],
        data: { roles: [ScuRoleEnum.ROLE_DIR_CARRERA, ScuRoleEnum.ROLE_DIR_ACADEMICA, ScuRoleEnum.ROLE_VICERRECTOR_SEDE, ScuRoleEnum.ROLE_VICERRECTOR_NACIONAL] }
      },
      {
        path: 'academic-audit',
        loadChildren: () => import('./academic-audit/academic-audit.module').then(m => m.AcademicAuditModule),
        canActivate: [ScuRoleGuard],
        data: { roles: [ScuRoleEnum.ROLE_DIR_ACADEMICA, ScuRoleEnum.ROLE_VICERRECTOR_SEDE, ScuRoleEnum.ROLE_VICERRECTOR_NACIONAL] }
      },
      {
        path: 'regional-analytics',
        loadChildren: () => import('./regional-analytics/regional-analytics.module').then(m => m.RegionalAnalyticsModule),
        canActivate: [ScuRoleGuard],
        data: { roles: [ScuRoleEnum.ROLE_VICERRECTOR_SEDE, ScuRoleEnum.ROLE_VICERRECTOR_NACIONAL] }
      },
      {
        path: 'executive-dashboard',
        loadChildren: () => import('./executive-dashboard/executive-dashboard.module').then(m => m.ExecutiveDashboardModule),
        canActivate: [ScuRoleGuard],
        data: { roles: [ScuRoleEnum.ROLE_VICERRECTOR_NACIONAL] }
      },
      { path: '', redirectTo: 'docente-planning', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecureRoutingModule {}
