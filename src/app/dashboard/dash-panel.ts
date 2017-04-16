import {Component, ChangeDetectionStrategy, AfterViewInit} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";

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

        window['responsiveTwitterWidget'] = function () {
            var widget = $("#twitter-widget-0");
            var frame_style = widget.attr('style');
            widget.attr('style', frame_style + ' max-width:none !important; width:100%');
            if (widget) {
                var head = widget.contents().find("head");
                if (head.length) {
                    head.append('<style>.timeline { max-width: 100% !important; width: 100% !important; } .timeline .stream { max-width: none !important; width: 100% !important; }</style>');
                }
                widget.append($('<div class=timeline>'));
            }
        };

        var a = function (d: any, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
            if (!d.getElementById(id)) {
                js = d.createElement(s);
                js.id = id;
                js.src = p + "://platform.twitter.com/widgets.js";
                js.setAttribute('onload', "twttr.events.bind('rendered',function(e) {responsiveTwitterWidget()});");
                fjs.parentNode.insertBefore(js, fjs);
            }
        }(document, "script", "twitter-wjs");


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
