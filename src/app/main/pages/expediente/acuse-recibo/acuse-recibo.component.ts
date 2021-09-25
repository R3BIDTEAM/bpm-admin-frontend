import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from "@core/services/auth.service";
import { environment } from 'environments/environment';
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import { DialogCargaComponent } from "app/main/dialog-carga/dialog-carga.component";
import { FlatpickrOptions } from 'ng2-flatpickr';
import Espanish from 'flatpickr/dist/l10n/es.js';
import { saveAs } from 'file-saver';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-acuse-recibo',
  templateUrl: './acuse-recibo.component.html',
  styleUrls: ['./acuse-recibo.component.scss']
})
export class AcuseReciboComponent implements OnInit {
  
  public loadingExpediente = true;

  public expediente;

  public contentHeader: object;
  
  public formAcuse: FormGroup;

  public numeroExpediente: String;

  httpOptions;

  public dateTimeOptions: FlatpickrOptions = {
    altInput: true,
    enableTime: true,
    locale: Espanish.es
  }
  
  constructor( 
    private http: HttpClient,
    private route: ActivatedRoute,
    private auth: AuthService,
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private snackBar: MatSnackBar,) { 

    this.formAcuse = this._formBuilder.group({
      entregado: [null, [Validators.required]],
      fechaHora: [null, [Validators.required]],
      nombre: [null, [Validators.required]],
      datosIdentificativos: [null, [Validators.required]],
    });
    
  }

  ngOnInit(): void {
    this.route.queryParams
      .subscribe(params => {
        if(params['expediente'] && params['expediente'].length > 0)
          this.numeroExpediente = params['expediente'];
          this.getData(this.numeroExpediente);
      }
    );

    this.httpOptions = {
      headers: new HttpHeaders({
        login: this.auth.getSession().userData.login,
        rol: this.auth.getSession().userData.rol.toString(),
      })
    };

    this.contentHeader = {
      headerTitle: 'Expediente',
      actionButton: true,
      isLink: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Bandeja de Tareas',
            isLink: true,
            link: '/main'
          },
          {
            name: 'Acuse de Recibo',
            isLink: false,
            link: '/'
          }
        ]
      }
    }
  }

  save (): void {
    let insertaExpedienteCompleto = environment.endpointAPI + 'acuseRecibo?action=registrarNotificacion';
    
    let fecha = Number(Date.parse(this.formAcuse.value.fechaHora))

    let data = {
      "numeroExpediente": this.numeroExpediente,
      "tipoTramite": 23,
      "expedienteEntrega": {
          "fechaEntrega": {
              "$date": fecha
          },
          "receptor": this.formAcuse.value.nombre,
          "entregado": this.formAcuse.value.entregado,
          "idDocumentoDigital": this.expediente.acuseRecibo.idDocumentoDigital
      }
    };

    this.http.post(insertaExpedienteCompleto, JSON.stringify(data), this.httpOptions).subscribe(
      (res: any) => {
        console.log(res.error.code)
        switch(res.error.code) {
          case 502: {
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
        this.snackBar.open(error.message, 'Cerrar', {
          duration: 10000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    );
  }

  getData(numeroExpediente): void {
    let bandeTarias = environment.endpointAPI + 'acuseRecibo?action=getInformacionOficioAcuseRecibo';
    let options = {
      headers: new HttpHeaders({
        login: this.auth.getSession().userData.login,
        rol: this.auth.getSession().userData.rol.toString(),
      })
    }
    
    let filtro = {
      "numeroExpediente": numeroExpediente
    };

    this.loadingExpediente = true;
    this.http.post(bandeTarias,filtro, options).subscribe(
      (res: any) => {
        this.expediente = res.data;
        console.log(this.expediente)
        this.loadingExpediente = false;
      },
      (error) => {
        this.loadingExpediente = false;
        this.snackBar.open(error.message, 'Cerrar', {
          duration: 10000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    );
  }

  getFiles(idDocumentoDigital) {
    console.log(idDocumentoDigital)
    let urlDownloadAcuse = environment.endpointAPI + 'documentos?action=descargar';
    var body = { idDocumentoDigital: idDocumentoDigital.toString() };

    const headers = new HttpHeaders({ 
      login: this.auth.getSession().userData.login,
      rol: this.auth.getSession().userData.rol.toString()
    });

    return this.http.post(urlDownloadAcuse,body, { headers: headers, responseType: 'blob'});
  }

  downloadFile(idDocumentoDigital) {
    const dialogRef = this.dialog.open(DialogCargaComponent, {
      width: '600px',
    });
    this.getFiles(idDocumentoDigital).subscribe((response: any) => {
      this.download(response,idDocumentoDigital);
      dialogRef.close();
    }, error => {
      dialogRef.close();
      this.snackBar.open(error, 'Cerrar', {
        duration: 10000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    })
  }

  download(response,idDocumentoDigital) {
    var newBlob = new Blob([response])
    saveAs(newBlob, idDocumentoDigital.toString()+".doc");
  }
}
