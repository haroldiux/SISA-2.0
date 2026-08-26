import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

import { ScuExecutiveDashboardComponent } from './components/scu-executive-dashboard/scu-executive-dashboard.component';
import { ScuMacroKpiCardsComponent } from './components/scu-macro-kpi-cards/scu-macro-kpi-cards.component';
import { ScuCrossBranchBenchmarkComponent } from './components/scu-cross-branch-benchmark/scu-cross-branch-benchmark.component';
import { ScuExportNationalReportCmd } from './commands/scu-export-national-report.cmd';

const routes: Routes = [
  { path: '', component: ScuExecutiveDashboardComponent }
];

/**
 * Executive Dashboard Module (Frame 5).
 *
 * @author GentleAI SISA Architecture Team
 */
@NgModule({
  declarations: [
    ScuExecutiveDashboardComponent,
    ScuMacroKpiCardsComponent,
    ScuCrossBranchBenchmarkComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    ScuExportNationalReportCmd
  ]
})
export class ExecutiveDashboardModule {}
