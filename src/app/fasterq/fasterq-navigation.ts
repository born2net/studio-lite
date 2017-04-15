import {ChangeDetectionStrategy, Component} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[@routeAnimation]': 'true',
        '[style.display]': "'block'"
    },
    providers: [],
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
                <fasterq></fasterq>
            </panel-split-main>
            <panel-split-side>
                <fasterq-line-props></fasterq-line-props>
            </panel-split-side>
        </panel-split-container>
    `
})

export class FasterqNavigation extends Compbaser {
}

