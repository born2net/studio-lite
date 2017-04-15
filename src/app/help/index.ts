import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {HelpNavigation} from "./help-navigation";
import {DropdownModule as DropdownModulePrime} from "primeng/primeng";
import {SharedModule} from "../../modules/shared.module";

export const LAZY_ROUTES = [
    {path: ':folder', component: HelpNavigation},
    {path: ':folder/:id', component: HelpNavigation},
    {path: '**', component: HelpNavigation}
];

@NgModule({
    imports: [DropdownModulePrime, SharedModule, CommonModule, RouterModule.forChild(LAZY_ROUTES)],
    declarations: [HelpNavigation]
})
export class HelpLazyModule {
}