import {Component, ChangeDetectionStrategy, AfterViewInit, Output, EventEmitter, Input, ChangeDetectorRef} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import * as _ from 'lodash';
import {PlayerDataModelExt} from "../../store/model/msdb-models-extended";
import {RedPepperService} from "../../services/redpepper.service";
import {timeout} from "../../decorators/timeout-decorator";

@Component({
    selector: 'scene-toolbar',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>
        <form novalidate autocomplete="off" class="inner5" [formGroup]="m_contGroup">
            <div id="sceneToolbar">
                <div class="btn-group">
                    <button (click)="_goBack()" type="button" title="back" class="openPropsButton btn btn-default btn-sm">
                        <span class="glyphicon glyphicon-chevron-left"></span>
                    </button>
                    <button (click)="onToolbarAction.emit('add')" type="button" title="add item" class="sceneAddNew btn btn-default btn-sm">
                        <i style="font-size: 1em" class="fa fa-plus"> </i>
                    </button>
                    <button (click)="onToolbarAction.emit('removeItem')" type="button" title="remove item" class="sceneRemoves btn btn-default btn-sm">
                        <i style="font-size: 1em" class="fa fa-minus"> </i>
                    </button>
                    <button (click)="onToolbarAction.emit('playPreview')" id="scenePlayPreview" type="button" title="play preview" class="btn btn-default btn-sm">
                        <i style="font-size: 1em" class="fa fa-play"> </i>
                    </button>
                    <button (click)="onToolbarAction.emit('pushItemToTopButtonToolTip')" id="sceneEditorPushTop" title="push item to top" class="btn btn-default btn-sm">
                        <i style="font-size: 1em" class="fa fa-angle-double-up"> </i>
                    </button>
                    <button (click)="onToolbarAction.emit('pushItemToBottomButtonToolTip')" id="sceneEditorPushBottom" title="push item to bottom" class="btn btn-default btn-sm">
                        <i style="font-size: 1em" class="fa fa-angle-double-down"> </i>
                    </button>
                    <button (click)="onToolbarAction.emit('sceneZoomIn')" id="sceneZoomIn" type="button" title="zoom in" class="btn btn-default btn-sm">
                        <i style="font-size: 1.3em" class="fa fa-search-plus"> </i>
                    </button>
                    <button (click)="onToolbarAction.emit('sceneZoomOut')" id="sceneZoomOut" type="button" title="zoom out" class="btn btn-default btn-sm">
                        <i style="font-size: 1.3em" class="fa fa-search-minus"> </i>
                    </button>
                    <button (click)="onToolbarAction.emit('sceneZoomReset')" id="sceneZoomReset" type="button" title="zoom reset" class="btn btn-default btn-sm">
                        <i style="font-size: 1.3em" class="fa fa-search"> </i>
                    </button>
                    <button (click)="onToolbarAction.emit('undo')" id="sceneUndo" type="button" title="undo" class="btn btn-default btn-sm">
                        <i style="font-size: 1.3em" class="fa fa-reply"> </i>
                    </button>
                    <button (click)="onToolbarAction.emit('redo')" id="sceneRedo" type="button" title="redo" class="btn btn-default btn-sm">
                        <i style="font-size: 1.3em" class="fa fa-share"> </i>
                    </button>
                    <button (click)="onToolbarAction.emit('magneticGrid')" id="sceneGridMagnet" type="button" title="magnetic grid" class="btn btn-default btn-sm">
                        <i style="font-size: 1.3em" class="fa fa-th-large"> </i>
                    </button>
                    <div class="input-group" style="margin-left: 0px; position: relative; top: -10px">
                        <select #sceneSelection style="height: 30px; max-width: 150px; width: 150px" (change)="_onBlockSelected($event)" formControlName="blocks">
                            <option [value]="block.id" *ngFor="let block of m_blocks">{{block.name}}</option>
                        </select>
                    </div>
                </div>
            </div>
        </form>

    `,
})
export class SceneToolbar extends Compbaser {

    m_formInputs = {};
    m_contGroup: FormGroup;
    m_blocks = [];

    constructor(private fb: FormBuilder, private cd: ChangeDetectorRef) {
        super();
        this.m_contGroup = fb.group({
            'blocks': []
        });
    }

    @Input()
    set blocks(i_blocks) {
        this.m_blocks = i_blocks;
    }

    @Output()
    onToolbarAction: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    onItemSelected: EventEmitter<string> = new EventEmitter<string>();

    @timeout(100)
    _goBack(){
        this.onToolbarAction.emit('back')
    }
    
    _onBlockSelected(event) {
        this.onItemSelected.emit(event.target.value);
    }

    ngOnInit() {
    }

    destroy() {
    }
}
