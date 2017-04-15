import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {CampaignsNavigation} from "./campaigns-navigation";
import {DropdownModule, DropdownModule as DropdownModulePrime} from "primeng/primeng";
import {SharedModule} from "../../modules/shared.module";
import {Campaigns} from "./campaigns";
import {OrderListModule} from "primeng/components/orderlist/orderlist";
import {CampaignManager} from "./campaign-manager";
import {CampaignName} from "./campaign-name";
import {CampaignOrientation} from "./campaign-orientation";
import {CampaignLayout} from "./campaign-layout";
import {CampaignEditor} from "./campaign-editor";
import {CampaignResolution} from "./campaign-resolution";
import {CampaignList} from "./campaign-list";
import {Sequencer} from "./sequencer";
import {ScreenLayoutEditor} from "./screen-layout-editor";
import {ScreenLayoutEditorProps} from "./screen-layout-editor-props";
import {CampaignProps} from "./campaign-props";
import {TimelineProps} from "./timeline-props";
import {ChannelProps} from "./channel-props";
import {DashboardProps} from "./dashboard-props";
import {CampaignEditorProps} from "./campaign-editor-props";
import {CampaignSchedProps} from "./campaign-sched-props";
import {CampaignPropsManager} from "./campaign-props-manager";
import {CampaignChannels} from "./campaign-channels";
import {ChannelBlockProps} from "./channel-block-props";
import {CampaignDuration} from "./campaign-duration";
import {Ng2Bs3ModalModule} from "ng2-bs3-modal/ng2-bs3-modal";

export const LAZY_ROUTES = [
    {path: ':folder', component: CampaignsNavigation},
    {path: ':folder/:id', component: CampaignsNavigation},
    {path: '**', component: CampaignsNavigation}
];

@NgModule({
    imports: [DropdownModulePrime, SharedModule, CommonModule, DropdownModule, OrderListModule, Ng2Bs3ModalModule, RouterModule.forChild(LAZY_ROUTES)],
    declarations: [CampaignsNavigation, Campaigns, CampaignManager, CampaignName, CampaignOrientation, CampaignLayout,
        CampaignEditor, CampaignResolution, CampaignList, Sequencer, ScreenLayoutEditor, ScreenLayoutEditorProps, CampaignChannels, CampaignDuration,
        CampaignPropsManager, CampaignProps, TimelineProps, ChannelProps, DashboardProps, CampaignEditorProps, CampaignSchedProps, ChannelBlockProps]
})
export class CampaignsLazyModule {
}