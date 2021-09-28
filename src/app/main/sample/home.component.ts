import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, OnInit } from '@angular/core'
import { environment } from 'environments/environment';
import { MatSnackBar } from "@angular/material/snack-bar";

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
    
    let listTramites = environment.endpointAPI + 'kreintoBPM?action=getBandejaTareas';
    
    let options = {
      headers: new HttpHeaders({
        login: this.auth.getSession().userData.login,
        rol: this.auth.getSession().userData.rol.toString(),
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
        this.total = res.data.conteo;
        this.tramites = res.data.resultado;
        this.loadingListadoTramites = false;
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
}
