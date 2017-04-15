import {Component} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {Observable} from "rxjs";
import {SideProps} from "../../store/actions/appdb.actions";
import {YellowPepperService} from "../../services/yellowpepper.service";

@Component({
    selector: 'campaign-props-manager',
    styles: [`
        ul {
            padding: 0
        }
    `],
    template: `
        <small class="debug">{{me}}</small>
        <ul id="campaignPropsManager" matchBodyHeight="50" style="overflow-y: auto; overflow-x: hidden" [ngSwitch]="m_uiUserFocusItem$ | async">
            <div *ngSwitchCase="m_uiUserFocusItemEnum.campaignProps">
                <campaign-props></campaign-props>
            </div>
            <div *ngSwitchCase="m_uiUserFocusItemEnum.miniDashboard">
                <dashboard-props></dashboard-props>
            </div>
            <!--<div *ngSwitchCase="m_uiUserFocusItemEnum.campaignBoard">-->
            <!--<h1>NOT USED</h1>-->
            <!--</div>-->
            <div *ngSwitchCase="m_uiUserFocusItemEnum.campaignEditor">
                <campaign-editor-props></campaign-editor-props>
            </div>
            <div *ngSwitchCase="m_uiUserFocusItemEnum.timeline">
                <timeline-props></timeline-props>
            </div>
            <div *ngSwitchCase="m_uiUserFocusItemEnum.channel">
                <channel-props></channel-props>
            </div>
            <div *ngSwitchCase="m_uiUserFocusItemEnum.screenLayoutEditor">
                <screen-layout-editor-props></screen-layout-editor-props>
            </div>
            <!--<div *ngSwitchCase="m_uiUserFocusItemEnum.sceneBlock">-->
            <!--<block-prop></block-prop>-->
            <!--</div>-->
            <div *ngSwitchCase="m_uiUserFocusItemEnum.channelBlock">
                <channel-block-props></channel-block-props>
            </div>
        </ul>
    `,
})
export class CampaignPropsManager extends Compbaser {

    constructor(private yp: YellowPepperService) {
        super();
        this.m_uiUserFocusItem$ = this.yp.ngrxStore.select(store => store.appDb.uiState.uiSideProps);
    }

    m_uiUserFocusItemEnum = SideProps;
    m_uiUserFocusItem$: Observable<SideProps>;

    ngOnInit() {
    }

    destroy() {
    }
}