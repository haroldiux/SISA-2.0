import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

import { ScuLayoutShellComponent } from './components/scu-layout-shell/scu-layout-shell.component';
import { ScuHeaderComponent } from './components/scu-header/scu-header.component';
import { ScuRoleSwitcherComponent } from './components/scu-role-switcher/scu-role-switcher.component';
import { ScuJwtInterceptor } from './interceptors/scu-jwt.interceptor';
import { ScuErrorInterceptor } from './interceptors/scu-error.interceptor';

/**
 * App Core Module containing singleton layout components, guards, and HTTP interceptors.
 *
 * @author GentleAI SISA Architecture Team
 */
@NgModule({
  declarations: [
    ScuLayoutShellComponent,
    ScuHeaderComponent,
    ScuRoleSwitcherComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    DropdownModule,
    ButtonModule,
    ToastModule
  ],
  exports: [
    ScuLayoutShellComponent,
    ScuHeaderComponent,
    ScuRoleSwitcherComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ScuJwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ScuErrorInterceptor, multi: true }
  ]
})
export class AppCoreModule {}
