import {
    Component,
    Injectable,
    ViewChild,
    ElementRef,
    Renderer
} from "@angular/core";
import {keyframes, trigger, transition, animate, state, style} from "@angular/animations";
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
    template: `
        <div [@loginState]="loginState" class="login-page" id="appLogin">
            <br/>
            <br/>
            <form class="form-signin" role="form">
                <h2 class="form-signin-heading"></h2>
                <input (keyup.enter)="passFocus()" #userName id="userName" spellcheck="false" type="text" name="m_user" [(ngModel)]="m_user" class="input-underline input-lg form-control" placeholder="user name" required autofocus>
                <input (keyup.enter)="onClickedLogin()" #userPass id="userPass" type="password" [(ngModel)]="m_pass" name="m_pass" class="input-underline input-lg form-control" placeholder="password" required>
                <div [@showTwoFactor]="m_showTwoFactor" *ngIf="m_showTwoFactor">
                    <br/>
                    <br/>
                    <span style="color: #989898; position: relative; left: -40px; top: 34px" class="fa fa-key fa-2x pull-right"></span>
                    <input #twoFactor spellcheck="false" type="text" name="m_twoFactor" [(ngModel)]="m_twoFactor" class="input-underline input-lg form-control" placeholder="enter two factor key" required autofocus>
                    <br/>
                    <br/>
                </div>
                <br/>
                <a id="loginButton" (click)="onClickedLogin()" type="submit" class="btn rounded-btn">  login to your account
                    <span *ngIf="m_showTwoFactor" style="font-size: 9px; max-height: 15px; display: block; padding: 0; margin: 0; position: relative; top: -20px">with Google authenticator</span>
                </a>&nbsp;
                <br/>
                <div *ngIf="!m_showTwoFactor">
                    <label class="checkbox" style="padding-left: 20px">
                        <input #rememberMe type="checkbox" [checked]="m_rememberMe" (change)="m_rememberMe = rememberMe.checked"/>
                        <span style="color: gray"> remember me for next time </span>
                    </label>
                </div>
                <br/>
                <br/>
                <br/>
                <!--<a href="http://www.digitalsignage.com/_html/benefits.html" target="_blank">not an enterprise member? learn more</a>-->
                <!-- todo: add forgot password in v2-->
                <div id="languageSelectionLogin"></div>
            </form>
        </div>
    `
})
export class LoginPanel extends Compbaser {
    public m_user: string = 'lite90@ms.com';
    public m_pass: string = '123123';
    public m_twoFactor: string;
    public m_showTwoFactor: boolean = false;
    public m_rememberMe: any;
    public loginState: string = '';
    public userModel: UserModel;

    constructor(private ngmslibService: NgmslibService, private store: Store<ApplicationState>,
                private renderer: Renderer,
                private toast: ToastsManager,
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
            this.store.select(store => store.appDb.appAuthStatus).subscribe((i_authStatus: Map<string,AuthenticateFlags>) => {
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
        this.renderer.invokeElementMethod(this.userPass.nativeElement, 'focus', [])
    }

    onClickedLogin() {
        if (this.m_showTwoFactor) {
            // this.toast.warning('Authenticating Two factor...');
            this.authService.authServerTwoFactor(this.m_twoFactor);
        } else {
            // this.toast.info('Authenticating...');
            this.authService.authUser(this.m_user, this.m_pass, this.m_rememberMe);
            // this.authService.authUser('reseller@ms.com', '123123', this.m_rememberMe);

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