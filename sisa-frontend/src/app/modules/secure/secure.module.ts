import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecureRoutingModule } from './secure-routing.module';
import { SecureComponent } from './secure.component';
import { AppCoreModule } from '@core/app-core.module';
import { SharedModule } from '@shared/shared.module';

/**
 * Secure Root Module containing layout and role-guarded secure features.
 *
 * @author GentleAI SISA Architecture Team
 */
@NgModule({
  declarations: [
    SecureComponent
  ],
  imports: [
    CommonModule,
    SecureRoutingModule,
    AppCoreModule,
    SharedModule
  ]
})
export class SecureModule {}
