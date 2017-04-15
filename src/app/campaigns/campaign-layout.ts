import {Component, EventEmitter, Input, Output} from "@angular/core";
import {Compbaser} from "ng-mslib";
import * as screenTemplates from "../../libs/screen-templates.json";
import * as _ from "lodash";
import {OrientationEnum} from "./campaign-orientation";
import {Observable, Observer} from "rxjs";
import {Once} from "../../decorators/once-decorator";
import {IUiStateCampaign} from "../../store/store.data";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {RedPepperService} from "../../services/redpepper.service";
import {IScreenTemplateData} from "../../interfaces/IScreenTemplate";

@Component({
    selector: 'campaign-layout',
    styles: [`
        :host /deep/ .svgSD {
            cursor: pointer;
        }
    `],
    template: `
        <small class="debug">{{me}}</small>
        <h4 i18n>screen layout</h4>
        <div id="screenLayoutList" style="min-width: 500px; min-height: 500px">
            <div (click)="_nextClick.next(screenLayout)" style="float: left; padding: 20px" *ngFor="let screenLayout of m_screenLayouts">
                <screen-template [mouseHoverEffect]="m_mouseHoverEffect" [setTemplate]="screenLayout"></screen-template>
            </div>
        </div>
    `
})
export class CampaignLayout extends Compbaser {

    private m_resolution: string;
    private m_screenTemplateData: IScreenTemplateData;
    private m_orientation: OrientationEnum;
    _nextClick: Observer<any>;
    m_addToExistingCampaignMode = false;
    m_screenLayouts: Array<IScreenTemplateData>;
    m_campaignName: string;
    m_onNewCampaignMode: boolean;
    m_mouseHoverEffect:boolean = false;

    constructor(private yp: YellowPepperService, private rp: RedPepperService) {
        super();
    }

    ngAfterViewInit() {
        this.getNewCampaignParams();
        this.cancelOnDestroy(
            Observable.create(observer => {
                this._nextClick = observer
            }).map((i_screenTemplateData: IScreenTemplateData) => {
                this.m_screenTemplateData = i_screenTemplateData;
                return i_screenTemplateData;
            })
                .debounceTime(100)
                .do(() => {
                    this.onSelection.emit(this.m_screenTemplateData)
                }).subscribe(() => {
            }, (e) => console.error(e))
        )
    }

    @Input()
    set mouseHoverEffect(i_value) {
        this.m_mouseHoverEffect = i_value;
    }

    @Input()
    set onNewCampaignMode(i_value: boolean) {
        this.m_onNewCampaignMode = i_value;
    }

    @Once()
    private getNewCampaignParams() {
        return this.yp.getNewCampaignParmas()
            .subscribe((value: IUiStateCampaign) => {
                console.log(this.m_onNewCampaignMode);
                if (this.m_onNewCampaignMode) {
                    this.m_addToExistingCampaignMode = false;
                    console.log(this.m_addToExistingCampaignMode);
                    this.m_resolution = value.campaignCreateResolution;
                    this.m_orientation = value.campaignCreateOrientation;
                    this.m_campaignName = value.campaignCreateName;
                } else {
                    this.m_addToExistingCampaignMode = true;
                    var recBoard = this.rp.getGlobalBoardFromCampaignId(value.campaignSelected)
                    var h = parseInt(recBoard.board_pixel_height);
                    var w = parseInt(recBoard.board_pixel_width);
                    this.m_resolution = `${w}x${h}`;
                    this.m_orientation = w > h ? OrientationEnum.HORIZONTAL : OrientationEnum.VERTICAL;
                    this.m_campaignName = '';
                }
                this._render();
            }, (e) => console.error(e))
    }


    @Output()
    onSelection: EventEmitter<IScreenTemplateData> = new EventEmitter<IScreenTemplateData>();


    private _render() {
        if (_.isUndefined(this.m_orientation) || _.isUndefined(this.m_resolution))
            return;
        this.m_screenLayouts = [];
        for (var screenType in screenTemplates[this.m_orientation][this.m_resolution]) {
            var screenTemplateData: IScreenTemplateData = {
                orientation: this.m_orientation,
                resolution: this.m_resolution,
                screenType: screenType,
                screenProps: screenTemplates[this.m_orientation][this.m_resolution][screenType],
                scale: 14,
                name: this.m_campaignName
            };
            this.m_screenLayouts.push(screenTemplateData);
        }
    }

    ngOnInit() {
    }

    destroy() {
    }
}