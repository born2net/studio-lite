import {ChangeDetectorRef, Component, ViewChild} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {Observable} from "rxjs";
import {ACTION_LIVELOG_UPDATE, ACTION_UISTATE_UPDATE, SideProps} from "../../store/actions/appdb.actions";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {RedPepperService} from "../../services/redpepper.service";
import {StationModel} from "../../models/StationModel";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {FormBuilder, FormGroup} from "@angular/forms";
import {timeout} from "../../decorators/timeout-decorator";
import {BranchStationsModelExt, CampaignsModelExt} from "../../store/model/msdb-models-extended";
import {List} from "immutable";
import {LazyImage} from "../../comps/lazy-image/lazy-image";
import {ToastsManager} from "ng2-toastr";
import {LiveLogModel} from "../../models/live-log-model";
import * as _ from 'lodash';
import {IUiState} from "../../store/store.data";
import {MainAppShowStateEnum} from "../app-component";
import {PreviewModeEnum} from "../live-preview/live-preview";

@Component({
    selector: 'stations-props-manager',
    host: {
        '(input-blur)': 'saveToStore($event)'
    },
    animations: [
        trigger('toggleState', [
            state('true', style({})),
            state('false', style({maxHeight: 0, padding: 0, display: 'none'})),
            // transition
            transition('* => *', animate('300ms')),
        ])
    ],
    styles: [`
        ul {
            padding: 0px;
        }

        #stationcontrol {
            width: 100%;
        }

        #stationcontrol button {
            width: 25%;
        }

        /*.loading {*/
        /*float: left;*/
        /*position: relative;*/
        /*top: -106px;*/
        /*left: calc((100% / 2) - 30px);*/
        /*}*/

        /*img {*/
        /*float: left;*/
        /*position: relative;*/
        /*width: 210px;*/
        /*top: -140px;*/
        /*left: calc((100% / 2) - 109px);*/
        /*}*/

        /*#propWrap {*/
        /*position: fixed;*/
        /*padding-left: 20px;*/
        /*}*/
    `],
    templateUrl: './stations-props-manager.html'
})
export class StationsPropsManager extends Compbaser {

    contGroup: FormGroup;
    m_sideProps$: Observable<SideProps>;
    m_sidePropsEnum = SideProps;
    m_uiUserFocusItem$: Observable<SideProps>;
    m_selectedStation: StationModel;
    m_selectedBranchStation: BranchStationsModelExt;
    m_selectedCampaignId = -1;
    m_loading = false;
    m_totalStationsSelected = [];
    m_snapPath = '';
    shouldToggle = true;
    m_disabled = true;
    m_port = '';
    m_campaigns: List<CampaignsModelExt>;
    m_ip = '';
    m_inFocus = false;
    m_multiOptions = ['change campaigns, no save','change campaigns & save','change campaigns, save & restart station']

    constructor(private toast: ToastsManager, private fb: FormBuilder, private yp: YellowPepperService, private rp: RedPepperService, private cd: ChangeDetectorRef) {
        super();
        this.m_uiUserFocusItem$ = this.yp.ngrxStore.select(store => store.appDb.uiState.uiSideProps);
        this.m_sideProps$ = this.yp.ngrxStore.select(store => store.appDb.uiState.uiSideProps);


        this.contGroup = fb.group({
            'm_campaignsControl': [''],
            'm_campaignsMultiControl': [''],
            'm_stationName': [''],
            'm_eventValue': [''],
            'm_enableLan': [],
            'm_ip': [],
            'm_port': []
        });

        this.cancelOnDestroy(
            //
            this.yp.getMultiSelectedStations()
                .map(i_stations => {
                    var jStationsData = i_stations.toJSON();
                    this.m_totalStationsSelected =  [];
                    _.forEach(jStationsData, (i_selected, i_stationId) => {
                        if (i_selected)
                            this.m_totalStationsSelected.push(i_stationId)
                    })
                    return this.m_totalStationsSelected;
                })
                .subscribe((i_stationsIds) => {
                    console.log(i_stationsIds);
                }, (e) => console.error(e))
        )

        this.cancelOnDestroy(
            //
            this.yp.getCampaigns()
                .subscribe((i_campaigns: List<CampaignsModelExt>) => {
                    this.m_campaigns = i_campaigns;
                }, (e) => console.error(e))
        )
        this.cancelOnDestroy(
            //
            this.yp.listenStationBranchSelected()
                .map((i_station: StationModel) => {
                    this.m_snapPath = '';
                    if (this.m_selectedStation && this.m_selectedStation.id != i_station.id)
                        this._resetSnapshotSelection();
                    this.m_selectedStation = i_station;
                    this.m_disabled = this.m_selectedStation.connection == "0";
                    return this.m_selectedStation.id;
                })
                .mergeMap(i_station_id => {
                    return this.yp.getStationCampaignID(i_station_id)
                        .map((i_campaign_id) => {
                            return {i_station_id, i_campaign_id};
                        })

                })
                .mergeMap(({i_station_id, i_campaign_id}) => {
                    this.m_selectedCampaignId = i_campaign_id;
                    return this.yp.listenStationRecord(i_station_id)
                })
                .subscribe((i_branchStationsModel) => {
                    this.m_selectedBranchStation = i_branchStationsModel;
                    this._render()

                }, (e) => console.error(e))
        )
    }

    @ViewChild(LazyImage)
    lazyImage: LazyImage;

    loadImage(imagePath: string): Observable<HTMLImageElement> {
        return Observable
            .create(observer => {
                const img = new Image();
                try {
                    img.src = imagePath;
                    img.onload = () => {
                        observer.next(imagePath);
                        observer.complete();
                    };
                    img.onerror = err => {
                        observer.error(null);
                    };
                }
                catch (e) {
                    console.log('some error ' + e);
                }


            });
    }

    _resetSnapshotSelection() {
        if (this.lazyImage)
            this.lazyImage.resetToDefault();
    }

    _onMultiChangeCampaign(){
        this.m_totalStationsSelected.forEach((i_stationId)=>{
            this.rp.setStationCampaignID(i_stationId, this.contGroup.value.m_campaignsControl);
        });
        switch (this.contGroup.value.m_campaignsMultiControl) {
            case 'change campaigns, no save': {
                break;
            }
            case 'change campaigns & save': {
                let uiState: IUiState = {mainAppState: MainAppShowStateEnum.SAVE, previewMode: PreviewModeEnum.NONE}
                this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
                break;
            }
            case 'change campaigns, save & restart station': {
                let uiState: IUiState = {mainAppState: MainAppShowStateEnum.SAVE, previewMode: PreviewModeEnum.NONE}
                this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
                this.yp.listenMainAppState()
                    .skip(1)
                    .take(1)
                    .subscribe(i_status => {
                        if (i_status == MainAppShowStateEnum.SAVED) {
                            this.m_totalStationsSelected.forEach((i_stationId)=>{
                                this.rp.sendCommand('rebootPlayer', i_stationId, () => {
                                // this.rp.sendCommand('rebootPlayer', -1, () => {
                                });
                            });
                        }
                    })
                break;
            }

        }


        this.rp.reduxCommit();

        // bootbox.alert('next, restart selected stations to have them play your newly selected campaign');
    }

    _render() {
        if (!this.m_selectedBranchStation)
            return;

        this.contGroup.controls.m_campaignsControl.setValue(this.m_selectedCampaignId);
        this.contGroup.controls.m_enableLan.setValue(this.m_selectedBranchStation.getLanEnabled);
        if (this.m_inFocus)
            return;
        this.contGroup.controls.m_stationName.setValue(this.m_selectedBranchStation.getStationName());
        this.contGroup.controls.m_ip.setValue(this.m_selectedBranchStation.getLanServerIp());
        this.contGroup.controls.m_port.setValue(this.m_selectedBranchStation.getLanServerPort());
    }

    _onFocus(i_value) {
        this.m_inFocus = i_value;
    }

    _onStationRename() {
        this.toast.info('Station name will apply a few minutes after you save Studio changes, click [Save]');
    }

    _onCommand(i_command) {
        this.yp.dispatch(({type: ACTION_LIVELOG_UPDATE, payload: new LiveLogModel({event: 'send station event ' + i_command})}));
        switch (i_command) {
            case 'play': {
                this.rp.sendCommand('start', this.m_selectedStation.id, () => {
                });
                break;
            }
            case 'stop': {
                this.rp.sendCommand('stop', this.m_selectedStation.id, () => {
                });
                break;
            }
            case 'snap': {
                this._takeSnapshot();
                break;
            }
            case 'off': {
                this.rp.sendCommand('rebootPlayer', this.m_selectedStation.id, () => {
                });
                break;
            }
        }
    }

    _onLoaded() {
        console.log('img loaded');
    }

    _onError() {
        console.log('img error');
    }

    _onCompleted() {
        console.log('img completed');
    }

    _takeSnapshot() {
        var d = new Date().getTime();
        this.m_snapPath = '';
        this.m_loading = true;
        var path = this.rp.sendSnapshot(d, 0.2, this.m_selectedStation.id, () => {
            this.m_snapPath = path;
            this.lazyImage.urls = [path];
        });
        setTimeout(() => {
            this.loadImage(path)
                .subscribe(v => {
                    // console.log(v);
                })
        }, 100)

        setTimeout(() => {
            this.m_loading = false;
            this.m_snapPath = path;
            // console.log('loading image from ' + this.m_snapPath);
        }, 100);

    }

    _onSendEvent() {
        this.shouldToggle != this.shouldToggle;
        this.rp.sendEvent(this.contGroup.controls.m_eventValue.value, this.m_selectedStation.id, function () {
        });
        this.yp.dispatch(({type: ACTION_LIVELOG_UPDATE, payload: new LiveLogModel({event: 'send station event ' + this.contGroup.controls.m_eventValue.value})}));
    }

    @timeout()
    private saveToStore() {
        // console.log(this.contGroup.status + ' ' + JSON.stringify(this.ngmslibService.cleanCharForXml(this.contGroup.value)));
        if (this.contGroup.status != 'VALID')
            return;
        if (this.contGroup.value.m_ip.match(/\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b/))
            this.rp.setStationRecordValue(this.m_selectedStation.id, 'lan_server_ip', this.contGroup.value.m_ip);
        this.rp.setStationCampaignID(this.m_selectedStation.id, this.contGroup.value.m_campaignsControl);
        this.rp.setStationRecordValue(this.m_selectedStation.id, 'lan_server_enabled', this.contGroup.value.m_enableLan == true ? 'True' : 'False');
        this.rp.setStationRecordValue(this.m_selectedStation.id, 'lan_server_port', this.contGroup.value.m_port);
        this.rp.setStationName(this.m_selectedStation.id, this.contGroup.value.m_stationName);
        this.rp.reduxCommit();
        this.cd.markForCheck();
    }

    destroy() {
    }
}

