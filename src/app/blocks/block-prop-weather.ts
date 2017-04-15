import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {BlockService, IBlockData} from "./block-service";
import {Compbaser, NgmslibService} from "ng-mslib";
import {simpleRegExp} from "../../Lib";
import * as _ from "lodash";

@Component({
    selector: 'block-prop-weather',
    host: {
        '(input-blur)': 'saveToStore($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>
        <form novalidate autocomplete="off" class="inner5" [formGroup]="m_contGroup">
            <div class="row">
                <div *ngIf="!jsonMode">
                    <ul class="list-group">
                        <li class="list-group-item">
                            <label i18n>Unit</label>
                            <br/>
                            <input type="radio" value="F" name="unit" formControlName="unit">
                            <span i18n>Fahrenheit</span>
                            <br/>
                            <input type="radio" value="C" name="unit" formControlName="unit">
                            <span i18n>Celsius</span>
                        </li>
                        <li class="list-group-item">
                            <label i18n>Styles</label>
                            <br/>
                            <input type="radio" value="1" name="style" formControlName="style">
                            <span i18n>Black</span>
                            <br/>
                            <input type="radio" value="2" name="style" formControlName="style">
                            <span i18n>White</span>
                            <br/>
                            <input type="radio" value="3" name="style" formControlName="style">
                            <span i18n>Color</span>
                        </li>
                        <li class="list-group-item">
                            address / zip code
                            <input type="text" [formControl]="m_contGroup.controls['address']"/>
                        </li>
                    </ul>
                </div>
                <div *ngIf="jsonMode">
                    <block-prop-json-player [setBlockData]="m_blockData"></block-prop-json-player>
                </div>
            </div>
        </form>
    `
})
export class BlockPropWeather extends Compbaser implements AfterViewInit {
    m_formInputs = {};
    m_contGroup: FormGroup;
    m_blockData: IBlockData;

    constructor(private fb: FormBuilder, private cd: ChangeDetectorRef, private bs: BlockService, private ngmslibService: NgmslibService) {
        super();
        this.m_contGroup = fb.group({
            'style': "",
            'unit': "",
            'address': ['', [Validators.pattern(simpleRegExp)]]
        });
        _.forEach(this.m_contGroup.controls, (value, key: string) => {
            this.m_formInputs[key] = this.m_contGroup.controls[key] as FormControl;
        })
    }

    @Input() jsonMode: boolean;

    @Input()
    set setBlockData(i_blockData) {
        if (this.m_blockData && this.m_blockData.blockID != i_blockData.blockID) {
            this.m_blockData = i_blockData;
            this._render();
        } else {
            this.m_blockData = i_blockData;
        }
    }

    private _render() {
        var domPlayerData: XMLDocument = this.m_blockData.playerDataDom
        var jXMLdata = jXML(domPlayerData).find('Json').find('Data');
        this.m_formInputs['unit'].setValue(jXMLdata.attr('unit'));
        this.m_formInputs['style'].setValue(jXMLdata.attr('style'));
        this.m_formInputs['address'].setValue(jXMLdata.attr('address'));
        //this.cd.markForCheck();
    }

    ngAfterViewInit() {
        this._render();
    }

    private saveToStore() {
        // console.log(this.m_contGroup.status + ' ' + JSON.stringify(this.ngmslibService.cleanCharForXml(this.m_contGroup.value)));
        if (this.m_contGroup.status != 'VALID')
            return;
        var domPlayerData: XMLDocument = this.m_blockData.playerDataDom;
        var item = jXML(domPlayerData).find('Json').find('Data');
        jXML(item).attr('unit', this.m_contGroup.value.unit);
        jXML(item).attr('style', this.m_contGroup.value.style);
        jXML(item).attr('address', this.m_contGroup.value.address);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    destroy() {
    }
}


