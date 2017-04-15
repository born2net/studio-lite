import {SimpleGridData} from "./SimpleGridData";
import {SimpleGridTable} from "./SimpleGridTable";
import {SimpleGridSortableHeader} from "./SimpleGridSortableHeader";
import {SimpleGridRecord} from "./SimpleGridRecord";
import {SimpleGridDataImage} from "./SimpleGridDataImage";
import {SimpleGridDataCurrency} from "./SimpleGridDataCurrency";
import {SimpleGridDataChecks} from "./SimpleGridDataChecks";
import {SimpleGridDataDropdown} from "./SimpleGridDataDropdown";
import {
    NgModule,
    ModuleWithProviders
} from "@angular/core";
import {CommonModule} from "@angular/common";
import {
    FormsModule,
    ReactiveFormsModule
} from "@angular/forms";
import {SimpleGridDraggable} from "./SimpleGridDraggable";
// import {StoreModel} from "../../models/StoreModel";


export const SIMPLEGRID_DIRECTIVES: Array<any> = [SimpleGridTable, SimpleGridSortableHeader, SimpleGridRecord, SimpleGridData, SimpleGridDataCurrency, SimpleGridDataImage, SimpleGridDataChecks, SimpleGridDataDropdown, SimpleGridDraggable];

export interface ISimpleGridEdit {
    value: string;
    item: any;
}

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    declarations: SIMPLEGRID_DIRECTIVES,
    exports: SIMPLEGRID_DIRECTIVES
})

// here we are loading the providers ONLY when this shared module is loaded by the app and not
// by a feature or lazy loaded module, this making sure we share a single instance of AuthService
export class SimpleGridModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SimpleGridModule,
            providers: []
        };
    }
}