import {ChangeDetectionStrategy, Component, ViewChild} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {RedPepperService} from "../../services/redpepper.service";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {Observable} from "rxjs/Observable";
import {UserModel} from "../../models/UserModel";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`

        .dottedHR {
            height: 6px;
            width: 1500px;
            opacity: 0.6;
            position: relative;
            border-top: 12px dotted #c1c1c1;
            padding-bottom: 7px;
            top: 20px;
        }

        .activated {
            background-color: #428bca;
            color: white;
        }

        .headerPropIcon {
            position: fixed !important;
            top: 0px !important;
            color: #f5f5f5;
            right: 50px !important;
            z-index: 1500;
            background-color: #151515;
            float: right;
            border: black;
        }

        .whiteFont {
            color: white;
        }

        .pricingContainer {
            padding-top: 40px;
        }

        .price {
            font-size: 25px;
            float: left;
        }

        .faHeader {
            font-size: 1.9em !important;
            color: #bababa;
        }

        .faHeader:hover {
            color: white;
        }

        .pricing_header1 {
            background: none repeat scroll 0% 0% rgb(0, 181, 255);
            border-radius: 5px 5px 0px 0px;
        }

        .pricing_header2 {
            background: none repeat scroll 0% 0% rgb(0, 121, 171);
            border-radius: 5px 5px 0px 0px;
        }

        .pricing_header3 {
            background: none repeat scroll 0% 0% rgb(0, 81, 115);
            border-radius: 5px 5px 0px 0px;
        }

        .pricing_headerh2 {
            text-align: center;
            line-height: 25px;
            padding: 15px 0px;
            margin: 0px;
            font-size: 1.5em;
            font-weight: 400;
            color: white;
        }

    `],
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
        <div id="proStudioPanel">
            <h3 data-localize="theRightPackage">Choose the package that's right for you</h3>
            <!-- price & service -->
            <div class="pricingContainer">
                <div class="row"></div>
                <br>

                <div id="pricingTableWrap" style="overflow-x: hidden; overflow-y: scroll; height: 100%">
                    <div class="col-md-4" id="home-box">
                        <div class="pricing_header1">
                            <h2 class="pricing_headerh2" data-localize="studioLiteFree">
                                <i class="fa fa-plus"></i>
                                StudioLite
                            </h2>

                            <div class="space"></div>
                        </div>
                        <ul class="list-group">
                            <li *ngIf="isBrandingDisabled | async" class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span>
                                <span data-localize="onehundredFree"> 100% FREE</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span>
                                <span data-localize="simpleInterface"> simple to use interface</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="campaignManager"> Campaign manager</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="timelineManagement"> Timeline management</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="screenTemplates"> Screen templates</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="screenEditor"> Screen editor</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="StationManager"> Station Manager</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="supportComponents"> Support 10 components</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="sceneEditor"> Scene editor (coming)</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="filesVIF"> Files: videos/images/flash</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="tabletsPhones"> Run on Tablets and phones</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="openSourceGitHub"> Open source (GitHub)</span>
                            </li>
                        </ul>
                        <div *ngIf="isBrandingDisabled | async" class="try">
                            <p class="price">$0.00</p>
                            <button class="pull-right btnPrice btn btn-default" disabled="disabled" href="#" type="button" data-localize="youAreHere">you are here
                            </button>
                        </div>
                    </div>
                    <div class="col-md-4" id="home-box">
                        <div class="pricing_header2">
                            <h2 class="pricing_headerh2" data-localize="studioProFree">
                                <i class="fa fa-desktop"></i>
                                StudioPro (FREE)
                            </h2>

                            <div class="space"></div>
                        </div>
                        <ul class="list-group">
                            <li *ngIf="isBrandingDisabled | async" class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="onehundredFree"> 100% FREE</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="higherLearningCurve"> Higher learning curve</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="professionalEditor"> Professional editor</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="campaignManager"> Campaign manager</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="timelineManagement"> Timeline management</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="channelManagement"> Channel management</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="schedulerSequencer"> Scheduler / sequencer</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="richSceneEditor"> Rich scene editor</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="supportMoreComponents"> Support more components</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="advanceStationManager"> Advance Station Manager</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="runDesktopWeb"> Runs on Desktop and Web</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="muchMore"> and much more...</span>
                            </li>
                        </ul>
                        <div *ngIf="isBrandingDisabled | async" class="try">
                            <p class="price">$0.00</p>
                            <a (click)="_onConvert($event)" id="convertAccount" class="pull-right btnPrice btn-primary btn btn-default" href="#" type="button" data-localize="convert">Convert</a>
                        </div>
                    </div>
                    <div class="col-md-4" id="home-box">
                        <div class="pricing_header3">
                            <h2 class="pricing_headerh2" data-localize="StudioEnterprise">
                                <i class="fa fa-cloud-upload"></i>
                                StudioEnterprise</h2>

                            <div class="space"></div>
                        </div>
                        <ul class="list-group">
                            <li *ngIf="isBrandingDisabled | async" class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="nintynine"> $99 a month (flat)</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="everythingFromLiteAndPro"> Everything from Lite & Pro</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="whiteLabel"> White label / branding</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="supportAllComponents"> Support all components</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="transitions"> Transitions / Effects</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="multiUserManagement"> Multi user management</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="advertisingManager"> Advertising manager</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="accessControl"> Access control</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="unlimitedCloudStorage"> Unlimited cloud storage</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="phoneSupport"> Phone support</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="hardwareDiscounts"> Hardware discounts</span>
                            </li>
                            <li class="list-group-item">
                                <span class="glyphicon glyphicon-ok"></span><span data-localize="muchMore"> and much more...</span>
                            </li>
                        </ul>
                        <div class="try">
                            <p *ngIf="isBrandingDisabled | async" class="price">$99/<span data-localize="month">month</span>
                            </p>
                            <button *ngIf="isBrandingDisabled | async" (click)="_onSubscribe($event)" id="subscribeAccount" class="pull-right showUpgradeModal btnPrice btn-primary btn btn-default" href="#" type="button" data-localize="subscribe"> Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <modal #modal>
            <modal-header [show-close]="true">
                <h4 i18n class="modal-title">Upgrade to Enterprise - $99.00 per month</h4>
            </modal-header>
            <modal-body>
                <pro-upgrade></pro-upgrade>
            </modal-body>
            <modal-footer [show-default-buttons]="false"></modal-footer>
        </modal>
    `
})
export class StudioProNavigation extends Compbaser {

    @ViewChild(ModalComponent)
    modal: ModalComponent;

    subAccount = false;
    isBrandingDisabled: Observable<boolean>

    constructor(private yp: YellowPepperService, private rp: RedPepperService) {
        super();
        this.isBrandingDisabled = this.yp.isBrandingDisabled()
    }

    _initCustomer() {
        if (this.rp.getUserData().resellerID == 1 || this.rp.getUserData().whiteLabel == false) {
            this.subAccount = false;
        } else {
            this.subAccount = true;
        }
    }

    _onConvert(event) {
        window.open('http://galaxy.mediasignage.com/WebService/signagestudio.aspx?mode=login&v=4&eri=f7bee07a7e79c8efdb961c4d30d20e10c66442110de03d6141', '_blank');
    }

    _onSubscribe(event) {
        this.modal.open();
    }

    ngOnInit() {
        this.preventRedirect(true);
        this._initCustomer();
    }

    destroy() {
    }
}