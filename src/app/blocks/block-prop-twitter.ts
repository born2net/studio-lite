import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from "@angular/core";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {BlockService, IBlockData} from "./block-service";
import {Compbaser, NgmslibService} from "ng-mslib";
import * as _ from "lodash";

@Component({
    selector: 'block-prop-twitter',
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
                            <span i18n>screen name</span><br/>
                            <input type="text" placeholder="filter"  [formControl]="m_contGroup.controls['screenName']"/>
                        </li>
                        <li class="list-group-item">
                            <span i18n>token</span><br/>
                            <input type="text" [formControl]="m_contGroup.controls['token']"/>
                        </li>
                        <li class="list-group-item">
                            <button i18n class="btn btn-default" (click)="_onCreateToken()">create instagram access token</button>
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
export class BlockPropTwitter extends Compbaser implements AfterViewInit {
    m_formInputs = {};
    m_contGroup: FormGroup;
    m_blockData: IBlockData;

    constructor(private fb: FormBuilder, private cd: ChangeDetectorRef, private bs: BlockService, private ngmslibService: NgmslibService) {
        super();
        this.m_contGroup = fb.group({
            'screenName': [''],
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
        var jXMLdata = jXML(domPlayerData).find('Json').find('Data');
        this.m_formInputs['token'].setValue(jXMLdata.attr('token'));
        this.m_formInputs['screenName'].setValue(jXMLdata.attr('screenName'));
    }

    ngAfterViewInit() {
        this._render();
    }

    _onCreateToken() {
        var win = window.open('http://twitter.signage.me', '_blank');
        if (win) {
            win.focus();
        } else {
            bootbox.alert('Browser popups are blocked, please enable and try again');
        }
    }

    private saveToStore() {
        con(this.m_contGroup.status + ' ' + JSON.stringify(this.ngmslibService.cleanCharForXml(this.m_contGroup.value)));
        if (this.m_contGroup.status != 'VALID')
            return;
        var domPlayerData: XMLDocument = this.m_blockData.playerDataDom;
        var item = jXML(domPlayerData).find('Json').find('Data');
        jXML(item).attr('screenName', this.m_contGroup.value.screenName);
        jXML(item).attr('token', this.m_contGroup.value.token);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    destroy() {
    }
}
