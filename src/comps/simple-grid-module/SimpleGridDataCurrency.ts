import {Component, Input, ChangeDetectionStrategy, Output, EventEmitter} from '@angular/core'
import {StoreModel} from "../../models/StoreModel";
import {ISimpleGridEdit} from "./SimpleGrid";

@Component({
    selector: 'td[simpleGridDataCurrency]',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
        label {
            padding: 0;
            margin: 0;
        }
    `],
    template: `
         <label>{{value | currency:'USD':true}}</label>         
    `
})
export class SimpleGridDataCurrency {
    value:string = '';
    storeModel:StoreModel;

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
}

