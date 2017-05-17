import {Component, ElementRef, Injectable, ViewChild} from "@angular/core";
import {animate, keyframes, state, style, transition, trigger} from "@angular/animations";
import {ActivatedRoute} from "@angular/router";
import {LocalStorage} from "../../services/LocalStorage";
import {AuthService} from "../../services/AuthService";
import {Map} from "immutable";
import {ToastsManager} from "ng2-toastr";
import {ApplicationState} from "../../store/application.state";
import {Store} from "@ngrx/store";
import {UserModel} from "../../models/UserModel";
import {AuthenticateFlags} from "../../store/actions/appdb.actions";
import {Compbaser, NgmslibService} from "ng-mslib";
import {RedPepperService} from "../../services/redpepper.service";
import {Lib} from "../../Lib";

enum ViewMod {
    LOGIN,
    FORGOT_PASSWORD,
    CHANGE_PASSWORD,
    CHANGE_BUSINESS_NAME
}

@Injectable()
@Component({
    selector: 'LoginPanel',
    providers: [LocalStorage],
    animations: [

        trigger('loginState', [
            state('inactive', style({
                backgroundColor: 'red',
                transform: 'scale(1)',
                alpha: 0
            })),
            state('default', style({
                backgroundColor: '#313131',
                transform: 'scale(1)',
                alpha: 1
            })),
            state('active', style({
                backgroundColor: 'green',
                transform: 'scale(0.98)'
            })),
            transition('* => active', animate('600ms ease-out')),
            transition('* => inactive', animate('2000ms ease-out'))
        ]),
        trigger('showTwoFactor', [
            state('true', style({
                transform: 'scale(1)'
            })),
            transition(':enter', [
                animate('1s 2s cubic-bezier(0.455,0.03,0.515,0.955)', keyframes([
                    style({
                        opacity: 0,
                        transform: 'translateX(-400px)'
                    }),
                    style({
                        opacity: 1,
                        transform: 'translateX(0)'
                    })
                ]))
            ]),
            transition(':leave', animate('500ms cubic-bezier(.17,.67,.83,.67)'))
        ])
    ],
    styles: [`
        a {
            color: gray;
        }

        a:visited {
            color: #b9b9b9;
        }

        a:hover {
            color: #b9b9b9;
        }
    `],
    template: `        
        <ul [@loginState]="loginState" class="login-page" id="appLogin">
            <br/>
            <br/>
            <br/>
            <br/>
            <form class="form-signin" role="form">
                <ul [ngSwitch]="m_currentViewMode">

                    
                    
                    <div *ngSwitchCase="m_viewMod.LOGIN">
                        <h2 class="form-signin-heading"></h2>
                        <input (keyup.enter)="passFocus()" #userName id="userName" spellcheck="false" type="text" name="m_user" [(ngModel)]="m_user" class="input-underline input-lg form-control" i18n-placeholder placeholder="user name or email" required autofocus>
                        <input (keyup.enter)="onClickedLogin()" #userPass id="userPass" type="password" [(ngModel)]="m_pass" name="m_pass" class="input-underline input-lg form-control" i18n-placeholder placeholder="password" required>
                        <div [@showTwoFactor]="m_showTwoFactor" *ngIf="m_showTwoFactor">
                            <br/>
                            <br/>
                            <span style="color: #989898; position: relative; left: -40px; top: 34px" class="fa fa-key fa-2x pull-right"></span>
                            <input #twoFactor spellcheck="false" type="text" name="m_twoFactor" [(ngModel)]="m_twoFactor" class="input-underline input-lg form-control" i18n-placeholder placeholder="enter two factor key" required autofocus>
                            <br/>
                            <br/>
                        </div>
                        <br/>
                        <a i18n id="loginButton" style="width: 280px" (click)="onClickedLogin()" type="submit" class="btn rounded-btn"> login to your account
                            <!--<span *ngIf="m_showTwoFactor" style="font-size: 9px; max-height: 15px; display: block; padding: 0; margin: 0; position: relative; top: -20px">with Google authenticator</span>-->
                        </a>&nbsp;

                        <br/>
                        <div style="width: 280px; position: relative">
                            <div class="pull-left" *ngIf="!m_showTwoFactor">
                                <label class="checkbox" style="padding-left: 20px">
                                    <input #rememberMe type="checkbox" [checked]="m_rememberMe" (change)="m_rememberMe = rememberMe.checked"/>
                                    <span i18n style="color: gray"> remember me </span>
                                </label>
                            </div>
                            <div style="text-align: right" id="loginExtras" class="pull-right">
                                <a id="forgotPassword" i18n (click)="$event.preventDefault(); m_currentViewMode = m_viewMod.FORGOT_PASSWORD" href="#">forgot password</a>
                                <br/>
                                <a id="changePassword" i18n (click)="$event.preventDefault(); m_currentViewMode = m_viewMod.CHANGE_PASSWORD" href="#">change password</a>
                                <br/>
                                <a id="changeBusiness" i18n (click)="$event.preventDefault(); m_currentViewMode = m_viewMod.CHANGE_BUSINESS_NAME" href="#">change business name</a>
                            </div>
                             <br/>
                        </div>
                        <div class="clearFloat"></div>
                        <locale-selector [orientation]="'inline'"></locale-selector>
                        <br/>
                        <a i18n style="padding-left: 20px" href="https://secure.digitalsignage.com/msgetstarted/#selectStudioLite">Don't have an account? create one</a>
                    </div>

                    <div *ngSwitchCase="m_viewMod.CHANGE_PASSWORD">
                        <h2 class="form-signin-heading"></h2>
                        <input spellcheck="false" type="text" name="m_user" [(ngModel)]="m_user" class="input-underline input-lg form-control" i18n-placeholder placeholder="user name / email" required autofocus>
                        <input type="password" [(ngModel)]="m_pass" name="m_pass" class="input-underline input-lg form-control" i18n-placeholder placeholder="old password" required>
                        <input type="password" [(ngModel)]="m_passNew" name="m_pass" class="input-underline input-lg form-control" i18n-placeholder placeholder="new password" required>
                        <input type="password" [(ngModel)]="m_passRepeat" name="m_pass" class="input-underline input-lg form-control" i18n-placeholder placeholder="repeat new password" required>
                        <br/>
                        <a style="width: 280px" (click)="onChangePassword()" type="submit" class="btn rounded-btn"> change password
                            <span *ngIf="m_showTwoFactor" style="font-size: 9px; max-height: 15px; display: block; padding: 0; margin: 0; position: relative; top: -20px">with Google authenticator</span>
                        </a>
                        <br/>
                        <a class="pull-left" (click)="$event.preventDefault(); m_currentViewMode = m_viewMod.LOGIN" href="#"><i class="fa fa-arrow-circle-left"></i> back</a>

                    </div>

                    <div *ngSwitchCase="m_viewMod.FORGOT_PASSWORD">
                        <h2 class="form-signin-heading"></h2>
                        <input (keyup.enter)="passFocus()" #userName id="userName" spellcheck="false" type="text" name="m_user" [(ngModel)]="m_user" class="input-underline input-lg form-control" i18n-placeholder placeholder="user name / email" required autofocus>
                        <br/>
                        <a style="width: 280px" (click)="onResetPassword()" type="submit" class="btn rounded-btn"> reset your password
                            <span *ngIf="m_showTwoFactor" style="font-size: 9px; max-height: 15px; display: block; padding: 0; margin: 0; position: relative; top: -20px">with Google authenticator</span>
                        </a>
                        <a class="pull-left" (click)="$event.preventDefault(); m_currentViewMode = m_viewMod.LOGIN" href="#"><i class="fa fa-arrow-circle-left"></i> back</a>
                        <br/>
                    </div>

                    <div *ngSwitchCase="m_viewMod.CHANGE_BUSINESS_NAME">
                        <h2 class="form-signin-heading"></h2>
                        <input spellcheck="false" type="text" name="m_user" [(ngModel)]="m_user" class="input-underline input-lg form-control" i18n-placeholder placeholder="user name / email" required autofocus>
                        <input type="password" [(ngModel)]="m_pass" name="m_pass" class="input-underline input-lg form-control" i18n-placeholder placeholder="password" required>
                        <input type="text" name="m_businessName" [(ngModel)]="m_businessName" class="input-underline input-lg form-control" i18n-placeholder placeholder="new business name" required>
                        <br/>
                        <a style="width: 280px" (click)="onChangeBusinessName()" type="submit" class="btn rounded-btn"> change business name
                            <span *ngIf="m_showTwoFactor" style="font-size: 9px; max-height: 15px; display: block; padding: 0; margin: 0; position: relative; top: -20px">with Google authenticator</span>
                        </a>
                        <br/>
                        <a class="pull-left" (click)="$event.preventDefault(); m_currentViewMode = m_viewMod.LOGIN" href="#"><i class="fa fa-arrow-circle-left"></i> back</a>

                    </div>
                </ul>
            </form>
        </ul>
    `
})
export class LoginPanel extends Compbaser {
    m_viewMod = ViewMod;
    m_currentViewMode = ViewMod.LOGIN;
    public m_user: string = '';
    public m_pass: string = '';
    public m_passNew: string = '';
    public m_passRepeat: string = '';
    public m_businessName: string = '';
    public m_twoFactor: string;
    public m_showTwoFactor: boolean = false;
    public m_rememberMe: any;
    public loginState: string = '';
    public userModel: UserModel;

    constructor(private ngmslibService: NgmslibService, private store: Store<ApplicationState>,
                private toast: ToastsManager,
                private rp: RedPepperService,
                private activatedRoute: ActivatedRoute,
                private authService: AuthService) {
        super();
        this.listenEvents();
    }

    @ViewChild('userPass') userPass: ElementRef;

    private listenEvents() {

        this.cancelOnDestroy(
            this.store.select(store => store.appDb.userModel)
                .subscribe((userModel: UserModel) => {
                    this.userModel = userModel
                }, (e) => {
                    console.error(e)
                })
        )

        this.cancelOnDestroy(
            this.store.select(store => store.appDb.appAuthStatus).subscribe((i_authStatus: Map<string, AuthenticateFlags>) => {
                let authStatus = i_authStatus.get('authStatus')
                if (this.isAccessAllowed(authStatus) == false)
                    return;
                switch (authStatus) {
                    case AuthenticateFlags.TWO_FACTOR_ENABLED: {
                        this.m_showTwoFactor = true;
                        break;
                    }
                    case AuthenticateFlags.TWO_FACTOR_PASS: {
                        this.loginState = 'active';
                        break;
                    }
                    case AuthenticateFlags.AUTH_PASS_NO_TWO_FACTOR: {
                        this.loginState = 'active';
                        break;
                    }
                }
            }, (e) => {
                console.error(e)
            })
        )

        this.cancelOnDestroy(
            this.activatedRoute.params.subscribe(params => {
                if (params['twoFactor']) {
                    this.m_user = this.ngmslibService.base64().decode(params['user']);
                    this.m_pass = this.ngmslibService.base64().decode(params['pass']);
                    this.m_showTwoFactor = true;
                }
            }, (e) => console.error(e))
        )
    }

    passFocus() {
        // this.renderer.invokeElementMethod(this.userPass.nativeElement, 'focus', [])
        jQuery(this.userPass.nativeElement).focus();
    }

    onChangeBusinessName(){
        this.rp.changeBusinessName(this.m_user, this.m_pass, this.m_businessName, (value) => {
            if (!value.result)
                return bootbox.alert('Sorry there was a problem authenticating');
            bootbox.alert('Your business name has been renamed successfully');
            this.m_currentViewMode = ViewMod.LOGIN;
        })
    }

    onResetPassword() {
        if (!Lib.ValidateEmail(this.m_user))
            return bootbox.alert('user name must be in the form of an email address');
        this.rp.resetPassword(this.m_user, (value) => {
            if (!value.result)
                return bootbox.alert('Sorry no account found');
            bootbox.alert('Please check your email for a new password');
            this.m_currentViewMode = ViewMod.LOGIN;
        })
    }

    onChangePassword() {
        if (this.m_passNew != this.m_passRepeat)
            return bootbox.alert('passwords do not match')
        if (this.m_user.length < 2)
            return bootbox.alert('user name is too short')
        this.rp.changePassword(this.m_user, this.m_pass, this.m_passNew, (value) => {
            if (value.result == -1)
                return bootbox.alert('authentication for password change failed, try again');
            bootbox.alert('Password changed successfully');
            this.m_currentViewMode = ViewMod.LOGIN;
        })
    }

    onClickedLogin() {
        if (this.m_showTwoFactor) {
            // this.toast.warning('Authenticating Two factor...');
            this.authService.authServerTwoFactor(this.m_twoFactor);
        } else {
            // this.toast.info('Authenticating...');
            this.authService.authUser(this.m_user, this.m_pass, this.m_rememberMe);
        }
    }

    private isAccessAllowed(i_reason: AuthenticateFlags): boolean {
        let msg1: string;
        let msg2: string;
        // this.loginState = 'default';
        switch (i_reason) {
            case AuthenticateFlags.WRONG_PASS: {
                msg1 = 'User or password are incorrect...'
                msg2 = 'Please try again or click forgot password to reset your credentials'
                this.showMessage(msg1, msg2);
                this.loginState = 'inactive';
                return false;
            }
            case AuthenticateFlags.WRONG_TWO_FACTOR: {
                msg1 = 'Invalid token'
                msg2 = 'Wrong token entered or the 60 seconds limit may have exceeded, try again...'
                this.showMessage(msg1, msg2);
                this.loginState = 'inactive';
                return false;
            }
            case AuthenticateFlags.TWO_FACTOR_CHECK: {
                return false;
            }
            case AuthenticateFlags.TWO_FACTOR_FAIL: {
                msg1 = 'Two factor failed'
                msg2 = 'please try again...'
                this.showMessage(msg1, msg2);
                this.loginState = 'inactive';
                return false;
            }
            case AuthenticateFlags.TWO_FACTOR_PASS: {
                this.loginState = 'active';
                return true;
            }
        }
    }

    private showMessage(title, message) {
        setTimeout(() => {
            bootbox.dialog({
                closeButton: true,
                title: title,
                message: message
            });
        }, 200);
    }
}