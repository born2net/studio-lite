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
import {ACTION_LIVELOG_UPDATE} from "../../store/actions/appdb.actions";
import {LiveLogModel} from "../../models/live-log-model";
import {FormBuilder, FormGroup} from "@angular/forms";
import {PLACEMENT_IS_SCENE} from "../../interfaces/Consts";
import {BlockService} from "../blocks/block-service";

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
        <form novalidate autocomplete="off" class="inner5" [formGroup]="contGroup">
            <div>
                <select formControlName="selectSimpleMode" (change)="_onSheetDropdownSelected($event)" style="height: 50px; border: solid #cbcbcb 1px; width: 200px">
                    <option selected="selected" value="true">Simple mode</option>
                    <option value="false">Advanced mode</option>
                </select>

            </div>
        </form>
        <div *ngIf="m_simpleMode == true">
            <h5 i18n>in this mode your entire layout consists of a single canvas (also known as scene).<br/> You don't need to worry about channels or timelines, it is super simple to get started (recommended).</h5>
            <div style="padding: 10px">

                <!--<svg *ngIf="m_orientation==0" class="svgSD" id="svgScreenLayout_388" width="137.14285714285714" height="77.14285714285714" xmlns="http://www.w3.org/2000/svg">  <g><rect id="rectSD_389" data-campaign_timeline_board_viewer_id="undefined" data-campaign_timeline_id="undefined" x="0" y="0" width="137.14285714285714" height="77.14285714285714" data-sd="sd0" class="screenDivisionClass" style="fill:rgb(230,230,230);stroke-width:2;stroke:rgb(72,72,72)"></rect></g> </svg>-->
                <div *ngIf="m_orientation==0" style="min-width: 500px; min-height: 500px">
                    <div (click)="_nextClick.next({screenLayout: screenLayout, simpleCampaign: true})" style="float: left; padding: 20px" *ngFor="let screenLayout of m_screenLayoutsH">
                        <screen-template [mouseHoverEffect]="m_mouseHoverEffect" [setTemplate]="screenLayout"></screen-template>
                    </div>
                </div>

                <div *ngIf="m_orientation==1" style="min-width: 500px; min-height: 500px">
                    <div (click)="_nextClick.next({screenLayout: screenLayout, simpleCampaign: true})" style="float: left; padding: 20px" *ngFor="let screenLayout of m_screenLayoutsV">
                        <screen-template [mouseHoverEffect]="m_mouseHoverEffect" [setTemplate]="screenLayout"></screen-template>
                    </div>
                </div>
            </div>
        </div>
        <div *ngIf="m_simpleMode == false">
            <h5 i18n>in this mode you have more flexibility on timing, individual screen division assignments and channels, however it does a bit more of a learning curve.</h5>
            <div id="screenLayoutList" style="min-width: 500px; min-height: 500px">
                <div (click)="_nextClick.next({screenLayout: screenLayout, simpleCampaign: false})" style="float: left; padding: 20px" *ngFor="let screenLayout of m_screenLayouts">
                    <screen-template [mouseHoverEffect]="m_mouseHoverEffect" [setTemplate]="screenLayout"></screen-template>
                </div>
            </div>
        </div>
    `
})
export class CampaignLayout extends Compbaser {

    private m_resolution: string;
    private m_screenTemplateData: IScreenTemplateData;
    m_orientation: OrientationEnum;
    contGroup: FormGroup;
    _nextClick: Observer<any>;
    m_addToExistingCampaignMode = false;
    m_screenLayouts: Array<IScreenTemplateData>;
    m_screenLayoutsV: Array<IScreenTemplateData> = [];
    m_screenLayoutsH: Array<IScreenTemplateData> = [];
    m_campaignName: string;
    m_onNewCampaignMode: boolean;
    m_simpleMode: boolean = true;
    m_mouseHoverEffect: boolean = false;


    constructor(private yp: YellowPepperService, private rp: RedPepperService, private bs: BlockService,  private fb: FormBuilder) {
        super();
        this.contGroup = fb.group({
            'selectSimpleMode': [true]
        });
    }

    _onSheetDropdownSelected(event) {
        this.m_simpleMode = event.target.value == 'true' ? true : false;
    }

    ngAfterViewInit() {
        this.getNewCampaignParams();
        this.cancelOnDestroy(
            Observable.create(observer => {
                this._nextClick = observer
            }).map((i_data: {screenLayout:IScreenTemplateData, simpleCampaign:boolean}) => {
                this.m_screenTemplateData = i_data.screenLayout;
                return i_data.screenLayout;
            })
                .debounceTime(200)
                .do(() => {

                    //todo: create a simple scene in rp via yp init
                    // var player_data = this.bs.getBlockBoilerplate('3510').getDefaultPlayerData(PLACEMENT_IS_SCENE);
                    // console.log(player_data);
                    // var sceneId = this.rp.createScene(player_data, '', i_name);
                    // this.rp.reduxCommit();
                    this.m_screenTemplateData.campaignSimpleSceneOnly = this.m_simpleMode;
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
        if (!this.m_onNewCampaignMode)
            this.m_simpleMode = false;
            // this.contGroup.controls.selectSimpleMode.setValue(false);
    }

    @Once()
    private getNewCampaignParams() {
        return this.yp.getNewCampaignParmas()
            .subscribe((value: IUiStateCampaign) => {
                if (this.m_onNewCampaignMode) {
                    this.m_addToExistingCampaignMode = false;
                    this.m_resolution = value.campaignCreateResolution;
                    this.m_orientation = value.campaignCreateOrientation;
                    this.m_campaignName = value.campaignCreateName;
                    this.yp.dispatch(({type: ACTION_LIVELOG_UPDATE, payload: new LiveLogModel({event: 'campaign created ' + this.m_campaignName})}));
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
        var c = 0;
        for (var screenType in screenTemplates[this.m_orientation][this.m_resolution]) {
            var screenTemplateData: IScreenTemplateData = {
                orientation: this.m_orientation,
                resolution: this.m_resolution,
                screenType: screenType,
                screenProps: screenTemplates[this.m_orientation][this.m_resolution][screenType],
                scale: 14,
                name: this.m_campaignName,
                campaignSimpleSceneOnly: false
            };
            this.m_screenLayouts.push(screenTemplateData);
            if (c == 0) {
                this.m_screenLayoutsH.push(screenTemplateData);
                this.m_screenLayoutsV.push(screenTemplateData);
            }
            c++;
        }
    }

    ngOnInit() {
    }

    destroy() {
    }
}