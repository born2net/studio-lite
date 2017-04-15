import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input} from "@angular/core";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {BlockService, IBlockData} from "./block-service";
import {Compbaser} from "ng-mslib";
import * as _ from "lodash";
import {Subject} from "rxjs";
import {timeout} from "../../decorators/timeout-decorator";
import {Lib} from "../../Lib";

@Component({
    selector: 'block-prop-fasterq',
    host: {
        '(input-blur)': 'saveToStore($event)'
    },
    styles: [`
        .offSet {
            position: relative;
            top: 5px;
        }

        button {
            margin: 5px;
            height: 30px;
        }

        .colorPicker {
            width: 20px;
            float: left;
            display: inline-block;
            margin: 0 10px 0 0;
            padding: 15px 45px;
            border-radius: 0;
            border: 1px solid gray;
            padding: 10px 20px 10px 20px;
            background: #21ff2e;
            text-decoration: none;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>
        <form novalidate autocomplete="off" class="inner5" [formGroup]="m_contGroup">
            <div class="row">
                <span i18n>customer lines</span><br/>
                <ul class="list-group">
                    <li class="list-group-item">
                        <label i18n>background color</label>
                        <button (click)="_moveColorPicker()" #borderColor (colorPickerChange)="m_borderColorChanged.next($event)"
                                [cpOKButton]="true" [cpOKButtonClass]="'btn btn-primary btn-xs'"
                                [(colorPicker)]="m_color" [cpPosition]="'left'" style="width: 59px"
                                [cpAlphaChannel]="'disabled'" class="colorPicker offSet pull-right"
                                [style.background]="m_color"></button>
                        <br/>
                        <br/>
                    </li>
                    <li class="list-group-item"><input class="default-prop-width" type="text" formControlName="lineID1"/></li>
                    <li class="list-group-item"><input class="default-prop-width" type="text" formControlName="lineID2"/></li>
                    <li class="list-group-item"><input class="default-prop-width" type="text" formControlName="lineID3"/></li>
                    <li class="list-group-item"><input class="default-prop-width" type="text" formControlName="lineID4"/></li>
                    <li class="list-group-item"><input class="default-prop-width" type="text" formControlName="lineID5"/></li>
                </ul>
            </div>
        </form>
    `
})
export class BlockPropFasterQ extends Compbaser implements AfterViewInit {

    formInputs = {};
    m_contGroup: FormGroup;
    m_blockData: IBlockData;
    m_borderColorChanged = new Subject();
    m_moveColorPickerOnce = false;
    m_color = '#ffffff';

    constructor(private fb: FormBuilder, private el: ElementRef, private bs: BlockService, private cd: ChangeDetectorRef) {
        super();
        this.m_contGroup = fb.group({
            'lineID1': [''],
            'lineID2': [''],
            'lineID3': [''],
            'lineID4': [''],
            'lineID5': ['']
        });
        _.forEach(this.m_contGroup.controls, (value, key: string) => {
            this.formInputs[key] = this.m_contGroup.controls[key] as FormControl;
        })
        this._listenColorChanged();
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

    _listenColorChanged() {
        this.cancelOnDestroy(
            //
            this.m_borderColorChanged
                .debounceTime(500)
                .distinct()
                .skip(1)
                .subscribe((i_color) => {
                    this.m_color = String(i_color);
                    this.saveToStore();
                }, (e) => console.error(e))
        )
    }

    ngAfterViewInit() {
        this._render();
    }

    _render() {
        var domPlayerData = this.m_blockData.playerDataDom
        var xWebKit = jXML(domPlayerData).find('Webkit');
        var xWebKitData = jXML(xWebKit).find('Data');
        this.formInputs['lineID1'].setValue(jXML(xWebKitData).attr('lineID1'));
        this.formInputs['lineID2'].setValue(jXML(xWebKitData).attr('lineID2'));
        this.formInputs['lineID3'].setValue(jXML(xWebKitData).attr('lineID3'));
        this.formInputs['lineID4'].setValue(jXML(xWebKitData).attr('lineID4'));
        this.formInputs['lineID5'].setValue(jXML(xWebKitData).attr('lineID5'));
        this.setNewColor(jXML(xWebKitData).attr('bgColor'));
        // this.m_color = Lib.ColorToHex(Lib.DecimalToHex(jXML(xWebKitData).attr('bgColor')));
    }

    @timeout()
    _moveColorPicker() {
        console.log(this.m_color);
        if (this.m_moveColorPickerOnce) return;
        this.m_moveColorPickerOnce = true;
        jXML(".color-picker", this.el.nativeElement).css("left", "+=100");
    }

    @timeout(50)
    private setNewColor(i_color) {
        if (_.isNaN(Lib.ColorToDecimal(i_color)))
            i_color = '#ffffff';
        this.m_color = i_color
        this.cd.markForCheck();
    }

    private saveToStore() {
        // console.log(this.m_contGroup.status + ' ' + JSON.stringify(this.ngmslibService.cleanCharForXml(this.m_contGroup.value)));
        if (this.m_contGroup.status != 'VALID')
            return;
        var domPlayerData = this.m_blockData.playerDataDom;
        var xWebKit = jXML(domPlayerData).find('Webkit');
        var xWebKitData = jXML(xWebKit).find('Data');
        jXML(xWebKitData).attr('lineID1', this.formInputs['lineID1'].value);
        jXML(xWebKitData).attr('lineID2', this.formInputs['lineID2'].value);
        jXML(xWebKitData).attr('lineID3', this.formInputs['lineID3'].value);
        jXML(xWebKitData).attr('lineID4', this.formInputs['lineID4'].value);
        jXML(xWebKitData).attr('lineID5', this.formInputs['lineID5'].value);
        jXML(xWebKitData).attr('bgColor', this.m_color);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    destroy() {
    }
}
