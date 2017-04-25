import {ChangeDetectionStrategy, Component} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {BlockService} from "../blocks/block-service";
import {BlockFactoryService} from "../../services/block-factory-service";
import {PLACEMENT_SCENE} from "../../interfaces/Consts";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {AppdbAction, AuthenticateFlags} from "../../store/actions/appdb.actions";
import {YellowPepperService} from "../../services/yellowpepper.service";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[@routeAnimation]': 'true',
        '[style.display]': "'block'"
    },
    providers: [BlockService, BlockFactoryService, {
        provide: "BLOCK_PLACEMENT",
        useValue: PLACEMENT_SCENE
    }],
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
        <small class="debug">scene-navigation</small>
        <div *ngIf="(userModel$ | async).getAccountType() == m_AuthenticateFlags.USER_ACCOUNT_PRO; else fullAccess">
            <limited-access></limited-access>
        </div>
        <ng-template #fullAccess>
            <panel-split-container>
                <panel-split-main>
                    <scenes>
                    </scenes>
                </panel-split-main>
                <panel-split-side>
                    <scene-props-manager></scene-props-manager>
                </panel-split-side>
            </panel-split-container>
        </ng-template>
    `
})
export class ScenesNavigation extends Compbaser {
    userModel$;
    m_AuthenticateFlags = AuthenticateFlags;

    constructor(private yp: YellowPepperService) {
        super();
        this.userModel$ = this.yp.listenUserModel();
    }
}

