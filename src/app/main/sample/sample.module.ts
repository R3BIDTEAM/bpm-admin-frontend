import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { CoreCommonModule } from '@core/common.module';

import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';

import { SampleComponent } from './sample.component';
import { HomeComponent } from './home.component';
import { GuardService } from '@core/services/guard.service';

import { AuthLoginV2Component } from '../pages/authentication/auth-login-v2/auth-login-v2.component';
import { AltaExpedienteComponent,DialogSearchPromoventeRepresentante,DialogAddDomicilioNotificacion, DialogCuentasCatastralesCurso,DialogInsertaExpediente } from 'app/main/sample/alta-expediente/alta-expediente.component';
import { MaterialModule } from 'app/material/material.module';

const routes = [
  { path: '', component: AuthLoginV2Component },
  {
    path: 'main',
    component: HomeComponent,
    data: { animation: 'home' },
    canActivate: [GuardService]
  },
  {
    path: 'registro/alta-expediente',
    component: AltaExpedienteComponent,
    data: { animation: 'home'},
    canActivate: [GuardService]
  }
];

@NgModule({
  declarations: [SampleComponent, HomeComponent,AltaExpedienteComponent,DialogSearchPromoventeRepresentante,DialogAddDomicilioNotificacion,DialogCuentasCatastralesCurso,DialogInsertaExpediente],
  imports: [RouterModule.forChild(routes), ContentHeaderModule, TranslateModule, CoreCommonModule,MaterialModule],
  exports: [SampleComponent, HomeComponent]
})
export class SampleModule {}
