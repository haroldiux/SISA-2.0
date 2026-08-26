import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ProgressBarModule } from 'primeng/progressbar';

import { ScuStatusBadgeComponent } from './components/scu-status-badge/scu-status-badge.component';
import { ScuDurationCounterComponent } from './components/scu-duration-counter/scu-duration-counter.component';
import { ScuOfficeExportButtonComponent } from './components/scu-office-export-button/scu-office-export-button.component';

/**
 * Shared Module exporting common Angular/PrimeNG modules and reusable SCU components.
 *
 * @author GentleAI SISA Architecture Team
 */
@NgModule({
  declarations: [
    ScuStatusBadgeComponent,
    ScuDurationCounterComponent,
    ScuOfficeExportButtonComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    DropdownModule,
    TagModule,
    ToastModule,
    DialogModule,
    TooltipModule,
    CardModule,
    TabViewModule,
    InputTextareaModule,
    ProgressBarModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    DropdownModule,
    TagModule,
    ToastModule,
    DialogModule,
    TooltipModule,
    CardModule,
    TabViewModule,
    InputTextareaModule,
    ProgressBarModule,
    ScuStatusBadgeComponent,
    ScuDurationCounterComponent,
    ScuOfficeExportButtonComponent
  ]
})
export class SharedModule {}
