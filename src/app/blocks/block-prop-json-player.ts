import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewChild} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {BlockService, IBlockData} from "./block-service";
import {RedPepperService} from "../../services/redpepper.service";
import {Compbaser} from "ng-mslib";
import {urlRegExp} from "../../Lib";
import * as _ from "lodash";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {Once} from "../../decorators/once-decorator";
import {SimpleGridTable} from "../../comps/simple-grid-module/SimpleGridTable";

@Component({
    selector: 'block-prop-json-player',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'(input-blur)': 'saveToStore($event)'},
    template: `
        <small class="debug">{{me}}</small>
        <form class="inner15" novalidate autocomplete="off" [formGroup]="m_contGroup">
            <div class="row">
                <ul class="list-group">
                    <li *ngIf="standAlone" class="list-group-item">
                        <div class="input-group">
                            <span class="input-group-addon"><i class="fa fa-paper-plane"></i></span>
                            <input type="text" class="form-control" minlength="3" placeholder="json url" [formControl]="m_contGroup.controls['itemsUrl']">
                        </div>
                    </li>
                    <li *ngIf="standAlone" class="list-group-item">
                        <div class="input-group">
                            <span class="input-group-addon"><i class="fa fa-paper-plane"></i></span>
                            <input type="text" class="form-control" minlength="3" placeholder="object path" [formControl]="m_contGroup.controls['itemsPath']">
                        </div>
                    </li>
                    <li class="list-group-item">
                        <span i18n>load with scene</span>
                        <div class="input-group">
                            <span class="input-group-addon"><i class="fa fa-paper-plane"></i></span>
                            <p-dropdown [style]="{'width':'220px'}" (onChange)="_onSceneSelectionChanged($event)" [(ngModel)]="m_sceneSeleced" [options]="m_sceneSelection" [filter]="true" formControlName="sceneSelection"></p-dropdown>
                        </div>
                    </li>
                    <li class="list-group-item">
                        <label i18n>interval</label><br/>
                        <input style="width: 268px" type="number" min="1" [formControl]="m_contGroup.controls['itemInterval']"/>
                    </li>
                    <li class="list-group-item">
                        <span i18n>play video to completion</span>
                        <div class="material-switch pull-right">
                            <input (change)="_onPlayVideoInFull(playVideoInFull.checked)"
                                   [formControl]="m_contGroup.controls['playVideoInFull']"
                                   id="playVideoInFull" #playVideoInFull
                                   name="playVideoInFull" type="checkbox"/>
                            <label for="playVideoInFull" class="label-primary"></label>
                        </div>
                    </li>
                    <li class="list-group-item">
                        <span i18n>random playback</span>
                        <div class="material-switch pull-right">
                            <input (change)="_onRandomPlay(randomOrder.checked)"
                                   [formControl]="m_contGroup.controls['randomOrder']"
                                   id="randomOrder" #randomOrder
                                   name="randomOrder" type="checkbox"/>
                            <label for="randomOrder" class="label-primary"></label>
                        </div>
                    </li>
                    <li class="list-group-item">
                        <span i18n>slideshow</span>
                        <div class="material-switch pull-right">
                            <input (change)="_onSlideShow(slideShow.checked)"
                                   [formControl]="m_contGroup.controls['slideShow']"
                                   id="slideShow" #slideShow
                                   name="slideShow" type="checkbox"/>
                            <label for="slideShow" class="label-primary"></label>
                        </div>
                    </li>

                    <li *ngIf="!m_slideShowMode" class="list-group-item">
                        <json-event-grid [showOption]="'url'" [setBlockData]="m_blockData"></json-event-grid>
                    </li>
                </ul>
            </div>
        </form>
    `
})
export class BlockPropJsonPlayer extends Compbaser implements AfterViewInit {

    formInputs = {};
    m_contGroup: FormGroup;
    m_blockData: IBlockData;
    m_sceneSelection = [];
    m_sceneSeleced: any = {};
    m_slideShowMode = 0;

    constructor(private fb: FormBuilder, private yp: YellowPepperService, private rp: RedPepperService, private bs: BlockService, private cd: ChangeDetectorRef) {
        super();
        this.m_contGroup = fb.group({
            'sceneSelection': [],
            'randomOrder': [],
            'slideShow': [],
            'playVideoInFull': [],
            'itemInterval': [],
            'itemsPath': [],
            'itemsUrl': ['', [Validators.pattern(urlRegExp)]],
            'url': ['', [Validators.pattern(urlRegExp)]]
        });
        _.forEach(this.m_contGroup.controls, (value, key: string) => {
            this.formInputs[key] = this.m_contGroup.controls[key] as FormControl;
        })
    }

    @ViewChild('simpleGrid')
    simpleGrid: SimpleGridTable;

    @Input() standAlone: boolean = false;


    @Input()
    set setBlockData(i_blockData) {
        /**
         Disabled as in this component we wish to always update UI on block changes
         since we are addinf and removing elements to event grid and need to be updated
         if (this.m_blockData && this.m_blockData.blockID != i_blockData.blockID) {
              this.m_blockData = i_blockData;
             this._render();
          } else {
              this.m_blockData = i_blockData;
         }
         **/
        this.m_blockData = i_blockData;
        this._render();
    }

    ngAfterViewInit() {
        this._render();
    }

    _onPlayVideoInFull(i_value) {
        i_value = StringJS(i_value).booleanToNumber()
        var domPlayerData = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('Json');
        jXML(xSnippet).attr('playVideoInFull', i_value);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData)
    }

    _onRandomPlay(i_value) {
        i_value = StringJS(i_value).booleanToNumber()
        var domPlayerData = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('Json');
        jXML(xSnippet).attr('randomOrder', i_value);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData)
    }

    _onSlideShow(i_value) {
        i_value = StringJS(i_value).booleanToNumber()
        this.m_slideShowMode = i_value;
        var domPlayerData = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('Json');
        jXML(xSnippet).attr('slideShow', i_value);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData)
    }

    _onSceneSelectionChanged(i_scene_id) {
        var domPlayerData = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('Json');
        var xSnippetPlayer = jXML(xSnippet).find('Player');
        jXML(xSnippetPlayer).attr('hDataSrc', i_scene_id.value.id);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData)
    }

    /**
     Populate the LI with all available scenes from msdb
     if the mimetype is empty (used for this class) we show all scenes in dropdown, but if mimetype exists
     (used by subclasses of this class) we filter dropdown list by matching mimetypes
     @method _populateSceneDropdown
     **/
    @Once()
    private _initSceneDropdown() {
        var self = this;
        return this.yp.getSceneNames()
            .subscribe((scenes) => {
                this.m_sceneSelection = [];
                var domPlayerData = this.m_blockData.playerDataDom;
                var xSnippet = jXML(domPlayerData).find('Json');
                var xSnippetPlayer = jXML(xSnippet).find('Player');
                var selectedSceneID = jXML(xSnippetPlayer).attr('hDataSrc');
                for (var scene in scenes) {
                    var mimeType = scenes[scene].mimeType;
                    var label = scenes[scene].label;
                    var sceneId = scenes[scene].id;
                    if (sceneId == selectedSceneID) {
                        this.m_sceneSeleced = scenes[scene];
                    }
                    // if this component is used as a standalone Json Player, include in drop down all possible scenes
                    if (self.m_blockData.playerMimeScene == mimeType || this.standAlone) {
                        this.m_sceneSelection.push({
                            sceneId, label, mimeType, value: scenes[scene]
                        })
                    }
                }
            }, (e) => console.error(e))
    }

    _render() {
        this._initSceneDropdown();
        // this._initEventTable();
        var domPlayerData = this.m_blockData.playerDataDom
        var xSnippet = jXML(domPlayerData).find('Json');
        var playVideoInFull = StringJS(jXML(xSnippet).attr('playVideoInFull')).booleanToNumber();
        this.formInputs['playVideoInFull'].setValue(playVideoInFull);
        var randomOrder = StringJS(jXML(xSnippet).attr('randomOrder')).booleanToNumber();
        this.formInputs['randomOrder'].setValue(randomOrder);
        this.m_slideShowMode = StringJS(jXML(xSnippet).attr('slideShow')).booleanToNumber(true) as number;
        this.formInputs['slideShow'].setValue(this.m_slideShowMode);
        this.formInputs['itemsPath'].setValue(jXML(xSnippet).attr('itemsPath'));
        this.formInputs['itemInterval'].setValue(jXML(xSnippet).attr('itemInterval'));
        this.formInputs['itemsUrl'].setValue(jXML(xSnippet).attr('url'));
    }

    private saveToStore() {
        if (this.m_contGroup.status != 'VALID')
            return;
        var domPlayerData: XMLDocument = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('Json');
        xSnippet.attr('itemsPath', this.m_contGroup.value.itemsPath);
        xSnippet.attr('url', this.m_contGroup.value.itemsUrl);
        xSnippet.attr('itemInterval', this.m_contGroup.value.itemInterval);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    destroy() {
    }
}