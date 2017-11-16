import { BrowserModule } from "@angular/platform-browser";
import { Compiler, NgModule, ErrorHandler } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpModule, JsonpModule } from "@angular/http";
import { Ng2Bs3ModalModule } from "ng2-bs3-modal/ng2-bs3-modal";
import { AppComponent } from "./app-component";
import { LocalStorage } from "../services/LocalStorage";
import { RedPepperService } from "../services/redpepper.service";
import { YellowPepperService } from "../services/yellowpepper.service";
import { ToastModule, ToastOptions } from "ng2-toastr";
import { AccordionModule, AlertModule, ModalModule } from "ngx-bootstrap";
import { DropdownModule, DropdownModule as DropdownModulePrime, InputTextModule, SelectButtonModule, TreeModule } from "primeng/primeng";
import { routing } from "../app-routes";
import { LoginPanel } from "../comps/entry/LoginPanel";
import { Logout } from "../comps/logout/Logout";
import { AgmCoreModule } from "@agm/core";
import { ImgLoader } from "../comps/imgloader/ImgLoader";
import { ChartModule } from "angular2-highcharts";
import { CommBroker } from "../services/CommBroker";
import { AUTH_PROVIDERS } from "../services/AuthService";
import { StoreService } from "../services/StoreService";
import { NgMenu } from "../comps/ng-menu/ng-menu";
import { NgMenuItem } from "../comps/ng-menu/ng-menu-item";
import { AutoLogin } from "../comps/entry/AutoLogin";
import { StoreModule,ActionReducerMap } from "@ngrx/store";
import { INITIAL_APPLICATION_STATE } from "../store/application.state";
import { EffectsModule } from "@ngrx/effects";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { ACTION_LIVELOG_UPDATE, AppdbAction } from "../store/actions/appdb.actions";
import { AppDbEffects } from "../store/effects/appdb.effects";
import { MsdbEffects } from "../store/effects/msdb.effects";
import { environment } from "../environments/environment";
import { productionReducer } from "../store/store.data";
import { SharedModule } from "../modules/shared.module";
import { Dashboard } from "./dashboard/dashboard-navigation";
import { Appwrap } from "./appwrap";
import {ApplicationState} from "../store/application.state";
import * as _ from "lodash";
import "hammerjs";
import "gsap";
import "gsap/CSSPlugin";
import "gsap/Draggable";
import "gsap/TweenLite";
import "gsap/ScrollToPlugin";
import * as ss from 'string';
import { Lib } from "../Lib";
import { FontLoaderService } from "../services/font-loader-service";
import { SimpleGridModule } from "../comps/simple-grid-module/SimpleGridModule";
import { GlobalErrorHandler } from "../services/global-error-handler";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FasterqTerminal } from "./fasterq/fasterq-terminal";
import { WizardService } from "../services/wizard-service";
import { ResellerLogo } from "../comps/logo/reseller-logo";
import { DashPanel } from "./dashboard/dash-panel";
import { ServerAvg } from "./dashboard/server-avg";
import { StorageUsed } from "./dashboard/storage-used";
import { LiveLogModel } from "../models/live-log-model";


// import "fabric"; // need to remove if we import via cli
// import {ScreenTemplate} from "../comps/screen-template/screen-template";

declare global {
    interface JQueryStatic {
        base64: any;
        knob: any;
        gradientPicker: any;
        timepicker: any;
        contextmenu: any;
        index: any;
    }
}

export class CustomToastOption extends ToastOptions {
    animate: 'flyRight';
    positionClass: 'toast-bottom-right';
    toastLife: 10000;
    showCloseButton: true;
    maxShown: 5;
    newestOnTop: true;
    enableHTML: true;
    dismiss: 'auto';
    messageClass: "";
    titleClass: ""
}

export const providing = [CommBroker, WizardService, AUTH_PROVIDERS, RedPepperService, YellowPepperService, NgmslibService, LocalStorage, StoreService, FontLoaderService, AppdbAction, {
    provide: "OFFLINE_ENV",
    useValue: window['offlineDevMode']
},
    {
        provide: "HYBRID_PRIVATE",
        useValue: false
    },
    {
        provide: ErrorHandler,
        useClass: GlobalErrorHandler
    },
    {
        provide: ToastOptions,
        useClass: CustomToastOption
    }
];
import {msDatabase} from "../store/reducers/msdb.reducer";
import {appDb} from "../store/reducers/appdb.reducer";
import {NgmslibService} from "../services/ngmslib.service";

const decelerations = [AppComponent, AutoLogin, LoginPanel, Appwrap, Dashboard, Logout, NgMenu, NgMenuItem, ImgLoader, FasterqTerminal, DashPanel, ServerAvg, StorageUsed];

// export function appReducer(state: ApplicationState , action: any) {
//     if (environment.production) {
//         return productionReducer;
//     } else {
//         return productionReducer;
//         // return developmentReducer(state, action);
//     }
// }
export const appReducer: ActionReducerMap<ApplicationState> = {msDatabase, appDb};


@NgModule({
    declarations: [decelerations],
    imports: [
        BrowserModule,
        FormsModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        Ng2Bs3ModalModule,
        HttpModule,
        ChartModule,
        StoreModule.forRoot(appReducer,{initialState:INITIAL_APPLICATION_STATE}),

        EffectsModule.forRoot([
            AppDbEffects,
            MsdbEffects,
        ]),
        !environment.production ? StoreDevtoolsModule.instrument({ maxAge: 2 }) : [],
        // environment.imports,  
        // StoreDevtoolsModule.instrumentStore({maxAge: 2}),
        // StoreDevtoolsModule.instrumentOnlyWithExtension(),
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyDKa8Z3QLtACfSfxF-S8A44gm5bkvNTmuM',
            libraries: ['places']
        }),
        SimpleGridModule.forRoot(),
        SharedModule.forRoot(),
        ToastModule.forRoot(),
        AlertModule.forRoot(),
        ModalModule.forRoot(),
        DropdownModule,
        AccordionModule.forRoot(),
        JsonpModule,
        TreeModule,
        InputTextModule,
        SelectButtonModule,
        InputTextModule,
        DropdownModulePrime,
        routing,
    ],
    providers: [providing],
    bootstrap: [AppComponent]
})

export class AppModule {
    constructor(private commBroker: CommBroker, private compiler: Compiler, private yp: YellowPepperService, private fontLoaderService: FontLoaderService) {
        Lib.Con(`running in dev mode: ${Lib.DevMode()}`);
        Lib.Con(`App in ${(compiler instanceof Compiler) ? 'AOT' : 'JIT'} mode`);
        window['business_id'] = -1;
        window['jQueryAny'] = jQuery;
        window['jXML'] = jQuery;
        // window['StringJS'] = ss.default;
        // MyS.prototype = ss('')
        // MyS.prototype.constructor = MyS;
        // function MyS(val) {
        //     this.setValue(val);
        // }

        /***********************************
         *
         * StringJS() library extension
         *
         ***********************************/
// window['StringJS'] = ss.default;
        MyS.prototype = ss('')
        MyS.prototype.constructor = MyS;
        function MyS(val) {
            this.setValue(val);
        }
//
        var formatMoney = function(n, c, d, t){
            var c = isNaN(c = Math.abs(c)) ? 2 : c,
                d = d == undefined ? "." : d,
                t = t == undefined ? "," : t,
                s = n < 0 ? "-" : "",
                i:any = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
                j = (j = i.length) > 3 ? j % 3 : 0;
            return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
        };

        MyS.prototype.isBlank = function () {
            var value = this.s;
            if (_.isNaN(value))
                return true;
            if (_.isUndefined(value))
                return true;
            if (_.isNull(value))
                return true;
            if (_.isEmpty(String(value)))
                return true;
            return false;
        }

        MyS.prototype.isNotBlank = function () {
            var value = this.s;
            if (_.isNaN(value))
                return false;
            if (_.isUndefined(value))
                return false;
            if (_.isNull(value))
                return false;
            if (_.isEmpty(String(value)))
                return false;
            return true;
        }

        /**
         *  booleanToNumber
         *  convert boolean to a number 0 or 1
         *  if forceCast is true, it will always return a number, else it will allow strings to pass through it
         * @param forceCast
         * @returns {any}
         */
        MyS.prototype.booleanToNumber = function (forceCasting: boolean = false) {
            var value = this.s;
            if (value == '')
                return 0;
            if (_.isUndefined(value) || _.isNull(value) || value == 'NaN' || value == 'null' || value == 'NULL')
                return 0;
            if (value === "0" || value === 'false' || value === "False" || value === false)
                return 0;
            if (value === 1 || value === "true" || value === "True" || value === true)
                return 1;
            if (forceCasting) {
                return parseInt(value);
            } else {
                return value;
            }
        }

        MyS.prototype.toCurrency = function (format?: 'us'|'eu') {

            var value = StringJS(this.s).toFloat(2);
            if (_.isNaN(value))
                value = 0;
            switch (format) {
                case 'eu': {
                    return '€' + formatMoney(value, 2, '.', ',');
                }
                case 'us': {}
                default: {
                    return '$' + formatMoney(value, 2, '.', ',');
                }
            }
        }

        MyS.prototype.toPercent = function () {
            return StringJS(this.s).toFloat(2) + '%';
        }
        MyS.prototype.toPercent2 = function () {
            return StringJS(this.s).toFloat(2) + '%';
        }

        MyS.prototype.fileTailName = function (i_level) {
            var fileName = this.s;
            var arr = fileName.split('/');
            var size = arr.length;
            var c = arr.slice(0 - i_level, size)
            return new this.constructor(c.join('/'));
        }

        MyS.prototype.cleanChar = function () {
            var value = this.s;
            if (_.isUndefined(value))
                return '';
            if (_.isNull(value))
                return '';
            if (_.isNumber(value))
                return value;
            if (_.isBoolean(value))
                return value;
            value = value.replace(/\}/g, ' ');
            value = value.replace(/%/g, ' ');
            value = value.replace(/{/g, ' ');
            value = value.replace(/"/g, '`');
            value = value.replace(/'/g, '`');
            value = value.replace(/&/g, 'and');
            value = value.replace(/>/g, ' ');
            value = value.replace(/</g, ' ');
            value = value.replace(/\[/g, ' ');
            value = value.replace(/]/g, ' ');
            value = value.replace(/#/g, ' ');
            value = value.replace(/\$/g, ' ');
            value = value.replace(/\^/g, ' ');
            value = value.replace(/;/g, ' ');
            return value;
        }



        window['StringJS'] = function (str) {
            // if (_.isNull(str) || _.isUndefined(str))
            if (str == null || str == undefined)
                str = '';
            return new MyS(str);
        }
        Lib.Con(StringJS('app-loaded-and-ready').humanize().s);
        Lib.AlertOnLeave();
        this.yp.dispatch(({ type: ACTION_LIVELOG_UPDATE, payload: new LiveLogModel({ event: 'app started' }) }));
    }
}









