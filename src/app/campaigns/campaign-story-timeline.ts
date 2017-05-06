import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Output} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {CampaignTimelineBoardViewerChanelsModel, CampaignTimelineChanelsModel, CampaignTimelinesModel} from "../../store/imsdb.interfaces_auto";
import {RedPepperService} from "../../services/redpepper.service";
import {Observable} from "rxjs/Observable";
import {BlockService, IBlockData} from "../blocks/block-service";
import * as _ from 'lodash';
import {Map, List} from 'immutable';
import {IUiState} from "../../store/store.data";
import {ACTION_UISTATE_UPDATE} from "../../store/actions/appdb.actions";


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
    resource: string;
    title: string;
    start: number;
    duration: number;
    channel: number;
    selected: boolean;
}

interface ITimelineState {
    zoom: number;
    duration: number;
    channels: Array<IChannels>;
    outputs: Array<IOutputs>;
    items: Array<IItem>;
}

@Component({
    selector: 'campaign-story-timeline',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>
        <app-timeline [resources]="resources"
                      [state]="state"
                      (channelClicked)="onChannelClicked($event)"                      
                      (closedGaps)="onCloseGaps($event)"
                      (itemAdded)="itemAdded($event)"
                      (channelAdded)="channelAdded($event)"
                      (itemMoved)="itemMoved($event)"
        ></app-timeline>
    `,
})
export class CampaignStoryTimeline extends Compbaser implements AfterViewInit {

    m_campaignTimelinesModels: List<CampaignTimelinesModel>;
    campaignTimelinesModel: CampaignTimelinesModel;

    // campaignModel: CampaignsModelExt;
    // channelModel: CampaignTimelineChanelsModel;
    // m_campaignTimelineChanelPlayersModel: CampaignTimelineChanelPlayersModelExt;
    // selected_campaign_timeline_id: number = -1;
    // selected_campaign_timeline_chanel_id: number = -1;
    // m_blockList: List<IBlockData> = List([]);

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
    state: Map<any, any> = Map({
        zoom: 1,
        duration: 500,
        channels: [],
        outputs: [],
        items: []
    });
    // state = {
    //     zoom: 1,
    //     duration: 3600,
    //     channels: [
    //         {
    //             id: 1,
    //             viewerId: -1,
    //             name: 'CH0',
    //             type: 'normal',
    //             color: '#0000FF',
    //             selected: false,
    //         },
    //         {
    //             id: 2,
    //             viewerId: -1,
    //             name: 'CH1',
    //             type: 'normal',
    //             color: '#e9ff71',
    //             selected: false
    //         },
    //         {
    //             id: 3,
    //             viewerId: -1,
    //             name: 'CH2',
    //             color: '#ff0014',
    //             type: 'common',
    //             selected: false
    //         },
    //     ],
    //     outputs: [
    //         {
    //             id: 1,
    //             name: "Output",
    //             color: "#000",
    //             selected: false
    //         }
    //     ],
    //     items: [
    //         {
    //             id: 1,
    //             type: 'channel',
    //             resource: "assets/sample1.png",
    //             title: 'Logo_splash',
    //             start: 0,
    //             duration: 60,
    //             channel: 7,
    //             selected: false
    //         },
    //         {
    //             id: 2,
    //             type: 'channel',
    //             resource: "assets/sample3.svg",
    //             title: '350x350',
    //             start: 300,
    //             duration: 60,
    //             channel: 8,
    //             selected: false
    //         }
    //     ]
    // }
    id = 0
    // items = []

    constructor(private yp: YellowPepperService, private rp: RedPepperService, private cd: ChangeDetectorRef, private bs: BlockService) {
        super();
        this.cancelOnDestroy(
            this.yp.listenTimelineSelected()
                .map((i_campaignTimelinesModel: CampaignTimelinesModel) => {
                    this.campaignTimelinesModel = i_campaignTimelinesModel;
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
                    this.yp.listenTimelineDurationChanged(true),
                    this.yp.ngrxStore.select(store => store.msDatabase.sdk.table_campaign_timeline_chanel_players))
                .map((i_data): List<CampaignTimelineChanelsModel> => {
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
                .subscribe((i_channels) => {
                    this.updateStateBlocks(i_channels);
                    this.cd.markForCheck();
                }, e => console.error(e))
        );

        // this.cancelOnDestroy(
        //     this.yp.listenCampaignTimelineBoardViewerSelected(true)
        //         .skip(1)
        //         .distinctUntilChanged()
        //         .subscribe((v) => {
        //             console.log(v);
        //         })
        // )

    }

    private updateStateChannelSelection(i_channelSelectedId: number) {
        var channels = this.state.get('channels');
        channels.forEach((ch,index) => {
            if (ch.id == i_channelSelectedId) {
                ch.selected = true;
            } else {
                ch.selected = false;
            }
            channels[index] = ch;
        })
        this.state = this.state.set('channels',channels);
    }

    private updateStateChannels(i_channels: List<CampaignTimelineChanelsModel>) {
        var channels = []
        i_channels.forEach((i_channel: CampaignTimelineChanelsModel) => {
            var channel: IChannels = {
                id: i_channel.getCampaignTimelineChanelId(),
                viewerId: this.rp.getAssignedViewerIdFromChannelId(i_channel.getCampaignTimelineChanelId()),
                name: i_channel.getChanelName(),
                color: i_channel.getChanelColor(),
                type: 'normal',
                selected: false
            }
            channels.push(channel);
        });
        this.state = this.state.set('channels', channels);
    }

    private updateStateBlocks(i_channels) {
        var self = this;
        var items = []
        _.forEach(i_channels, (i_channel) => {
            var channelId = i_channel["0"].channelId;
            var blockList = this._sortBlock(i_channel);
            blockList.forEach((i_block) => {
                if (i_block == -1) return;
                var block: IBlockData = i_block.block
                var item: IItem = {
                    id: block.blockID,
                    type: 'channel',
                    channel: channelId,
                    duration: block.duration,
                    selected: false,
                    title: block.blockName,
                    start: block.offset,
                    resource: "assets/sample3.svg",
                }
                items.push(item);
            });
            self.state = this.state.set('items', items);

        })
        // var s = this.state.toJS();
        // console.log(s);
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

    itemMoved(state) {
        console.log("Item moved", state);
    }

    channelAdded(state) {
        console.log("Channel added", state);
    }

    onChannelClicked(state){
        var uiState: IUiState = {
            campaign: {
                campaignTimelineChannelSelected: state.id,
                campaignTimelineBoardViewerSelected: state.id
            }
        }
        this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    }

    onCloseGaps(state){
        console.log(state);
    }

    itemAdded(state) {
        console.log("Item Added", state);
    }

    ngAfterViewInit() {


    }

    ngOnInit() {
    }

    destroy() {
    }
}


// this.cancelOnDestroy(
//     //
//     this.yp.listenCampaignSelected()
//         .switchMap((i_campaignsModelExt: CampaignsModelExt) => {
//             this.campaignModel = i_campaignsModelExt;
//             return this.yp.listenCampaignTimelines(i_campaignsModelExt.getCampaignId())
//         })
//         .subscribe((i_campaignTimelinesModel: List<CampaignTimelinesModel>) => {
//             this.m_campaignTimelinesModels = i_campaignTimelinesModel;
//         }, (e) => console.error(e))
// );
//
// this.cancelOnDestroy(
//     this.yp.listenTimelineSelected()
//         .map((i_campaignTimelinesModel: CampaignTimelinesModel) => {
//             this.campaignTimelinesModel = i_campaignTimelinesModel;
//             return i_campaignTimelinesModel;
//         })
//         .mergeMap((i_campaignTimelinesModel: CampaignTimelinesModel) => {
//             return this.yp.listenChannelsOfTimeline(i_campaignTimelinesModel.getCampaignTimelineId())
//         })
//         .subscribe((i_channels: List<CampaignTimelineChanelsModel>) => {
//             this.updateStateChannels(i_channels);
//         }, (e) => console.error(e))
// );
//
// this.cancelOnDestroy(
//     this.yp.listenCampaignTimelineBoardViewerSelected(true)
//         .combineLatest(
//             this.yp.listenTimelineDurationChanged(true),
//             this.yp.ngrxStore.select(store => store.msDatabase.sdk.table_campaign_timeline_chanel_players)
//         )
//         .filter((v) => {
//             var campaignTimelineBoardViewerChanelsModel: CampaignTimelineBoardViewerChanelsModel = v[0];
//             var totalDuration = v[1];
//             var campaignTimelineChanelPlayersModel = v[2];
//             if (campaignTimelineBoardViewerChanelsModel == null) this.m_blockList = List([]);
//             return campaignTimelineBoardViewerChanelsModel != null;
//
//         })
//         .withLatestFrom(this.yp.listenTimelineSelected(), (i_channelModel: CampaignTimelineBoardViewerChanelsModel, i_campaignTimelinesModel: CampaignTimelinesModel) => {
//             this.selected_campaign_timeline_chanel_id = i_channelModel[0].getCampaignTimelineChanelId();
//             this.selected_campaign_timeline_id = i_campaignTimelinesModel.getCampaignTimelineId();
//
//             // this.yp.listenChannelsOfTimeline(i_campaignTimelinesModel.getCampaignTimelineId())
//
//             return i_channelModel[0].getCampaignTimelineBoardViewerChanelId()
//
//         })
//         .mergeMap(i_boardViewerChanelId => {
//             return this.yp.getChannelFromCampaignTimelineBoardViewer(i_boardViewerChanelId)
//
//         })
//         .mergeMap((i_campaignTimelineChanelModel: CampaignTimelineChanelsModel) => {
//             return this.yp.getChannelBlocks(i_campaignTimelineChanelModel.getCampaignTimelineChanelId())
//
//         })
//         .mergeMap(blockIds => {
//             if (blockIds.length == 0)
//                 return Observable.of([])
//
//             return Observable.from(blockIds)
//                 .map((blockId) => this.bs.getBlockData(blockId))
//                 .combineAll()
//
//         })
//         .subscribe((i_blockList: Array<IBlockData>) => {
//             this.m_blockList = List(this._sortBlock(i_blockList));
//             // this.draggableList.createSortable()
//         }, e => console.error(e))
// )
//
// this.cancelOnDestroy(
//     this.yp.listenChannelSelected(true)
//         .subscribe((channel: CampaignTimelineChanelsModel) => {
//             this.channelModel = channel;
//         }, (e) => {
//             console.error(e)
//         })
// );
// this.cancelOnDestroy(
//     this.yp.listenBlockChannelSelected(true)
//         .subscribe((i_campaignTimelineChanelPlayersModel: CampaignTimelineChanelPlayersModelExt) => {
//             this.m_campaignTimelineChanelPlayersModel = i_campaignTimelineChanelPlayersModel;
//         }, (e) => console.error(e))
// )

// i_channelIds.forEach((channelId) => {
//     var channel:IChannels = {
//
//         viewerId:  this.rp.getAssignedViewerIdFromChannelId(channelId)
//     }
// })