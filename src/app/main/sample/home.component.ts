import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, OnInit, Inject } from '@angular/core'
import { environment } from 'environments/environment';
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DialogCargaComponent } from "app/main/dialog-carga/dialog-carga.component";
import Swal from 'sweetalert2'

import { AuthService } from "@core/services/auth.service";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  loadingListadoTramites = false;

  tramites = [];
  total = 0;
  pagina = 0;
  pageSize = 10;

  filtroForm: FormGroup;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private router: Router,
    public dialog: MatDialog,
  ) {}

  public contentHeader: object

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    console.log('configured routes: ', this.router.config);
    this.contentHeader = {
      headerTitle: 'Asignación de trámites',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Asignación',
            isLink: false
          }
        ]
      }
    };

    this.filtroForm = this._formBuilder.group({
      expediente: [null, []],
    });

    (async () => {
      await this.getTramites({ pageIndex:0 });
    })();

  }

  search() {
    (async () => {
      await this.getTramites({ pageIndex:0 });
    })();
  }

  getTramites(evt): void {
    this.pagina = evt.pageIndex + 1;
    
    let listTramites = environment.endpointAPI + 'kreintoBPM?action=getExpedienteNoAsignados';
    
    let options = {
      headers: new HttpHeaders({
        login: this.auth.getSession().userData.login,
        rol: this.auth.getSession().userData.rol.toString(),
        apellidos: this.auth.getSession().userData.primer_apellido + ' ' + this.auth.getSession().userData.segundo_apellido,
        nombre: this.auth.getSession().userData.nombre
      })
    }
    
    let filtro = {
      "numPagina": this.pagina,
      "tamanoPagina": this.pageSize,
      "orden": {
          "campo": "numeroExpediente",
          "valor": -1
      }
    };

    if(this.filtroForm.value.expediente && this.filtroForm.value.expediente != undefined && this.filtroForm.value.expediente != '')
      filtro["numeroExpediente"] = this.filtroForm.value.expediente;

    this.loadingListadoTramites = true;
    this.http.post(listTramites,filtro, options).subscribe(
      (res: any) => {
        this.loadingListadoTramites = false;
        if(res.error.code === 0)
        {
          this.total = res.data.conteo;
          this.tramites = res.data.resultado;
        } else {
          this.snackBar.open(res.error.message, 'Cerrar', {
            duration: 10000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      },
      (error) => {
        this.loadingListadoTramites = false;
        this.snackBar.open(error.message, 'Cerrar', {
          duration: 10000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    );
  }

  openDialogAsignaUsuario(numeroExpediente): void {
    const dialogRef = this.dialog.open(DialogAsignaUsuario, {
      width: '700px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        let endpoint = environment.endpointAPI + 'kreintoBPM?action=asignarExpediente';
    
        let options = {
          headers: new HttpHeaders({
            login: this.auth.getSession().userData.login,
            rol: this.auth.getSession().userData.rol.toString(),
            apellidos: this.auth.getSession().userData.primer_apellido + ' ' + this.auth.getSession().userData.segundo_apellido,
            nombre: this.auth.getSession().userData.nombre
          })
        };

        let body = {
          "numeroExpediente": numeroExpediente,
          "login": [
            result.login
          ]
        };

        const dialogRef = this.dialog.open(DialogCargaComponent, {
          width: '600px',
        });

        this.http.post(endpoint, JSON.stringify(body), options).subscribe(
          (res: any) => {
            dialogRef.close();
            switch(res.error.code) {
              case 0: {
                Swal.fire({  
                  title: 'Trámite Asignado',
                  html: 'El expediente con numero <strong>' + numeroExpediente + '</strong> fue asignado al usuario <strong>' + result.login + '</strong> exitosamente.',  
                  icon: 'success',
                  confirmButtonColor: '#a02042',
                  showCancelButton: false,  
                  confirmButtonText: 'Aceptar',  
                }).then((result) => {  
                  window.location.reload();
                });
                break;
              }
              case 100: {
                this.snackBar.open('Verifique la información ingresada', 'Cerrar', {
                  duration: 10000,
                  horizontalPosition: 'end',
                  verticalPosition: 'top'
                });
                break;
              }
              case 200: {
                this.snackBar.open('Ocurrió un error en la comucación, intentelo nuevamente', 'Cerrar', {
                  duration: 10000,
                  horizontalPosition: 'end',
                  verticalPosition: 'top'
                });
                break;
              }
              case 203: {
                this.snackBar.open('Ocurrió un error al guardar la información, intentelo nuevamente', 'Cerrar', {
                  duration: 10000,
                  horizontalPosition: 'end',
                  verticalPosition: 'top'
                });
                break;
              }
              default: {
                this.snackBar.open(res.error.message, 'Cerrar', {
                  duration: 10000,
                  horizontalPosition: 'end',
                  verticalPosition: 'top'
                });
                break;
              }
            }
          },
          (error) => {
            dialogRef.close();
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

@Component({
  selector: 'app-dialog-asigna-usuario',
  templateUrl: 'app-dialog-asigna-usuario.html',
})
export class DialogAsignaUsuario {
  endpoint = environment.ssoEndpoint + 'usuarios/plataforma/8';

  loadingPaginado = false;
  pagina = 0;
  total = 0;
  pageSize = 5;

  dataSource = [];
  dataResponse = [];
  
  usuario;
  
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<DialogAsignaUsuario>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      dialogRef.disableClose = true;

      this.getData();
    }

  getData(): void {
    this.loadingPaginado = true;
    this.pagina = 1;
  
    this.http.get(this.endpoint).subscribe(
      (res: any) => {
        this.loadingPaginado = false;
          if(res.length > 0){
            this.dataResponse = res;
            this.dataSource = this.paginate(this.dataResponse, this.pageSize, this.pagina);
            this.total = this.dataResponse.length;
          } else {
            this.dataResponse = [];
            this.dataSource = [];
            this.total = 0;
          }
      },
      (error) => {
        this.loadingPaginado = false;
        this.snackBar.open(error.message, 'Cerrar', {
          duration: 10000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    );
  }

  paginado(evt): void{
    this.pagina = evt.pageIndex + 1;
    this.dataSource = this.paginate(this.dataResponse, this.pageSize, this.pagina);
  }

  paginate(array, page_size, page_number) {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  }

}