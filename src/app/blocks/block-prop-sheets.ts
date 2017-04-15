import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {BlockService, IBlockData} from "./block-service";
import {Compbaser, NgmslibService} from "ng-mslib";
import * as _ from "lodash";
import * as moment from 'moment'

@Component({
    selector: 'block-prop-sheets',
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
                            <span i18n>token</span><br/>
                            <input class="default-prop-width" (blur)="_getGoogleSheets()" type="text" [formControl]="m_contGroup.controls['token']"/>
                        </li>
                        <li class="list-group-item">
                            <button i18n class="btn btn-default default-prop-width" (click)="_onCreateToken()">create token</button>
                        </li>
                        <li class="list-group-item">
                            <span i18n>Load with sheet</span>
                            <div class="input-group">
                                <span class="input-group-addon"><i class="fa fa-paper-plane"></i></span>
                                <select #sceneSelection (change)="_onSheetSelected($event)" style="height: 30px; width: 234px" formControlName="sheetSelection">
                                    <option [value]="cal.id" *ngFor="let cal of m_sheetList">{{cal.label}}</option>
                                </select>

                            </div>
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

export class BlockPropSheets extends Compbaser implements AfterViewInit {
    m_formInputs = {};
    m_contGroup: FormGroup;
    m_blockData: IBlockData;
    m_sheetList = [];
    m_sheetSeleced: any = {};
    m_mode = false;

    constructor(private fb: FormBuilder, private cd: ChangeDetectorRef, private bs: BlockService, private ngmslibService: NgmslibService) {
        super();
        this.m_contGroup = fb.group({
            'token': [''],
            'sheetSelection': ['']
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

    _onSheetSelected(event) {
        var calId = event.target.value;
        var domPlayerData: XMLDocument = this.m_blockData.playerDataDom;
        var item = jXML(domPlayerData).find('Json').find('Data');
        jXML(item).attr('id', calId);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    private _render() {
        var domPlayerData: XMLDocument = this.m_blockData.playerDataDom
        var jXMLdata = jXML(domPlayerData).find('Json').find('Data');
        var mode = jXMLdata.attr('mode');
        this.m_formInputs['token'].setValue(jXMLdata.attr('token'));
        this._getGoogleSheets();
    }

    _getGoogleSheets() {
        var self = this;
        try {
            jXML.ajax({
                url: `https://secure.digitalsignage.com/GoogleSheetsList/${self.m_contGroup.value.token}`,
                dataType: "json",
                type: "post",
                complete: function (response, status) {
                    self.m_sheetSeleced = {};
                    self.m_sheetList = [];
                    if (_.isUndefined(response.responseText) || response.responseText.length == 0)
                        return;
                    var jData = JSON.parse(response.responseText);
                    _.forEach(jData, function (k: any) {
                        self.m_sheetList.push({
                            id: k.id,
                            label: k.title,
                            mimeType: k.mimeType
                        })
                    });
                    var id = self._getFileId();
                    if (id && id.length > 10)
                        self.m_sheetSeleced = self.m_sheetList.find(item => item.id == id);
                    self.m_formInputs['sheetSelection'].setValue(self.m_sheetSeleced.id);
                    self.cd.markForCheck()
                },
                error: function (jqXHR, exception) {
                    console.log('ajax req:' + jqXHR, exception);
                }
            });
        } catch (e) {
            console.error('error on ajax' + e);
        }
    }

    private _getFileId(): string {
        var domPlayerData: XMLDocument = this.m_blockData.playerDataDom;
        var item = jXML(domPlayerData).find('Json').find('Data');
        return jXML(item).attr('id');
    }

    ngAfterViewInit() {
        this._render();
    }

    _onCreateToken() {
        var win = window.open('http://google.signage.me', '_blank');
        if (win) {
            win.focus();
        } else {
            bootbox.alert('Browser popups are blocked, please enable and try again');
        }
    }

    private saveToStore() {
        // Lib.Con(this.m_contGroup.status + ' ' + JSON.stringify(this.ngmslibService.cleanCharForXml(this.m_contGroup.value)));
        if (this.m_contGroup.status != 'VALID')
            return;
        var domPlayerData: XMLDocument = this.m_blockData.playerDataDom;
        var item = jXML(domPlayerData).find('Json').find('Data');
        jXML(item).attr('token', this.m_contGroup.value.token);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    destroy() {
    }
}
