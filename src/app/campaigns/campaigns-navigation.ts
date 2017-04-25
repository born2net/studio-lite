import {ChangeDetectionStrategy, Component} from "@angular/core";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {Compbaser} from "ng-mslib";
import {BlockService} from "../blocks/block-service";
import {AppdbAction, AuthenticateFlags} from "../../store/actions/appdb.actions";
import {PLACEMENT_CHANNEL} from "../../interfaces/Consts";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {UserModel} from "../../models/UserModel";


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // new animation, can't add due to aot limitation and angular language service bug
    // host: {
    //     '[@routerTransition]': '',
    //     '[style.display]': "'block'"
    // },
    // animations: [routerTransition()],
    providers: [BlockService, {
        provide: "BLOCK_PLACEMENT",
        useValue: PLACEMENT_CHANNEL
    }],
    host: {
        '[@routeAnimation]': 'true',
        '[style.display]': "'block'"
    },
    animations: [
        trigger('routeAnimation', [
            state('*', style({opacity: 1})),
            transition('void => *', [
                style({opacity: 0}),
                animate(333)
            ]),
            transition('* => void', animate(333, style({opacity: 0})))
        ])
    ],

    template: `
        <small class="debug">campaigns-navigation</small>
        <div *ngIf="(userModel$ | async).getAccountType() == m_AuthenticateFlags.USER_ACCOUNT_PRO; else fullAccess">
            <limited-access></limited-access>            
        </div>
        <ng-template #fullAccess>
            <panel-split-container>
                <panel-split-main>
                    <campaigns>
                    </campaigns>
                </panel-split-main>
                <panel-split-side>
                    <campaign-props-manager></campaign-props-manager>
                </panel-split-side>
            </panel-split-container>    
        </ng-template>
        
    `
})
export class CampaignsNavigation extends Compbaser {
    userModel$;
    m_AuthenticateFlags = AuthenticateFlags;
    constructor(private actions: AppdbAction, private yp: YellowPepperService) {
        super();
        this.userModel$ = this.yp.listenUserModel();
    }

    destroy() {
        this.actions.resetCampaignSelection();
    }
}

