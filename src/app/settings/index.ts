import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {SettingsNavigation} from "./settings-navigation";
import {DropdownModule as DropdownModulePrime} from "primeng/primeng";
import {SharedModule} from "../../modules/shared.module";
import {Twofactor} from "./twofactor";

export const LAZY_ROUTES = [
    {path: ':folder', component: SettingsNavigation},
    {path: ':folder/:id', component: SettingsNavigation},
    {path: '**', component: SettingsNavigation}
];

@NgModule({
    imports: [DropdownModulePrime, SharedModule, CommonModule, RouterModule.forChild(LAZY_ROUTES)],
    declarations: [SettingsNavigation, Twofactor]
})
export class SettingsLazyModule {
}