import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

import { ScuAcademicAuditComponent } from './components/scu-academic-audit/scu-academic-audit.component';
import { ScuActiveClassesRadarComponent } from './components/scu-active-classes-radar/scu-active-classes-radar.component';
import { ScuInSituAuditFormComponent } from './components/scu-in-situ-audit-form/scu-in-situ-audit-form.component';
import { ScuAuditInitiateCmd } from './commands/scu-audit-initiate.cmd';
import { ScuAuditFinalizeCmd } from './commands/scu-audit-finalize.cmd';

const routes: Routes = [
  { path: '', component: ScuAcademicAuditComponent }
];

/**
 * Academic Audit Module (Frame 3).
 *
 * @author GentleAI SISA Architecture Team
 */
@NgModule({
  declarations: [
    ScuAcademicAuditComponent,
    ScuActiveClassesRadarComponent,
    ScuInSituAuditFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    ScuAuditInitiateCmd,
    ScuAuditFinalizeCmd
  ]
})
export class AcademicAuditModule {}
