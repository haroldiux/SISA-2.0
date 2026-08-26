import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

import { ScuCareerOversightComponent } from './components/scu-career-oversight/scu-career-oversight.component';
import { ScuCohortProgressTableComponent } from './components/scu-cohort-progress-table/scu-cohort-progress-table.component';
import { ScuPacReviewModalComponent } from './components/scu-pac-review-modal/scu-pac-review-modal.component';
import { ScuPacReviewCmd } from './commands/scu-pac-review.cmd';

const routes: Routes = [
  { path: '', component: ScuCareerOversightComponent }
];

/**
 * Career Oversight Module (Frame 2).
 *
 * @author GentleAI SISA Architecture Team
 */
@NgModule({
  declarations: [
    ScuCareerOversightComponent,
    ScuCohortProgressTableComponent,
    ScuPacReviewModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    ScuPacReviewCmd
  ]
})
export class CareerOversightModule {}
