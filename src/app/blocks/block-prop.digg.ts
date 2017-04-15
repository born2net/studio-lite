import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {BlockService, IBlockData} from "./block-service";
import {Compbaser, NgmslibService} from "ng-mslib";
import * as _ from "lodash";

@Component({
    selector: 'block-prop-digg',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>
        <form novalidate autocomplete="off" class="inner5" [formGroup]="m_contGroup">
            <div class="row">
                <div *ngIf="!jsonMode" style="padding: 10px">
                    <h5>Digg, it's what's new on the web...</h5>
                    <span class="fa fa-digg fa-4x pull-right"></span>    
                </div>
            </div>
        </form>
        <div *ngIf="jsonMode">
            <block-prop-json-player [setBlockData]="m_blockData"></block-prop-json-player>
        </div>
    `
})
export class BlockPropDigg extends Compbaser implements AfterViewInit {
    m_formInputs = {};
    m_contGroup: FormGroup;
    m_blockData: IBlockData;

    constructor(private fb: FormBuilder) {
        super();
        this.m_contGroup = fb.group({
            'token': ['']
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
        jXML(domPlayerData).find('Json').find('Data');
    }

    ngAfterViewInit() {
        this._render();
    }

    destroy() {
    }
}
