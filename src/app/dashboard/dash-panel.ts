import {Component, ChangeDetectionStrategy, AfterViewInit} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {timeout} from "../../decorators/timeout-decorator";

@Component({
    selector: 'dash-panel',
    styles: [`
        .twitter-timeline {
            width: 100% !important;
        }

        iframe {
            width: 100% !important;
        }
    `],
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
        var twitter = function (d: any, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
            // if (!d.getElementById(id)) {
            js = d.createElement(s);
            js.id = id;
            js.src = p + "://platform.twitter.com/widgets.js";
            js.setAttribute('onload', "twttr.events.bind('rendered',function(e) {});");
            fjs.parentNode.insertBefore(js, fjs);
            // }
        }(document, "script", "twitter-wjs");
        this.setTwitterWidth();

    }

    @timeout(500)
    setTwitterWidth() {
        jQuery('.twitter-timeline').css({width: '100%'});

    }

    destroy() {
    }
}
