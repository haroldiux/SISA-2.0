import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/public/public.module').then(m => m.PublicModule)
  },
  {
    path: 'secure',
    loadChildren: () => import('./modules/secure/secure.module').then(m => m.SecureModule)
  },
  { path: '', redirectTo: 'secure', pathMatch: 'full' },
  { path: '**', redirectTo: 'secure' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
