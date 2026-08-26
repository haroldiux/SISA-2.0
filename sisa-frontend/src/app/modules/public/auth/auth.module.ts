import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import { ScuLoginComponent } from './components/scu-login/scu-login.component';
import { ScuAuthLoginCmd } from './commands/scu-auth-login.cmd';

const routes: Routes = [
  { path: 'login', component: ScuLoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

/**
 * Public Authentication Module.
 *
 * @author GentleAI SISA Architecture Team
 */
@NgModule({
  declarations: [
    ScuLoginComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    ScuAuthLoginCmd
  ]
})
export class AuthModule {}
