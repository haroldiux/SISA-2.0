import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicRoutingModule } from './public-routing.module';

/**
 * Public Root Module.
 *
 * @author GentleAI SISA Architecture Team
 */
@NgModule({
  imports: [
    CommonModule,
    PublicRoutingModule
  ]
})
export class PublicModule {}
