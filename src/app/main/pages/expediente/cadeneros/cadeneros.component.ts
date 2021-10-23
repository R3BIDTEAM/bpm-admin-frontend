import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cadeneros',
  templateUrl: './cadeneros.component.html',
  styleUrls: ['./cadeneros.component.scss']
})
export class CadenerosComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  contentHeader: object;
  cadeneros = [];
  loadingCadeneros = true;

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
      headerTitle: 'Cadeneros',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Cadeneros de Topógrafos',
            link: '/main',
            isLink: false
          },
          {
            name: 'Cadeneros',
            isLink: false
          }
        ]
      }
    };

    (async () => {
      await this.getList();
    })();
  }

  getList(): void {
    const uri = environment.endpointAPI + 'brigada?action=getCadeneros';

    let filtro = {};

    this.http.post(uri, filtro, this.options).subscribe(
      (res: any) => {
        this.cadeneros = res.data.respuesta;
        this.loadingCadeneros = false;
        console.log(this.cadeneros);
      },
      (error) => {
        this.loadingCadeneros = false;
        this.snackBar.open(error.message, 'Cerrar', {
          duration: 10000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    );
  }

  deleteCadenero(id) {
    const uri = environment.endpointAPI + 'brigada?action=eliminarCadeneros';

    let filtro = {
      id: id
    };

    Swal.fire({
      title: 'Estas seguro?',
      text: 'Esta accion es irreversible',
      icon: 'warning',
      confirmButtonColor: '#a02042',
      showCancelButton: true,
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      console.log(result);
      if (result.isConfirmed) {
        this.http.post(uri, filtro, this.options).subscribe(
          (res: any) => {
            this.loadingCadeneros = true;
            this.getList();
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
    });
  }
}
