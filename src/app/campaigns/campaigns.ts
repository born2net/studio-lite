import {ChangeDetectionStrategy, Component, ViewChild} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {ISliderItemData, Slideritem} from "../../comps/sliderpanel/Slideritem";
import {ACTION_UISTATE_UPDATE, SideProps} from "../../store/actions/appdb.actions";
import {IUiState, IUiStateCampaign} from "../../store/store.data";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {RedPepperService} from "../../services/redpepper.service";
import {Once} from "../../decorators/once-decorator";
import {PLACEMENT_CHANNEL} from "../../interfaces/Consts";
import {IAddContents} from "../../interfaces/IAddContent";
import {CampaignTimelineBoardViewerChanelsModel} from "../../store/imsdb.interfaces_auto";
import {BlockService} from "../blocks/block-service";
import {IScreenTemplateData} from "../../interfaces/IScreenTemplate";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'campaigns',
    template: `
        <small class="debug" style="padding-right: 25px">{{me}}</small>
        <Sliderpanel>
            <Slideritem [templateRef]="a" #sliderItemCampaignManager class="page center campaignList selected" [showToButton]="false" [toDirection]="'right'" [to]="'campaignEditor'">
                <ng-template #a>
                    <campaign-manager (slideToCampaignName)="sliderItemCampaignManager.slideTo('campaignName','right')" (slideToCampaignEditor)="sliderItemCampaignManager.onNext()"></campaign-manager>
                </ng-template>
            </Slideritem>
            <Slideritem [templateRef]="b" #campaignNameSlider class="page left campaignName" [toDirection]="'right'" [fromDirection]="'left'" [from]="'campaignList'" [to]="'campaignOrientation'">
                <ng-template #b>
                    <campaign-name (onNext)="campaignNameSlider.onNext()" #campaignName></campaign-name>
                </ng-template>
            </Slideritem>
            <Slideritem [templateRef]="c" #sliderItemCampaignOrientation class="page left campaignOrientation" [showToButton]="false" [toDirection]="'right'" [fromDirection]="'left'" [from]="'campaignName'" [to]="'campaignResolution'">
                <ng-template #c>
                    <campaign-orientation #campaignOrientation (onSelection)="sliderItemCampaignOrientation.onNext()"></campaign-orientation>
                </ng-template>
            </Slideritem>
            <Slideritem [templateRef]="d" #sliderItemCampaignResolution class="page left campaignResolution" [showToButton]="false" [toDirection]="'right'" [fromDirection]="'left'" [from]="'campaignOrientation'" [to]="'campaignLayout'">
                <ng-template #d>
                    <campaign-resolution #campaignResolution (onSelection)="sliderItemCampaignResolution.onNext()"></campaign-resolution>
                </ng-template>
            </Slideritem>
            <Slideritem [templateRef]="e" #sliderItemCampaignLayout (onChange)="_onSlideChange($event)" class="page left campaignLayout" [showToButton]="false" [toDirection]="'right'" [fromDirection]="'left'" [from]="'campaignResolution'"  [to]="'campaignEditor'">
                <ng-template #e>
                    <campaign-layout [onNewCampaignMode]="true" (onSelection)="sliderItemCampaignLayout.onNext(); _createCampaign($event)"></campaign-layout>
                </ng-template>
            </Slideritem>
            <Slideritem [templateRef]="i" #sliderItemCampaignLayoutAddTimeline (onChange)="_onSlideChange($event)" class="page left campaignAddLayout" [showToButton]="false" [toDirection]="'right'" [fromDirection]="'right'" [from]="'campaignEditor'">
                <ng-template #i>
                    <campaign-layout [mouseHoverEffect]="true" [onNewCampaignMode]="false" (onSelection)="_addTimelineToCampaign($event); sliderItemCampaignLayoutAddTimeline.onPrev();"></campaign-layout>
                </ng-template>
            </Slideritem>
            <Slideritem [templateRef]="f" #sliderItemCampaignEditor (onChange)="_onSlideChange($event)" [showFromButton]="false" class="page left campaignEditor" [fromDirection]="'left'" [from]="'campaignList'">
                <ng-template #f>
                    <campaign-editor #campaignEditor
                                     (onToAddTimeline)="sliderItemCampaignLayoutAddTimeline.slideTo('campaignAddLayout','left')"
                                     (onToAddContent)="sliderAddContent.slideTo('addContent','right')"
                                     (onToScreenLayoutEditor)="_onOpenScreenLayoutEditor() ; sliderScreenLayoutEditor.slideTo('screenLayoutEditor','right')"
                                     (onGoBack)="sliderItemCampaignEditor.slideTo('campaignList','left')">
                    </campaign-editor>
                </ng-template>
            </Slideritem>
            <Slideritem [templateRef]="g" #sliderScreenLayoutEditor (onChange)="_onSlideChange($event)" [showFromButton]="false" class="page left screenLayoutEditor" [fromDirection]="'left'" [from]="'campaignList'">
                <ng-template #g>
                    <screen-layout-editor #screenLayoutEditor (onGoBack)="sliderItemCampaignEditor.slideTo('campaignEditor','left')"></screen-layout-editor>
                </ng-template>
            </Slideritem>
            <Slideritem [templateRef]="h" #sliderAddContent [showFromButton]="true" class="page left addContent" [fromDirection]="'left'" [from]="'campaignEditor'">
                <ng-template #h>
                    <add-content #addContent [placement]="m_PLACEMENT_CHANNEL" (onClosed)="_onAddedContentClosed()" (onAddContentSelected)="_onAddedContent($event) ; sliderItemCampaignEditor.slideTo('campaignEditor','left')"></add-content>
                </ng-template>
            </Slideritem>
            <Slideritem [templateRef]="j" #sliderLocation [showFromButton]="false" class="page left locationMap" [fromDirection]="'right'" [from]="'campaignEditor'">
                <ng-template #j>
                    <location-map (onClose)="_onLocationMapClosed()"></location-map>
                </ng-template>
            </Slideritem>
            
        </Sliderpanel>
    `
})

export class Campaigns extends Compbaser {

    m_PLACEMENT_CHANNEL = PLACEMENT_CHANNEL;
    private m_selected_campaign_timeline_chanel_id = -1;

    constructor(private yp: YellowPepperService, private rp: RedPepperService, private bs: BlockService) {
        super();

        this.cancelOnDestroy(
            //
            this.yp.listenCampaignTimelineBoardViewerSelected()
                .subscribe((i_campaignTimelineBoardViewerChanelsModel: CampaignTimelineBoardViewerChanelsModel) => {
                    this.m_selected_campaign_timeline_chanel_id = i_campaignTimelineBoardViewerChanelsModel.getCampaignTimelineChanelId();
                }, (e) => console.error(e))
        )

        this.cancelOnDestroy(
            //
            this.yp.listenLocationMapLoad()
                .subscribe((v) => {
                    if (v && this.sliderItemCampaignEditor){
                        this.sliderItemCampaignEditor.slideTo('locationMap','right');
                    }
            }, (e) => console.error(e))

        )

        var uiState: IUiState = {uiSideProps: SideProps.miniDashboard}
        this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    }

    @ViewChild('sliderItemCampaignEditor')
    sliderItemCampaignEditor:Slideritem;

    _onOpenScreenLayoutEditor() {
    }

    _onAddedContent(i_addContents: IAddContents) {
        this.cancelOnDestroy(
            //
            this.yp.getTotalDurationChannel(this.m_selected_campaign_timeline_chanel_id)
                .subscribe((i_totalChannelLength) => {
                    var boilerPlate = this.bs.getBlockBoilerplate(i_addContents.blockCode);
                    this._createNewChannelBlock(i_addContents, boilerPlate, i_totalChannelLength);
                }, (e) => console.error(e))
        )
    }

    _onLocationMapClosed(){
        this.sliderItemCampaignEditor.slideTo('campaignEditor','left')
        
    }
    
    _onAddedContentClosed(){
        var uiState: IUiState = {uiSideProps: SideProps.miniDashboard}
        this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    }

    /**
     Create a new block (player) on the current channel and refresh UI bindings such as properties open events.
     **/
    _createNewChannelBlock(i_addContents: IAddContents, i_boilerPlate, i_totalChannelLength) {
        this.rp.createNewChannelPlayer(this.m_selected_campaign_timeline_chanel_id, i_addContents, i_boilerPlate, i_totalChannelLength);
        this.rp.reduxCommit();
    }

    _onSlideChange(event: ISliderItemData) {
        if (event.direction == 'left' && event.to == 'campaignList') {
            var uiState: IUiState = {uiSideProps: SideProps.miniDashboard}
            return this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
        }
        // if (event.direction == 'right' && event.to == 'campaignEditor')
        //     return this._createCampaign();
    }

    @Once()
    private _addTimelineToCampaign(i_screenTemplateData: IScreenTemplateData) {
        return this.yp.getNewCampaignParmas()
            .subscribe((value: IUiStateCampaign) => {
                var campaign_board_id = this.rp.getFirstBoardIDofCampaign(value.campaignSelected);
                var board_id = this.rp.getBoardFromCampaignBoard(campaign_board_id);
                var newTemplateData = this.rp.createNewTemplate(board_id, i_screenTemplateData.screenProps);
                var board_template_id = newTemplateData['board_template_id']
                var viewers = newTemplateData['viewers'];
                var campaign_timeline_id = this.rp.createNewTimeline(value.campaignSelected);
                this.rp.setCampaignTimelineSequencerIndex(value.campaignSelected, campaign_timeline_id, 0);
                this.rp.setTimelineTotalDuration(campaign_timeline_id, '0');
                this.rp.createCampaignTimelineScheduler(value.campaignSelected, campaign_timeline_id);
                var campaign_timeline_board_template_id = this.rp.assignTemplateToTimeline(campaign_timeline_id, board_template_id, campaign_board_id);
                var channels = this.rp.createTimelineChannels(campaign_timeline_id, viewers);
                this.rp.assignViewersToTimelineChannels(campaign_timeline_board_template_id, viewers, channels);
                this.rp.reduxCommit();
            }, (e) => {
                console.error(e)
            })
    }

    @Once()
    private _createCampaign(i_screenTemplateData: IScreenTemplateData) {
        return this.yp.getNewCampaignParmas()
            .subscribe((value: IUiStateCampaign) => {
                var campaignId = this.rp.createCampaignEntire(i_screenTemplateData.screenProps, i_screenTemplateData.name, value.campaignCreateResolution);
                var uiState: IUiState = {campaign: {campaignSelected: campaignId}}
                this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
            }, (e) => {
                console.error(e)
            })
    }
}

