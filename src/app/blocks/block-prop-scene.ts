import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {BlockService, IBlockData} from "./block-service";
import {RedPepperService} from "../../services/redpepper.service";
import {Compbaser, NgmslibService} from "ng-mslib";
import {Lib, urlRegExp} from "../../Lib";
import * as _ from "lodash";

@Component({
    selector: 'block-prop-scene',
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
                        <span i18n>scene name</span><br/>
                        <input class="default-prop-width" type="text" [formControl]="m_contGroup.controls['name']"/>
                    </li>
                </ul>
            </div>
        </form>
    `
})
export class BlockPropScene extends Compbaser implements AfterViewInit {

    private formInputs = {};
    m_contGroup: FormGroup;
    m_blockData: IBlockData;

    constructor(@Inject('BLOCK_PLACEMENT') private blockPlacement, private fb: FormBuilder, private cd: ChangeDetectorRef, private rp: RedPepperService, private bs: BlockService, private ngmslibService: NgmslibService) {
        super();
        this.m_contGroup = fb.group({
            'name': []
        });
        _.forEach(this.m_contGroup.controls, (value, key: string) => {
            this.formInputs[key] = this.m_contGroup.controls[key] as FormControl;
        })
    }

    @Input()
    set setBlockData(i_blockData) {
        this.m_blockData = i_blockData;
        this._render();
    }

    ngAfterViewInit() {
        this._render();
    }

    _render() {
        var domPlayerData = this.bs.getBlockPlayerData(this.m_blockData);
        var name = jXML(domPlayerData).find('Player').eq(0).attr('label');
        this.formInputs['name'].setValue(name);
    }

    private saveToStore() {
        if (this.m_contGroup.status != 'VALID')
            return;
        var domPlayerData = this.bs.getBlockPlayerData(this.m_blockData);
        var name = Lib.CleanProbCharacters(this.m_contGroup.value.name, 1);
        jXML(domPlayerData).find('Player').eq(0).attr('label', name);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    destroy() {
    }
}
