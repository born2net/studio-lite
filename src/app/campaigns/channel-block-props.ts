import {AfterViewInit, Component, ElementRef} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {CampaignTimelineChanelPlayersModel, CampaignTimelinesModel} from "../../store/imsdb.interfaces_auto";
import {Lib} from "../../Lib";
import {RedPepperService} from "../../services/redpepper.service";
import {List} from "immutable";
import {CampaignTimelineChanelPlayersModelExt} from "../../store/model/msdb-models-extended";

@Component({
    selector: 'channel-block-props',
    template: `
        <small class="debug">{{me}}</small>
        <div class="center-block" style="width: 240px">
            <h5 id="resourceLengthDuration" i18n>hours / minutes /seconds</h5>
            <input id="blockLengthHours" data-displayPrevious="false" data-min="0" data-max="23" data-skin="tron" data-width="60" data-height="60" data-thickness=".2" type="text" class="knob" data-fgColor="gray">
            <input id="blockLengthMinutes" data-displayPrevious="false" data-min="0" data-max="59" data-skin="tron" data-width="60" data-height="60" data-thickness=".2" type="text" class="knob" data-fgColor="gray">
            <input id="blockLengthSeconds" data-displayPrevious="false" data-min="0" data-max="59" data-skin="tron" data-width="60" data-height="60" data-thickness=".2" type="text" class="knob" data-fgColor="gray">
        </div>
        <block-prop-container></block-prop-container>
    `,
})
export class ChannelBlockProps extends Compbaser implements AfterViewInit {

    m_blockLengthHours = 0;
    m_blockLengthMinutes = 0;
    m_blockLengthSeconds = 0;

    private m_selectedCampaignTimelinesModel: CampaignTimelinesModel;
    private m_campaignTimelineChanelPlayersModel: CampaignTimelineChanelPlayersModel

    constructor(private rp: RedPepperService, private yp: YellowPepperService, private el: ElementRef) {
        super();
    }

    ngAfterViewInit() {

        this.cancelOnDestroy(
            this.yp.listenTimelineSelected()
                .subscribe((i_selectedCampaignTimelinesModel) => {
                    this.m_selectedCampaignTimelinesModel = i_selectedCampaignTimelinesModel;
                }, (e) => console.error(e))
        )

        this.cancelOnDestroy(
            this.yp.listenBlockChannelSelected()
                .subscribe((i_campaignTimelineChanelPlayersModel: CampaignTimelineChanelPlayersModel) => {
                    this.m_campaignTimelineChanelPlayersModel = i_campaignTimelineChanelPlayersModel;
                    var totalSeconds = this.m_campaignTimelineChanelPlayersModel.getPlayerDuration()
                    var totalSecondsObj = Lib.FormatSecondsToObject(totalSeconds);
                    this.m_blockLengthHours = totalSecondsObj.hours;
                    this.m_blockLengthMinutes = totalSecondsObj.minutes;
                    this.m_blockLengthSeconds = totalSecondsObj.seconds;
                    jQuery('#blockLengthHours', this.el.nativeElement).val(this.m_blockLengthHours).trigger('change');
                    jQuery('#blockLengthMinutes', this.el.nativeElement).val(this.m_blockLengthMinutes).trigger('change');
                    jQuery('#blockLengthSeconds', this.el.nativeElement).val(this.m_blockLengthSeconds).trigger('change');
                }, (e) => console.error(e))
        )
        this._propLengthKnobsInit()
    }

    /**
     Update the blocks offset times according to current order of LI elements and reorder accordingly in msdb.
     @method _reOrderChannelBlocks
     @return none
     **/
    _reOrderChannelBlocks() {
        var self = this
        this.cancelOnDestroy(
            this.yp.getChannelBlockModels(this.m_campaignTimelineChanelPlayersModel.getCampaignTimelineChanelId())
                .subscribe((i_campaignTimelineChanelPlayersModels: List<CampaignTimelineChanelPlayersModelExt>) => {
                    var sorted = i_campaignTimelineChanelPlayersModels.sort((a, b) => {
                        if (a.getPlayerOffsetTimeInt() < b.getPlayerOffsetTimeInt())
                            return -1;
                        if (a.getPlayerOffsetTimeInt() > b.getPlayerOffsetTimeInt())
                            return 1;
                        if (a.getPlayerOffsetTimeInt() === b.getPlayerOffsetTimeInt())
                            return 0;
                    })
                    var playerOffsetTime: any = 0;
                    sorted.forEach((i_campaignTimelineChanelPlayersModel) => {
                        // console.log(i_campaignTimelineChanelPlayersModel.getPlayerDuration() + ' ' + i_campaignTimelineChanelPlayersModel.getPlayerOffsetTime());
                        var playerDuration = i_campaignTimelineChanelPlayersModel.getPlayerDuration();
                        self.rp.setBlockRecord(i_campaignTimelineChanelPlayersModel.getCampaignTimelineChanelPlayerId(), 'player_offset_time', playerOffsetTime);
                        // console.log('player ' + i_campaignTimelineChanelPlayersModel.getCampaignTimelineChanelPlayerId() + ' offset ' + playerOffsetTime + ' playerDuration ' + playerDuration);
                        playerOffsetTime = parseFloat(playerOffsetTime) + parseFloat(playerDuration);
                    })
                    self.rp.updateTotalTimelineDuration(this.m_selectedCampaignTimelinesModel.getCampaignTimelineId());
                    self.rp.reduxCommit();

                }, (e) => console.error(e))
        )
    }


    /**
     Create the block length knobs so a user can set the length of the block with respect to timeline_channel
     @method _propLengthKnobsInit
     @return none
     **/
    _propLengthKnobsInit() {
        var self = this;
        jQuery('.knob', this.el.nativeElement).knob({
            /*change: function (value) {
             console.log("change : " + value);
             var caller = this['i'][0].id;
             },*/
            release: function (value) {
                // console.log(this.$.attr('value'));
                // console.log("release : " + value + ' ' + this['i'][0].id);
                var caller = this['i'][0].id;

                switch (caller) {
                    case 'blockLengthHours': {
                        self.m_blockLengthHours = parseInt(value)
                        break;
                    }
                    case 'blockLengthMinutes': {
                        self.m_blockLengthMinutes = parseInt(value)
                        break;
                    }
                    case 'blockLengthSeconds': {
                        self.m_blockLengthSeconds = parseInt(value)
                        break;
                    }
                }

                // log('upd: ' + self.m_block_id + ' ' + hours + ' ' + minutes + ' ' + seconds);
                if (self.m_blockLengthHours == 0 && self.m_blockLengthMinutes == 0 && self.m_blockLengthSeconds < 5)
                    return;
                self.rp.setBlockTimelineChannelBlockLength(self.m_campaignTimelineChanelPlayersModel.getCampaignTimelineChanelPlayerId(), self.m_blockLengthHours, self.m_blockLengthMinutes, self.m_blockLengthSeconds);
                self.rp.reduxCommit();
                self._reOrderChannelBlocks();

            },
            /*cancel: function () {
             console.log("cancel : ", this);
             },*/
            draw: function () {
                if (this.$.data('skin') == 'tron') {

                    var a = this.angle(this.cv)  // Angle
                        , sa = this.startAngle          // Previous start angle
                        , sat = this.startAngle         // Start angle
                        , ea                            // Previous end angle
                        , eat = sat + a                 // End angle
                        , r = 1;

                    this.g.lineWidth = this.lineWidth;

                    this.o.cursor
                    && (sat = eat - 0.3)
                    && (eat = eat + 0.3);

                    if (this.o.displayPrevious) {
                        ea = this.startAngle + this.angle(this.v);
                        this.o.cursor
                        && (sa = ea - 0.3)
                        && (ea = ea + 0.3);
                        this.g.beginPath();
                        this.g.strokeStyle = this.pColor;
                        this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sa, ea, false);
                        this.g.stroke();
                    }

                    this.g.beginPath();
                    this.g.strokeStyle = r ? this.o.fgColor : this.fgColor;
                    this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sat, eat, false);
                    this.g.stroke();

                    this.g.lineWidth = 2;
                    this.g.beginPath();
                    this.g.strokeStyle = this.o.fgColor;
                    this.g.arc(this.xy, this.xy, this.radius - this.lineWidth + 1 + this.lineWidth * 2 / 3, 0, 2 * Math.PI, false);
                    this.g.stroke();

                    return false;
                }
            }
        });
    }

    ngOnInit() {
    }

    destroy() {
    }
}