import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {Observable} from "rxjs";

@Component({
    selector: 'campaign-duration',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>
        <span style="font-size: 1em" data-localize="campaignLength">campaign length:</span>
        <span id="timelinesTotalLength" style="font-size: 1em">{{m_duration$ | async | FormatSecondsPipe}} </span>
    `
})
export class CampaignDuration extends Compbaser implements AfterViewInit {

    m_duration$:Observable<number>;

    constructor(private yp: YellowPepperService, private cd:ChangeDetectorRef) {
        super();
    }

    ngAfterViewInit() {
        this.m_duration$ = this.yp.listenTimelineDurationChanged()
        this.cd.markForCheck()
    }

    ngOnInit() {
    }

    destroy() {
    }
}