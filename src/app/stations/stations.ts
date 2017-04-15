import {ChangeDetectionStrategy, Component} from "@angular/core";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {RedPepperService} from "../../services/redpepper.service";
import {ResourcesModel} from "../../store/imsdb.interfaces_auto";
import {List} from "immutable";
import {Observable} from "rxjs";
import {Compbaser} from "ng-mslib";
import {IUiState} from "../../store/store.data";
import {ACTION_UISTATE_UPDATE, SideProps} from "../../store/actions/appdb.actions";
import {BlockService} from "../blocks/block-service";
import {MainAppShowStateEnum} from "../app-component";
import {EFFECT_LOAD_STATIONS} from "../../store/effects/appdb.effects";
import {StationModel} from "../../models/StationModel";
import * as _ from 'lodash';

@Component({
    // changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'stations',
    template: `
        <small class="debug">{{me}}</small>
        <div id="resourcesPanel">
            <div class="btn-group">
                <button (click)="_loadData()" type="button" class="btn btn-danger">
                    <i style="font-size: 1em" class="fa fa-refresh"></i>
                    <span i18n>reload</span>
                </button>
                <button (click)="_removeStation()" type="button" class="btn btn-default">
                    <i style="font-size: 1em" class="fa fa-minus"></i>
                    <span i18n>remove</span>
                </button>
                <input [(ngModel)]="m_filter" style="width: 200px" id="resourcesFilterList" class="form-control" placeholder="search for" required="">
            </div>
            <!--<h5 i18n>supported files: flv, mp4, jpg, png, swf and svg</h5>-->
            <div id="resourceLibListWrap">
                <ul id="resourceLibList" class="list-group row"></ul>
            </div>
        </div>
        <!-- move scroller to proper offset -->
        <div class="responsive-pad-right">
            <div id="stationsPanel" matchBodyHeight="150" style="overflow: scroll">
                <stations-list [filter]="m_filter" [stations]="m_stationModels$ | async" (onSelected)="_onSelected($event)">
                </stations-list>
            </div>
        </div>
    `,
    styles: [`

        /*:host /deep/ vg-player {*/
        /*background-color: transparent;*/
        /*margin: 30px;*/
        /*width: 30%;*/
        /*height: calc(100% - 60px);*/
        /*}*/

        /*:host /deep/ vg-player {*/
        /*background-color: transparent;*/
        /*margin: 30px;*/
        /*width: 30%;*/
        /*height: calc(100% - 60px);*/
        /*}*/

        * {
            border-radius: 0 !important;
        }

        vg-player {
            background-color: transparent;
            margin: 30px;
            width: 30%;
            height: calc(100% - 60px);
        }

        vg-controls {
            padding: 30px;
            transition: all 1s;
        }

        #resourcesPanel {
            padding: 10px;
        }

        .myFile {
            position: relative;
            overflow: hidden;
            float: left;
            clear: left;
        }

        .myFile input[type="file"] {
            display: block;
            position: absolute;
            top: 0;
            right: 0;
            opacity: 0;
            font-size: 100px;
            filter: alpha(opacity=0);
            cursor: pointer;
        }
    `]
})

export class Stations extends Compbaser {

    m_filter;
    m_stationModel: StationModel;
    m_stationModels$: Observable<List<StationModel>>;
    m_loadStationsHandle;

    constructor(private yp: YellowPepperService, private rp: RedPepperService, private bs: BlockService) {
        super();
        this._loadData();
        this.m_stationModels$ = this.yp.listenStations();

        this.cancelOnDestroy(
            //
            this.yp.listenStationSelected()
                .subscribe((i_stationModel: StationModel) => {
                    this.m_stationModel = i_stationModel;
                }, (e) => console.error(e))
        )

        this.cancelOnDestroy(
            //
            this.yp.listenMainAppState()
                .subscribe((i_value: MainAppShowStateEnum) => {
                    switch (i_value) {
                        case MainAppShowStateEnum.SAVED: {
                            this._loadData();
                            break;
                        }
                    }
                }, (e) => console.error(e))
        )
    }

    _loadData() {
        this.yp.ngrxStore.dispatch({type: EFFECT_LOAD_STATIONS, payload: {userData: this.rp.getUserData()}})
        if (_.isUndefined(this.m_loadStationsHandle)) {
            this.m_loadStationsHandle = setInterval(() => {
                this._loadData();
            }, 4000)
        }
    }

    _removeStation() {
        if (_.isUndefined(this.m_stationModel)) {
            bootbox.dialog({
                message: 'No station selected...',
                buttons: {
                    danger: {
                        label: 'close',
                        className: "btn-danger",
                        callback: function () {
                        }
                    }
                }
            });
            return false;
        }
        bootbox.confirm('Are you sure you want to uninstall the selected station?', (result) => {
            if (!result) return;

            this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: {uiSideProps: SideProps.miniDashboard}}))
            this.rp.removeStation(this.m_stationModel.id);
            // this.rp.sendCommand('rebootStation', this.m_stationModel.id, () => {});
            this.rp.sendCommand('rebootPlayer', this.m_stationModel.id, () => {});
            this.rp.sendCommand('rebootPlayer', this.m_stationModel.id, () => {});
            this.rp.sendCommand('rebootPlayer', this.m_stationModel.id, () => {});
            var uiState: IUiState = {uiSideProps: SideProps.miniDashboard, stations: {stationSelected: -1}}
            this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
            this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: {mainAppState: MainAppShowStateEnum.SAVE}}))
        });
    }

    _onSelected(i_station: StationModel) {
        let uiState: IUiState = {
            uiSideProps: SideProps.stationProps,
            stations: {stationSelected: i_station.id}
        }
        this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    }

    destroy() {
        clearInterval(this.m_loadStationsHandle);
        var uiState: IUiState = {stations: {stationSelected: -1}}
        this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    }
}

