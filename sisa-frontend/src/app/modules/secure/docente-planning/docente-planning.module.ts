import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

// Components
import { ScuDocentePlanningComponent } from './components/scu-docente-planning/scu-docente-planning.component';
import { ScuMatriz7GridComponent, ScuPacMatrixComponent } from './components/scu-pac-matrix/scu-pac-matrix.component';
import { ScuPlanClaseEditorComponent } from './components/scu-plan-clase-editor/scu-plan-clase-editor.component';
import { ScuProgramaAnaliticoEditorComponent } from './components/scu-programa-analitico-editor/scu-programa-analitico-editor.component';
import { ScuAutosaveIndicatorComponent } from './components/scu-autosave-indicator/scu-autosave-indicator.component';
import { ScuValidationPanelComponent } from './components/scu-pac-validation-panel/scu-pac-validation-panel.component';
import { ScuPacCalendarGeneratorComponent } from './components/scu-pac-calendar-generator/scu-pac-calendar-generator.component';
import { ScuExcelIngestModalComponent } from './components/scu-pac-excel-modal/scu-pac-excel-modal.component';
import { ScuPlanClaseCloneModalComponent } from './components/scu-plan-clase-clone-modal/scu-plan-clase-clone-modal.component';
import { ScuPlanClaseExcelModalComponent } from './components/scu-plan-clase-excel-modal/scu-plan-clase-excel-modal.component';
import { ScuLearningUnitsManagerComponent } from './components/scu-learning-units-manager/scu-learning-units-manager.component';
import { ScuApaBibliographyManagerComponent } from './components/scu-apa-bibliography-manager/scu-apa-bibliography-manager.component';
import { ScuApaBuilderModalComponent } from './components/scu-apa-builder-modal/scu-apa-builder-modal.component';
import { ScuProgramaDocxModalComponent } from './components/scu-programa-docx-modal/scu-programa-docx-modal.component';
import { ScuPlanningPreflightCheckerComponent } from './components/scu-planning-preflight-checker/scu-planning-preflight-checker.component';
import { ScuDirectorFeedbackViewerComponent } from './components/scu-director-feedback-viewer/scu-director-feedback-viewer.component';

// State Services
import { ScuPacStateService } from './services/scu-pac-state.service';
import { ScuPlanClaseStateService } from './services/scu-plan-clase-state.service';
import { ScuProgramaStateService } from './services/scu-programa-state.service';

// Commands
import { ScuPacSaveCmd } from './commands/scu-pac-save.cmd';
import { ScuPacSubmitCmd } from './commands/scu-pac-submit.cmd';
import { ScuPlanClaseSaveCmd } from './commands/scu-plan-clase-save.cmd';
import { ScuProgramaAnaliticoSaveCmd } from './commands/scu-programa-analitico-save.cmd';
import { ScuPlanningSubmitCmd } from './commands/scu-planning-submit.cmd';

const routes: Routes = [
  { path: '', component: ScuDocentePlanningComponent }
];

/**
 * Docente Planning Module - Complete Three-Tier Academic Planning Trilogy.
 *
 * Encapsulates Macrocurricular (Programa Analítico), Mesocurricular (PAC Matriz 7),
 * and Microdidactic (Planes de Clase) editors, validators, modals, and governance workflows.
 *
 * @author GentleAI SISA Architecture Team
 */
@NgModule({
  declarations: [
    ScuDocentePlanningComponent,
    ScuMatriz7GridComponent,
    ScuPlanClaseEditorComponent,
    ScuProgramaAnaliticoEditorComponent,
    ScuAutosaveIndicatorComponent,
    ScuValidationPanelComponent,
    ScuPacCalendarGeneratorComponent,
    ScuExcelIngestModalComponent,
    ScuPlanClaseCloneModalComponent,
    ScuPlanClaseExcelModalComponent,
    ScuLearningUnitsManagerComponent,
    ScuApaBibliographyManagerComponent,
    ScuApaBuilderModalComponent,
    ScuProgramaDocxModalComponent,
    ScuPlanningPreflightCheckerComponent,
    ScuDirectorFeedbackViewerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    ScuPacStateService,
    ScuPlanClaseStateService,
    ScuProgramaStateService,
    ScuPacSaveCmd,
    ScuPacSubmitCmd,
    ScuPlanClaseSaveCmd,
    ScuProgramaAnaliticoSaveCmd,
    ScuPlanningSubmitCmd
  ]
})
export class DocentePlanningModule {}
