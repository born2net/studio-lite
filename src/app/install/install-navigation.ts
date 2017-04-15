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
    styles: [`
        .installopts li {
            height: 40px;
            min-height: 40px;
            overflow: hidden;
        }

        .installs {
            font-size: 22px !important;
            margin-right: 10px !important;
            color: #4a4a4a !important;
            opacity: 0.8 !important;
        }

        .installs:hover {
            opacity: 1 !important;
        }

    `],
    template: `
        <div id="installPanel">
            <h3 data-localize="installSignagePlayer">Install the Signage Player</h3>
            <h5 data-localize="chooseVersion">
                <b>Choose which version of the SignagePlayer you would like to get</b>
            </h5>
            <span style="padding-top: 20px; padding-right: 20px; margin-bottom: 20px" data-localize="recDevice">We recommend that you purchase our device as it is optimized for the signage software. It also has a built in watch-dog and the software comes pre-installed, so you will not need to download anything at all.</span><br/>
            <br/>

            <div>
                <div class="panel-group" id="accordion">
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            <h4 class="panel-title">
                                <a data-toggle="collapse" data-parent="#accordion" href="#collapseOne">
                                    <i class="installs fa fa-cubes"></i><span data-localize="playerPreInstall">SignagePlayer pre-installed</span></a>
                            </h4>
                        </div>
                        <div id="collapseOne" class="panel-collapse collapse in">
                            <div class="panel-body">
                                <ul class="installopts">
                                    <li>
                                        <b data-localize="step1">Step 1:</b><span data-localize="purchaseOne"> purchase one of our devices: </span>
                                        <button data-localize="orderNow" type="button" (click)="_openInNewTab('http://www.digitalsignage.com/_html/mediaplayer.html')" class="helpLinks btn btn-primary btn-xs">order now
                                        </button>
                                    </li>
                                    <li>
                                        <b data-localize="step2">Step 2:</b><span data-localize="regDevice"> register the device with your user </span>&nbsp;<span class="userName"></span>&nbsp;<span data-localize="andPass"> and password</span>&nbsp;
                                    </li>
                                    <li>
                                        <b data-localize="step3">Step 3:</b><span data-localize="remoteManage"> begin remote managing your device from the </span>&nbsp;<u data-localize="navStation"> Stations </u>&nbsp;<span data-localize="secApp"> section of this application</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            <h4 class="panel-title">
                                <a data-toggle="collapse" data-parent="#accordion" href="#collapseTwo">
                                    <i class="installs fa fa-android"></i><span data-localize="signageAndroid">SignagePlayer for Android</span></a>
                            </h4>
                        </div>
                        <div id="collapseTwo" class="panel-collapse collapse">
                            <div class="panel-body">
                                <ul class="installopts">
                                    <li>
                                        <b data-localize="step1">Step 1:</b><span data-localize="downloadAndroid"> download player from Google play store: </span>
                                        <button (click)="_openInNewTab('http://android.digitalsignage.com')" type="button" data-localize="download" class="helpLinks btn btn-primary btn-xs">download
                                        </button>
                                    </li>
                                    <li>
                                        <b data-localize="step2">Step 2:</b><span data-localize="regDevice"> register the device with your user </span>&nbsp;<span class="userName"></span>&nbsp;<span data-localize="andPass"> and password</span>&nbsp;
                                    </li>
                                    <li>
                                        <b data-localize="step3">Step 3:</b><span data-localize="remoteManage"> begin remote managing your device from the </span>&nbsp;<u data-localize="navStation"> Stations </u>&nbsp;<span data-localize="secApp"> section of this application</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            <h4 class="panel-title">
                                <a data-toggle="collapse" data-parent="#accordion" href="#collapseThree">
                                    <i class="installs fa fa-windows"></i><span data-localize="signageWindows">SignagePlayer for Windows</span></a>
                            </h4>
                        </div>
                        <div id="collapseThree" class="panel-collapse collapse">
                            <div class="panel-body">
                                <ul class="installopts">
                                    <li>
                                        <b data-localize="step1">Step 1:</b><span data-localize="downloadSignagePlayerExe"> download the SignagePlayer EXE app: </span>
                                        <button (click)="_openInNewTab('http://galaxy.signage.me/Code/install/exe/CloudSignagePlayerSetup.exe')" type="button" data-localize="download" class="helpLinks btn btn-primary btn-xs">
                                            download
                                        </button>
                                    </li>
                                    <li>
                                        <b data-localize="step2">Step 2:</b><span data-localize="regDevice"> register the device with your user </span>&nbsp;<span class="userName"></span>&nbsp;<span data-localize="andPass"> and password</span>&nbsp;
                                    </li>
                                    <li>
                                        <b data-localize="step3">Step 3:</b><span data-localize="remoteManage"> begin remote managing your device from the </span>&nbsp;<u data-localize="navStation"> Stations </u>&nbsp;<span data-localize="secApp"> section of this application</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            <h4 class="panel-title">
                                <a data-toggle="collapse" data-parent="#accordion" href="#collapseFour">
                                    <i class="installs fa fa-apple"></i><span data-localize="signageMac">SignagePlayer for Mac</span></a>
                            </h4>
                        </div>
                        <div id="collapseFour" class="panel-collapse collapse">
                            <div class="panel-body">
                                <ul class="installopts">
                                    <li>
                                        <b data-localize="step1">Step 1:</b><span data-localize="downloadAIR"> download Adobe AIR runtime: </span>
                                        <button type="button" (click)="_openInNewTab('http://get.adobe.com/air/')" data-localize="download" class="helpLinks btn btn-primary btn-xs">download
                                        </button>
                                    </li>
                                    <li>
                                        <b data-localize="step2">Step 2:</b><span data-localize="downloadSignagePlayer"> download the SignagePlayer AIR app: </span>
                                        <button (click)="_openInNewTab('http://galaxy.signage.me/Code/Install/air/CloudSignagePlayer.air')" type="button" data-localize="download" class="helpLinks btn btn-primary btn-xs">
                                            download
                                        </button>
                                    </li>
                                    <li>
                                        <b data-localize="step3">Step 3:</b><span data-localize="regDevice"> register the device with your user </span>&nbsp;<span class="userName"></span>&nbsp;<span data-localize="andPass"> and password</span>&nbsp;
                                    </li>
                                    <li>
                                        <b data-localize="step4">Step 4:</b><span data-localize="remoteManage"> begin remote managing your device from the </span>&nbsp;<u data-localize="navStation"> Stations </u>&nbsp;<span data-localize="secApp"> section of this application</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            <h4 class="panel-title">
                                <a data-toggle="collapse" data-parent="#accordion" href="#collapseFive">
                                    <i class="installs fa fa-apple"></i><span data-localize="signageIOS">SignagePlayer for iOS</span></a>
                            </h4>
                        </div>
                        <div id="collapseFive" class="panel-collapse collapse">
                            <div class="panel-body">
                                <ul class="installopts">
                                    <li>
                                        <b data-localize="step1">Step 1:</b><span data-localize="downloadIOS"> download player from the App store: </span>
                                        <button (click)="_openInNewTab('http://ios.digitalsignage.com')" type="button" data-localize="download" class="helpLinks btn btn-primary btn-xs">download
                                        </button>
                                    </li>
                                    <li>
                                        <b data-localize="step2">Step 2:</b><span data-localize="regDevice"> register the device with your user </span>&nbsp;<span class="userName"></span>&nbsp;<span data-localize="andPass"> and password</span>&nbsp;
                                    </li>
                                    <li>
                                        <b data-localize="step3">Step 3:</b><span data-localize="remoteManage"> begin remote managing your device from the </span>&nbsp;<u data-localize="navStation"> Stations </u>&nbsp;<span data-localize="secApp"> section of this application</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    `
})
export class InstallNavigation extends Compbaser {

    _openInNewTab(url, event?:MouseEvent) {
        if (event){
            event.stopImmediatePropagation();
            event.preventDefault();
        }
        var win = window.open(url, '_blank');
        win.focus();
    }

}

