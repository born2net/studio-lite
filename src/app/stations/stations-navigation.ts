import {ChangeDetectionStrategy, Component} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {animate, state, style, transition, trigger} from "@angular/animations";
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
        <small class="debug">station-navigation</small>
        <panel-split-container>
            <panel-split-main>
                <stations>
                </stations>
            </panel-split-main>
            <panel-split-side>
                <stations-props-manager></stations-props-manager>
            </panel-split-side>
        </panel-split-container>
    `
})
export class StationsNavigation extends Compbaser {

    constructor() {
        super();
    }

    ngOnInit() {
    }

    destroy() {
    }
}