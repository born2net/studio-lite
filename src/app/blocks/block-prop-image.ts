import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {BlockService, IBlockData} from "./block-service";
import {Compbaser, NgmslibService} from "ng-mslib";
import * as _ from "lodash";
import {urlRegExp} from "../../Lib";

@Component({
    selector: 'block-prop-image',
    host: {'(input-blur)': 'saveToStore($event)'},
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>
        <form novalidate autocomplete="off" class="inner5" [formGroup]="m_contGroup">
            <div class="row">
                <ul class="list-group">
                    <li *ngIf="external" class="list-group-item">
                        <span i18n>url</span><br/>
                        <input class="default-prop-width" type="text" [formControl]="m_contGroup.controls['url']"/>
                    </li>
                    <li *ngIf="!external" class="list-group-item">
                        <span i18n>maintain aspect ratio</span>
                        <div class="material-switch pull-right">
                            <input #imageRatio (change)="_toggleAspectRatio(imageRatio.checked)"
                                   [formControl]="m_contGroup.controls['maintain']"
                                   id="imageRatio"
                                   name="imageRatio" type="checkbox"/>
                            <label for="imageRatio" class="label-primary"></label>
                        </div>
                    </li>
                </ul>
            </div>
        </form>
    `
})
export class BlockPropImage extends Compbaser implements AfterViewInit {
    m_formInputs = {};
    m_contGroup: FormGroup;
    m_blockData: IBlockData;

    constructor(private fb: FormBuilder, private cd: ChangeDetectorRef, private bs: BlockService, private ngmslibService: NgmslibService) {
        super();
        this.m_contGroup = fb.group({
            'url': ['', [Validators.pattern(urlRegExp)]],
            'maintain': []
        });
        _.forEach(this.m_contGroup.controls, (value, key: string) => {
            this.m_formInputs[key] = this.m_contGroup.controls[key] as FormControl;
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

    @Input() external: boolean = false;

    /**
     Toggle maintain aspect ratio
     **/
    _toggleAspectRatio(i_value) {
        i_value = StringJS(i_value).booleanToNumber()
        var domPlayerData = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('AspectRatio');
        jXML(xSnippet).attr('maintain', i_value);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData)
    }

    private _render() {
        var domPlayerData: XMLDocument = this.m_blockData.playerDataDom
        if (this.external) {
            var xSnippet = jXML(domPlayerData).find('LINK');
            this.m_formInputs['url'].setValue(xSnippet.attr('src'));
        } else {
            var xSnippet = jXML(domPlayerData).find('AspectRatio');
            var maintain = StringJS(jXML(xSnippet).attr('maintain')).booleanToNumber();
            this.m_formInputs['maintain'].setValue(maintain);
        }
    }

    ngAfterViewInit() {
        this._render();
    }

    private saveToStore() {
        con(this.m_contGroup.status + ' ' + JSON.stringify(this.ngmslibService.cleanCharForXml(this.m_contGroup.value)));
        if (this.m_contGroup.status != 'VALID')
            return;
        var domPlayerData: XMLDocument = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('LINK');
        xSnippet.attr('src', this.m_contGroup.value.url);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    destroy() {
    }
}