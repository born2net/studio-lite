import {Component} from "@angular/core";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {RedPepperService} from "../../services/redpepper.service";
import * as _ from "lodash";
import {BoardTemplateViewersModel} from "../../store/imsdb.interfaces_auto";

@Component({
    selector: 'screen-layout-editor-props',
    //changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(input-blur)': '_saveToStore($event)'
    },
    styles: [`
        /*:host > > > .ui-spinner-input {*/
        /*width: 60px;*/
        /*}*/

        input {
            width: 70px;
        }

        .spinLabel {
            display: inline-block;
            width: 70px;
        }
    `],
    template: `
        <div>
            <form novalidate autocomplete="off" [formGroup]="contGroup">
                <div class="row">
                    <div class="inner userGeneral">
                        <div class="panel panel-default tallPanel">
                            <div class="panel-heading">
                                <small class="release">layout properties
                                    <i style="font-size: 1.4em" class="fa fa-cog pull-right"></i>
                                </small>
                                <small class="debug">{{me}}</small>
                            </div>
                            <ul class="list-group">
                                <li class="list-group-item">
                                    <div class="spinLabel">top:</div>
                                    <input (change)="_saveToStore()" type="number" class="numStepper" [formControl]="contGroup.controls['pixel_y']">
                                </li>
                                <li class="list-group-item">
                                    <div class="spinLabel">left:</div>
                                    <input (change)="_saveToStore()" type="number" class="numStepper" [formControl]="contGroup.controls['pixel_x']">
                                </li>
                                <li class="list-group-item">
                                    <div class="spinLabel">width:</div>
                                    <input (change)="_saveToStore()" type="number" type="number" class="numStepper" [formControl]="contGroup.controls['pixel_width']">
                                </li>
                                <li class="list-group-item">
                                    <div class="spinLabel">height:</div>
                                    <input (change)="_saveToStore()" type="number" class="numStepper" [formControl]="contGroup.controls['pixel_height']">
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    `

})
export class ScreenLayoutEditorProps extends Compbaser {

    private boardTemplateModel: BoardTemplateViewersModel;
    private formInputs = {};
    contGroup: FormGroup;

    constructor(private fb: FormBuilder, private yp: YellowPepperService, private rp: RedPepperService) {
        super();

        this.contGroup = fb.group({
            'pixel_height': [0],
            'pixel_width': [0],
            'pixel_x': [0],
            'pixel_y': [0]
        });
        _.forEach(this.contGroup.controls, (value, key: string) => {
            this.formInputs[key] = this.contGroup.controls[key] as FormControl;
        })
        this.cancelOnDestroy(
            this.yp.listenGlobalBoardSelectedChanged(true)
                .subscribe((boardTemplateModel: BoardTemplateViewersModel) => {
                    if (!boardTemplateModel) {
                        _.forEach(this.formInputs, (value, key: string) => {
                            this.formInputs[key].disable();
                            this.formInputs[key].setValue(0);
                        });
                        return;
                    }
                    _.forEach(this.formInputs, (value, key: string) => {
                        this.formInputs[key].enable();
                    });
                    this.boardTemplateModel = boardTemplateModel;
                    this.renderFormInputs();
                }, (e) => console.error(e))
        )
    }

    _saveToStore() {
        // console.log(this.contGroup.status + ' ' + JSON.stringify(this.contGroup.value));
        if (this.contGroup.status != 'VALID' || !this.boardTemplateModel)
            return;
        var props = {
            x: this.contGroup.value.pixel_x,
            y: this.contGroup.value.pixel_y,
            w: this.contGroup.value.pixel_width,
            h: this.contGroup.value.pixel_height
        }
        this.rp.setBoardTemplateViewer(-1, this.boardTemplateModel.getBoardTemplateViewerId(), props);
        this.rp.reduxCommit()
    }

    private renderFormInputs() {
        _.forEach(this.formInputs, (value, key: string) => {
            let data = this.boardTemplateModel.getKey(key);
            data = StringJS(data).booleanToNumber();
            this.formInputs[key].setValue(data)
        });
    };

    destroy() {
    }
}