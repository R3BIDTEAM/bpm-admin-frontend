import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-crearcadenero',
  templateUrl: './crearcadenero.component.html',
  styleUrls: ['./crearcadenero.component.scss']
})
export class CrearcadeneroComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private router: Router
  ) {
    this.formGroup = this._formBuilder.group({
      //curp: [null, [Validators.required]],
      nombre: [null, [Validators.required]],
      apellidoPaterno: [null, [Validators.required]],
      apellidoMaterno: [null, [Validators.required]],
      // rfc: [null, [Validators.required]],
      // claveIne: [null, [Validators.required]],
      // otros: [null, [Validators.required]],
      celular: [null, [Validators.minLength(10), Validators.maxLength(10)]],
      email: [null, [Validators.email]]
    });
  }

  contentHeader: object;
  formGroup: FormGroup;
  loadingSave = false;

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

  ngOnInit(): void {
    this.contentHeader = {
      headerTitle: 'Crear cadenero',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Cadeneros',
            link: '/cadeneros',
            isLink: true
          },
          {
            name: 'Crear cadenero',
            isLink: false
          }
        ]
      }
    };
  }

  save() {
    const uri = environment.endpointAPI + 'brigada?action=agregarCadeneros';

    let brigadaEnvio = {};
    brigadaEnvio = this.formGroup.value;

    console.log(brigadaEnvio);

    this.loadingSave = true;
    this.http.post(uri, brigadaEnvio, this.options).subscribe(
      (res: any) => {
        console.log(res);
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
              html: 'Se guardó el Cadenero <b>'+ res.data.nombre + ' ' + res.data.apellidoPaterno + ' ' + res.data.apellidoMaterno +'</b> con éxito',
              icon: 'success',
              confirmButtonColor: '#a02042',
              showCancelButton: false,
              confirmButtonText: 'Aceptar'
            }).then((result) => {
              this.router.navigate(['/cadeneros']);
            });
          }
          case 0: {
            this.loadingSave = false;
            Swal.fire({
              title: '',
              html: 'Se guardó el Cadenero <b>'+ res.data.nombre + ' ' + res.data.apellidoPaterno + ' ' + res.data.apellidoMaterno +'</b> con éxito',
              icon: 'success',
              confirmButtonColor: '#a02042',
              showCancelButton: false,
              confirmButtonText: 'Aceptar'
            }).then((result) => {
              this.router.navigate(['/cadeneros']);
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
