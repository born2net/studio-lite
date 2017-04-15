import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {ResourcesNavigation} from "./resources-navigation";
import {DropdownModule as DropdownModulePrime} from "primeng/primeng";
import {SharedModule} from "../../modules/shared.module";
import {Orders} from "./orders";
import {ResourcePropsManager} from "./resource-props-manager";
import {Resources} from "./resources";
import {ResourcesList} from "./resources-list";

export const LAZY_ROUTES = [
    {path: ':folder', component: ResourcesNavigation},
    {path: ':folder/:id', component: ResourcesNavigation},
    {path: '**', component: ResourcesNavigation}
];

@NgModule({
    imports: [DropdownModulePrime, SharedModule, CommonModule, RouterModule.forChild(LAZY_ROUTES)],
    declarations: [ResourcesNavigation, Orders, ResourcePropsManager, Resources, ResourcesList]
})
export class ResourcesLazyModule {
}