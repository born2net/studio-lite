import {AfterViewInit, ChangeDetectorRef, Component, Input, ViewChild} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {CampaignTimelineBoardViewerChanelsModel, CampaignTimelineChanelPlayersModel, CampaignTimelineChanelsModel, CampaignTimelinesModel} from "../../store/imsdb.interfaces_auto";
import {BlockService, IBlockData} from "../blocks/block-service";
import {Observable, Subject} from "rxjs";
import {RedPepperService} from "../../services/redpepper.service";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {Once} from "../../decorators/once-decorator";
import {List} from "immutable";
import {IUiState} from "../../store/store.data";
import {ACTION_UISTATE_UPDATE, SideProps} from "../../store/actions/appdb.actions";
import {DraggableList} from "../../comps/draggable-list/draggable-list";
import {IAddContents} from "../../interfaces/IAddContent";
import {timeout} from "../../decorators/timeout-decorator";


@Component({
    selector: 'campaign-channels',
    styles: [`
        * {
            font-size: 1.1em !important;
        }

        .dragch {
            float: right;
            padding-right: 10px;
            position: relative;
            top: 5px;
        }

        .lengthTimer {
            float: right;
            padding-right: 10px;
        }

        .listItems {
            cursor: pointer;
        }

        .listItems a i {
            display: inline;
            font-size: 40px;
            padding-right: 20px;
        }

        .listItems a span {
            display: inline;
            font-size: 1.5em;
            position: relative;
            top: -12px;
        }
    `],
    template: `
        <small class="debug">{{me}}</small>
        <!-- todo: need to investigate as performance sometime lag when using the matchBodyHeight directive here -->
        <div matchBodyHeight="540" id="campaignViewList" style="padding-right: 5px; overflow-y: auto">
            <draggable-list (onItemSelected)="_onItemSelected($event)" [customTemplate]="customTemplate" (onDragComplete)="_onDragComplete($event)" [items]="m_blockList"></draggable-list>
            <ng-template #customTemplate let-item>
                <a href="#" [attr.data-block_id]="item.blockID">
                    <i class="fa {{item.blockFontAwesome}}"></i>
                    <span>{{item.scene?.name || item.resource?.name || item.blockName}}</span>
                    <i class="dragch fa fa-arrows-v"></i>
                    <span class="lengthTimer hidden-xs"> 
                    {{item.duration | FormatSecondsPipe}}
                </span>
                </a>
            </ng-template>
        </div>
    `
})

export class CampaignChannels extends Compbaser implements AfterViewInit {

    private selected_campaign_timeline_id: number = -1;
    private selected_campaign_timeline_chanel_id: number = -1;
    private durationChanged$ = new Subject();
    m_blockList: List<IBlockData> = List([]);

    constructor(private yp: YellowPepperService, private rp: RedPepperService, private bs: BlockService, private cd:ChangeDetectorRef) {
        super();
    }

    @ViewChild(DraggableList)
    draggableList: DraggableList;

    ngAfterViewInit() {
        this.listenChannelSelected();
        this.preventRedirect(true);

    }

    @timeout()
    private listenChannelSelected() {
        this.cd.markForCheck();
        this.cancelOnDestroy(
            this.yp.listenCampaignTimelineBoardViewerSelected(true)
                .skip(1)
                .distinctUntilChanged()
                .subscribe(() => {
                    this.draggableList.deselect();
                })
        )

        this.cancelOnDestroy(
            this.yp.listenCampaignTimelineBoardViewerSelected(true)
                .combineLatest(
                    this.durationChanged$,
                    this.yp.ngrxStore.select(store => store.msDatabase.sdk.table_campaign_timeline_chanel_players)
                )
                .filter((v) => {
                    var campaignTimelineBoardViewerChanelsModel: CampaignTimelineBoardViewerChanelsModel = v[0];
                    var totalDuration = v[1];
                    var campaignTimelineChanelPlayersModel = v[2];
                    if (campaignTimelineBoardViewerChanelsModel == null) this.m_blockList = List([]);
                    return campaignTimelineBoardViewerChanelsModel != null;

                })
                .withLatestFrom(this.yp.listenTimelineSelected(), (i_channelModel: CampaignTimelineBoardViewerChanelsModel, i_timelinesModel: CampaignTimelinesModel) => {
                    this.selected_campaign_timeline_chanel_id = i_channelModel[0].getCampaignTimelineChanelId();
                    this.selected_campaign_timeline_id = i_timelinesModel.getCampaignTimelineId();
                    return i_channelModel[0].getCampaignTimelineBoardViewerChanelId()

                })
                .mergeMap(i_boardViewerChanelId => {
                    return this.yp.getChannelFromCampaignTimelineBoardViewer(i_boardViewerChanelId)

                })
                .mergeMap((i_campaignTimelineChanelsModel: CampaignTimelineChanelsModel) => {
                    return this.yp.getChannelBlocks(i_campaignTimelineChanelsModel.getCampaignTimelineChanelId())

                })
                .mergeMap(blockIds => {
                    if (blockIds.length == 0)
                        return Observable.of([])

                    return Observable.from(blockIds)
                        .map((blockId) => this.bs.getBlockData(blockId))
                        .combineAll()

                })
                .subscribe((i_blockList: Array<IBlockData>) => {
                    this.m_blockList = List(this._sortBlock(i_blockList));
                    // this.draggableList.createSortable()
                }, e => console.error(e))
        )

        this.cancelOnDestroy(
            this.yp.listenTimelineDurationChanged()
                .subscribe((totalDuration) => {
                    this.durationChanged$.next(totalDuration);
                })
        )
    }

    _onItemSelected(event) {
        var blockData: IBlockData = event.item;
        var uiState: IUiState = {
            campaign: {
                blockChannelSelected: blockData.blockID
            },
            uiSideProps: SideProps.channelBlock
        }
        this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    }

    _onDragComplete(i_blocks) {
        this._reOrderChannelBlocks(i_blocks);
    }

    private _sortBlock(i_blockList: Array<IBlockData>): Array<IBlockData> {

        var sorted = i_blockList.sort((a, b) => {
            if (a.offset < b.offset)
                return -1;
            if (a.offset > b.offset)
                return 1;
            if (a.offset === b.offset)
                return 0;
        })
        return sorted;
    }

    /**
     Update the blocks offset times according to current order of LI elements and reorder accordingly in msdb.
     @method _reOrderChannelBlocks
     @return none
     **/
    _reOrderChannelBlocks(i_blocks) {
        var self = this
        var blocks = i_blocks;
        var playerOffsetTime: any = 0;
        jQuery(blocks).each(function (i) {
            var block_id = jQuery('[data-block_id]', this).data('block_id');
            self._getBlockRecord(block_id, (i_campaignTimelineChanelPlayersModel: CampaignTimelineChanelPlayersModel) => {
                var playerDuration = i_campaignTimelineChanelPlayersModel.getPlayerDuration();
                self.rp.setBlockRecord(block_id, 'player_offset_time', playerOffsetTime);
                // console.log('player ' + block_id + ' offset ' + playerOffsetTime + ' playerDuration ' + playerDuration);
                playerOffsetTime = parseFloat(playerOffsetTime) + parseFloat(playerDuration);
            })
        });
        self.rp.updateTotalTimelineDuration(this.selected_campaign_timeline_id);
        self.rp.reduxCommit();
    }

    @Once()
    private _getBlockRecord(i_blockId, i_cb: (i_blockId: CampaignTimelineChanelPlayersModel) => void) {
        return this.yp.getChannelBlockRecord(i_blockId)
            .subscribe((block: CampaignTimelineChanelPlayersModel) => {
                i_cb(block);
            }, (e) => console.error(e));
    }


    ngOnInit() {
    }

    destroy() {
        this.selected_campaign_timeline_chanel_id = -1;
        this.selected_campaign_timeline_id = -1;
    }
}


// var campaign_timeline_chanel_player_id = jData['campaign_timeline_chanel_player_id'];
// var campaign_timeline_chanel_player_data = jData['campaign_timeline_chanel_player_data'];
// var timeline = BB.comBroker.getService(BB.SERVICES.CAMPAIGN_VIEW).getTimelineInstance(self.selected_campaign_timeline_id);
// var channel = timeline.getChannelInstance(self.selected_campaign_timeline_chanel_id);
// channel.createChannelBlock(campaign_timeline_chanel_player_id, campaign_timeline_chanel_player_data);
//
// var campaign_timeline_board_viewer_id = self.selected_campaign_timeline_board_viewer_id;
// var campaign_timeline_id = self.selected_campaign_timeline_id;
// var campaign_timeline_chanel_id = self.selected_campaign_timeline_chanel_id;
//
// // self._resetChannel();
// $(Elements.SORTABLE).empty();
// self._loadChannelBlocks(campaign_timeline_id, campaign_timeline_chanel_id);
// self._listenBlockSelected();
// // self._deselectBlocksFromChannel();
// self._selectLastBlockOnChannel();
// self._reOrderChannelBlocks();
// var blocksSorted = {};
// _.forEach(i_blockList, (i_block: IBlockData) => {
//     var player_data = i_block.campaignTimelineChanelPlayersModelExt.getPlayerData();
//     var domPlayerData = $.parseXML(player_data);
//     var sceneHandle = jQuery(domPlayerData).find('Player').attr('player');
//     // workaround to remove scenes listed inside table campaign_timeline_chanel_players
//     if (sceneHandle == '3510')
//         return;
//     var a = i_block.campaignTimelineChanelPlayersModelExt.getKey('player_offset_time');
//     var offsetTime = i_block.campaignTimelineChanelPlayersModelExt.getPlayerOffsetTimeInt();
//     console.log(i_block.blockName + ' duration: ' + i_block.length + ' offset: ' + offsetTime);
//     blocksSorted[offsetTime] = i_block;
// });
// return _.values(blocksSorted) as Array<IBlockData>;