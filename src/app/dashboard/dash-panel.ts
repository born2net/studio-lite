import {AfterViewInit, Component} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {EFFECT_LOAD_FASTERQ_LINES, EFFECT_LOAD_STATIONS} from "../../store/effects/appdb.effects";
import {RedPepperService} from "../../services/redpepper.service";
import {List} from "immutable";
import {StationModel} from "../../models/StationModel";
import {Observable} from "rxjs/Observable";
import {LiveLogModel} from "../../models/live-log-model";
import {ACTION_LIVELOG_UPDATE} from "../../store/actions/appdb.actions";

@Component({
    selector: 'dash-panel',
    styles: [`
        .twitter-timeline {
            width: 100% !important;
        }

        iframe {
            width: 100% !important;
        }
    `],
    templateUrl: './dash-panel.html'
})
export class DashPanel extends Compbaser implements AfterViewInit {
    m_totalStationsConnected = 0;
    m_totalStationsDisconnected = 0;
    m_lastSave$;
    m_userModel$;
    m_scenes$;
    m_campaigns$;
    m_resources$;
    m_lines$;
    m_timelines$;
    m_liveLog:List<LiveLogModel>;
    isBrandingDisabled: Observable<boolean>;


    constructor(private yp: YellowPepperService, private rp: RedPepperService) {
        super();
        this.m_lastSave$ = this.yp.ngrxStore.select(store => store.appDb.uiState.appSaved)
        this.m_userModel$ = this.yp.listenUserModel();
        this.m_scenes$ = this.yp.getScenes();
        this.m_campaigns$ = this.yp.getCampaigns();
        this.m_resources$ = this.yp.getResources();
        this.m_lines$ = this.yp.listenFasterqLines();
        this.m_timelines$ = this.yp.getTimelines();
        this.isBrandingDisabled = this.yp.isBrandingDisabled();
        this._listenStationsConnection();
        this._listenLoadLines();
        this._listenLiveLog();
    }

    _listenLiveLog() {
        this.cancelOnDestroy(
            this.yp.ngrxStore.select(store => store.appDb.liveLog)
                .subscribe((i_liveLog) => {
                    this.m_liveLog = i_liveLog;
                }, (e) => console.error(e))
        )
    }

    _listenLoadLines() {
        this.yp.ngrxStore.dispatch({type: EFFECT_LOAD_FASTERQ_LINES, payload: {}})
        this.yp.dispatch(({type: ACTION_LIVELOG_UPDATE, payload: new LiveLogModel({event: 'updating remote stations status'})}));
    }

    _listenStationsConnection() {
        this.cancelOnDestroy(
            this.yp.listenStations()
                .map((i_stationModels: List<StationModel>) => {
                    i_stationModels.forEach(i_stationModel => {
                        if (i_stationModel.connection == 0) {
                            this.m_totalStationsDisconnected++;
                        } else {
                            this.m_totalStationsConnected++;
                        }
                    });
                    return i_stationModels;
                }).subscribe(() => {
            }, (e) => console.error(e))
        );
        this._loadStationData();
    }

    ngAfterViewInit() {
        var twitter = function (d: any, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
            // if (!d.getElementById(id)) {
            js = d.createElement(s);
            js.id = id;
            js.src = p + "://platform.twitter.com/widgets.js";
            js.setAttribute('onload', "twttr.events.bind('rendered',function(e) {});");
            fjs.parentNode.insertBefore(js, fjs);
            // }
        }(document, "script", "twitter-wjs");
        this.setTwitterWidth();

    }

    _loadStationData() {
        this.yp.ngrxStore.dispatch({type: EFFECT_LOAD_STATIONS, payload: {userData: this.rp.getUserData()}});
    }

    setTwitterWidth() {
        Observable.interval(400)
            .take(5)
            .subscribe(() => {
                jQuery('.twitter-timeline').css({width: '100%'});
            })
    }

    destroy() {
    }
}
