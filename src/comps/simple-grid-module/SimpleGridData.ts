import {Component, Input, ChangeDetectionStrategy, Output, EventEmitter} from '@angular/core'
import {StoreModel} from "../../models/StoreModel";
import {ISimpleGridEdit} from "./SimpleGrid";
import {timeout} from "../../decorators/timeout-decorator";

@Component({
    selector: 'td[simpleGridData]',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
        label {
            padding: 0;
            margin: 0;
        }
        .editableLabel {
            cursor: pointer;
        }
        input {
            padding: 0;
            margin: 0;
        }
        a {
            cursor: pointer;
        }
    `],
    template: `
         <label [ngClass]="{editableLabel: _editable}" *ngIf="!_editing" (click)="onEdit(true)">{{value}}</label>
         <span *ngIf="_editing">
            <input [value]="value" [(ngModel)]="value"/>
                <a (click)="onEdit(false)" class="fa fa-check"></a>
         </span>
         
         <!--<img src="{{ item.iconPath }}" style="width: 40px; height: 40px"/>-->
         <!--&lt;!&ndash; <td [innerHtml]="item.day"></td> &ndash;&gt;-->
    `
})
export class SimpleGridData {
    value:string = '';
    private storeModel:StoreModel;
    private _editable:boolean|string = false;
    _editing:boolean = false;

    @Input()
    set item(i_storeModel:StoreModel) {
        this.storeModel = i_storeModel
    }

    @Input()
    set field(i_field) {
        this.value = this.storeModel.getKey(i_field)
    }

    @Input()
    set processField(i_processField:(storeModel:StoreModel)=>string) {
        this.value = i_processField(this.storeModel)
    }

    @Input()
    set editable(i_editable) {
        this._editable = i_editable;
    }

    @Output()
    labelEdited:EventEmitter<any> = new EventEmitter();

    onEdit(isEditing:boolean) {
        if (this._editable == false || this._editable == 'false')
            return;
        this._editing = isEditing;
        if (this._editing)
            return;
        // done editing, so notify
        var payload:ISimpleGridEdit = {
            value: this.value,
            item: this.storeModel
        }
        this.labelEdited.emit(payload);

    }
}

