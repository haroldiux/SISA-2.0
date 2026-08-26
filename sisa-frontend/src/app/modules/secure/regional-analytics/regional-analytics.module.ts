import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

import { ScuRegionalAnalyticsComponent } from './components/scu-regional-analytics/scu-regional-analytics.component';
import { ScuDisciplinaryRecurrencePanelComponent } from './components/scu-disciplinary-recurrence-panel/scu-disciplinary-recurrence-panel.component';
import { ScuBranchComplianceChartComponent } from './components/scu-branch-compliance-chart/scu-branch-compliance-chart.component';
import { ScuActionPlanApproveCmd } from './commands/scu-action-plan-approve.cmd';

const routes: Routes = [
  { path: '', component: ScuRegionalAnalyticsComponent }
];

/**
 * Regional Analytics Module (Frame 4).
 *
 * @author GentleAI SISA Architecture Team
 */
@NgModule({
  declarations: [
    ScuRegionalAnalyticsComponent,
    ScuDisciplinaryRecurrencePanelComponent,
    ScuBranchComplianceChartComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    ScuActionPlanApproveCmd
  ]
})
export class RegionalAnalyticsModule {}
