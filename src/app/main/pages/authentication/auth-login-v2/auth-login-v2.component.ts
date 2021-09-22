import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { CoreConfigService } from '@core/services/config.service';
import { environment } from 'environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-auth-login-v2',
  templateUrl: './auth-login-v2.component.html',
  styleUrls: ['./auth-login-v2.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AuthLoginV2Component implements OnInit {
  //  Public
  public coreConfig: any;
  public loginForm: FormGroup;
  public loading = false;
  public submitted = false;
  public returnUrl: string;
  public error = '';
  public passwordTextType: boolean;

  // Private
  private _unsubscribeAll: Subject<any>;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: environment.ssoToken
    })
  };

  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   */
  constructor(
    private _coreConfigService: CoreConfigService,
    private _formBuilder: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private http: HttpClient,
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this._unsubscribeAll = new Subject();

    // Configure the layout
    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  /**
   * Toggle password
   */
  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    try {
      const payload = {
        login: this.loginForm.get('username').value,
        password: this.authService.hashPassword(this.loginForm.get('password').value),
      };
      this.loading = true;
      this.http.post(environment.ssoEndpoint + 'usuarios/login', payload,
        this.httpOptions).subscribe(
          (res: any) => {
            this.loading = false;
            this.authService.setSession({
              token: res.token,
              userData: res
            });
            this._router.navigate(['main']);
          },
          (error) => {
            this.loading = false;
            this.error = error.error.mensaje;
          });
    } catch (err) {
     // this.loginInvalid = true;
     this.loading = false;
    }
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.loginForm = this._formBuilder.group({
      username: ['', Validators.required],
      password: ['', [Validators.required,Validators.minLength(6)]]
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/';

    // Subscribe to config changes
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });

  }
  
  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
