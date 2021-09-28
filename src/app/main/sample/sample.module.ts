import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { CoreCommonModule } from '@core/common.module';

import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';

import { SampleComponent } from './sample.component';
import { HomeComponent, DialogAsignaUsuario, DialogSuccessAsignacion } from './home.component';
import { GuardService } from '@core/services/guard.service';

import { AuthLoginV2Component } from '../pages/authentication/auth-login-v2/auth-login-v2.component';
import { MaterialModule } from 'app/material/material.module';

const routes = [
  { path: '', component: AuthLoginV2Component },
  {
    path: 'main',
    component: HomeComponent,
    data: { animation: 'home' },
    canActivate: [GuardService]
  }
];

@NgModule({
  declarations: [SampleComponent, HomeComponent, DialogAsignaUsuario, DialogSuccessAsignacion],
  imports: [RouterModule.forChild(routes), ContentHeaderModule, TranslateModule, CoreCommonModule,MaterialModule],
  exports: [SampleComponent, HomeComponent]
})
export class SampleModule {}
