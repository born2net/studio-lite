/**
 Github repo: https://github.com/AlexWD/ds-timeline-widget
 **/

import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {CampaignTimelineBoardViewerChanelsModel, CampaignTimelineChanelsModel, CampaignTimelinesModel} from "../../store/imsdb.interfaces_auto";
import {RedPepperService} from "../../services/redpepper.service";
import {Observable} from "rxjs/Observable";
import {BlockService, IBlockData} from "../blocks/block-service";
import {IUiState} from "../../store/store.data";
import {ACTION_UISTATE_UPDATE, SideProps} from "../../store/actions/appdb.actions";
import {TimelineComponent} from "./timeline/timeline.component";
import {EventManager} from "@angular/platform-browser";
import {Lib} from "../../Lib";
import * as _ from "lodash";
import {List, Map} from "immutable";

interface IChannelCollection {
    blocks: Array<number>;
    channelId: number;
}

interface IOutputs {
    id: number;
    name: string;
    color: string;
    selected: boolean;
}

interface IChannels {
    id: number;
    viewerId: number;
    name: string;
    type: 'common' | 'normal';
    color: string;
    selected: boolean;
}

interface IItem {
    id: number;
    type: 'output' | 'channel';
    resource: Object;
    title: string;
    start: number;
    duration: number;
    channel: number;
    selected: boolean;
}

export interface ITimelineState {
    zoom: number;
    switch: boolean;
    duration: number;
    channels: Array<IChannels>;
    outputs: Array<IOutputs>;
    items: Array<IItem>;
}

@Component({
    selector: 'campaign-story-timeline',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:keyup)': 'handleKeyboardEvents($event,"up")',
        '(document:keydown)': 'handleKeyboardEvents($event,"down")',
        '(window:mouseup)': 'handleMouseEvents($event,"up")',
        '(window:mousedown)': 'handleMouseEvents($event,"down")'
    },
    template: `
        <small class="debug">{{me}}</small>
        <div matchBodyHeight="350" style="overflow: scroll">
            <app-timeline *ngIf="state && state.get('channels').length > 0"
                          [resources]="resources"
                          [state]="state"
                          (channelClicked)="onChannelClicked($event)"
                          (closedGaps)="itemsChanged($event)"
                          (alignedRight)="itemsChanged($event)"
                          (alignedLeft)="itemsChanged($event)"
                          (itemsClicked)="itemsClicked($event)"
                          (itemsResized)="itemsChanged($event)"
                          (itemAdded)="itemAdded($event)"
                          (channelAdded)="channelAdded($event)"
                          (resizedToLargest)="itemsChanged($event)"
                          (itemsMoved)="itemsMoved($event)">
            </app-timeline>
        </div>
    `
})
export class CampaignStoryTimeline extends Compbaser implements AfterViewInit {

    m_campaignTimelinesModels: List<CampaignTimelinesModel>;
    campaignTimelinesModel: CampaignTimelinesModel;
    m_contPressed: 'down' | 'up' = 'up';
    m_selectedItems: Array<any> = [];
    m_zoom = 1;

    // @Output()
    // stateChanged:EventEmitter<ITimelineState> = new EventEmitter<ITimelineState>();

    resources = {
        items: [
            {
                id: 1,
                name: 'logo',
                type: 'png',
                time: '0',
                size: '110KB',
                src: 'assets/img/doc-13-128.png'
            },
            {
                id: 2,
                name: 'samplesvg',
                type: 'svg',
                time: '0',
                size: '110KB',
                src: 'assets/img/svgexample.svg'
            }
        ],
        outputs: [
            {
                id: 1,
                name: 'logo',
                type: 'png',
                time: '0',
                size: '110KB',
                src: 'assets/img/doc-13-128.png'
            },
            {
                id: 2,
                name: 'samplesvg',
                type: 'svg',
                time: '0',
                size: '110KB',
                src: 'assets/img/svgexample.svg'
            }
        ]
    };
    state: Map<any, any>;
    // = Map({
    //     zoom: 1,
    //     duration: -1,
    //     channels: [],
    //     outputs: [],
    //     items: []
    // });

    stateTemp: ITimelineState = {
        zoom: 1,
        switch: false,
        duration: -1,
        channels: [],
        outputs: [],
        items: []
    }


    // id = 0

    constructor(private yp: YellowPepperService, private rp: RedPepperService, private cd: ChangeDetectorRef, private bs: BlockService, private eventManager: EventManager) {
        super();

        this.cancelOnDestroy(
            this.yp.listenTimelineSelected()
                .map((i_campaignTimelinesModel: CampaignTimelinesModel) => {
                    this.campaignTimelinesModel = i_campaignTimelinesModel;
                    console.log('selected timeline ' + i_campaignTimelinesModel.getCampaignTimelineId());
                    return i_campaignTimelinesModel;
                })
                .mergeMap((i_campaignTimelinesModel: CampaignTimelinesModel) => {
                    return this.yp.listenChannelsOfTimeline(i_campaignTimelinesModel.getCampaignTimelineId())
                })
                .do((i_channels: List<CampaignTimelineChanelsModel>) => {
                    return this.updateStateChannels(i_channels);
                })
                .combineLatest(
                    this.yp.listenCampaignTimelineBoardViewerSelected(true),
                    this.yp.listenSelectedTimelineChanged(),
                    this.yp.ngrxStore.select(store => store.msDatabase.sdk.table_campaign_timeline_chanel_players))
                .map((i_data): List<CampaignTimelineChanelsModel> => {
                    var i_campaignTimelinesModel = i_data[2];
                    this.updateStateDuration(i_campaignTimelinesModel.getTimelineDuration());
                    var i_campaignTimelineBoardViewerChanelsModel: CampaignTimelineBoardViewerChanelsModel = i_data["1"]
                    if (i_campaignTimelineBoardViewerChanelsModel)
                        this.updateStateChannelSelection(i_campaignTimelineBoardViewerChanelsModel.getCampaignTimelineChanelId());
                    return i_data[0];
                })
                .mergeMap((i_campaignTimelineChanelModels: List<CampaignTimelineChanelsModel>) => {
                    var channelIds = [];
                    i_campaignTimelineChanelModels.forEach((i_campaignTimelineChanelModel: CampaignTimelineChanelsModel) => {
                        channelIds.push(i_campaignTimelineChanelModel.getCampaignTimelineChanelId());
                    })
                    return Observable.from(channelIds)
                        .map((channelId) => {
                            return this.yp.getChannelBlocks(channelId)
                                .map((blocks) => {
                                    if (blocks.length > 0) {
                                        return {channelId, blocks};
                                    } else {
                                        return {channelId, blocks: [-1]};
                                    }
                                })
                        })
                        .combineAll()
                })
                .mergeMap((i_channelArray: Array<IChannelCollection>) => {
                    return Observable.from(i_channelArray)
                        .map((i_channelCollection: IChannelCollection) => {
                            return Observable.from(i_channelCollection.blocks)
                                .map((i_block) => {
                                    if (i_block == -1) return Observable.of(-1);
                                    return this.bs.getBlockData(i_block).map((block) => {
                                        return {block, channelId: i_channelCollection.channelId}
                                    })
                                })
                                .combineAll()
                        })
                        .combineAll()
                })
                .withLatestFrom(
                    this.yp.ngrxStore.select(store => store.appDb.uiState.campaign.blockChannelSelected),
                    (i_channels, i_blockIdSelected) => ({i_channels, i_blockIdSelected})
                )
                .subscribe(({i_channels, i_blockIdSelected}) => {
                    this.updateStateBlocks(i_channels, i_blockIdSelected);
                    this.applyState();
                    this.cd.markForCheck();
                }, e => console.error(e))
        );
    }

    @ViewChild(TimelineComponent)
    timelineComponent: TimelineComponent;

    // @Input()
    // set duration(i_duration:number) {
    //     this.stateTemp.duration = i_duration;
    //     this.applyState();
    // }

    @Input()
    set zoom(i_zoom: number) {
        this.stateTemp.zoom = i_zoom;
        if (!this.timelineComponent) return;
        this.applyState();
        this.cd.detectChanges();
        this.timelineComponent.changeZoom(null);
    }

    @Input()
    set switchMode(i_mode: boolean) {
        this.stateTemp.switch = i_mode;
        this.applyState();
    }

    private updateStateChannelSelection(i_channelSelectedId: number) {
        this.stateTemp.channels.forEach((ch, index) => {
            if (ch.id == i_channelSelectedId) {
                ch.selected = true;
            } else {
                ch.selected = false;
            }
            this.stateTemp.channels[index] = ch;
        })
    }

    private updateStateDuration(i_duration: number) {
        console.log('CampaignStoryTimeline: upd duration ' + i_duration);
        this.stateTemp.duration = i_duration;
    }

    private updateStateChannels(i_channels: List<CampaignTimelineChanelsModel>) {
        var channels = []
        i_channels.forEach((i_channel: CampaignTimelineChanelsModel) => {
            var channel: IChannels = {
                id: i_channel.getCampaignTimelineChanelId(),
                viewerId: this.rp.getAssignedViewerIdFromChannelId(i_channel.getCampaignTimelineChanelId()),
                name: i_channel.getChanelName(),
                color: '#' + Lib.DecimalToHex(i_channel.getChanelColor()),
                type: 'normal',
                selected: false
            }
            channels.push(channel);
        });
        this.stateTemp.channels = channels;
    }

    private updateStateBlocks(i_channels, i_blockIdSelected) {
        var items = []
        _.forEach(i_channels, (i_channel) => {
            var channelId = i_channel["0"].channelId;
            var blockList = this._sortBlock(i_channel);
            blockList.forEach((i_block) => {
                if (i_block == -1) return;
                var name;
                if (i_block.block.scene) {
                    name = i_block.block.scene.name;
                } else if (i_block.block.resource) {
                    name = i_block.block.resource.name;
                } else {
                    name = i_block.block.blockName;
                }
                var block: IBlockData = i_block.block
                var item: IItem = {
                    id: block.blockID,
                    type: 'channel',
                    channel: channelId,
                    duration: block.duration,
                    selected: i_blockIdSelected == block.blockID,
                    title: name,
                    start: block.offset,
                    // uncomment for svg or png support
                    // resource: {
                    //     type: 'svg',
                    //     src: "assets/sample3.svg"
                    // }
                    resource: {
                        type: 'fa',
                        src: i_block.block.blockFontAwesome
                    }
                }
                items.push(item);
            });
            this.stateTemp.items = items;

        })

    }

    private applyState() {
        // if (this.stateTemp.duration == -1)
        //     return;
        if (!this.state)
            return this.state = Map(this.stateTemp);
        const currentState = this.state.toJS();
        var equal = _.isEqual(currentState, this.stateTemp);
        if (equal) return;
        this.state = Map(this.stateTemp);
        // this.stateChanged.emit(currentState);
    }

    private _sortBlock(i_blockList) {
        var sorted = i_blockList.sort((a, b) => {
            if (a.block.offset < b.block.offset)
                return -1;
            if (a.block.offset > b.block.offset)
                return 1;
            if (a.block.offset === b.block.offset)
                return 0;
        })
        return sorted;
    }

    public closedGaps(){
        this.timelineComponent.closeGaps();
    }

    public resizeToLargest(){
        this.timelineComponent.resizeToLargest();
    }

    public alignLeft(){
        this.timelineComponent.alignLeft();
    }

    public alignRight(){
        this.timelineComponent.alignRight();
    }

    remove(id) {
        // let index = this.items.findIndex(item => item.id === id)
        // this.items.splice(index, 1)
    }

    reset() {
        // this.items = []
    }

    add() {
        // this.items.unshift({id: this.id++, name: 'item'})
    }

    itemsMoved(event) {
        event.forEach((item) => {
            // console.log("Item moved", item);
            this.rp.setBlockTimelineChannelBlockNewPosition(item.channel, item.id, "player_offset_time", item.start);

        })
        this.rp.reduxCommit();
    }

    channelAdded(event) {
        // console.log("Channel added", event);
    }

    onChannelClicked(event) {
        var uiState: IUiState = {
            campaign: {
                campaignTimelineChannelSelected: event.id,
                campaignTimelineBoardViewerSelected: event.id
            }
        }
        this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    }

    handleMouseEvents(event: KeyboardEvent, direction) {
        // con(event + ' ' + direction);
    }

    handleKeyboardEvents(event: KeyboardEvent, direction) {
        var key = event.which || event.keyCode;
        if (key != 17) return;
        this.m_contPressed = direction;
        return true;
    }

    itemsClicked(event) {
        // con('Total items clicks ' + event.length);
        if (this.m_contPressed == 'down' || event.length == 0) return;
        const item = event[event.length - 1];
        var uiState: IUiState = {
            campaign: {
                campaignTimelineBoardViewerSelected: item.channel,
                campaignTimelineChannelSelected: item.channel,
                blockChannelSelected: item.id
            },
            uiSideProps: SideProps.channelBlock
        }
        this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    }

    itemsChanged(event) {
        event.forEach((item) => {
            this.rp.setBlockTimelineChannelBlockNewPosition(item.channel, item.id, "player_offset_time", Math.round(item.start));
            this.rp.setBlockTimelineChannelBlockNewPosition(item.channel, item.id, "player_duration", Math.round(item.duration));
        })
        this.rp.reduxCommit();
    }

    itemAdded(event) {
        // console.log("Item Added", event);
    }

    ngAfterViewInit() {


    }

    ngOnInit() {
    }

    destroy() {
    }
}