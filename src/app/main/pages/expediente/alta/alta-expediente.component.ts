import { DatePipe } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "environments/environment"

import { AuthService } from "@core/services/auth.service";
import { saveAs } from 'file-saver';

import Stepper from 'bs-stepper';
import { DialogCargaComponent } from "app/main/dialog-carga/dialog-carga.component";
export interface DataExpediente {
  tipoTramite: string;
  descripcion: string;
  abreviatura: string;
  observaciones: string;
}

export interface DataDocumentosAportar {
  idConjuntoDocumental: string;
  tramite: string;
  idTipoDocumento: string;
  conjuntoDocumental: string;
  idProcess: number;
  documento: string;
  obligatorio: string;
  abreviaturaProceso: string;
  entregado: false;
}
export interface DataPromoventeRepresentante {
  tipo: string;
  curp: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rfc: string;
  claveIne: string;
  otros: string;
  celular: number;
  email: string;
  idDocIdentif: number;
  notificacion: boolean;
  activprincip: string;
}

export interface DataCuentaCatastral {
  region: string;
  manzana: string;
  lote: string;
  unidadPrivativa: string;
  direccion: any;
  idInmueble: string;
}

export interface DataDomicilioNotificacion {
  IDDOMICILIONOTIFICACIONES: number;
  CODTIPOSVIA: number;
  IDVIA: number;
  VIA: string;
  NUMEROEXTERIOR: string;
  ENTRECALLE1: string;
  ENTRECALLE2: string;
  ANDADOR: string;
  EDIFICIO: string;
  SECCION: string;
  ENTRADA: string;
  CODTIPOSLOCALIDAD: number;
  NUMEROINTERIOR: string;
  CODTIPOSASENTAMIENTO: number;
  IDCOLONIA: number;
  CODASENTAMIENTO: number;
  COLONIA: string;
  CODIGOPOSTAL: string;
  CODCIUDAD: number;
  CIUDAD: string;
  IDDELEGACION: number;
  CODMUNICIPIO: number;
  DELEGACION: string;
  TELEFONO: string;
  CODESTADO: number;
  INDICACIONESADICIONALES: string;
  IDCHS_MTODESDE: number;
  CODTIPOSDIRECCION: string;
  CODTIPOSDIRECCI: string;
}
@Component({
  selector: 'app-alta-expediente',
  templateUrl: './alta-expediente.component.html',
  styleUrls: ['./alta-expediente.component.scss'],
  providers: [DatePipe],
  encapsulation: ViewEncapsulation.None,
})
export class AltaExpedienteComponent implements OnInit {
    public contentHeader: object;
    private horizontalWizardStepper: Stepper;
    private bsStepper;

    httpOptions;
    httpOptionsContentType;

    tiposTramite;
    tiposPersona;
    tiposDocIdentif;
    tiposVia;
    tiposLocalidad;
    delegaciones;

    indexEdicionPromovente;
    indexEdicionRepresentante;

    dataExpediente: DataExpediente = {} as DataExpediente;
    dataDocumentosAportar: DataDocumentosAportar[] = [];
    dataPromoventes: DataPromoventeRepresentante[] = [];
    dataCuentasCatastrales: DataCuentaCatastral[] = [];
    dataDomicilioNotificacion: DataDomicilioNotificacion[] = [];
    dataRepresentantes: DataPromoventeRepresentante[] = [];

    pagina = 1;
    total = 0;
    pageSize = 5;

    loadingTiposTramite = false;
    loadingDocumentosAportar = false;
    loadingTiposPersona = false;
    loadingPaginado = false;
    loadingTiposDocIdentif = false;
    loadingDataCuentaCatastral = false;
    loadingTiposVia = false;
    loadingTiposLocalidad = false;
    loadingDelegaciones = false;
    loadingCuentasCatastrales = false;
    loadingInserta = false;

    isEdicionPromovente = false;
    isEdicionRepresentante = false;

    tipoPersonaPromovente = 'F';
    tipoPersonaRepresentante = 'F'

    promoventeFisica: FormGroup;
    cuentaCatastral: FormGroup;
    promoventeMoral: FormGroup;
    representanteFisica: FormGroup;
    representanteMoral: FormGroup;

    todayNumber: number = Date.now()
    
    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private datePipe: DatePipe,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        private auth: AuthService,
      ) { }
    horizontalWizardStepperNextNoValidation(){
      this.horizontalWizardStepper.next();
    }
    horizontalWizardStepperNext(data) {
      if (data.form.valid === true) {
        this.horizontalWizardStepper.next();
      }
    }
    /**
     * Horizontal Wizard Stepper Previous
     */
    horizontalWizardStepperPrevious() {
      this.horizontalWizardStepper.previous();
    }
    
    ngOnInit (): void {      
      this.horizontalWizardStepper = new Stepper(document.querySelector('#stepper'), {
        linear: false,
        animation: true
      });
      this.bsStepper = document.querySelectorAll('.bs-stepper');

      this.contentHeader = {
        headerTitle: 'Registro',
        actionButton: true,
        breadcrumb: {
          type: '',
          links: [
            {
              name: 'Alta de Expediente',
              isLink: false,
              link: '/'
            }
          ]
        }
      }

      this.httpOptions = {
        headers: new HttpHeaders({
          login: this.auth.getSession().userData.login,
          rol: this.auth.getSession().userData.rol.toString(),
        })
      };

      this.httpOptionsContentType = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      };

      (async () => {
        await this.getTiposTramite();
        await this.getTiposPersona();
        await this.getTiposDocIdentif();
        await this.getTiposVia();
        await this.getTiposLocalidad();
        await this.getDelegaciones();
      })();

      this.promoventeFisica = this._formBuilder.group({
        tipo: [null, []],
        curp: [null, [Validators.required]],
        nombre: [null, [Validators.required]],
        apellidoPaterno: [null, [Validators.required]],
        apellidoMaterno: [null, []],
        rfc: [null, [Validators.required]],
        claveIne: [null, []],
        idDocIdentif: [null,[]],
        otros: [null, []],
        celular: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
        email: [null, [Validators.required, Validators.email]],
        notificacion: [null,[]]
      });
      
      this.promoventeMoral = this._formBuilder.group({
        nombre: [null, [Validators.required]],
        rfc: [null, [Validators.required]],
        activprincip: [null, [Validators.required]],
      });

      this.representanteFisica = this._formBuilder.group({
        tipo: [null, []],
        curp: [null, [Validators.required]],
        nombre: [null, [Validators.required]],
        apellidoPaterno: [null, [Validators.required]],
        apellidoMaterno: [null, []],
        rfc: [null, [Validators.required]],
        claveIne: [null, []],
        idDocIdentif: [null,[]],
        otros: [null, []],
        celular: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
        email: [null, [Validators.required, Validators.email]],
        notificacion: [null,[]]
      });
  
      this.representanteMoral = this._formBuilder.group({
        nombre: [null, [Validators.required]],
        rfc: [null, [Validators.required]],
        activprincip: [null, [Validators.required]],
      });
      
      this.cuentaCatastral = this._formBuilder.group({
        region: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
        manzana: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
        lote: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
        unidadPrivativa: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      });

    }

    getTiposTramite(): void {
      let catTiposTramite = environment.endpoint + '?action=getCatalogo&coleccion=catTiposTramite';
      let filtro = "{\n    \"active\": true\n}";
      this.loadingTiposTramite = true;
      this.http.post(catTiposTramite, filtro, this.httpOptions).subscribe(
        (res: any) => {
          this.loadingTiposTramite = false;
          if(res.error.code === 0)
          {
            this.tiposTramite = res.data.respuesta;
          } else {
            this.snackBar.open(res.error.message, 'Cerrar', {
              duration: 10000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
          }
        },
        (error) => {
          this.loadingTiposTramite = false;
          this.snackBar.open(error.message, 'Cerrar', {
            duration: 10000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      );
    }

    getDocumentosAportar() {;
      this.loadingDocumentosAportar = true;
      this.pagina = 1;
      
      let ab = this.tiposTramite.find(element => element.tipoTramite === this.dataExpediente.tipoTramite)
      
      let filtro = '{\n    \"abreviaturaProceso\": \"'+ab.abreviatura+ '\"\n}';
      let get = environment.endpoint + '?action=getTiposDocumento';
      this.http.post(get, filtro, this.httpOptions).subscribe(
        (res: any) => {
          if(res.error.code === 0)
          {
            if(res.data.respuesta.length > 0){
              let data = res.data.respuesta;
              this.dataDocumentosAportar = data;
            } else {
              this.dataDocumentosAportar = [];
            }
          } else {
            this.snackBar.open(res.error.message, 'Cerrar', {
              duration: 10000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
          }
          this.loadingDocumentosAportar = false;
        },
        (error) => {
          this.snackBar.open(error.message, 'Cerrar', {
            duration: 10000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.loadingDocumentosAportar = false;
        }
      );
    }

    getTiposPersona(): void {
      let catTipoPersona = environment.endpoint + '?action=getCatalogo&coleccion=catTipoPersona';
      let filtro = "{\n    \"active\": true\n}";
      this.loadingTiposPersona = true;
      this.http.post(catTipoPersona, filtro, this.httpOptions).subscribe(
        (res: any) => {
          this.loadingTiposPersona = false;
          if(res.error.code === 0)
          {
            this.tiposPersona = res.data.respuesta;
          } else {
            this.snackBar.open(res.error.message, 'Cerrar', {
              duration: 10000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
          }
        },
        (error) => {
          this.loadingTiposPersona = false;
          this.snackBar.open(error.message, 'Cerrar', {
            duration: 10000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      );
    }

    getTiposDocIdentif(): void {
      let catDocIdentif = environment.endpoint + '?action=getCatalogo&coleccion=catDocIdentif';
      let filtro = "{\n    \"active\": true\n}";
      this.loadingTiposDocIdentif = true;
      this.http.post(catDocIdentif, filtro, this.httpOptions).subscribe(
        (res: any) => {
          this.loadingTiposDocIdentif = false;
          if(res.error.code === 0)
          {
            this.tiposDocIdentif = res.data.respuesta;
          } else {
            this.snackBar.open(res.error.message, 'Cerrar', {
              duration: 10000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
          }
        },
        (error) => {
          this.loadingTiposDocIdentif = false;
          this.snackBar.open(error.message, 'Cerrar', {
            duration: 10000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      );
    }
    
    addPromoventeFisica(): void {
      if(this.validatePromoventeRepresentante(this.promoventeFisica.value.rfc)){
        let promovente = {} as DataPromoventeRepresentante; 
        promovente.tipo = this.tipoPersonaPromovente;
        promovente.curp = this.promoventeFisica.value.curp;
        promovente.nombre = this.promoventeFisica.value.nombre;
        promovente.apellidoPaterno = this.promoventeFisica.value.apellidoPaterno;
        promovente.apellidoMaterno = (this.promoventeFisica.value.apellidoMaterno) ? this.promoventeFisica.value.apellidoMaterno : '';
        promovente.rfc = this.promoventeFisica.value.rfc;
        promovente.claveIne = (this.promoventeFisica.value.claveIne) ? this.promoventeFisica.value.claveIne : '';
        promovente.otros = (this.promoventeFisica.value.otros) ? this.promoventeFisica.value.otros : '';
        promovente.celular = this.promoventeFisica.value.celular;
        promovente.email = this.promoventeFisica.value.email;
        promovente.idDocIdentif = (this.promoventeFisica.value.idDocIdentif) ? this.promoventeFisica.value.idDocIdentif : 0;
        promovente.notificacion = this.promoventeFisica.value.notificacion;
  
        this.dataPromoventes.push(promovente);

        if(this.dataPromoventes.length == 1){
          this.dataPromoventes[0].notificacion = true;
        }

        this.clearFormPromovente();
      } else {
        this.snackBar.open("No puede agregar como promovente una persona que ya esta como representante", 'Cerrar', {
          duration: 10000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      } 
    }

    addRepresentanteFisica(): void {
      if(this.validateRepresentantePromovente(this.representanteFisica.value.rfc)){
        let representante = {} as DataPromoventeRepresentante; 
        representante.tipo = this.tipoPersonaPromovente;
        representante.curp = this.representanteFisica.value.curp;
        representante.nombre = this.representanteFisica.value.nombre;
        representante.apellidoPaterno = this.representanteFisica.value.apellidoPaterno;
        representante.apellidoMaterno = (this.representanteFisica.value.apellidoMaterno) ? this.representanteFisica.value.apellidoMaterno : '';
        representante.rfc = this.representanteFisica.value.rfc;
        representante.claveIne = (this.representanteFisica.value.claveIne) ? this.representanteFisica.value.claveIne : '';
        representante.otros = (this.representanteFisica.value.otros) ? this.representanteFisica.value.otros : '';
        representante.celular = this.representanteFisica.value.celular;
        representante.email = this.representanteFisica.value.email;
        representante.idDocIdentif = (this.representanteFisica.value.idDocIdentif) ? this.representanteFisica.value.idDocIdentif : 0;
        representante.notificacion = this.representanteFisica.value.notificacion;
  
        this.dataRepresentantes.push(representante);

        if(this.dataRepresentantes.length == 1){
          this.dataRepresentantes[0].notificacion = true;
        }

        this.clearFormRepresentante();
      } else {
        this.snackBar.open("No puede agregar como representante una persona que ya esta como promovente", 'Cerrar', {
          duration: 10000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      } 
    }

    addPromoventeMoral(): void {
      if(this.validatePromoventeRepresentante(this.promoventeMoral.value.rfc)){
        let promovente = {} as DataPromoventeRepresentante; 
        promovente.tipo = this.tipoPersonaPromovente;
        promovente.nombre = this.promoventeMoral.value.nombre;
        promovente.rfc = this.promoventeMoral.value.rfc;
        promovente.activprincip = this.promoventeMoral.value.activprincip;
        promovente.notificacion = false;
  
        this.dataPromoventes.push(promovente);
        
        if(this.dataPromoventes.length == 1){
          this.dataPromoventes[0].notificacion = true;
        }

        this.clearFormPromovente();
      } else {
        this.snackBar.open("No puede agregar como promovente una persona que ya esta como representante", 'Cerrar', {
          duration: 10000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      } 
    }

    addRepresentanteMoral(): void {
      if(this.validateRepresentantePromovente(this.representanteMoral.value.rfc)){
        let representante = {} as DataPromoventeRepresentante; 
        representante.tipo = this.tipoPersonaPromovente;
        representante.nombre = this.promoventeMoral.value.nombre;
        representante.rfc = this.promoventeMoral.value.rfc;
        representante.activprincip = this.promoventeMoral.value.activprincip;
        representante.notificacion = false;
  
        this.dataRepresentantes.push(representante);

        this.clearFormRepresentante();
      } else {
        this.snackBar.open("No puede agregar como representante una persona que ya esta como promovente", 'Cerrar', {
          duration: 10000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      } 
    }

    saveRepresentanteMoral(): void {
      if(this.validateRepresentantePromovente(this.representanteMoral.value.RFC)){
        this.dataRepresentantes[this.indexEdicionRepresentante].tipo = this.tipoPersonaRepresentante;
        this.dataRepresentantes[this.indexEdicionRepresentante].nombre = this.representanteMoral.value.nombre;
        this.dataRepresentantes[this.indexEdicionRepresentante].rfc = this.representanteMoral.value.rfc;
        this.dataRepresentantes[this.indexEdicionRepresentante].activprincip = this.representanteMoral.value.activprincip;
        this.dataRepresentantes[this.indexEdicionRepresentante].notificacion = false;
  
        this.clearFormRepresentante();
      } else {
        this.snackBar.open("No puede agregar como representante una persona que ya esta como promovente", 'Cerrar', {
          duration: 10000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      } 
    }
  
    validatePromoventeRepresentante(rfc): boolean {
      let response = true;
      if(this.dataRepresentantes.length > 0){
        for(let i = 0; i < this.dataRepresentantes.length; i++) {
          if(this.dataRepresentantes[i].rfc === rfc){
            response = false;
          }
        }
      } else {
        response = true;
      }
      return response;
    }

    validateRepresentantePromovente(rfc): boolean {
      let response = true;
      if(this.dataPromoventes.length > 0){
        for(let i = 0; i < this.dataPromoventes.length; i++) {
          if(this.dataPromoventes[i].rfc === rfc){
            response = false;
          }
        }
      } else {
        response = true;
      }
      return response;
    }
    
    clearFormPromovente(): void {
      this.promoventeFisica.reset();
      this.promoventeMoral.reset();
      this.isEdicionPromovente = false;
      this.indexEdicionPromovente = undefined;
    }

    clearFormRepresentante(): void {
      this.representanteFisica.reset();
      this.representanteMoral.reset();
      this.isEdicionRepresentante = false;
      this.indexEdicionRepresentante = undefined;
    }

    setDatosNotificacionPromovente(index): void {
      for(let i = 0; i < this.dataPromoventes.length; i++) {
        if(i != index){
          this.dataPromoventes[i].notificacion = false;
        }
      }
      if(this.dataRepresentantes.length > 0){
        for(let i = 0; i < this.dataRepresentantes.length; i++) {
          this.dataRepresentantes[i].notificacion = false;
        }
      }
    }

    setDatosNotificacionRepresentante(index): void {
      for(let i = 0; i < this.dataRepresentantes.length; i++) {
        if(i != index){
          this.dataRepresentantes[i].notificacion = false;
        }
      }
      if(this.dataPromoventes.length > 0){
        for(let i = 0; i < this.dataPromoventes.length; i++) {
          this.dataPromoventes[i].notificacion = false;
        }
      }
    }

    editPromovente(index): void {
      this.tipoPersonaPromovente = this.dataPromoventes[index].tipo;
      if(this.tipoPersonaPromovente == 'F'){
        this.promoventeFisica.controls['tipo'].setValue(this.dataPromoventes[index].tipo);
        this.promoventeFisica.controls['nombre'].setValue(this.dataPromoventes[index].nombre);
        this.promoventeFisica.controls['apellidoPaterno'].setValue(this.dataPromoventes[index].apellidoPaterno);
        this.promoventeFisica.controls['apellidoMaterno'].setValue(this.dataPromoventes[index].apellidoMaterno);
        this.promoventeFisica.controls['rfc'].setValue(this.dataPromoventes[index].rfc);
        this.promoventeFisica.controls['curp'].setValue(this.dataPromoventes[index].curp);
        this.promoventeFisica.controls['claveIne'].setValue(this.dataPromoventes[index].claveIne);
        this.promoventeFisica.controls['idDocIdentif'].setValue(this.dataPromoventes[index].idDocIdentif);
        this.promoventeFisica.controls['otros'].setValue(this.dataPromoventes[index].otros);
        this.promoventeFisica.controls['celular'].setValue(this.dataPromoventes[index].celular);
        this.promoventeFisica.controls['email'].setValue(this.dataPromoventes[index].email);
      } else {
        this.promoventeMoral.controls['nombre'].setValue(this.dataPromoventes[index].nombre);
        this.promoventeMoral.controls['rfc'].setValue(this.dataPromoventes[index].rfc);
        this.promoventeMoral.controls['activprincip'].setValue(this.dataPromoventes[index].activprincip);
      }
      
      this.isEdicionPromovente = true;
      this.indexEdicionPromovente = index;
    }

    editRepresentante(index): void {
      this.tipoPersonaRepresentante = this.dataRepresentantes[index].tipo;
      if(this.tipoPersonaPromovente == 'F'){
        this.representanteFisica.controls['tipo'].setValue(this.dataRepresentantes[index].tipo);
        this.representanteFisica.controls['nombre'].setValue(this.dataRepresentantes[index].nombre);
        this.representanteFisica.controls['apellidoPaterno'].setValue(this.dataRepresentantes[index].apellidoPaterno);
        this.representanteFisica.controls['apellidoMaterno'].setValue(this.dataRepresentantes[index].apellidoMaterno);
        this.representanteFisica.controls['rfc'].setValue(this.dataRepresentantes[index].rfc);
        this.representanteFisica.controls['curp'].setValue(this.dataRepresentantes[index].curp);
        this.representanteFisica.controls['claveIne'].setValue(this.dataRepresentantes[index].claveIne);
        this.representanteFisica.controls['idDocIdentif'].setValue(this.dataRepresentantes[index].idDocIdentif);
        this.representanteFisica.controls['otros'].setValue(this.dataRepresentantes[index].otros);
        this.representanteFisica.controls['celular'].setValue(this.dataRepresentantes[index].celular);
        this.representanteFisica.controls['email'].setValue(this.dataPromoventes[index].email);
      } else {
        this.representanteMoral.controls['nombre'].setValue(this.dataRepresentantes[index].nombre);
        this.representanteMoral.controls['rfc'].setValue(this.dataRepresentantes[index].rfc);
        this.representanteMoral.controls['activprincip'].setValue(this.dataRepresentantes[index].activprincip);
      }
      
      this.isEdicionRepresentante = true;
      this.indexEdicionRepresentante = index;
    }

    savePromoventeFisica(): void {
      if(this.validatePromoventeRepresentante(this.promoventeFisica.value.rfc)){
        this.dataPromoventes[this.indexEdicionPromovente].tipo = this.tipoPersonaPromovente;
        this.dataPromoventes[this.indexEdicionPromovente].nombre = this.promoventeFisica.value.nombre;
        this.dataPromoventes[this.indexEdicionPromovente].apellidoPaterno = this.promoventeFisica.value.apellidoPaterno;
        this.dataPromoventes[this.indexEdicionPromovente].apellidoMaterno = (this.promoventeFisica.value.apellidoMaterno) ? this.promoventeFisica.value.apellidoMaterno : '';
        this.dataPromoventes[this.indexEdicionPromovente].rfc = this.promoventeFisica.value.rfc;
        this.dataPromoventes[this.indexEdicionPromovente].curp = this.promoventeFisica.value.curp;
        this.dataPromoventes[this.indexEdicionPromovente].claveIne = (this.promoventeFisica.value.claveIne) ? this.promoventeFisica.value.claveIne : '';
        this.dataPromoventes[this.indexEdicionPromovente].idDocIdentif = (this.promoventeFisica.value.idDocIdentif) ? this.promoventeFisica.value.idDocIdentif : 0;
        this.dataPromoventes[this.indexEdicionPromovente].otros = (this.promoventeFisica.value.otros) ? this.promoventeFisica.value.otros : '';
        this.dataPromoventes[this.indexEdicionPromovente].celular = this.promoventeFisica.value.celular;
        this.dataPromoventes[this.indexEdicionPromovente].email = this.promoventeFisica.value.email;
        this.clearFormPromovente();
      } else {
        this.snackBar.open("No puede agregar como promovente una persona que ya esta como representante", 'Cerrar', {
          duration: 10000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      } 
    }

    savePromoventeMoral(): void {
      if(this.validatePromoventeRepresentante(this.promoventeMoral.value.rfc)){
        this.dataPromoventes[this.indexEdicionPromovente].tipo = this.tipoPersonaPromovente;
        this.dataPromoventes[this.indexEdicionPromovente].nombre = this.promoventeMoral.value.nombre;
        this.dataPromoventes[this.indexEdicionPromovente].rfc = this.promoventeMoral.value.rfc;
        this.dataPromoventes[this.indexEdicionPromovente].activprincip = this.promoventeMoral.value.activprincip;
        this.dataPromoventes[this.indexEdicionPromovente].notificacion = false;
  
        this.clearFormPromovente();
      } else {
        this.snackBar.open("No puede agregar como promovente una persona que ya esta como representante", 'Cerrar', {
          duration: 10000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      } 
    }

    saveRepresentanteFisica(): void {
      if(this.validateRepresentantePromovente(this.representanteFisica.value.rfc)){
        this.dataRepresentantes[this.indexEdicionRepresentante].tipo = this.tipoPersonaPromovente;
        this.dataRepresentantes[this.indexEdicionRepresentante].nombre = this.representanteFisica.value.nombre;
        this.dataRepresentantes[this.indexEdicionRepresentante].apellidoPaterno = this.representanteFisica.value.apellidoPaterno;
        this.dataRepresentantes[this.indexEdicionRepresentante].apellidoMaterno = (this.representanteFisica.value.apellidoMaterno) ? this.representanteFisica.value.apellidoMaterno : '';
        this.dataRepresentantes[this.indexEdicionRepresentante].rfc = this.representanteFisica.value.rfc;
        this.dataRepresentantes[this.indexEdicionRepresentante].curp = this.representanteFisica.value.curp;
        this.dataRepresentantes[this.indexEdicionRepresentante].claveIne = (this.representanteFisica.value.claveIne) ? this.representanteFisica.value.claveIne : '';
        this.dataRepresentantes[this.indexEdicionRepresentante].idDocIdentif = (this.representanteFisica.value.idDocIdentif) ? this.representanteFisica.value.idDocIdentif : 0;
        this.dataRepresentantes[this.indexEdicionRepresentante].otros = (this.representanteFisica.value.otros) ? this.representanteFisica.value.otros : '';
        this.dataRepresentantes[this.indexEdicionRepresentante].celular = this.representanteFisica.value.celular;
        this.dataRepresentantes[this.indexEdicionRepresentante].email = this.representanteFisica.value.email;
        this.clearFormRepresentante();
      } else {
        this.snackBar.open("No puede agregar como promovente una persona que ya esta como representante", 'Cerrar', {
          duration: 10000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      } 
    }

    deletePromovente(index): void {
      this.dataPromoventes.splice(index, 1);
      this.isEdicionPromovente = false;
      if(this.dataPromoventes.length == 0){
        this.dataRepresentantes = [];
      }
      if(this.dataPromoventes.length == 1){
        this.dataPromoventes[0].notificacion = true;
      }
    }

    deleteRepresentante(index): void {
      this.dataRepresentantes.splice(index, 1);
      this.isEdicionRepresentante = false;
      if(this.dataRepresentantes.length == 0){
        this.dataPromoventes[0].notificacion = true;
      }
    }

    openDialogSearchPromovente(tipoBusqueda): void {
      const dialogRef = this.dialog.open(DialogSearchPromoventeRepresentante, {
        data: { tipoBusqueda:tipoBusqueda },
      });
      dialogRef.afterClosed().subscribe(result => {
        if(result){
          this.tipoPersonaPromovente = result.CODTIPOPERSONA;
          console.log(this.tipoPersonaPromovente)
          if(this.tipoPersonaPromovente == 'F'){
            this.promoventeFisica.controls['nombre'].setValue(result.NOMBRE);
            this.promoventeFisica.controls['apellidoPaterno'].setValue(result.APELLIDOPATERNO);
            this.promoventeFisica.controls['apellidoMaterno'].setValue(result.APELLIDOMATERNO);
            this.promoventeFisica.controls['rfc'].setValue(result.RFC);
            this.promoventeFisica.controls['curp'].setValue(result.CURP);
            this.promoventeFisica.controls['claveIne'].setValue(result.CLAVEIFE);
            this.promoventeFisica.controls['idDocIdentif'].setValue(result.IDDOCIDENTIF);
            this.promoventeFisica.controls['otros'].setValue(result.VALDOCIDENTIF);
          console.log(this.promoventeFisica)
          } else {
            this.promoventeMoral.controls['nombre'].setValue((result.NOMBRE == null ? '': result.NOMBRE) + '' + (result.APELLIDOPATERNO == null ?  '' :  result.APELLIDOPATERNO));
            this.promoventeMoral.controls['rfc'].setValue(result.RFC);
            this.promoventeMoral.controls['activprincip'].setValue(result.ACTIVPRINCIP);
          }
          this.isEdicionPromovente = false;
        }
      });
    }
  
    addCuentaCatastral(): void {
      let cuentaCatastral = {} as DataCuentaCatastral; 
      //let getCuentasCatastralesCurso = environment.endpoint + '?action=getCuentasCatastralesBusqueda';
      let getCuentasCatastralesCurso = environment.endPointCuentas + 'getCuentasCatastralesBusqueda';
      let filtro = '{\n    \"region\": \"'+this.cuentaCatastral.value.region+'\",\n    \"manzana\": \"'+this.cuentaCatastral.value.manzana+'\",\n    \"lote\": \"'+this.cuentaCatastral.value.lote+'\",\n    \"unidadPrivativa\": \"'+this.cuentaCatastral.value.unidadPrivativa+'\"\n}';
      
      this.loadingDataCuentaCatastral = true;
      
      this.http.post(getCuentasCatastralesCurso, filtro, this.httpOptionsContentType).subscribe(
        (res: any) => {
          this.loadingDataCuentaCatastral = false;
          if(res.error.code === 0)
          {
            if(res.data.respuesta.length > 0)
            {
              cuentaCatastral.region = this.cuentaCatastral.value.region;
              cuentaCatastral.manzana = this.cuentaCatastral.value.manzana;
              cuentaCatastral.lote = this.cuentaCatastral.value.lote;
              cuentaCatastral.unidadPrivativa = this.cuentaCatastral.value.unidadPrivativa;
              cuentaCatastral.idInmueble = res.data.respuesta[0].idInmueble;
              cuentaCatastral.direccion = res.data.respuesta[0].direccion;
  
              this.dataCuentasCatastrales.push(cuentaCatastral);
            } else {
              this.snackBar.open('No se encontraron datos de la cuenta ingresada.', 'Cerrar', {
                duration: 10000,
                horizontalPosition: 'end',
                verticalPosition: 'top'
              });
            }
          } else {
            this.snackBar.open(res.error.message, 'Cerrar', {
              duration: 10000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
          }
        },
        (error) => {
          this.loadingDataCuentaCatastral = false;
          this.snackBar.open(error.message, 'Cerrar', {
            duration: 10000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      );
    }

    deleteCuentaCatastral(index): void {
      this.dataCuentasCatastrales.splice(index, 1);
    }

    openDialogAddDomicilioNotificacion(index = -1, dataDomicilioNotificacion = null): void {
      const dialogRef = this.dialog.open(DialogAddDomicilioNotificacion, {
        width: '700px',
        data: {tiposVia: this.tiposVia, tiposLocalidad: this.tiposLocalidad, delegaciones: this.delegaciones, dataDomicilioNotificacion: dataDomicilioNotificacion},
      });
      dialogRef.afterClosed().subscribe(result => {
        if(result){
          if(index != -1){
            this.dataDomicilioNotificacion[index] = result;
          }else{
            this.dataDomicilioNotificacion.push(result);
          }
        }
      });
    }

    getTiposVia(): void {
      let catTiposVia = environment.rconEndpoint + 'registro/getTiposVia';
      
      let options = {
        headers: new HttpHeaders(
          {
            'Content-Type': 'application/json',
            Authorization: this.auth.getSession().token
          }
        )
      }

      this.loadingTiposVia = true;
      this.http.get(catTiposVia, options).subscribe(
        (res: any) => {
          this.loadingTiposVia = false;
          this.tiposVia = res;
        },
        (error) => {
          this.loadingTiposVia = false;
          this.snackBar.open(error.message, 'Cerrar', {
            duration: 10000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      );
    }
  
    getTiposLocalidad(): void {
      let catTiposLocalidad = environment.rconEndpoint + 'registro/getTiposLocalidad';
      
      let options = {
        headers: new HttpHeaders(
          {
            'Content-Type': 'application/json',
            Authorization: this.auth.getSession().token
          }
        )
      }

      this.loadingTiposLocalidad = true;
      this.http.get(catTiposLocalidad, options).subscribe(
        (res: any) => {
          this.loadingTiposLocalidad = false;
          this.tiposLocalidad = res;
        },
        (error) => {
          this.loadingTiposLocalidad = false;
          this.snackBar.open(error.message, 'Cerrar', {
            duration: 10000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      );
    }
  
    getDelegaciones(): void {
      let catDelegacion = environment.rconEndpoint + 'registro/getDelegaciones';
      
      let options = {
        headers: new HttpHeaders(
          {
            'Content-Type': 'application/json',
            Authorization: this.auth.getSession().token
          }
        )
      }
      
      this.loadingDelegaciones = true;
      this.http.get(catDelegacion, options).subscribe(
        (res: any) => {
          this.loadingDelegaciones = false;
          this.delegaciones = res;
        },
        (error) => {
          this.loadingDelegaciones = false;
          this.snackBar.open(error.message, 'Cerrar', {
            duration: 10000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      );
    }

    deleteDomicilionNotificacion(index): void {
      this.dataDomicilioNotificacion.splice(index, 1);
    }

    paginate(array, page_size, page_number) {
      return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    initiateExpediente(): void {
      let dataResponseCuentaCatastral = [];
      let getCuentasCatastralesCurso = environment.endpoint + '?action=getCuentasCatastralesCurso';
      let filtro = '{\n    \"region\": \"'+this.dataCuentasCatastrales[0].region+'\",\n    \"manzana\": \"'+this.dataCuentasCatastrales[0].manzana+'\",\n    \"lote\": \"'+this.dataCuentasCatastrales[0].lote+'\",\n    \"unidadPrivativa\": \"'+this.dataCuentasCatastrales[0].unidadPrivativa+'\"\n}';
      this.loadingCuentasCatastrales = true;
        this.http.post(getCuentasCatastralesCurso, filtro, this.httpOptions).subscribe(
        (res: any) => {
          this.loadingCuentasCatastrales = false;
          if(res.data.respuesta.length > 0)
          {
            dataResponseCuentaCatastral = res.data.respuesta;
            const dialogRef = this.dialog.open(DialogCuentasCatastralesCurso, {
              width: '700px',
              data: dataResponseCuentaCatastral,
            });
            dialogRef.afterClosed().subscribe(result => {
              if(result){
              }
            });
          } else  {
            let expediente = {
              tipoTramite: this.dataExpediente.tipoTramite,
              rol: "Contribuyente",
              fechaEntrada: {
                  "$date": this.todayNumber
              },
              observaciones: this.dataExpediente.observaciones
            }

            let element = this.dataCuentasCatastrales[0]
            let inmueble = {
                region:element.region,
                manzana: element.manzana,
                lote: element.lote,
                unidadPrivativa: element.unidadPrivativa,
                direccion: element.direccion.via.via + '' + element.direccion.numeroExterior + ' , ' +(element.direccion.numerInterior== undefined ? '': element.direccion.numerInterio) +' , '+ element.direccion.asentamiento.d_asenta +' , '+ element.direccion.codigopostal + ' , ' +element.direccion.delegacion.nombre + ' , ' + element.direccion.estado.d_estado,
                idInmueble: element.idInmueble,
                idDelegacion: element.direccion.delegacion.idDelegacion,
                colonia: element.direccion.asentamiento.d_asenta,
                codigoPostal: element.direccion.codigopostal
            }

            let documentos = [];

            for (let i = 0; i < this.dataDocumentosAportar.length; i++)
            {
              documentos.push({
                idTipoDocumento: this.dataDocumentosAportar[i].idTipoDocumento,
                tipoDocumento: this.dataDocumentosAportar[i].documento,
                idConjuntoDocumental: this.dataDocumentosAportar[i].idConjuntoDocumental,
                conjuntonDocumental: this.dataDocumentosAportar[i].conjuntoDocumental,
                entregado : this.dataDocumentosAportar[i].entregado,
              });
            }

            let representantes = [];
            for (let i = 0; i < this.dataRepresentantes.length; i++)
            {
              let representante;
              if(this.dataRepresentantes[i].tipo == 'F'){
                representante = {
                  tipo: 'fisica',
                  curp: this.dataRepresentantes[i].curp,
                  nombre: this.dataRepresentantes[i].nombre,
                  apellidoPaterno: this.dataRepresentantes[i].apellidoPaterno,
                  apellidoMaterno: this.dataRepresentantes[i].apellidoMaterno,
                  rfc: this.dataRepresentantes[i].rfc,
                  claveIne: this.dataRepresentantes[i].claveIne,
                  otros: this.dataRepresentantes[i].otros,
                  celular: this.dataRepresentantes[i].celular,
                  email: this.dataRepresentantes[i].email
                };
              }else {
                representante = {
                  tipo:'moral',
                  nombre: this.dataRepresentantes[i].nombre,
                  actividadPrincipal: this.dataRepresentantes[i].activprincip,
                  rfc: this.dataRepresentantes[i].rfc
                };
              }

              let direccionDN = this.dataDomicilioNotificacion[0];

              if (this.dataRepresentantes[i].notificacion)
              {
                let direccionNotificacion = 
                {
                  codigopostal: direccionDN.CODIGOPOSTAL,
                  estado: {
                      d_estado: "Ciudad de México",
                      c_estado: "9"
                  },
                  delegacion: {
                      idDelegacion: direccionDN.IDDELEGACION,
                      nombre: direccionDN.DELEGACION
                  },
                  asentamiento: {
                      c_tipo_asenta: direccionDN.CODTIPOSASENTAMIENTO,
                      d_asenta: direccionDN.COLONIA
                  },
                  numeroExterior: direccionDN.NUMEROEXTERIOR,
                  numeroInterior: direccionDN.NUMEROINTERIOR,
                  edificio: direccionDN.EDIFICIO,
                  via: {
                      codTipoVia: direccionDN.CODTIPOSVIA,
                      tipoVia: direccionDN.IDVIA,/// Revisión
                      via: direccionDN.VIA
                  },
                  localidad: {
                      codigoTiposLocalidad: direccionDN.CODTIPOSLOCALIDAD,
                      descripcion: ""
                  },
                  seccion: direccionDN.SECCION,
                  entrada: direccionDN.ENTRADA,
                  entreCalle1: direccionDN.ENTRECALLE1,
                  entreCalle2: direccionDN.ENTRECALLE2,
                  indicacionesAdicionales: direccionDN.INDICACIONESADICIONALES
                }
                representante.direccion = direccionNotificacion;
              }
              representantes.push(representante)
            }

            let promoventes = [];
            for (let i = 0; i < this.dataPromoventes.length; i++)
            {
              let promovente;
              if(this.dataPromoventes[i].tipo == 'F'){
                promovente = {
                  tipo: 'fisica',
                  curp: this.dataPromoventes[i].curp,
                  nombre: this.dataPromoventes[i].nombre,
                  apellidoPaterno: this.dataPromoventes[i].apellidoPaterno,
                  apellidoMaterno: this.dataPromoventes[i].apellidoMaterno,
                  rfc: this.dataPromoventes[i].rfc,
                  claveIne: this.dataPromoventes[i].claveIne,
                  otros: this.dataPromoventes[i].otros,
                  celular: this.dataPromoventes[i].celular,
                  email: this.dataPromoventes[i].email
                };
              }else {
                promovente = {
                  tipo:'moral',
                  nombre: this.dataPromoventes[i].nombre,
                  actividadPrincipal: this.dataPromoventes[i].activprincip,
                  rfc: this.dataPromoventes[i].rfc
                };
              }

              let direccionDN = this.dataDomicilioNotificacion[0];

              if (this.dataPromoventes[i].notificacion)
              {
                let direccionNotificacion = 
                {
                  codigopostal: direccionDN.CODIGOPOSTAL,
                  estado: {
                      d_estado: "Ciudad de México",
                      c_estado: "9"
                  },
                  delegacion: {
                      idDelegacion: direccionDN.IDDELEGACION,
                      nombre: direccionDN.DELEGACION
                  },
                  asentamiento: {
                      c_tipo_asenta: direccionDN.CODTIPOSASENTAMIENTO,
                      d_asenta: direccionDN.COLONIA
                  },
                  numeroExterior: direccionDN.NUMEROEXTERIOR,
                  numeroInterior: direccionDN.NUMEROINTERIOR,
                  edificio: direccionDN.EDIFICIO,
                  via: {
                      codTipoVia: direccionDN.CODTIPOSVIA,
                      tipoVia: direccionDN.IDVIA,/// Revisión
                      via: direccionDN.VIA
                  },
                  localidad: {
                      codigoTiposLocalidad: direccionDN.CODTIPOSLOCALIDAD,
                      descripcion: ""
                  },
                  seccion: direccionDN.SECCION,
                  entrada: direccionDN.ENTRADA,
                  entreCalle1: direccionDN.ENTRECALLE1,
                  entreCalle2: direccionDN.ENTRECALLE2,
                  indicacionesAdicionales: direccionDN.INDICACIONESADICIONALES
                }

                promovente.direccion = direccionNotificacion;
              }
              promoventes.push(promovente);
            }
            let expedienteCompleto = {
              expediente: expediente,
              inmueble: inmueble,
              expedienteDocumentos: documentos,
              usertoken: "token user login",
              rol: "contribuyente",
              representantes: representantes,
              promoventes: promoventes
            }

            const dialogRef = this.dialog.open(DialogCargaComponent, {
              width: '600px',
            });
            
            let insertaExpedienteCompleto = environment.endpoint + '?action=insertaExpedienteCompleto';
            this.http.post(insertaExpedienteCompleto, JSON.stringify(expedienteCompleto), this.httpOptions).subscribe(
              (res: any) => {
                dialogRef.close();
                switch(res.error.code) {
                  case 0: {
                    this.downloadFile(res.data.idDocumentoDigital);
                    window.location.reload();
                    this.snackBar.open('Se ha iniciado el expediente con numero ' + res.data.numeroExpediente, 'Cerrar', {
                      duration: 10000,
                      horizontalPosition: 'end',
                      verticalPosition: 'top'
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
        })
      }

      getFiles(idDocumentoDigital) {
        let urlDownloadAcuse = environment.endpointAPI + 'documentos/?action=descargar';
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

export interface FiltroDatosPersonales {
  nombre: string;
  apaterno: string;
  amaterno: string;
}
export interface FiltroDatosIdentificativos {
  rfc: string;
  curp: string;
  ine: string;
  otro: string;
}
@Component({
  selector: 'app-dialog-search-promovente-representante',
  templateUrl: 'app-dialog-search-promovente-representante.html',
})
export class DialogSearchPromoventeRepresentante {
  tipoBusqueda;
  
  isBusqueda;
  loadingPaginado = false;
  
  pagina = 0;
  total = 0;
  pageSize = 5;
  
  dataSource = [];
  dataResponse = [];
  
  displayedColumns: string[] = ['nombre', 'datos_identificativos', 'select'];
  
  @ViewChild('paginator') paginator: MatPaginator;
  
  filtroDatosPersonales: FiltroDatosPersonales = {} as FiltroDatosPersonales;
  filtroDatosIdentificativos: FiltroDatosIdentificativos = {} as FiltroDatosIdentificativos;
  dataPromoventeRepresentante: DataPromoventeRepresentante = {} as DataPromoventeRepresentante;
  
  promoventeRepresentante;

  input;
  tipoDatos;
  tipoPersona;

  httpOptions;
  
  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<DialogSearchPromoventeRepresentante>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      dialogRef.disableClose = true;

      this.httpOptions = {
        headers: new HttpHeaders({
          login: this.auth.getSession().userData.login,
          rol: this.auth.getSession().userData.rol.toString(),
        })
      };

      this.tipoBusqueda = data.tipoBusqueda;
    }
  
  clearDatos(input, tipoDatos): void {
    this.tipoDatos = tipoDatos;
    if(tipoDatos === 'personales'){
      this.filtroDatosIdentificativos = {} as FiltroDatosIdentificativos;
    } else {
      this.input = input;
      this.filtroDatosPersonales = {} as FiltroDatosPersonales;
      switch(input) {
        case 'rfc': {
          this.filtroDatosIdentificativos.curp = undefined;
          this.filtroDatosIdentificativos.ine = undefined;
          this.filtroDatosIdentificativos.otro = undefined;
          break;
        }
        case 'curp': {
          this.filtroDatosIdentificativos.rfc = undefined;
          this.filtroDatosIdentificativos.ine = undefined;
          this.filtroDatosIdentificativos.otro = undefined;
          break;
        }
        case 'ine': {
          this.filtroDatosIdentificativos.rfc = undefined;
          this.filtroDatosIdentificativos.curp = undefined;
          this.filtroDatosIdentificativos.otro = undefined;
          break;
        }
        case 'otro': {
          this.filtroDatosIdentificativos.rfc = undefined;
          this.filtroDatosIdentificativos.curp = undefined;
          this.filtroDatosIdentificativos.ine = undefined;
          break;
        }
        default: {
          break;
        }
      } 
    }
  }

  getData(): void {
    this.isBusqueda = true;
    this.loadingPaginado = true;
    this.pagina = 1;
    let filtro = {};
    let get;
    if(this.tipoDatos === 'personales' && this.tipoBusqueda == 'promovente')
      get = environment.rconEndpoint + 'registro/getContribuyente?nombre='+(this.filtroDatosPersonales.nombre == undefined ? '' : this.filtroDatosPersonales.nombre)+'&apellidoPaterno='+(this.filtroDatosPersonales.apaterno == undefined ? '':this.filtroDatosPersonales.apaterno)+'&apellidoMaterno='+(this.filtroDatosPersonales.amaterno == undefined ? '' : this.filtroDatosPersonales.amaterno);
    else if(this.tipoBusqueda == 'promovente')
      get = environment.rconEndpoint + 'registro/getIdentificativos?curp='+(this.filtroDatosIdentificativos.curp == undefined ? '': this.filtroDatosIdentificativos.curp)+'&rfc='+(this.filtroDatosIdentificativos.rfc == undefined ? '': this.filtroDatosIdentificativos.rfc)+'&claveife='+(this.filtroDatosIdentificativos.ine == undefined ? '': this.filtroDatosIdentificativos.ine)+'&iddocidentif=&valdocidentif=&coincidenTodos=false';

    if(this.tipoDatos === 'personales' && this.tipoBusqueda == 'representante')
      get = environment.rconEndpoint + 'registro/getRepresentante?nombre='+(this.filtroDatosPersonales.nombre == undefined ? '' : this.filtroDatosPersonales.nombre)+'&apellidoPaterno='+(this.filtroDatosPersonales.apaterno == undefined ? '':this.filtroDatosPersonales.apaterno)+'&apellidoMaterno='+(this.filtroDatosPersonales.amaterno == undefined ? '' : this.filtroDatosPersonales.amaterno);
    else if(this.tipoBusqueda == 'representante')
      get = environment.rconEndpoint + 'registro/getRepresentanteIdentificativos?curp='+(this.filtroDatosIdentificativos.curp == undefined ? '': this.filtroDatosIdentificativos.curp)+'&rfc='+(this.filtroDatosIdentificativos.rfc == undefined ? '': this.filtroDatosIdentificativos.rfc)+'&claveife='+(this.filtroDatosIdentificativos.ine == undefined ? '': this.filtroDatosIdentificativos.ine)+'&iddocidentif=&valdocidentif=&coincidenTodos=false';

    let httpOptions = {
      headers: new HttpHeaders(
        {
          'Content-Type': 'application/json',
          Authorization: this.auth.getSession().token
        }
      )
    }

    this.http.get(get, httpOptions).subscribe(
      (res: any) => {
        console.log(res)
        this.loadingPaginado = false;
          if(res.length > 0){
            this.dataResponse = res;
            this.dataSource = this.paginate(this.dataResponse, this.pageSize, this.pagina);
            this.total = this.dataResponse.length;
            this.paginator.pageIndex = 0;
          } else {
            this.dataResponse = [];
            this.dataSource = [];
            this.total = 0;
            this.paginator.pageIndex = 0;
            this.promoventeRepresentante = undefined;
            this.tipoPersona = undefined;
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

  promoventeRepresentanteSelected(promoventeRepresentante): void {
    this.dataPromoventeRepresentante = promoventeRepresentante;
    this.dataPromoventeRepresentante.tipo = promoventeRepresentante.tipo;
  }
}

@Component({
  selector: 'app-dialog-add-domicilio-notificacion',
  templateUrl: 'app-dialog-add-domicilio-notificacion.html',
})
export class DialogAddDomicilioNotificacion {
  tiposVia;
  tiposLocalidad;
  delegaciones;
  domicilio: FormGroup;
  dataDomicilioNotificacion: DataDomicilioNotificacion = {} as DataDomicilioNotificacion;

  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogAddDomicilioNotificacion>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      dialogRef.disableClose = true;

      this.tiposVia = data.tiposVia;
      this.tiposLocalidad = data.tiposLocalidad;
      this.delegaciones = data.delegaciones;

      this.domicilio = this._formBuilder.group({
        ESTADO: ['Ciudad de México'],
        IDDELEGACION: ['', [Validators.required]],
        COLONIA: [null, [Validators.required]],
        CODIGOPOSTAL: [null, [Validators.minLength(5), Validators.maxLength(5)]],
        CODTIPOSVIA: ['', [Validators.required]],
        VIA: [null, [Validators.required]],
        CODTIPOSLOCALIDAD: [''],
        NUMEROEXTERIOR: [null, [Validators.required]],
        NUMEROINTERIOR: [''],
        ANDADOR: [''],
        EDIFICIO: [''],
        ENTRADA: [''],
        SECCION: [''],
        TELEFONO: [''],
        ENTRECALLE1: [''],
        ENTRECALLE2: [''],
        INDICACIONESADICIONALES: [''],
      });

      (data.dataDomicilioNotificacion) ? this.setDataDomicilioNotificacion(data.dataDomicilioNotificacion) : "";
    }
  
  getNombreDelegacion(event): void {
    this.dataDomicilioNotificacion.DELEGACION = event.source.triggerValue;
    this.dataDomicilioNotificacion.IDCHS_MTODESDE = this.delegaciones.find(element => element.nombre === this.dataDomicilioNotificacion.DELEGACION).IDCHS_MTODESDE;
  }

  getDataDomicilioNotificacion(): DataDomicilioNotificacion {
    this.dataDomicilioNotificacion.IDDOMICILIONOTIFICACIONES = 0;
    this.dataDomicilioNotificacion.CODTIPOSVIA = this.domicilio.value.CODTIPOSVIA;
    this.dataDomicilioNotificacion.IDVIA = this.domicilio.value.CODTIPOSVIA;
    this.dataDomicilioNotificacion.VIA = (this.domicilio.value.VIA) ? this.domicilio.value.VIA : '';
    this.dataDomicilioNotificacion.NUMEROEXTERIOR = (this.domicilio.value.NUMEROEXTERIOR) ? this.domicilio.value.NUMEROEXTERIOR : '';
    this.dataDomicilioNotificacion.ENTRECALLE1 = (this.domicilio.value.ENTRECALLE1) ? this.domicilio.value.ENTRECALLE1 : '';
    this.dataDomicilioNotificacion.ENTRECALLE2 = (this.domicilio.value.ENTRECALLE2) ? this.domicilio.value.ENTRECALLE2 : '';
    this.dataDomicilioNotificacion.ANDADOR = (this.domicilio.value.ANDADOR) ? this.domicilio.value.ANDADOR : '';
    this.dataDomicilioNotificacion.EDIFICIO = (this.domicilio.value.EDIFICIO) ? this.domicilio.value.EDIFICIO : '';
    this.dataDomicilioNotificacion.SECCION = (this.domicilio.value.SECCION) ? this.domicilio.value.SECCION : '';
    this.dataDomicilioNotificacion.ENTRADA = (this.domicilio.value.ENTRADA) ? this.domicilio.value.ENTRADA : '';
    this.dataDomicilioNotificacion.CODTIPOSLOCALIDAD = this.domicilio.value.CODTIPOSLOCALIDAD;
    this.dataDomicilioNotificacion.NUMEROINTERIOR = (this.domicilio.value.NUMEROINTERIOR) ? this.domicilio.value.NUMEROINTERIOR : '';
    this.dataDomicilioNotificacion.CODTIPOSASENTAMIENTO = 10;
    this.dataDomicilioNotificacion.IDCOLONIA = 10;
    this.dataDomicilioNotificacion.CODASENTAMIENTO = 10;
    this.dataDomicilioNotificacion.COLONIA = (this.domicilio.value.COLONIA) ? this.domicilio.value.COLONIA : '';
    this.dataDomicilioNotificacion.CODIGOPOSTAL = (this.domicilio.value.CODIGOPOSTAL) ? this.domicilio.value.CODIGOPOSTAL : '';
    this.dataDomicilioNotificacion.CODCIUDAD = 10;
    this.dataDomicilioNotificacion.CIUDAD = "VARCHAR2";
    this.dataDomicilioNotificacion.IDDELEGACION = this.domicilio.value.IDDELEGACION;
    this.dataDomicilioNotificacion.CODMUNICIPIO = this.domicilio.value.IDDELEGACION;
    this.dataDomicilioNotificacion.TELEFONO = (this.domicilio.value.TELEFONO) ? this.domicilio.value.TELEFONO : '';
    this.dataDomicilioNotificacion.CODESTADO = 10;
    this.dataDomicilioNotificacion.INDICACIONESADICIONALES = (this.domicilio.value.INDICACIONESADICIONALES) ? this.domicilio.value.INDICACIONESADICIONALES : '';
    this.dataDomicilioNotificacion.CODTIPOSDIRECCION = "CHAR";
    this.dataDomicilioNotificacion.CODTIPOSDIRECCI = "CHAR";
    
    return this.dataDomicilioNotificacion;
  }

  setDataDomicilioNotificacion(dataDomicilioNotificacion): void {
    this.domicilio.controls['CODTIPOSVIA'].setValue(dataDomicilioNotificacion.CODTIPOSVIA);
    this.domicilio.controls['VIA'].setValue(dataDomicilioNotificacion.VIA);
    this.domicilio.controls['NUMEROEXTERIOR'].setValue(dataDomicilioNotificacion.NUMEROEXTERIOR);
    this.domicilio.controls['ENTRECALLE1'].setValue(dataDomicilioNotificacion.ENTRECALLE1);
    this.domicilio.controls['ENTRECALLE2'].setValue(dataDomicilioNotificacion.ENTRECALLE2);
    this.domicilio.controls['ANDADOR'].setValue(dataDomicilioNotificacion.ANDADOR);
    this.domicilio.controls['EDIFICIO'].setValue(dataDomicilioNotificacion.EDIFICIO);
    this.domicilio.controls['SECCION'].setValue(dataDomicilioNotificacion.SECCION);
    this.domicilio.controls['ENTRADA'].setValue(dataDomicilioNotificacion.ENTRADA);
    this.domicilio.controls['CODTIPOSLOCALIDAD'].setValue(dataDomicilioNotificacion.CODTIPOSLOCALIDAD);
    this.domicilio.controls['NUMEROINTERIOR'].setValue(dataDomicilioNotificacion.NUMEROINTERIOR);
    this.domicilio.controls['COLONIA'].setValue(dataDomicilioNotificacion.COLONIA);
    this.domicilio.controls['CODIGOPOSTAL'].setValue(dataDomicilioNotificacion.CODIGOPOSTAL);
    this.domicilio.controls['IDDELEGACION'].setValue(dataDomicilioNotificacion.IDDELEGACION);
    this.domicilio.controls['TELEFONO'].setValue(dataDomicilioNotificacion.TELEFONO);
    this.domicilio.controls['INDICACIONESADICIONALES'].setValue(dataDomicilioNotificacion.INDICACIONESADICIONALES);
  }
}

@Component({
  selector: 'app-dialog-cuentas-catastrales-curso',
  templateUrl: 'app-dialog-cuentas-catastrales-curso.html',
})
export class DialogCuentasCatastralesCurso {
  pagina = 1;
  total = 0;
  pageSize = 5;
  dataSource = [];
  dataResponse = [];
  displayedColumns: string[] = ['cuentas_catastrales', 'direccion'];

  constructor(
    public dialogRef: MatDialogRef<DialogCuentasCatastralesCurso>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      dialogRef.disableClose = true;

      this.dataResponse = data;
      this.dataSource = this.paginate(this.dataResponse, this.pageSize, this.pagina);
      this.total = this.dataResponse.length;
    }

  paginado(evt): void{
    this.pagina = evt.pageIndex + 1;
    this.dataSource = this.paginate(this.dataResponse, this.pageSize, this.pagina);
  }

  paginate(array, page_size, page_number) {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  }
}
