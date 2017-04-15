import {AfterViewInit, ChangeDetectionStrategy, Component} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {ToastsManager} from "ng2-toastr";
import {timeout} from "../../decorators/timeout-decorator";

@Component({
    selector: 'Dashboard',
    changeDetection: ChangeDetectionStrategy.OnPush,
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
        <h2 i18n>account dashboard</h2>
        <dash-panel></dash-panel>
    `
})
export class Dashboard implements AfterViewInit {

    constructor(private toastr: ToastsManager) {
    }

    ngAfterViewInit(){
        this.clearToasts();
    }

    @timeout(1000)
    clearToasts(){
        this.toastr.clearAllToasts();
    }
}