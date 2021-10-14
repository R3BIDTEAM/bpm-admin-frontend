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
import {
  AltaExpedienteComponent,
  DialogSearchPromoventeRepresentante,
  DialogAddDomicilioNotificacion,
  DialogCuentasCatastralesCurso
} from 'app/main/pages/expediente/alta/alta-expediente.component';
import { BrigadasComponent } from './expediente/brigadas/brigadas.component';
import { TopografosComponent } from './expediente/topografos/topografos.component';
import { CadenerosComponent } from './expediente/cadeneros/cadeneros.component';
import { CrearComponent } from './expediente/brigadas/components/crear/crear.component';
import { EditarComponent } from './expediente/brigadas/components/editar/editar.component';
import { CreartopografoComponent } from './expediente/topografos/components/creartopografo/creartopografo.component';
import { CrearcadeneroComponent } from './expediente/cadeneros/components/crearcadenero/crearcadenero.component';

const routes = [
  {
    path: 'brigadas',
    component: BrigadasComponent,
    data: { animation: 'home' },
    canActivate: [GuardService]
  },
  {
    path: 'brigadas/crear',
    component: CrearComponent,
    data: { animation: 'home' },
    canActivate: [GuardService]
  },
  {
    path: 'brigadas/editar',
    component: EditarComponent,
    data: { animation: 'home' },
    canActivate: [GuardService]
  },
  {
    path: 'topografos',
    component: TopografosComponent,
    data: { animation: 'home' },
    canActivate: [GuardService]
  },
  {
    path: 'topografos/crear',
    component: CreartopografoComponent,
    data: { animation: 'home' },
    canActivate: [GuardService]
  },
  {
    path: 'cadeneros',
    component: CadenerosComponent,
    data: { animation: 'home' },
    canActivate: [GuardService]
  },
  {
    path: 'cadeneros/crear',
    component: CrearcadeneroComponent,
    data: { animation: 'home' },
    canActivate: [GuardService]
  }
];

@NgModule({
  declarations: [
    AcuseReciboComponent,
    AltaExpedienteComponent,
    DialogSearchPromoventeRepresentante,
    DialogAddDomicilioNotificacion,
    DialogCuentasCatastralesCurso,
    BrigadasComponent,
    TopografosComponent,
    CadenerosComponent,
    CrearComponent,
    EditarComponent,
    CreartopografoComponent,
    CrearcadeneroComponent
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
    Ng2FlatpickrModule
  ],

  providers: []
})
export class PagesModule {}
