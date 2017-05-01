import {Component, ChangeDetectionStrategy, AfterViewInit} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {CampaignsModelExt, CampaignTimelineChanelPlayersModelExt} from "../../store/model/msdb-models-extended";
import {Map, List} from 'immutable';
import {CampaignTimelineChanelsModel, CampaignTimelinesModel} from "../../store/imsdb.interfaces_auto";

@Component({
    selector: 'campaign-story-timeline',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>
        <app-timeline [resources]="resources"
                      [state]="state"
                      (itemAdded)="itemAdded($event)"
                      (channelAdded)="channelAdded($event)"
                      (itemMoved)="itemMoved($event)"
        ></app-timeline>
    `,
})
export class CampaignStoryTimeline extends Compbaser implements AfterViewInit {

    campaignModel: CampaignsModelExt;
    campaignTimelinesModel: CampaignTimelinesModel;
    channelModel: CampaignTimelineChanelsModel;
    m_campaignTimelinesModels: List<CampaignTimelinesModel>;
    m_campaignTimelineChanelPlayersModel: CampaignTimelineChanelPlayersModelExt;
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
    state = {
        zoom: 1,
        channels: [
            {
                id: 1,
                name: 'CH0',
                type: 'normal',
                color: '#0000FF',
                selected: false,
            },
            {
                id: 2,
                name: 'CH1',
                type: 'normal',
                color: '#0000FF',
                selected: false
            },
            {
                id: 3,
                name: 'CH2',
                color: '#0000FF',
                type: 'common',
                selected: false
            },
        ],
        outputs: [
            {
                id: 1,
                name: "Output",
                color: "#000",
                selected: false
            }
        ],
        items: [
            {
                id: 1,
                type: 'channel',
                resource: "assets/sample1.png",
                title: 'Logo_splash',
                start: 0,
                duration: 60,
                channel: 1,
                selected: false
            },
            {
                id: 2,
                type: 'channel',
                resource: "assets/sample3.svg",
                title: '350x350',
                start: 300,
                duration: 60,
                channel: 2,
                selected: false
            }
        ]
    }

    constructor(private yp: YellowPepperService) {
        super();

        this.cancelOnDestroy(
            //
            this.yp.listenCampaignSelected()
                .switchMap((i_campaignsModelExt: CampaignsModelExt) => {
                    this.campaignModel = i_campaignsModelExt;
                    return this.yp.listenCampaignTimelines(i_campaignsModelExt.getCampaignId())
                })
                .subscribe((i_campaignTimelinesModel: List<CampaignTimelinesModel>) => {
                    this.m_campaignTimelinesModels = i_campaignTimelinesModel;
                }, (e) => console.error(e))
        );

        this.cancelOnDestroy(
            this.yp.listenTimelineSelected()
                .map((i_campaignTimelinesModel: CampaignTimelinesModel) => {
                    this.campaignTimelinesModel = i_campaignTimelinesModel;
                    return i_campaignTimelinesModel;
                })
                .mergeMap((i_campaignTimelinesModel: CampaignTimelinesModel) => {
                    return this.yp.listenChannelsOfTimeline(i_campaignTimelinesModel.getCampaignTimelineId())
                }).subscribe((i_channels: Array<number>) => {
            }, (e) => console.error(e))
        );

        this.cancelOnDestroy(
            this.yp.listenChannelSelected(true)
                .subscribe((channel: CampaignTimelineChanelsModel) => {
                    this.channelModel = channel;
                }, (e) => {
                    console.error(e)
                })
        );
        this.cancelOnDestroy(
            this.yp.listenBlockChannelSelected(true)
                .subscribe((i_campaignTimelineChanelPlayersModel: CampaignTimelineChanelPlayersModelExt) => {
                    this.m_campaignTimelineChanelPlayersModel = i_campaignTimelineChanelPlayersModel;
                }, (e) => console.error(e))
        )

    }

    id = 0
    items = []

    remove(id) {
        let index = this.items.findIndex(item => item.id === id)
        this.items.splice(index, 1)
    }

    reset() {
        this.items = []
    }

    add() {
        this.items.unshift({id: this.id++, name: 'item'})
    }

    itemMoved(state) {
        console.log("Item moved", state);
    }

    channelAdded(state) {
        console.log("Channel added", state);
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

