import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.component.html',
  styleUrls: ['./crear.component.scss']
})
export class CrearComponent implements OnInit {
  brigada = null;
  contentHeader: object;
  supervisores: Array<object>;
  topografos: Array<object>;
  cadeneros: Array<object>;
  loadingSupervisores = true;
  loadingTopografos = true;
  loadingCadeneros = true;
  loadingSave = false;
  formGroup: FormGroup;

  nombre = null;
  supervisor = null;
  topografo = null;
  cadenero1 = null;
  cadenero2 = null;

  options = {
    headers: new HttpHeaders({
      login: this.auth.getSession().userData.login,
      rol: this.auth.getSession().userData.rol.toString(),
      apellidos:
        this.auth.getSession().userData.primer_apellido +
        ' ' +
        this.auth.getSession().userData.segundo_apellido,
      nombre: this.auth.getSession().userData.nombre
    })
  };

  constructor(
    private router: Router,
    private http: HttpClient,
    private _formBuilder: FormBuilder,
    private auth: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.formGroup = this._formBuilder.group({
      nombre: [null, [Validators.required]],
      supervisor: [null, [Validators.required]],
      topografo: [null, [Validators.required]],
      cadenero1: [null, [Validators.required]],
      cadenero2: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.contentHeader = {
      headerTitle: 'Crear brigada',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Brigadas',
            link: '/brigadas',
            isLink: true
          },
          {
            name: 'Crear brigada',
            isLink: false
          }
        ]
      }
    };

    (async () => {
      await this.getSupervisores();
      await this.getTopografos();
      await this.getCadeneros();
      // await this.getConfirmaciones();
    })();
  }

  getSupervisores() {
    const uri = environment.ssoEndpoint + 'usuarios/adycon/supervisor-campo';

    this.http.get(uri).subscribe(
      (res: any) => {
        this.supervisores = res;
        this.loadingSupervisores = false;
        console.log(this.supervisores);
      },
      (error) => {
        this.loadingSupervisores = false;
      }
    );
  }
  getTopografos() {
    const uri = environment.endpointAPI + 'brigada?action=getTopografos';

    this.http.post(uri, {}, this.options).subscribe(
      (res: any) => {
        this.topografos = res.data.respuesta;
        this.loadingTopografos = false;
        console.log(this.topografos);
      },
      (error) => {
        this.loadingTopografos = false;
      }
    );
  }
  getCadeneros() {
    const uri = environment.endpointAPI + 'brigada?action=getCadeneros';

    this.http.post(uri, {}, this.options).subscribe(
      (res: any) => {
        this.cadeneros = res.data.respuesta;
        this.loadingCadeneros = false;
        console.log(this.cadeneros);
      },
      (error) => {
        this.loadingCadeneros = false;
      }
    );
  }

  getSupervisorObject() {
    const supervisor = this.formGroup.value.supervisor;
    const hoy = Date.now();

    const supervisorData = {
      claveIne: supervisor.ife || '',
      insertTime: {
        $date: hoy
      },
      apellidoPaterno: supervisor.apellidopaterno,
      otros: '',
      celular: supervisor.telefono || '',
      active: true,
      nombre: supervisor.nombre,
      curp: supervisor.curp || '',
      rfc: supervisor.rfc,
      email: supervisor.correo,
      apellidoMaterno: supervisor.apellidomaterno
    };

    return supervisorData;
  }

  save() {
    const uri = environment.endpointAPI + 'brigada?action=agregarBrigadas';
    const supervisor = this.getSupervisorObject();

    const brigadaEnvio = {};

    brigadaEnvio['nombre'] = this.formGroup.value.nombre;
    brigadaEnvio['supervisor'] = supervisor;
    brigadaEnvio['topografo'] = this.formGroup.value.topografo;
    brigadaEnvio['cadenero1'] = this.formGroup.value.cadenero1;
    brigadaEnvio['cadenero2'] = this.formGroup.value.cadenero2;

    console.log(brigadaEnvio);

    this.loadingSave = true;
    this.http.post(uri, brigadaEnvio, this.options).subscribe(
      (res: any) => {
        console.log(res.error.code);
        switch (res.error.code) {
          case 502: {
            this.loadingSave = false;
            this.snackBar.open(res.error.message, 'Cerrar', {
              duration: 10000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
            break;
          }
          case 505: {
            this.loadingSave = false;
            Swal.fire({
              title: '',
              html: 'Se guardó la brigada' + ' <b>' + res.data.nombre + '</b> ' + 'con éxito',
              icon: 'success',
              confirmButtonColor: '#a02042',
              showCancelButton: false,
              confirmButtonText: 'Aceptar'
            }).then((result) => {
              this.router.navigate(['/brigadas']);
            });
          }
          case 0: {
            this.loadingSave = false;
            Swal.fire({
              title: '',
              html: 'Se guardó la brigada' + ' <b>' + res.data.nombre + '</b> ' + 'con éxito',
              icon: 'success',
              confirmButtonColor: '#a02042',
              showCancelButton: false,
              confirmButtonText: 'Aceptar'
            }).then((result) => {
              this.router.navigate(['/brigadas']);
            });
          }
          default: {
            this.loadingSave = false;
          }
        }
      },
      (error) => {
        this.snackBar.open(error.message, 'Cerrar', {
          duration: 10000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    );
  }

}
