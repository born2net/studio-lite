import {AfterViewInit, Component} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {RedPepperService} from "../../services/redpepper.service";
import {Observable} from "rxjs/Observable";

@Component({
    selector: 'dash-panel-mini',
    styles: [`
        a  {
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
    m_scenes$;
    m_campaigns$;
    m_resources$;
    m_lines$;
    m_timelines$;
    isBrandingDisabled: Observable<boolean>;

    constructor(private yp: YellowPepperService, private rp: RedPepperService) {
        super();

        this.clock$ = Observable
            .interval(300)
            .startWith(1)
            .map(()=> new Date());

        this.m_userModel$ = this.yp.listenUserModel();
        this.isBrandingDisabled = this.yp.isBrandingDisabled();
    }

    ngAfterViewInit() {
    }

    destroy() {
    }
}
