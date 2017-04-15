import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {BlockService, IBlockData} from "./block-service";
import {RedPepperService} from "../../services/redpepper.service";
import {Compbaser, NgmslibService} from "ng-mslib";
import {urlRegExp} from "../../Lib";
import * as _ from "lodash";

@Component({
    selector: 'block-prop-youtube',
    host: {
        '(input-blur)': 'saveToStore($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>
        <form novalidate autocomplete="off" class="inner5" [formGroup]="m_contGroup">
            <div class="row">
                <ul class="list-group">
                    <li class="list-group-item">
                        <span i18n>volume</span>
                        <input formControlName="volume" type="range" min="0" max="100" step="1"/>
                    </li>
                    <li class="list-group-item">
                        <span i18n>video quality</span>
                        <select #sceneSelection class="default-prop-width" formControlName="quality">
                            <option [value]="'default'">default</option>
                            <option [value]="'small'">small</option>
                            <option [value]="'medium'">medium</option>
                            <option [value]="'large'">large</option>
                            <option [value]="'hd720'">HD</option>
                        </select>
                    </li>
                    <li *ngIf="m_contGroup.controls['listType'].value == 'most_viewed'" class="list-group-item">
                        <span i18n>region</span>
                        <select #sceneSelection class="default-prop-width" formControlName="region">
                            <option [value]="region" *ngFor="let region of m_regions">{{region}}</option>
                        </select>
                    </li>
                    <li class="list-group-item">
                        <input type="radio" value="most_viewed" name="listType" formControlName="listType">
                        <span i18n>most viewed</span>
                        <br/>
                        <input type="radio" value="manually" name="listType" formControlName="listType">
                        <span i18n>custom list</span>
                    </li>
                    <li *ngIf="m_contGroup.controls['listType'].value != 'most_viewed'" class="list-group-item">
                        <span i18n>video ids</span><br/>
                        <textarea placeholder="enter comma separated video IDs, for example: SIFUUhN3TVo, pZH1itk6Udg, azZo59ayLS4" class="default-prop-width" spellcheck="false" rows="10" cols="50" type="textarea"
                                  [formControl]="m_contGroup.controls['customList']">
                        </textarea>
                    </li>

                </ul>
            </div>
        </form>
    `
})
export class BlockPropYouTube extends Compbaser implements AfterViewInit {

    formInputs = {};
    m_contGroup: FormGroup;
    m_blockData: IBlockData;
    m_regions = ['US', 'AR', 'AU', 'AT', 'BE', 'BR', 'CA', 'CL', 'CO', 'CZ', 'EG', 'FR', 'DE', 'GB', 'HK', 'HU', 'IN', 'IE', 'IL', 'IT', 'JP', 'JO', 'MY', 'MX', 'MA', 'NL', 'NZ', 'PE', 'PH', 'PL', 'RU', 'SA', 'SG', 'ZA', 'KR', 'ES', 'SE', 'CH', 'TW', 'AE'];

    constructor(private fb: FormBuilder, private bs: BlockService, private cd: ChangeDetectorRef) {
        super();
        this.m_contGroup = fb.group({
            'volume': [100],
            'listType': [0],
            'quality': [5],
            'region': ['US'],
            'customList': [''],
            'text': []
        });
        _.forEach(this.m_contGroup.controls, (value, key: string) => {
            this.formInputs[key] = this.m_contGroup.controls[key] as FormControl;
        })
    }

    @Input()
    set setBlockData(i_blockData) {
        if (this.m_blockData && this.m_blockData.blockID != i_blockData.blockID) {
            this.m_blockData = i_blockData;
            this._render();
        } else {
            this.m_blockData = i_blockData;
        }
    }

    ngAfterViewInit() {
        this._render();
    }

    _render() {
        var domPlayerData = this.m_blockData.playerDataDom
        var xSnippetYouTube = jXML(domPlayerData).find('YouTube');
        var xSnippetYouTubeManualList = jXML(domPlayerData).find('VideoIdList');
        var videoIDs = jXML(xSnippetYouTubeManualList).text();
        var listType = jXML(xSnippetYouTube).attr('listType'); //manually most_viewed
        var region = jXML(xSnippetYouTube).attr('listRegion');
        var volume = parseFloat(xSnippetYouTube.attr('volume'));
        var quality = jXML(xSnippetYouTube).attr('quality');
        this.formInputs['volume'].setValue(volume);
        this.formInputs['listType'].setValue(listType);
        this.formInputs['quality'].setValue(quality);
        this.formInputs['region'].setValue(region);
        this.formInputs['customList'].setValue(videoIDs);
        this.cd.markForCheck();
    }

    private saveToStore() {
        if (this.m_contGroup.status != 'VALID')
            return;
        var domPlayerData = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('YouTube');
        jXML(xSnippet).attr('volume', this.m_contGroup.value.volume);
        jXML(xSnippet).attr('quality', this.m_contGroup.value.quality);
        jXML(xSnippet).attr('listRegion', this.m_contGroup.value.region);
        jXML(xSnippet).attr('listType', this.m_contGroup.value.listType);
        jXML(xSnippet).find('VideoIdList').remove();
        if (this.m_contGroup.value.listType == 'manually') {
            jXML(xSnippet).append(jXML(`<VideoIdList>jXML{this.m_contGroup.value.customList}</VideoIdList>`));
        } else {
            jXML(xSnippet).find('VideoIdList').remove();
        }
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    destroy() {
    }
}
