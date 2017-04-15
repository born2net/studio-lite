import {Injectable} from "@angular/core";
import {ActivatedRoute, ActivatedRouteSnapshot, NavigationStart, Router, RouterStateSnapshot} from "@angular/router";
import {LocalStorage} from "./LocalStorage";
import {StoreService} from "./StoreService";
import "rxjs/add/observable/fromPromise";
import {Observable} from "rxjs/Observable";
import {Map} from "immutable";
import * as _ from "lodash";
import {Store} from "@ngrx/store";
import {ApplicationState} from "../store/application.state";
import {AuthenticateFlags} from "../store/actions/appdb.actions";
import {UserModel} from "../models/UserModel";
import {EFFECT_AUTH_START, EFFECT_TWO_FACTOR_AUTH} from "../store/effects/appdb.effects";
import {NgmslibService} from "ng-mslib";
import {Lib} from "../Lib";

@Injectable()
export class AuthService {
    constructor(private ngmslibService: NgmslibService,
                private router: Router,
                private store: Store<ApplicationState>,
                private localStorage: LocalStorage,
                private storeService: StoreService,
                private activatedRoute: ActivatedRoute) {

        this.store.select(store => store.appDb.userModel).subscribe((userModel: UserModel) => {
            this.userModel = userModel;
        }, (e) => {
            console.error(e)
        })
        this.listenEvents();
    }

    private userModel: UserModel;
    private requestedRoute: string;

    private listenEvents() {
        this.store.select(store => store.appDb.appAuthStatus).subscribe((i_authStatus: Map<string, AuthenticateFlags>) => {
            let authStatus: AuthenticateFlags = i_authStatus.get('authStatus')
            switch (authStatus) {
                case AuthenticateFlags.WRONG_PASS: {
                    this.saveCredentials('', '', '');
                    this.router.navigate(['/UserLogin']);
                    break;
                }
                case AuthenticateFlags.TWO_FACTOR_ENABLED: {
                    var user = this.ngmslibService.base64().encode(this.userModel.getUser());
                    var pass = this.ngmslibService.base64().encode(this.userModel.getPass());
                    this.router.navigate([`/UserLogin/twoFactor/${user}/${pass}`])
                    break;
                }
                case AuthenticateFlags.TWO_FACTOR_PASS: {
                    this.saveCredentials('', '', '');
                    this.enterApplication();
                    break;
                }
                case AuthenticateFlags.AUTH_PASS_NO_TWO_FACTOR: {
                    if (this.userModel.getRememberMe()) {
                        this.saveCredentials(this.userModel.getUser(), this.userModel.getPass(), this.userModel.rememberMe());
                    } else {
                        this.saveCredentials('', '', '');
                    }
                    console.log('Auth pass no two factor');
                    this.enterApplication();
                    break;
                }
            }
        }, (e) => {
            console.error(e)
        })
        this.router.events.filter(event => event instanceof NavigationStart).take(1).subscribe(event => {
            this.requestedRoute = event['url'];
            // this.requestedRoute = event.url == '/' ? '/App1/Campaigns' : event.url;
        }, (e) => console.error(e));
    }

    private enterApplication() {
        setTimeout(() => {
            if (Lib.DevMode()) {
                var nav = '/App1/Campaigns';
                // this.router.navigate(['/App1/Dashboard']);
                // Lib.Con(`in dev mode entering:  ${nav}`);
                // this.router.navigate([this.requestedRoute]);
                this.router.navigate([nav]);
            } else {
                console.log('requested route ' + this.requestedRoute);
                console.log('entering /App1/Dashboard');
                // this.router.navigate([this.requestedRoute]);
                this.router.navigate(['/App1/Dashboard']);
            }
            this.storeService.loadServices();
        }, 10)
    }

    public start() {
        var i_user, i_pass, i_remember;

        // check local store first
        console.log('checking credentials in local storage');
        var credentials = this.localStorage.getItem('remember_me_studioweb');
        if (credentials && (credentials && credentials.u != '')) {

            i_user = credentials.u;
            i_pass = credentials.p;
            i_remember = credentials.r;
            console.log(`credentials found ${i_user}`);

        } else {
            // check url params
            console.log('credentials not found, checking url params');
            // var id = this.activatedRoute.snapshot.queryParams['id'];
            var id = this.activatedRoute.snapshot.queryParams['param'];
            if (!_.isUndefined(id)) {
                id = id.replace(/=/ig, '');
                try {
                    credentials = this.ngmslibService.base64().decode(id);
                    var local = this.activatedRoute.snapshot.queryParams['local'];
                    var credentialsArr = credentials.match(/user=(.*),pass=(.*)/);
                    i_user = credentialsArr[1];
                    i_pass = credentialsArr[2];
                    i_remember = 'false';
                    console.log('auth with url ' + i_user);
                } catch (e) {
                    console.error('error problem decoding url base65 params on login ' + e);
                }
            }
        }
        if (i_user && i_pass) {
            this.router.navigate(['/AutoLogin']);
            console.log(`auth manually ${i_user}`);
            this.authUser(i_user, i_pass, i_remember)
        } else {
            // no valid user/pass found so go to user login, end of process
            console.log(`auth no valids`);
            this.router.navigate(['/UserLogin']);
        }
    }

    public saveCredentials(i_user, i_pass, i_remember) {
        if (i_remember) {
            this.localStorage.setItem('remember_me_studioweb', {
                u: i_user,
                p: i_pass,
                r: i_remember
            });
        } else {
            this.localStorage.setItem('remember_me_studioweb', {
                u: '',
                p: '',
                r: i_remember
            });
        }
    }

    public authUser(user: string, pass: string, rememberMe: boolean = false): void {
        this.store.dispatch({
            type: EFFECT_AUTH_START,
            payload: this.userModel.setUser(user.trim()).setPass(pass.trim()).setRememberMe(rememberMe)
        })
    }

    public authServerTwoFactor(token): void {
        this.store.dispatch({type: EFFECT_TWO_FACTOR_AUTH, payload: {token: token, enable: false}})
    }


    public getLocalstoreCred(): { u: string, p: string, r: string } {
        var credentials = this.localStorage.getItem('remember_me_studioweb');
        if (!credentials)
            return {
                u: '',
                p: '',
                r: ''
            };
        return {
            u: credentials.u,
            p: credentials.p,
            r: credentials.r,
        }
    }

    public checkAccess(): Promise<any> {
        if (this.userModel.getAuthenticated()) {
            return Promise.resolve(true);
        } else {
            return Promise.resolve(false);
        }
    }

    public canActivate(activatedRouteSnapshot: ActivatedRouteSnapshot, routerStateSnapshot: RouterStateSnapshot): Observable<boolean> {
        return Observable
            .fromPromise(this.checkAccess())
            .do(result => {
                if (!result)
                    this.router.navigate(['/AutoLogin']);
            });
    }
}

export const AUTH_PROVIDERS: Array<any> = [{
    provide: AuthService,
    useClass: AuthService
}];