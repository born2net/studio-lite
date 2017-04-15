import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {ACTION_UISTATE_UPDATE} from "../../store/actions/appdb.actions";
import {IUiState} from "../../store/store.data";
import {RedPepperService} from "../../services/redpepper.service";
import {CampaignTimelinesModel} from "../../store/imsdb.interfaces_auto";
import {ISceneData} from "../blocks/block-service";
import {CampaignsModelExt} from "../../store/model/msdb-models-extended";
import {MainAppShowStateEnum} from "../app-component";

export enum PreviewModeEnum {
    NONE,
    SCENE,
    CAMPAIGN,
    TIMELINE
}

@Component({
    selector: 'live-preview',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
        .btn-group {
            position: relative;
            top: -25px;
            left: 20px;
        }

        #iFramePreview {
            width: 100%;
            height: 100%;
            float: left;
            text-align: center;
            background-color: #222222;
        }

        #iFrameEmbedded {
            width: 1920px;
            height: 1080px;
            margin: 0 auto;
        }
    `],
    template: `
        <div class="btn-group">
            <button (click)="_onExit()" type="button" title="back" class="openPropsButton btn btn-default btn-lg">
                <span class="fa fa-power-off"></span>
            </button>
        </div>
        <div id="iFramePreview">
            <IFRAME id="iFrameEmbedded"></IFRAME>
        </div>
    `,
})
export class LivePreview extends Compbaser implements AfterViewInit {

    constructor(private cd:ChangeDetectorRef, private yp: YellowPepperService, private rp: RedPepperService, private el: ElementRef) {
        super();
        cd.detach();
    }

    ngAfterViewInit() {
        if (!this.checkFlash())
            return;
        this.yp.getPreviewMode()
            .mergeMap((i_previewMode: PreviewModeEnum) => {
                switch (i_previewMode) {
                    case PreviewModeEnum.SCENE: {
                        return this.yp.listenSceneSelected()
                            .map((i_sceneData: ISceneData) => {
                                return this.launchScene(i_sceneData.scene_id);
                            })
                    }
                    case PreviewModeEnum.TIMELINE: {
                        return this.yp.listenTimelineSelected()
                            .take(1)
                            .map((i_campaignTimelinesModel: CampaignTimelinesModel) => {
                                return this.launchTimeline(i_campaignTimelinesModel.getCampaignId(), i_campaignTimelinesModel.getCampaignTimelineId());
                            })
                    }
                    case PreviewModeEnum.CAMPAIGN: {
                        return this.yp.listenCampaignSelected()
                            .take(1)
                            .map((i_campaignsModelExt: CampaignsModelExt) => {
                                return this.launchCampaign(i_campaignsModelExt.getCampaignId());
                            })
                    }
                }
            }).subscribe((v) => {
            console.log(v);
        }, (e) => console.error(e))
    }

    _onExit() {
        let uiState: IUiState = {mainAppState: MainAppShowStateEnum.NORMAL, previewMode: PreviewModeEnum.NONE}
        this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    }

    checkFlash() {
        if (!FlashDetect.installed || !FlashDetect.versionAtLeast(13)) {
            bootbox.alert({
                message: 'Flash is not enabled, in Chrome go to the URL: chrome://settings/content to enable'
            });
            return false;
        } else {
            return true;
        }
    }

    /**
     Listen to live preview launch
     @method launch
     **/
    launchScene(i_sceneId) {
        var url = this.rp.livePreviewScene(i_sceneId, 0);
        $('#iFrameEmbedded').attr('src', url);
    }

    /**
     Listen to live preview launch
     @method launch  i_campaignTimelineNativeID
     **/
    launchTimeline(i_campaignID, i_campaignTimelineID) {
        var url = this.rp.livePreviewTimeline(i_campaignID, i_campaignTimelineID, 0);
        $('#iFrameEmbedded').attr('src', url);
    }

    /**
     Listen to live view launch
     @method launch
     **/
    launchCampaign(i_campaignID) {
        var url = this.rp.livePreviewCampaign(i_campaignID, 0);
        $('#iFrameEmbedded').attr('src', url);
    }

    ngOnInit() {
    }

    destroy() {
    }
}
