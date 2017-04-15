import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {SharedModule} from "../../modules/shared.module";
import {InstallNavigation} from "./install-navigation";

export const LAZY_ROUTES = [
    {path: ':folder', component: InstallNavigation},
    {path: ':folder/:id', component: InstallNavigation},
    {path: '**', component: InstallNavigation}
];

@NgModule({
    imports: [SharedModule, CommonModule, RouterModule.forChild(LAZY_ROUTES)],
    declarations: [InstallNavigation]
})
export class InstallLazyModule {
}