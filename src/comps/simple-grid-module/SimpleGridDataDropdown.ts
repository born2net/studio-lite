import {
    Component, Input, ChangeDetectionStrategy, Output, EventEmitter, ViewChildren, QueryList, HostListener
} from '@angular/core'
import {List} from "immutable";
import {StoreModel} from "../../models/StoreModel";

@Component({
    selector: 'td[simpleGridDataDropdown]',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
        i {
            cursor: pointer;
        }

        .select button {
            width: 100%;
            text-align: left;
        }

        .select .caret {
            position: absolute;
            right: 10px;
            margin-top: 10px;
        }

        .select:last-child > .btn {
            border-top-left-radius: 5px;
            border-bottom-left-radius: 5px;
        }

        .selected {
            padding-right: 10px;
        }

        .option {
            width: 100%;
        }
    `],
    template: `
        <div class="btn-group">
            <!--<select class="form-control longInput" [ngFormControl]="notesForm.controls['privileges']">-->
            <select (change)="onChanges($event)" class="form-control custom longInput">
                <option *ngFor="let dropItem of m_dropdown" [selected]="getSelected(dropItem)">{{dropItem.getKey(m_field)}}</option>
            </select>
        </div>
        <!--<div *ngFor="let item of m_checkboxes">-->
        <!--<label class="pull-left">{{item.name}}</label>-->
        <!--<Input #checkInputs type="checkbox" [checked]="item.checked" value="{{item.value}}" class="pull-left" style="margin-right: 2px">-->
        <!--</div>-->
    `
})
export class SimpleGridDataDropdown {

    m_dropdown: List<StoreModel>
    m_storeModel: StoreModel;
    m_field: string = '';
    value: string = '';
    m_testSelection: Function;

    @ViewChildren('checkInputs')
    inputs: QueryList<any>

    @Input()
    set dropdown(i_dropdown: List<any>) {
        this.m_dropdown = i_dropdown
    }

    @Input()
    set item(i_storeModel: StoreModel) {
        this.m_storeModel = i_storeModel
    }

    @Input()
    set field(i_field) {
        this.m_field = i_field;
    }

    @Input()
    set testSelection(i_testSelection: (dropItem: any, storeModel: StoreModel) => 'checked' | '') {
        this.m_testSelection = i_testSelection;
    }

    @Output()
    changed: EventEmitter<any> = new EventEmitter();

    onChanges(event) {
        this.changed.emit({item: this.m_storeModel, value: event.target.value});
    }

    private getSelected(i_dropItem): string {
        if (this.m_testSelection) {
            return this.m_testSelection(i_dropItem, this.m_storeModel);
        }
        return '';
    }
}

