import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {FasterqNavigation} from "./fasterq-navigation";
import {DropdownModule as DropdownModulePrime} from "primeng/primeng";
import {SharedModule} from "../../modules/shared.module";
import {Fasterq} from "./fasterq";
import {FasterqManager} from "./fasterq-manager";
import {FasterqEditor} from "./fasterq-editor";
import {FasterqLineProps} from "./fasterq-line-props";

export const LAZY_ROUTES = [
    {path: ':folder', component: FasterqNavigation},
    {path: ':folder/:id', component: FasterqNavigation},
    {path: '**', component: FasterqNavigation}
];

@NgModule({
    imports: [DropdownModulePrime, SharedModule, CommonModule, RouterModule.forChild(LAZY_ROUTES)],
    declarations: [FasterqNavigation, Fasterq, FasterqManager, FasterqEditor, FasterqLineProps]
})
export class FasterqLazyModule {
}