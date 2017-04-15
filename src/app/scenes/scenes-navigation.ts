import {ChangeDetectionStrategy, Component} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {BlockService} from "../blocks/block-service";
import {BlockFactoryService} from "../../services/block-factory-service";
import {PLACEMENT_SCENE} from "../../interfaces/Consts";
import {animate, state, style, transition, trigger} from "@angular/animations";

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
        <panel-split-container>
            <panel-split-main>
                <scenes>
                </scenes>
            </panel-split-main>
            <panel-split-side>
                <scene-props-manager></scene-props-manager>
            </panel-split-side>
        </panel-split-container>
    `
})
export class ScenesNavigation extends Compbaser {
}

