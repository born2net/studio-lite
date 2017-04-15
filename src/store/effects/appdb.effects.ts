import {Injectable} from "@angular/core";
import {Headers, Http, RequestMethod, RequestOptionsArgs, Response} from "@angular/http";
import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/merge";
import "rxjs/add/operator/debounceTime";
import * as xml2js from "xml2js";
import {Action, Store} from "@ngrx/store";
import {ApplicationState} from "../application.state";
import {Actions, Effect} from "@ngrx/effects";
import {Observable} from "rxjs";
import {UserModel} from "../../models/UserModel";
import {ACTION_UISTATE_UPDATE, AuthenticateFlags} from "../actions/appdb.actions";
import {RedPepperService} from "../../services/redpepper.service";
import {IPepperConnection} from "../../store/imsdb.interfaces";
import * as _ from "lodash";
import {IStation, IUiState} from "../store.data";
import {List} from "immutable";
import {StationModel} from "../../models/StationModel";
import {Lib} from "../../Lib";
import {FasterqLineModel} from "../../models/fasterq-line-model";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {FasterqQueueModel} from "../../models/fasterq-queue-model";
import {FasterqAnalyticsModel} from "../../models/fasterq-analytics";
import {IQueueSave} from "../../app/fasterq/fasterq-editor";
import {CommBroker, IMessage} from "../../services/CommBroker";
import {FASTERQ_QUEUE_CALL_CANCLED} from "../../interfaces/Consts";
import {message} from "gulp-typescript/release/utils";
import {ToastsManager} from "ng2-toastr";

export const EFFECT_AUTH_START = 'EFFECT_AUTH_START';
export const EFFECT_AUTH_END = 'EFFECT_AUTH_END';
export const EFFECT_UPDATE_USER_MODEL = 'EFFECT_UPDATE_USER_MODEL';
export const EFFECT_AUTH_STATUS = 'EFFECT_AUTH_STATUS';
export const EFFECT_TWO_FACTOR_AUTH = 'EFFECT_TWO_FACTOR_AUTH';
export const EFFECT_TWO_FACTOR_UPDATING = 'EFFECT_TWO_FACTOR_UPDATING';
export const EFFECT_TWO_FACTOR_UPDATED = 'EFFECT_TWO_FACTOR_UPDATED';
export const EFFECT_LOAD_STATIONS = 'EFFECT_LOAD_STATIONS';
export const EFFECT_LOADING_STATIONS = 'EFFECT_LOADING_STATIONS';
export const EFFECT_LOADED_STATIONS = 'EFFECT_LOADED_STATIONS';
export const EFFECT_LOAD_FASTERQ_LINES = 'EFFECT_LOAD_FASTERQ_LINES';
export const EFFECT_LOADED_FASTERQ_LINES = 'EFFECT_LOADED_FASTERQ_LINES';
export const EFFECT_LOADING_FASTERQ_LINES = 'EFFECT_LOADING_FASTERQ_LINES';
export const EFFECT_LOAD_FASTERQ_LINE = 'EFFECT_LOAD_FASTERQ_LINE';
export const EFFECT_LOADED_FASTERQ_LINE = 'EFFECT_LOADED_FASTERQ_LINE';
export const EFFECT_LOADING_FASTERQ_LINE = 'EFFECT_LOADING_FASTERQ_LINE';
export const EFFECT_LOAD_FASTERQ_ANALYTICS = 'EFFECT_LOAD_FASTERQ_ANALYTICS';
export const EFFECT_LOADED_FASTERQ_ANALYTICS = 'EFFECT_LOADED_FASTERQ_ANALYTICS';
export const EFFECT_LOADING_FASTERQ_ANALYTICS = 'EFFECT_LOADING_FASTERQ_ANALYTICS';
export const EFFECT_LOAD_FASTERQ_QUEUES = 'EFFECT_LOAD_FASTERQ_QUEUES';
export const EFFECT_LOADED_FASTERQ_QUEUES = 'EFFECT_LOADED_FASTERQ_QUEUES';
export const EFFECT_LOADING_FASTERQ_QUEUES = 'EFFECT_LOADING_FASTERQ_QUEUES';
export const EFFECT_UPDATE_FASTERQ_LINE = 'EFFECT_UPDATE_FASTERQ_LINE';
export const EFFECT_UPDATED_FASTERQ_LINE = 'EFFECT_UPDATED_FASTERQ_LINE';
export const EFFECT_REMOVE_FASTERQ_LINE = 'EFFECT_REMOVE_FASTERQ_LINE';
export const EFFECT_REMOVED_FASTERQ_LINE = 'EFFECT_REMOVED_FASTERQ_LINE';
export const EFFECT_ADD_FASTERQ_LINE = 'EFFECT_ADD_FASTERQ_LINE';
export const EFFECT_ADDED_FASTERQ_LINE = 'EFFECT_ADDED_FASTERQ_LINE';
export const EFFECT_QUEUE_CALL_SAVE = 'EFFECT_QUEUE_CALL_SAVE';
export const EFFECT_QUEUE_CALL_SAVING = 'EFFECT_QUEUE_CALL_SAVING';
export const EFFECT_QUEUE_CALL_SAVED = 'EFFECT_QUEUE_CALL_SAVED';
export const EFFECT_QUEUE_SERVICE_SAVE = 'EFFECT_QUEUE_SERVICE_SAVE';
export const EFFECT_QUEUE_SERVICE_SAVING = 'EFFECT_QUEUE_SERVICE_SAVING';
export const EFFECT_QUEUE_SERVICE_SAVED = 'EFFECT_QUEUE_SERVICE_SAVED';
export const EFFECT_QUEUE_POLL_SERVICE = 'EFFECT_QUEUE_POLL_SERVICE';
export const EFFECT_RESET_FASTERQ_LINE = 'EFFECT_RESET_FASTERQ_LINE';

@Injectable()
export class AppDbEffects {

    parseString;
    appBaseUrlServices
    fasterQueueInFlight = false;

    constructor(private actions$: Actions,
                private store: Store<ApplicationState>,
                private rp: RedPepperService,
                private yp: YellowPepperService,
                private commBroker: CommBroker,
                private toastr: ToastsManager,
                private http: Http) {

        // todo: disabled injection as broken in AOT
        // @Inject('OFFLINE_ENV') private offlineEnv,

        this.yp.ngrxStore.select(store => store.appDb.appBaseUrlServices)
            .subscribe((i_appBaseUrlServices) => {
                this.appBaseUrlServices = i_appBaseUrlServices;
            })

        this.parseString = xml2js.parseString;
    }

    /**
     *
     * Authentication
     *
     */

    @Effect({dispatch: true})
    authTwoFactor$: Observable<Action> = this.actions$.ofType(EFFECT_TWO_FACTOR_AUTH)
        .switchMap(action => this.authTwoFactor(action))
        .map(authStatus => ({type: EFFECT_AUTH_END, payload: authStatus}));

    private authTwoFactor(action: Action): Observable<any> {
        this.store.dispatch({type: EFFECT_AUTH_STATUS, payload: AuthenticateFlags.TWO_FACTOR_CHECK})

        return this.store.select(store => store.appDb.appBaseUrlCloud)
            .take(1)
            .mergeMap(baseUrl => {
                const url = baseUrl.replace('END_POINT', 'twoFactor') + `/${action.payload.token}/${action.payload.enable}`
                return this.http.get(url)
                    .catch((err: any) => {
                        this.toastr.error('Error getting two factor');
                        return Observable.throw(err);
                    })
                    .finally(() => {
                    })
                    .map(res => {
                        var status = res.json();
                        if (status.result) {
                            this.store.dispatch({type: EFFECT_AUTH_STATUS, payload: AuthenticateFlags.TWO_FACTOR_PASS})
                        } else {
                            this.store.dispatch({type: EFFECT_AUTH_STATUS, payload: AuthenticateFlags.TWO_FACTOR_FAIL})
                        }
                    })
            })
    }

    @Effect()
    updatedTwoFactor$: Observable<Action> = this.actions$.ofType(EFFECT_TWO_FACTOR_UPDATING)
        .switchMap(action => this.updatedTwoFactor(action))
        .map(authStatus => ({type: EFFECT_AUTH_END, payload: authStatus}));

    private updatedTwoFactor(action: Action): Observable<any> {
        return this.store.select(store => store.appDb.appBaseUrlCloud)
            .take(1)
            .mergeMap(baseUrl => {
                const url = baseUrl.replace('END_POINT', 'twoFactor') + `/${action.payload.token}/${action.payload.enable}`
                return this.http.get(url)
                    .catch((err: any) => {
                        this.toastr.error('Error getting two factor');
                        return Observable.throw(err);
                    })
                    .finally(() => {
                    })
                    .map(res => {
                        var status = res.json().result;
                        status == true ? this.store.dispatch({
                            type: EFFECT_AUTH_STATUS,
                            payload: AuthenticateFlags.TWO_FACTOR_UPDATE_PASS
                        }) : this.store.dispatch({
                            type: EFFECT_AUTH_STATUS,
                            payload: AuthenticateFlags.TWO_FACTOR_UPDATE_FAIL
                        })
                        this.store.dispatch({
                            type: EFFECT_TWO_FACTOR_UPDATED,
                            payload: status
                        })
                    })
            })
    }


    @Effect()
    authUser$: Observable<Action> = this.actions$.ofType(EFFECT_AUTH_START)
        .switchMap(action => this.authUser(action))
        .map(authStatus => ({type: EFFECT_AUTH_END, payload: authStatus}));

    private authUser(action: Action): Observable<any> {
        console.log('authenticating');
        this.toastr.clearAllToasts();
        this.toastr.warning('Authenticating, please wait');
        let userModel: UserModel = action.payload;
        this.store.dispatch({type: EFFECT_UPDATE_USER_MODEL, payload: userModel});

        return this.rp.dbConnect(userModel.user(), userModel.pass()).take(1).map((pepperConnection: IPepperConnection) => {
            console.log('authenticating in process');
            if (pepperConnection.pepperAuthReply.status == false) {
                console.log('authentication failed');
                this.toastr.error('Authentication failed')
                userModel = userModel.setAuthenticated(false);
                userModel = userModel.setAccountType(-1);
                this.store.dispatch({type: EFFECT_UPDATE_USER_MODEL, payload: userModel});
                this.store.dispatch({type: EFFECT_AUTH_STATUS, payload: AuthenticateFlags.WRONG_PASS});
                return;

            } else {
                console.log('authenticating check account type');
                if (pepperConnection.pepperAuthReply.warning == 'not a studioLite account') {
                    return bootbox.alert('This is not a StudioLite account, please use StudioPro')
                } else {
                    // console.log('lite account');
                }

                var whiteLabel = jXML(pepperConnection.loadManager.m_resellerInfo).find('WhiteLabel');//.attr('enabled'));
                var resellerId = jXML(pepperConnection.loadManager.m_resellerInfo).find('BusinessInfo');//.attr('businessId'));
                var resellerDataString = jXML(pepperConnection.loadManager.m_resellerInfo).children()[0].innerHTML;

                var componentList = {};
                var components = jXML(pepperConnection.loadManager.m_resellerInfo).find('InstalledApps').find('App');
                _.each(components, function (component) {
                    if (jXML(component).attr('installed') == '1')
                        componentList[jXML(component).attr('id')] = 1;
                });
                userModel = userModel.setComponents(componentList)

                var resellerDataJson = {};
                const boundCallback = Observable.bindCallback(this.processXml, (xmlData: any) => xmlData);
                boundCallback(this, resellerDataString).subscribe((i_resellerDataJson) => {
                    resellerDataJson = i_resellerDataJson;
                }, (e) => console.error(e))
                userModel = userModel.setAuthenticated(true);
                userModel = userModel.setAccountType(AuthenticateFlags.USER_ACCOUNT);
                userModel = userModel.setResellerInfo(pepperConnection.loadManager.m_resellerInfo);
                userModel = userModel.setResellerName(
                    jXML(pepperConnection.loadManager.m_resellerInfo)
                        .find('BusinessInfo')
                        .attr('name')
                );
                userModel = userModel.setResellerId(
                    Number(jXML(pepperConnection.loadManager.m_resellerInfo)
                        .find('BusinessInfo')
                        .attr('businessId'))
                );
                userModel = userModel.setEri(pepperConnection.loadManager.m_eri);
                userModel = userModel.setResellerWhiteLabel(resellerDataJson);

                this.store.dispatch({type: EFFECT_UPDATE_USER_MODEL, payload: userModel});
                this.store.dispatch({
                    type: EFFECT_AUTH_STATUS, payload: AuthenticateFlags.USER_ACCOUNT
                });

                /////////////////////////////////////////////////////////////////////////////
                // todo: currently if logging in with enterprise account, dbConnect will timeout,
                // todo: Alon needs to fix and we can dispatch code below
                // userModel = userModel.setAuthenticated(true);
                // userModel = userModel.setAccountType(AuthenticateFlags.ENTERPRISE_ACCOUNT);
                // this.store.dispatch({type: EFFECT_UPDATE_USER_MODEL, payload: userModel});
                // this.store.dispatch({
                //     type: EFFECT_AUTH_STATUS, payload: AuthenticateFlags.ENTERPRISE_ACCOUNT
                // });
                /////////////////////////////////////////////////////////////////////////////
            }

            // if passed check for two factor
            if (userModel.getAuthenticated()) {
                this.twoFactorCheck()
                    .take(1)
                    .subscribe((twoFactorResult) => {
                        if (window['offlineDevMode']) {
                            return this.store.dispatch({
                                type: EFFECT_AUTH_STATUS,
                                payload: AuthenticateFlags.AUTH_PASS_NO_TWO_FACTOR
                            });
                        }
                        userModel = userModel.setBusinessId(twoFactorResult.businessId);
                        userModel = userModel.setTwoFactorRequired(twoFactorResult.enabled);
                        this.store.dispatch({type: EFFECT_UPDATE_USER_MODEL, payload: userModel});
                        if (twoFactorResult.enabled) {
                            this.store.dispatch({
                                type: EFFECT_AUTH_STATUS,
                                payload: AuthenticateFlags.TWO_FACTOR_ENABLED
                            });
                        } else {
                            this.toastr.info('Authenticated successfully');
                            this.store.dispatch({
                                type: EFFECT_AUTH_STATUS,
                                payload: AuthenticateFlags.AUTH_PASS_NO_TWO_FACTOR
                            });
                        }
                    }, (e) => console.error(e))
            }
        });
    }

    /**
     *
     * Stations
     *
     */

    @Effect({dispatch: true})
    loadStations: Observable<Action> = this.actions$.ofType(EFFECT_LOAD_STATIONS)
        .switchMap(action => this._loadStations(action))
        .map(stations => ({type: EFFECT_LOADED_STATIONS, payload: stations}));

    private _loadStations(action: Action): Observable<List<StationModel>> {

        const insertStations = (response) => {
            var stationsList: List<StationModel> = List([]);
            response.Stations.Station.forEach((i_station) => {
                if (_.isEmpty(i_station.attr.name))
                    i_station.attr.name = 'new station';
                var station: IStation = i_station.attr;
                var newStation = new StationModel(station)
                stationsList = stationsList.push(newStation);
            })
            return stationsList;
        }

        const boundCallback = Observable.bindCallback(this.processXml, (xmlData: any) => xmlData);
        this.store.dispatch({type: EFFECT_LOADING_STATIONS, payload: {}})
        var url = window.g_protocol + action.payload.userData.domain + '/WebService/getStatus.ashx?user=' + action.payload.userData.userName + '&password=' + action.payload.userData.userPass + '&callback=?';
        return this.http.get(url)
            .catch((err: any) => {
                bootbox.alert('Error loading stations, try again later...');
                return Observable.throw(err);
            })
            .finally(() => {
            })
            .mergeMap((result: Response) => {
                var s64: string = String(result.text());
                s64 = s64.replace(/\?\({ "ret": "/, '').replace(/" }\)/, '');
                var str = jQuery.base64.decode(s64);
                return boundCallback(this, str)
            }).map(response => {

                if (_.isEmpty(response.Stations))
                    return List([]);

                var totalBranches = this.rp.getStationBranchTotal();
                var totalStations = response.Stations.Station.length;

                if (totalStations != totalBranches) {
                    this.rp.sync(() => {
                        this.rp.reduxCommit();
                    })
                    return insertStations(response);
                } else {
                    return insertStations(response);
                }
            })
    }

    /**
     *
     * Fasterq
     *
     */
    private fasterqCreateServerCall(i_urlEndPoint, i_method, i_body): RequestOptionsArgs {
        var credentials = Lib.EncryptUserPass(this.rp.getUserData().userName, this.rp.getUserData().userPass);
        var url = `${this.appBaseUrlServices}${i_urlEndPoint}`;
        var headers = new Headers();
        headers.append('Authorization', credentials);
        return {
            url: url,
            method: i_method,
            headers: new Headers({'Authorization': credentials}),
            body: i_body
        };
    }

    @Effect({dispatch: true})
    loadfasterqLines: Observable<Action> = this.actions$.ofType(EFFECT_LOAD_FASTERQ_LINES)
        .switchMap(action => this._loadFasterqLines(action))
        .map(stations => ({type: EFFECT_LOADED_FASTERQ_LINES, payload: stations}));

    private _loadFasterqLines(action: Action): Observable<List<FasterqLineModel>> {
        this.store.dispatch({type: EFFECT_LOADING_FASTERQ_LINES, payload: {}})
        var options: RequestOptionsArgs = this.fasterqCreateServerCall('/Lines', RequestMethod.Get, '')
        return this.http.get(options.url, options)
            .catch((err: any) => {
                bootbox.alert('Error loading fasterq lines, try again later...');
                return Observable.throw(err);
            })
            .finally(() => {
            })
            .map((response: Response) => {
                var lines = List([]);
                var rxLines = response.json();
                rxLines.forEach((line) => {
                    lines = lines.push(new FasterqLineModel(line))
                })
                return lines;
            })
    }

    @Effect({dispatch: true})
    loadfasterqLine: Observable<Action> = this.actions$.ofType(EFFECT_LOAD_FASTERQ_LINE)
        .switchMap(action => this._loadFasterqLine(action))
        .map(stations => ({type: EFFECT_LOADED_FASTERQ_LINE, payload: stations}));

    private _loadFasterqLine(action: Action): Observable<FasterqLineModel> {
        this.store.dispatch({type: EFFECT_LOADING_FASTERQ_LINE, payload: {}})
        var options: RequestOptionsArgs = this.fasterqCreateServerCall(`/GetLine`, RequestMethod.Post, action.payload)
        return this.http.get(options.url, options)
            .catch((err: any) => {
                bootbox.alert('Error loading fasterq line, try again later...');
                return Observable.throw(err);
            })
            .finally(() => {
            })
            .map((response: Response) => {
                var data:any = response.json()[0];
                var line = new FasterqLineModel(data)
                return line;
            })
    }


    @Effect({dispatch: true})
    loadfasterqAnalytics: Observable<Action> = this.actions$.ofType(EFFECT_LOAD_FASTERQ_ANALYTICS)
        .switchMap(action => this._loadfasterqAnalytics(action))
        .map(stations => ({type: EFFECT_LOADED_FASTERQ_ANALYTICS, payload: stations}));

    private _loadfasterqAnalytics(action: Action): Observable<List<FasterqLineModel>> {
        this.store.dispatch({type: EFFECT_LOADING_FASTERQ_ANALYTICS, payload: {}})
        var options: RequestOptionsArgs = this.fasterqCreateServerCall('/LineAnalytics', RequestMethod.Post, action.payload)
        return this.http.get(options.url, options)
            .catch((err: any) => {
                bootbox.alert('Error loading fasterq analytics, try again later...');
                return Observable.throw(err);
            })
            .finally(() => {
            })
            .map((response: Response) => {
                var analytics = List([]);
                var rxAnalytics = response.json();
                rxAnalytics.forEach((data) => {
                    analytics = analytics.push(new FasterqAnalyticsModel(data))
                })
                return analytics;
            })
    }

    @Effect({dispatch: true})
    loadfasterqQueues: Observable<Action> = this.actions$.ofType(EFFECT_LOAD_FASTERQ_QUEUES)
        .takeWhile(() => {
            return this.fasterQueueInFlight == false;
        })
        .switchMap(action => this._loadfasterqQueues(action))
        .map(stations => ({type: EFFECT_LOADED_FASTERQ_QUEUES, payload: stations}));

    private _loadfasterqQueues(action: Action): Observable<List<FasterqLineModel>> {
        this.store.dispatch({type: EFFECT_LOADING_FASTERQ_QUEUES, payload: {}})
        var options: RequestOptionsArgs = this.fasterqCreateServerCall(`/Queues`, RequestMethod.Post, action.payload)
        return this.http.get(options.url, options)
            .catch((err: any) => {
                bootbox.alert('Error loading fasterq queues, try again later...');
                return Observable.throw(err);
            })
            .finally(() => {
            })
            .map((response: Response) => {
                var lines = List([]);
                var rxQueus = response.json();
                rxQueus.forEach((queue) => {
                    lines = lines.push(new FasterqQueueModel(queue))
                })
                return lines;
            })
    }

    @Effect({dispatch: true})
    savefasterqQueueCall: Observable<Action> = this.actions$.ofType(EFFECT_QUEUE_CALL_SAVE)
        .do(() => this.fasterQueueInFlight = true)
        .switchMap(action => this._savefasterqQueueCall(action))
        .map(stations => ({type: EFFECT_QUEUE_CALL_SAVED, payload: stations}));

    private _savefasterqQueueCall(action: Action): Observable<List<FasterqLineModel>> {
        this.store.dispatch({type: EFFECT_QUEUE_CALL_SAVING, payload: {}})
        var queueSave: IQueueSave = action.payload;
        var data = Object.assign({}, queueSave.queue.getData().toJS(), queueSave)
        var options: RequestOptionsArgs = this.fasterqCreateServerCall(`/Queue/${action.payload.queue_id}`, RequestMethod.Put, data)
        return this.http.get(options.url, options)
            .catch((err: any) => {
                bootbox.alert('Error saving call fasterq queue, try again later...');
                return Observable.throw(err);
            })
            .finally(() => {
                this.fasterQueueInFlight = false;
            })
            .map((response: Response) => {
                var reply = response.json();
                if (reply.updated == 'alreadyCalled') {
                    var message: IMessage = {
                        event: FASTERQ_QUEUE_CALL_CANCLED,
                        fromInstance: this,
                        message: data
                    }
                    this.commBroker.fire(message)
                    return null;
                }
                return data;
            })
    }

    @Effect({dispatch: false})
    resetFasterqLine: Observable<Action> = this.actions$.ofType(EFFECT_RESET_FASTERQ_LINE)
        .switchMap(action => this._resetFasterqLine(action))
        .map(res => ({type: null}));

    private _resetFasterqLine(action: Action): Observable<List<FasterqLineModel>> {
        var options: RequestOptionsArgs = this.fasterqCreateServerCall(`/ResetQueueCounter`, RequestMethod.Post, action.payload)
        return this.http.get(options.url, options)
            .catch((err: any) => {
                bootbox.alert('Error resetting line, try again later...');
                return Observable.throw(err);
            })
            .finally(() => {
            })
            .map((response: Response) => {
                var reply = response.json();
                return {};
            })
    }

    @Effect({dispatch: true})
    savefasterqQueueService: Observable<Action> = this.actions$.ofType(EFFECT_QUEUE_SERVICE_SAVE)
        .do(() => this.fasterQueueInFlight = true)
        .switchMap(action => this._savefasterqQueueService(action))
        .map(stations => ({type: EFFECT_QUEUE_SERVICE_SAVED, payload: stations}));

    private _savefasterqQueueService(action: Action): Observable<List<FasterqLineModel>> {
        this.store.dispatch({type: EFFECT_QUEUE_SERVICE_SAVING, payload: {}})
        var queueSave: IQueueSave = action.payload;
        var data = Object.assign({}, queueSave.queue.getData().toJS(), queueSave)
        var options: RequestOptionsArgs = this.fasterqCreateServerCall(`/Queue/${action.payload.queue_id}`, RequestMethod.Put, data)
        return this.http.get(options.url, options)
            .catch((err: any) => {
                bootbox.alert('Error saving service fasterq queue, try again later...');
                return Observable.throw(err);
            })
            .finally(() => {
                this.fasterQueueInFlight = false;
            })
            .map((response: Response) => {
                var data = response.json();
                return action.payload;
            })
    }

    @Effect({dispatch: false})
    pollServicing: Observable<Action> = this.actions$.ofType(EFFECT_QUEUE_POLL_SERVICE)
        .switchMap(action => this._pollServicing(action))
        .do((data: any) => {
            var uiState: IUiState = {fasterq: {fasterqNowServicing: data}}
            this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
        })
        .map(result => ({type: null}));

    private _pollServicing(action: Action): Observable<List<FasterqLineModel>> {
        var options: RequestOptionsArgs = this.fasterqCreateServerCall(`/LastCalledQueue`, RequestMethod.Post, action.payload)
        return this.http.get(options.url, options)
            .catch((err: any) => {
                bootbox.alert('Error saving service fasterq queue, try again later...');
                return Observable.throw(err);
            })
            .finally(() => {
            })
            .map((response: Response) => {
                var data = response.json().service_id
                return data;
            })
    }

    @Effect({dispatch: true})
    updateFasterqLine: Observable<Action> = this.actions$.ofType(EFFECT_UPDATE_FASTERQ_LINE)
        .switchMap(action => this._updateFasterqLine(action))
        .map(payload => ({type: EFFECT_UPDATED_FASTERQ_LINE, payload: payload}));

    private _updateFasterqLine(action: Action): Observable<any> {
        var options: RequestOptionsArgs = this.fasterqCreateServerCall(`/Line/${action.payload.id}`, RequestMethod.Put, action.payload)
        return this.http.get(options.url, options)
            .catch((err: any) => {
                bootbox.alert('Error saving fasterq line, try again later...');
                return Observable.throw(err);
            })
            .finally(() => {
            })
            .map((response: Response) => {
                return {
                    data: action.payload,
                    serverReplay: response.json()
                }
            })
    }

    @Effect({dispatch: true})
    removeFasterqLine: Observable<Action> = this.actions$.ofType(EFFECT_REMOVE_FASTERQ_LINE)
        .switchMap(action => this._removeFasterqLine(action))
        .map(payload => ({type: EFFECT_REMOVED_FASTERQ_LINE, payload: payload}));

    private _removeFasterqLine(action: Action): Observable<any> {
        var options: RequestOptionsArgs = this.fasterqCreateServerCall(`/Line/${action.payload.id}`, RequestMethod.Delete, action.payload)
        return this.http.get(options.url, options)
            .catch((err: any) => {
                bootbox.alert('Error removing fasterq line, try again later...');
                return Observable.throw(err);
            })
            .finally(() => {
            })
            .map((response: Response) => {
                return {
                    data: action.payload,
                    serverReplay: response.json()
                }
            })
    }

    @Effect({dispatch: true})
    addFasterqLine: Observable<Action> = this.actions$.ofType(EFFECT_ADD_FASTERQ_LINE)
        .switchMap(action => this._addFasterqLine(action))
        .map(payload => ({type: EFFECT_ADDED_FASTERQ_LINE, payload: payload}));

    private _addFasterqLine(action: Action): Observable<any> {
        var options: RequestOptionsArgs = this.fasterqCreateServerCall(`/Line`, RequestMethod.Post, action.payload)
        return this.http.get(options.url, options)
            .catch((err: any) => {
                bootbox.alert('Error adding fasterq line, try again later...');
                return Observable.throw(err);
            })
            .finally(() => {
            })
            .map((response: Response) => {
                return {
                    data: action.payload,
                    serverReplay: response.json()
                }
            })
    }

    private processXml(context, xmlData, cb) {
        context.parseString(xmlData, {attrkey: 'attr'}, function (err, result) {
            if (err || !result)
                return cb(null);
            return cb(result);
        })
    }

    private twoFactorCheck(): Observable<any> {
        return this.store.select(store => store.appDb.appBaseUrlCloud)
            .take(1)
            .mergeMap(appBaseUrlCloud => {
                if (window['offlineDevMode']) {
                    return Observable.of({});
                }
                var url = appBaseUrlCloud.replace('END_POINT', 'twoFactorCheck');
                return this.http.get(url)
                    .catch((err: any) => {
                        return Observable.throw(err);
                    })
                    .map(res => {
                        return res.json()
                    })
            })
    }
}


// this.store.select(store => store.appDb.appBaseUrl)
//     .take(1)
//     .mergeMap(baseUrl => {
//         const url = `${baseUrl}?command=GetCustomers&resellerUserName=${userModel.user()}&resellerPassword=${userModel.pass()}`;
//         return this.http.get(url)
//             .catch((err: any) => {
//                 alert('Error getting order details');
//                 return Observable.throw(err);
//             })
//             .finally(() => {
//             })
//             .map(res => {
//                 return res.text()
//             }).flatMap((i_xmlData: string) => {
//                 const boundCallback = Observable.bindCallback(this.processXml, (xmlData: any) => xmlData);
//                 return boundCallback(this, i_xmlData)
//             }).map(result => {
//
//
//             })
//     })
// this.rp.dbConnect(userModel.user(), userModel.pass(), (result:{[key: string]: string}) => {
//     console.log(result);
// })
