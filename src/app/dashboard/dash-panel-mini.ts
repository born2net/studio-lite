import {AfterViewInit, Component, VERSION} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {RedPepperService} from "../../services/redpepper.service";
import {Observable} from "rxjs/Observable";
import * as packageJson from "../../../package.json";

@Component({
    selector: 'dash-panel-mini',
    styles: [`
        a {
            font-size: 1.1em;
        }

        li {
            list-style-type: none;
        }

    `],
    templateUrl: './dash-panel-mini.html'
})
export class DashPanelMini extends Compbaser implements AfterViewInit {
    clock$;
    m_userModel$;
    offlineDevMode: any = window['offlineDevMode'];
    version = packageJson.version;
    isBrandingDisabled: boolean = false;
    ngVersion = VERSION.full;
    resellerName = 'MediasSignage Inc.';

    constructor(private yp: YellowPepperService, private rp: RedPepperService) {
        super();

        this.clock$ = Observable
            .interval(300)
            .startWith(1)
            .map(() => new Date());

        this.m_userModel$ = this.yp.listenUserModel();
        this.cancelOnDestroy(
            this.yp.isBrandingDisabled()
                .subscribe((v) => {
                    this.isBrandingDisabled = v;
                    if (!this.isBrandingDisabled)
                        this.resellerName = this.rp.getUserData().resellerName;
                }, (e) => console.error(e))
        )
    }

    ngAfterViewInit() {
    }

    destroy() {
    }
}
