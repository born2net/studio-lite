import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {ScenesNavigation} from "./scenes-navigation";
import {DropdownModule as DropdownModulePrime} from "primeng/primeng";
import {SharedModule} from "../../modules/shared.module";
import {ScenePropsManager} from "./scene-props-manager";
import {SceneList} from "./scene-list";
import {SceneManager} from "./scene-manager";
import {Scenes} from "./scenes";
import {SceneEditor} from "./scene-editor";
import {SceneToolbar} from "./scene-toolbar";
import {BlockPropPosition} from "../blocks/block-prop-position";
import {Ng2Bs3ModalModule} from "ng2-bs3-modal/ng2-bs3-modal";
import {SceneCreator} from "./scene-creator";

export const LAZY_ROUTES = [
    {path: ':folder', component: ScenesNavigation},
    {path: ':folder/:id', component: ScenesNavigation},
    {path: '**', component: ScenesNavigation}
];

@NgModule({
    imports: [DropdownModulePrime, SharedModule, CommonModule, Ng2Bs3ModalModule, RouterModule.forChild(LAZY_ROUTES)],
    declarations: [Scenes, SceneEditor, SceneCreator, SceneToolbar, ScenesNavigation, ScenePropsManager, SceneManager, SceneList, BlockPropPosition]
})
export class ScenesLazyModule {
}