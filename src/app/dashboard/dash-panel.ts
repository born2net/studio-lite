import {Component, ChangeDetectionStrategy, AfterViewInit} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";

@Component({
    selector: 'dash-panel',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './dash-panel.html'
})
export class DashPanel extends Compbaser implements AfterViewInit {
    options: Object;

    constructor(private yp: YellowPepperService) {
        super();
        this.options = {
            title: {text: 'simple chart'},
            series: [{
                data: [29.9, 71.5, 106.4, 129.2],
            }]
        };
    }

    ngAfterViewInit() {


    }

    ngOnInit() {
    }

    destroy() {
    }
}
