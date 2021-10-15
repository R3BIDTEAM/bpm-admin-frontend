import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-brigadas',
  templateUrl: './brigadas.component.html',
  styleUrls: ['./brigadas.component.scss']
})
export class BrigadasComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  contentHeader: object;
  loadingBrigadas = true;
  brigadas = [];

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
      headerTitle: 'Brigadas',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Asignacion de tramites',
            link: '/main',
            isLink: true
          },
          {
            name: 'Brigadas',
            isLink: false
          }
        ]
      }
    };

    (async () => {
      await this.getList();
      // await this.getConfirmaciones();
    })();
  }


  navigateToDetail(evt) {
    console.log(evt);
    this.router.navigate(['/brigadas/editar'], { state: evt });

    
  }

  getList(): void {
    const uri = environment.endpointAPI + 'brigada?action=getBrigadas';

    let filtro = {};

    this.http.post(uri, filtro, this.options).subscribe(
      (res: any) => {
        this.brigadas = res.data.respuesta;
        this.loadingBrigadas = false;
        console.log(this.brigadas);
      },
      (error) => {
        this.loadingBrigadas = false;
        this.snackBar.open(error.message, 'Cerrar', {
          duration: 10000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    );
  }

  deleteDetail(id) {
    const uri = environment.endpointAPI + 'brigada?action=eliminarBrigadas';

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
            this.loadingBrigadas = true;
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
