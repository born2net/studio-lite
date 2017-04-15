import {ChangeDetectionStrategy, Component} from "@angular/core";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {Compbaser} from "ng-mslib";
import {BlockService} from "../blocks/block-service";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[@routeAnimation]': 'true',
        '[style.display]': "'block'"
    },
    providers: [BlockService, {
        provide: "BLOCK_PLACEMENT",
        useValue: ''
    }
    ],
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
        <small class="debug">resource-navigation</small>
        <panel-split-container>
            <panel-split-main>
                <resources>
                </resources>
            </panel-split-main>
            <panel-split-side>
                <resource-props-manager></resource-props-manager>
            </panel-split-side>
        </panel-split-container>
    `,
})
export class ResourcesNavigation extends Compbaser {

    constructor() {
        super();
    }

    destroy() {
    }
}