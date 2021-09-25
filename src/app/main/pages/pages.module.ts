import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';

import { CoreCommonModule } from '@core/common.module';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';

import { AuthenticationModule } from './authentication/authentication.module';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';
import { AcuseReciboComponent } from './expediente/acuse-recibo/acuse-recibo.component';
import { RouterModule } from '@angular/router';
import { GuardService } from '@core/services/guard.service';
import { MaterialModule } from 'app/material/material.module';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { AltaExpedienteComponent,DialogSearchPromoventeRepresentante,DialogAddDomicilioNotificacion, DialogCuentasCatastralesCurso } from 'app/main/pages/expediente/alta/alta-expediente.component';

const routes = [
  {
    path: 'expediente/alta',
    component: AltaExpedienteComponent,
    data: { animation: 'home'},
    canActivate: [GuardService]
  },
  {
    path: 'expediente/acuse-recibo',
    component: AcuseReciboComponent,
    data: { animation: 'home'},
    canActivate: [GuardService]
  }
];

@NgModule({
  declarations: [
    AcuseReciboComponent,
    AltaExpedienteComponent,
    DialogSearchPromoventeRepresentante,
    DialogAddDomicilioNotificacion,
    DialogCuentasCatastralesCurso
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CoreCommonModule,
    ContentHeaderModule,
    NgbModule,
    NgSelectModule,
    FormsModule,
    AuthenticationModule,
    MiscellaneousModule,
    MaterialModule,
    Ng2FlatpickrModule,
  ],

  providers: []
})

export class PagesModule {}
