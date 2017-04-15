import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren} from "@angular/core";
import {RedPepperService} from "../../services/redpepper.service";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {CampaignTimelineBoardViewerChanelsModel, CampaignTimelinesModel} from "../../store/imsdb.interfaces_auto";
import {ScreenTemplate} from "../../comps/screen-template/screen-template";
import {Observable, Subscriber, Subscription} from "rxjs";
import {IUiState, IUiStateCampaign} from "../../store/store.data";
import {ACTION_UISTATE_UPDATE, SideProps} from "../../store/actions/appdb.actions";
import {List} from "immutable";
import * as _ from "lodash";
import {ContextMenuService} from "ngx-contextmenu";
import {Once} from "../../decorators/once-decorator";
import {IScreenTemplateData} from "../../interfaces/IScreenTemplate";
import {Compbaser} from "ng-mslib";
// import TweenLite = gsap.TweenLite;
          
@Component({
    selector: 'sequencer',
    styles: [`
        #dragcontainer {
            padding-left: 0;
            margin-left: 0;
            vertical-align: middle;
            width: 2500px;
            overflow-y: hidden;
        }

        .dottedHR {
            height: 6px;
            width: 2500px;
            opacity: 0.6;
            position: relative;
            border-top: 12px dotted #c1c1c1;
            padding-bottom: 7px;
            top: 20px;
        }

        .draggableTimeline {
            float: left;
            margin: 10px;
            overflow-y: hidden;
        }

    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div (click)="$event.preventDefault()">
            <small class="debug">{{me}}</small>
            <h4 style="color: #a9a9a9">total timelines: {{m_campaignTimelinesModels?.size}}</h4>
            <hr class="dottedHR">
            <div id="dragcontainer">
                <screen-template #st class="draggableTimeline"
                                 *ngFor="let screenTemplate of m_screenTemplates$ | async; trackBy: trackByFn"
                                 (contextmenu)="onContextMenu($event, screenTemplate)"
                                 (click)="_onScreenTemplateSelected(screenTemplate, st)"
                                 (onDivisionDoubleClicked)="_onDivisionDoubleClicked($event)"
                                 [setTemplate]="screenTemplate">
                </screen-template>
            </div>
            <context-menu>
                <ng-template contextMenuItem let-item (execute)="_onContextClicked('load props ',$event.item)">
                    timeline properties for {{item?.name}}
                </ng-template>
                <ng-template contextMenuItem divider="true"></ng-template>
                <ng-template contextMenuItem (execute)="_onContextClicked('edit',$event.item)"><span i18n>edit layout</span></ng-template>
                <ng-template contextMenuItem (execute)="_onContextClicked('nextch',$event.item)"><span i18n>next channel</span></ng-template>
            </context-menu>
        </div>
    `
})
export class Sequencer extends Compbaser {

    m_campaignTimelinesModels: List<CampaignTimelinesModel>;
    m_screenTemplates$: Observable<any>;
    private m_draggables;
    private m_thumbsContainer;
    private target;
    private x: number;
    private m_selectedScreenTemplate: ScreenTemplate;
    private m_selectedTimelineId: number;
    private m_campaignTimelineBoardViewerSelected: number = -1;
    private m_campaignTimelineChannelSelected: number = -1;
    private m_selectedCampaignId: number = -1;

    constructor(private el: ElementRef, private yp: YellowPepperService, private pepper: RedPepperService, private contextMenuService: ContextMenuService) {
        super();
        this.m_thumbsContainer = el.nativeElement;
    }

    @ViewChildren(ScreenTemplate)
    screenTemplatesQueryList: QueryList<any>;


    trackByFn(index, item) {
        return item.campaignTimelineId;
    }

    ngAfterViewInit() {
        // auto select the timeline / division on component creation if need to
        this.cancelOnDestroy(
            this.yp.ngrxStore.select(store => store.appDb.uiState.campaign)
                .take(1)
                .subscribe((i_campaign: IUiStateCampaign) => {
                    if (i_campaign.timelineSelected != -1 && i_campaign.campaignTimelineBoardViewerSelected != -1) {
                        this.tmpScreenTemplates.forEach((i_screenTemplate) => {
                            if (i_screenTemplate.campaignTimelineId == i_campaign.timelineSelected) {
                                this.m_selectedScreenTemplate = i_screenTemplate;
                                this.m_selectedTimelineId = i_campaign.timelineSelected;
                                this.m_campaignTimelineBoardViewerSelected = i_campaign.campaignTimelineBoardViewerSelected;
                                this.m_campaignTimelineChannelSelected = i_campaign.campaignTimelineChannelSelected;
                                this.m_selectedCampaignId = i_campaign.campaignSelected;
                                i_screenTemplate.selectFrame();
                                i_screenTemplate.selectDivison(i_campaign.campaignTimelineBoardViewerSelected)
                            }
                        })
                    }
                }, (e) => console.error(e))
        )
    }

    _onContextClicked(cmd: string, screenTemplateData: IScreenTemplateData) {
        switch (cmd) {
            case 'edit': {
                this.onEditLayout.emit();
                break;
            }
            case 'nextch': {
                this.onSelectNextChannel()
                break;
            }
        }
    }

    public onContextMenu($event: MouseEvent, item: any): void {
        this.contextMenuService.show.next({
            event: $event,
            item: item,
        });
        $event.preventDefault();
        $event.stopPropagation();
    }

    @ViewChildren(ScreenTemplate) tmpScreenTemplates: QueryList<ScreenTemplate>;

    @Input()
    set setCampaignTimelinesModels(i_campaignTimelinesModels: List<CampaignTimelinesModel>) {
        if (!i_campaignTimelinesModels)
            return;
        this.m_campaignTimelinesModels = i_campaignTimelinesModels;
        this.m_selectedCampaignId = this.m_campaignTimelinesModels.first().getCampaignId();

        this._sortTimelines((sortedTimelines: Array<CampaignTimelinesModel>) => {
            this.m_screenTemplates$ = Observable.from(sortedTimelines)
                .map(i_campaignTimelinesModelsOrdered => {
                    return this._getScreenTemplate(i_campaignTimelinesModelsOrdered)
                }).combineAll();

            setTimeout(() => {
                this._createSortable('#dragcontainer');
            }, 300)

        });
    }

    @Output()
    onEditLayout: EventEmitter<any> = new EventEmitter<any>();

    @Once()
    private _sortTimelines(i_cb: (sortedTimelines: Array<CampaignTimelinesModel>) => void) {
        return Observable.from(this.m_campaignTimelinesModels.toArray())
            .switchMap((i_campaignTimelinesModel: CampaignTimelinesModel) => {
                return this.yp.getCampaignTimelineSequencerIndex(i_campaignTimelinesModel.getCampaignTimelineId())
                    .map((index) => {
                        return Observable.of({
                            index: index,
                            campaign: i_campaignTimelinesModel
                        })
                    })
            })
            .combineAll()
            .subscribe((i_orderedTimelines: any) => {
                var orderedTimelines = _.sortBy(i_orderedTimelines, [function (o) {
                    return o.index;
                }]);
                i_cb(
                    _.toArray(_.map(orderedTimelines, function (o) {
                        return o['campaign'];
                    }))
                );
            }, (e) => {
                console.error(e)
            })
    }

    _getScreenTemplate(i_campaignTimelinesModel: CampaignTimelinesModel): Observable<IScreenTemplateData> {
        return this.yp.getTemplatesOfTimeline(i_campaignTimelinesModel.getCampaignTimelineId())
            .map((campaignTimelineBoardTemplateIds: Array<number>) => {
                // for now return zero as we don't support multiple divisions per single timeline, yet
                return campaignTimelineBoardTemplateIds[0];
            }).switchMap((campaignTimelineBoardTemplateId) => {
                return this.yp.getTemplateViewersScreenProps(
                    i_campaignTimelinesModel.getCampaignTimelineId(), campaignTimelineBoardTemplateId, i_campaignTimelinesModel.getTimelineName()
                );
            })
    }

    _onScreenTemplateSelected(event, screenTemplate: ScreenTemplate) {
        this.tmpScreenTemplates.forEach((i_screenTemplate) => {
            if (i_screenTemplate == screenTemplate) {
                if (this.m_selectedTimelineId != i_screenTemplate.m_screenTemplateData.campaignTimelineId) {
                    i_screenTemplate.selectFrame();
                    this.m_selectedScreenTemplate = i_screenTemplate;
                    this.m_selectedTimelineId = i_screenTemplate.m_screenTemplateData.campaignTimelineId;
                    this.m_campaignTimelineChannelSelected = -1;
                    this.m_campaignTimelineBoardViewerSelected = -1;
                    this._setAndNotifyIds();
                } else {
                    i_screenTemplate.deselectDivisons();
                }
                var uiState: IUiState = {
                    campaign: {
                        campaignTimelineChannelSelected: -1,
                        campaignTimelineBoardViewerSelected: -1
                    }
                }
                this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
                this._notifyPropertySelect(SideProps.timeline);
            } else {
                i_screenTemplate.deSelectFrame();
                i_screenTemplate.deselectDivisons();
            }
        })

    }


    private _setAndNotifyIds() {
        var uiState: IUiState = {
            campaign: {
                campaignTimelineChannelSelected: this.m_campaignTimelineChannelSelected,
                campaignTimelineBoardViewerSelected: this.m_campaignTimelineBoardViewerSelected,
                timelineSelected: this.m_selectedTimelineId
            }
        }
        this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    }


    /**
     Create a sortable channel list
     @method _createSortable
     @param {Element} i_selector
     **/
    private _createSortable(i_selector) {
        var self = this;
        if (jQuery(i_selector).children().length == 0) return;
        var sortable = document.querySelector(i_selector);
        self.m_draggables = Draggable.create(sortable.children, {
                type: "x",
                bounds: sortable,
                edgeResistance: 1,
                dragResistance: 0,
                onPress: self._sortablePress,
                onDragStart: self._sortableDragStart,
                onDrag: self._sortableDrag,
                liveSnap: self._sortableSnap,
                zIndexBoost: true,
                onDragEnd () {
                    var t = this.target,
                        max = t.kids.length - 1,
                        newIndex = Math.round(this.x / t.currentWidth);
                    //newIndex += (newIndex < 0 ? -1 : 0) + t.currentIndex;
                    var preIndex = newIndex;
                    //alert(this.x);
                    newIndex += t.originalIndex;
                    if (newIndex === max) {
                        t.parentNode.appendChild(t);
                    } else {
                        if (preIndex >= 0) t.parentNode.insertBefore(t, t.kids[newIndex + 1]);
                        else t.parentNode.insertBefore(t, t.kids[newIndex]);
                    }
                    TweenLite.set(t.kids, {xPercent: 0, overwrite: "all"});
                    TweenLite.set(t, {x: 0, color: ""});

                    var orderedTimelines = self.reSequenceTimelines();
                    // jQuery(self.m_thumbsContainer).empty();
                    // BB.comBroker.getService(BB.SERVICES.CAMPAIGN_VIEW).populateTimelines(orderedTimelines);
                    // var campaign_timeline_id = BB.comBroker.getService(BB.SERVICES.CAMPAIGN_VIEW).getSelectedTimeline();
                    // self.selectTimeline(campaign_timeline_id);
                }
            }
        );
    }

    /**
     Reorder the timeline in the local msdb to match the UI order of the timeline thumbnails in the Sequencer
     @method reSequenceTimelines
     @return {Array} order of timelines ids
     **/
    reSequenceTimelines() {
        var self = this;
        var order = [];
        var timelines = jQuery('#dragcontainer', self.el.nativeElement).children().each(function (sequenceIndex) {
            var element = jQuery(this).find('[data-campaign_timeline_id]').eq(0);
            var campaign_timeline_id = jQuery(element).data('campaign_timeline_id');
            order.push(campaign_timeline_id);
            self.pepper.setCampaignTimelineSequencerIndex(self.m_selectedCampaignId, campaign_timeline_id, sequenceIndex);
        });
        this.pepper.reduxCommit();
        return order;
    }

    /**
     Sortable channel list on press
     @method _sortablePress
     **/
    private _sortablePress() {
        var t = this.target,
            i = 0,
            child = t;
        while (child = child.previousSibling)
            if (child.nodeType === 1) i++;
        t.originalIndex = i;
        t.currentWidth = jQuery(t).outerWidth();
        t.kids = [].slice.call(t.parentNode.children); // convert to array
    }

    /**
     Sortable drag channel list on press
     @method _sortableDragStart
     **/
    private _sortableDragStart() {
        TweenLite.set(this.target, {color: "#88CE02"});
    }

    /**
     Sortable drag channel list
     @method _sortableDrag
     **/
    private _sortableDrag() {
        var t = this.target,
            elements = t.kids.slice(), // clone
            // indexChange = Math.round(this.x / t.currentWidth), // round flawed on large values
            indexChange = Math.ceil(this.x / t.currentWidth),
            srcIndex = t.originalIndex,
            dstIndex = srcIndex + indexChange;
        // console.log('k ' + t.kids.length + ' s:' + srcIndex + ' d:' + indexChange + ' t:' + (dstIndex - srcIndex));
        if (srcIndex < dstIndex) { // moved right
            TweenLite.to(elements.splice(srcIndex + 1, dstIndex - srcIndex), 0.15, {xPercent: -140});  // 140 = width of screen layout widget
            TweenLite.to(elements, 0.15, {xPercent: 0});
        } else if (srcIndex === dstIndex) {
            elements.splice(srcIndex, 1);
            TweenLite.to(elements, 0.15, {xPercent: 0});
        } else { // moved left
            // ignore if destination > source index
            if ((indexChange < 0 ? indexChange * -1 : indexChange) > srcIndex)
                return;
            TweenLite.to(elements.splice(dstIndex, srcIndex - dstIndex), 0.15, {xPercent: 140}); // 140 = width of screen layout widget
            TweenLite.to(elements, 0.15, {xPercent: -10});
        }
    }

    /**
     snap channels to set rounder values
     @method _sortableSnap
     **/
    private _sortableSnap(y) {
        return y;
        /* enable code below to use live drag snapping */
        // var h = this.target.currentHeight;
        // return Math.round(y / h) * h;
    }

    @Once()
    _onDivisionDoubleClicked(i_campaign_timeline_board_viewer_id) {
        this.m_campaignTimelineBoardViewerSelected = i_campaign_timeline_board_viewer_id;
        this.m_selectedScreenTemplate.selectDivison(i_campaign_timeline_board_viewer_id)
        return this.yp.getChannelFromViewer(this.m_selectedTimelineId, i_campaign_timeline_board_viewer_id)
            .subscribe((result: any) => {
                this.m_campaignTimelineChannelSelected = result.channel;
                this._setAndNotifyIds()
                this._notifyPropertySelect(SideProps.channel);

            }, (e) => {
                console.error(e)
            })
    }

    private _notifyPropertySelect(i_type) {
        var uiState: IUiState = {uiSideProps: i_type}
        this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    }

    /**
     Select next channel
     @method selectNextChannel
     **/
    @Once()
    public onSelectNextChannel(): Subscription {
        if (!this.m_selectedScreenTemplate && this.screenTemplatesQueryList)
            this._onScreenTemplateSelected(null, this.screenTemplatesQueryList.first)
        var timeline_channel_id;
        return this.yp.getChannelsOfTimeline(this.m_selectedTimelineId)
            .subscribe((channelsIDs) => {
                if (this.m_campaignTimelineChannelSelected == -1) {
                    timeline_channel_id = channelsIDs[0];
                } else {
                    for (var ch in channelsIDs) {
                        if (channelsIDs[ch] == this.m_campaignTimelineChannelSelected) {
                            if (_.isUndefined(channelsIDs[parseInt(ch) + 1])) {
                                timeline_channel_id = channelsIDs[0];
                            } else {
                                timeline_channel_id = channelsIDs[parseInt(ch) + 1];
                            }
                        }
                    }
                }
                this.m_campaignTimelineChannelSelected = timeline_channel_id;
                this.getAssignedViewerIdFromChannelId(timeline_channel_id);
            }, (e) => {
                console.error(e)
            });
    }

    @Once()
    private getAssignedViewerIdFromChannelId(timeline_channel_id) {
        return this.yp.getAssignedViewerIdFromChannelId(timeline_channel_id)
            .subscribe((i_campaign_timeline_board_viewer_id) => {
                // note: workaround for when viewer is unassigned, need to investigate
                if (_.isUndefined(i_campaign_timeline_board_viewer_id))
                    return;
                this.m_campaignTimelineBoardViewerSelected = i_campaign_timeline_board_viewer_id;
                this.m_selectedScreenTemplate.selectDivison(i_campaign_timeline_board_viewer_id)
                this._setAndNotifyIds();
                this._notifyPropertySelect(SideProps.channel);

                // self._removeBlockSelection();
                // self._addChannelSelection(timeline_channel_id);
                // BB.comBroker.getService(BB.SERVICES['SEQUENCER_VIEW']).selectViewer(screenData.campaign_timeline_id, screenData.campaign_timeline_board_viewer_id);
                // BB.comBroker.fire(BB.EVENTS.ON_VIEWER_SELECTED, this, screenData);
                // BB.comBroker.fire(BB.EVENTS.CAMPAIGN_TIMELINE_CHANNEL_SELECTED, this, null, self.m_selectedChannel);
            }, (e) => console.error(e));
    }

    ngOnInit() {
    }

    destroy() {
    }
}


