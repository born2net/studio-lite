import {AfterViewInit, Component, VERSION, ViewChild, ViewContainerRef} from "@angular/core";
import "rxjs/add/operator/catch";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {CommBroker} from "../services/CommBroker";
import {EventManager, Title} from "@angular/platform-browser";
import {ToastsManager} from "ng2-toastr";
import {Observable} from "rxjs";
import * as packageJson from "../../package.json";
import {AuthService} from "../services/AuthService";
import {LocalStorage} from "../services/LocalStorage";
import {YellowPepperService} from "../services/yellowpepper.service";
import {RedPepperService} from "../services/redpepper.service";
import {IUiState} from "../store/store.data";
import {ACTION_LIVELOG_UPDATE, ACTION_UISTATE_UPDATE} from "../store/actions/appdb.actions";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {Map, List} from 'immutable';
import {Consts} from "../interfaces/Consts";
import {animate, state, style, transition, trigger} from "@angular/animations";
import * as moment from 'moment'
import {LiveLogModel} from "../models/live-log-model";
import {LocaleSelector} from "./locale-selector/local-selector";

enum MainAppShowModeEnum {
    MAIN,
    SAVE,
    PREVIEW,
    LOGOUT
}

export enum MainAppShowStateEnum {
    INIT,
    NORMAL,
    SAVE,
    SAVING,
    SAVE_AND_PREVIEW,
    SAVED,
    GOODBYE
}

@Component({
    selector: 'app-root',
    templateUrl: './app-component.html',
    animations: [
        trigger('logoutState', [
            state('active', style({
                transform: 'scale(2)',
                alpha: 0
            })),
            transition('* => active', animate('1000ms ease-out'))
        ])
    ]
})

export class AppComponent implements AfterViewInit {
    version: string;
    ngVersion: string;
    offlineDevMode: any = window['offlineDevMode'];
    m_ShowModeEnum = MainAppShowModeEnum;
    m_showMode: any = MainAppShowModeEnum.MAIN;
    m_hidden = false;
    m_localSelected;
    // isBrandingDisabled: Observable<boolean>;
    syncOnSave = false;
    m_logoutState = '';
    productName = 'Studio-Lite';
    isBrandingDisabled: boolean = false;
    demoModeMsg = `Sorry cannot save while in demo mode, <a href="https://secure.digitalsignage.com/msgetstarted/#selectStudioLite">please open a new FREE account</a> to be able to use all features...`;

    constructor(private router: Router,
                private localStorage: LocalStorage,
                private commBroker: CommBroker,
                private rp: RedPepperService,
                private authService: AuthService,
                private yp: YellowPepperService,
                private activatedRoute: ActivatedRoute,
                private vRef: ViewContainerRef,
                private titleService: Title,
                private eventManager: EventManager,
                private toastr: ToastsManager) {

        // this.version = packageJson.version;
        // this.ngVersion = VERSION.full

        // this.localStorage.removeItem('remember_me')
        // this.localStorage.removeItem('business_id')
        // this.localStorage.removeItem('no_show_limited')

        this.checkPlatform();
        this.listenAppStateChange();
        this.toastr.setRootViewContainerRef(vRef);
        this.listenRouterUpdateTitle();
        this.listenUpgradeEnterpris();
        this.listenSaves();
        this.appResized();
        Observable.fromEvent(window, 'resize').debounceTime(250)
            .subscribe(() => {
                this.appResized();
            }, (e) => {
                console.error(e)
            });
    }

    @ViewChild('modalProUpgrade')
    modal: ModalComponent;

    @ViewChild('modalLocale')
    modalLocale: ModalComponent;

    @ViewChild('localSelector')
    localSelector: LocaleSelector;

    ngOnInit() {

        this.yp.isBrandingDisabled()
            .subscribe((v) => {
                this.isBrandingDisabled = v;
                if (!this.isBrandingDisabled)
                    this.productName = this.rp.getUserData().resellerName;
            }, (e) => console.error(e));

        let s = this.router.events
            .subscribe((val) => {
                if (val instanceof NavigationEnd) {
                    if (val.url.indexOf('data') > -1 || val.url.indexOf('remoteStatus') > -1) {
                        this.router.navigate(['/FasterqTerminal', val.url.split('?')[1]]);
                    } else {
                        this.authService.start();
                    }
                    s.unsubscribe();
                }
            }, (e) => console.error(e));
    }

    _onMenuIcon(icon, event) {
        event.stopImmediatePropagation();
        event.preventDefault();
        switch (icon) {
            case 'web': {
                window.open('http://www.digitalsignage.com', '_blank');
                break;
            }
            case 'chat': {
                window.open('http://www.digitalsignage.com/_html/live_chat.html', '_blank');
                break;
            }
            case 'upgrade': {
                this.modal.open();
                break;
            }
            case 'save': {
                this.saveAndRestartPrompt(() => {
                })
                break;
            }
            case 'locale': {
                this.modalLocale.open();
                break;
            }
        }
    }

    /**
     Save and serialize configuration to remote mediaSERVER> Save and restart will check if
     the Stations module has been loaded and if no connected stations are present, it will NOT
     prompt for option to restart station on save, otherwise it will.
     @method saveAndRestartPrompt
     @param {Function} call back after save
     **/
    saveAndRestartPrompt(i_callBack) {
        bootbox.dialog({
            message: 'Restart connected stations and apply your saved work?',
            title: 'Save work to remote server',
            buttons: {
                success: {
                    label: 'OK',
                    className: "btn-success",
                    callback: () => {
                        let uiState: IUiState = {mainAppState: MainAppShowStateEnum.SAVE}
                        this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
                        this.yp.dispatch(({type: ACTION_LIVELOG_UPDATE, payload: new LiveLogModel({event: 'app saved'})}));
                    }
                },
                danger: {
                    label: 'Save & restart stations',
                    className: "btn-success",
                    callback: () => {
                        // reboot will reboot the PC or exits presentation android
                        // pepper.sendCommand('rebootStation', -1, function () {});
                        // reboot player exits player
                        // pepper.sendCommand('rebootPlayer', -1, function () {
                        // sync and restart does a fast / soft restart of player
                        this.syncOnSave = true;
                        let uiState: IUiState = {mainAppState: MainAppShowStateEnum.SAVE}
                        this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
                        this.yp.dispatch(({type: ACTION_LIVELOG_UPDATE, payload: new LiveLogModel({event: 'app saved and restarting all stations'})}));
                    }
                },
                main: {
                    label: 'Cancel',
                    callback: () => {
                        return;
                    }
                }
            }
        });
    }

    ngAfterViewInit() {
        let uiState: IUiState = {mainAppState: MainAppShowStateEnum.NORMAL}
        this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    }

    _onLocaleChanged(i_localSelected) {
        this.m_localSelected = i_localSelected;
        this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: {mainAppState: MainAppShowStateEnum.SAVE}}));
        this.modalLocale.close();
    }

    private listenAppStateChange() {
        this.yp.listenMainAppState()
            .subscribe((i_value: MainAppShowStateEnum) => {
                switch (i_value) {

                    case MainAppShowStateEnum.SAVE_AND_PREVIEW: {
                        if (this.rp.getUserData().businessID == 459848) {
                            this.viewMode(MainAppShowModeEnum.MAIN);
                            const uiState: IUiState = {mainAppState: MainAppShowStateEnum.NORMAL};
                            this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}));
                            return bootbox.alert(this.demoModeMsg);
                        }
                        this.save(() => {
                            this.yp.dispatch(({type: ACTION_LIVELOG_UPDATE, payload: new LiveLogModel({event: 'loading preview'})}));
                            this.viewMode(MainAppShowModeEnum.PREVIEW);
                        });
                        break;
                    }

                    case MainAppShowStateEnum.NORMAL: {
                        this.viewMode(MainAppShowModeEnum.MAIN);
                        break;
                    }

                    case MainAppShowStateEnum.SAVED: {
                        con('Saved to server');
                        if (this.syncOnSave)
                            this.rp.sendCommand('syncAndStart', -1, () => {
                            });
                        this.syncOnSave = false;
                        const uiState: IUiState = {appSaved: moment().format('h:mm:ss')};
                        this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}));
                        if (this.m_localSelected)
                            this.localSelector.redirect(this.m_localSelected)
                        break;
                    }

                    case MainAppShowStateEnum.GOODBYE: {
                        con('Goodbye');
                        this.m_logoutState = 'active'
                        this.viewMode(MainAppShowModeEnum.LOGOUT);
                        break;
                    }

                    case MainAppShowStateEnum.SAVE: {
                        if (this.rp.getUserData().businessID == 459848) {
                            this.viewMode(MainAppShowModeEnum.MAIN);
                            const uiState: IUiState = {mainAppState: MainAppShowStateEnum.NORMAL};
                            this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}));
                            return bootbox.alert(this.demoModeMsg);
                        }
                        this.save(() => {
                            this.viewMode(MainAppShowModeEnum.MAIN);
                            const uiState: IUiState = {mainAppState: MainAppShowStateEnum.NORMAL};
                            this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}));
                        });
                        break;
                    }
                }
            }, (e) => console.error(e))
    }

    private save(i_cb: () => void) {
        this.viewMode(MainAppShowModeEnum.SAVE);
        let uiState: IUiState = {mainAppState: MainAppShowStateEnum.SAVING}
        this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
        this.rp.save((result) => {
            if (result.status == true) {
                this.rp.reduxCommit(null, true)
                let uiState: IUiState = {mainAppState: MainAppShowStateEnum.SAVED}
                this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
                i_cb();
            } else {
                alert('error ' + JSON.stringify(result));
            }
        })
    }

    private viewMode(i_mode: MainAppShowModeEnum) {
        this.m_showMode = i_mode;
        switch (i_mode) {
            case MainAppShowModeEnum.MAIN: {
                this.m_hidden = false;
                break;
            }
            case MainAppShowModeEnum.PREVIEW: {
                this.m_hidden = true;
                break;
            }
            case MainAppShowModeEnum.SAVE: {
                this.m_hidden = true;
                break;
            }
            case MainAppShowModeEnum.LOGOUT: {
                this.m_hidden = true;
                break;
            }
        }
    }

    private checkPlatform() {
        switch (platform.name.toLowerCase()) {
            case 'microsoft edge': {
                // alert(`${platform.name} browser not supported at this time, please use Google Chrome`);
                break;
            }
            case 'chrome': {
                break;
            }
            default: {
                // alert('for best performance please use Google Chrome');
                break;
            }
        }
    }

    private listenUpgradeEnterpris() {
        this.commBroker.onEvent(Consts.Events().UPGRADE_ENTERPRISE)
            .subscribe((v) => {
                this.modal.open();
            }, (e) => console.error(e));
    }

    private listenSaves() {
        this.eventManager.addGlobalEventListener('window', 'keydown.control.s', (event) => {
            event.preventDefault();
            this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: {mainAppState: MainAppShowStateEnum.SAVE}}));
        })
    }

    public appResized(): void {
        var appHeight = document.body.clientHeight;
        var appWidth = document.body.clientWidth;
        var uiState: IUiState = {appSized: Map({width: appWidth, height: appHeight})}
        this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))

        this.commBroker.setValue(Consts.Values().APP_SIZE, {
            height: appHeight,
            width: appWidth
        });
        this.commBroker.fire({
            fromInstance: self,
            event: Consts.Events().WIN_SIZED,
            context: '',
            message: {
                height: appHeight,
                width: appWidth
            }
        })
    }

    private listenRouterUpdateTitle() {
        this.router.events
            .filter(event => event instanceof NavigationEnd)
            .map(() => this.activatedRoute)
            .map(route => {
                while (route.firstChild) {
                    route = route.firstChild
                }
                return route;
            }).filter(route => route.outlet === 'primary')
            .mergeMap(route => route.data)
            .subscribe((event) => {
                this.titleService.setTitle(event['title'])
            }, (e) => console.error(e));
    }
}