import {Component, ChangeDetectionStrategy, AfterViewInit} from "@angular/core";
import {Compbaser} from "ng-mslib";

@Component({
    selector: 'limited-access',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <h3>Limited access:</h3>
        <hr/>
        <div id="installPanel">
            <h4>You are login in to StudioLite with StudioPro credentials</h4>
            <h5>
                <b>This will result in limited functionality, please proceed to download StudioPro below...</b>
            </h5>
            <br/>
            <div>
                <div class="panel-group" id="accordion">
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            <h4 class="panel-title">
                                <a data-toggle="collapse" data-parent="#accordion" href="#collapseThree">
                                    <i class="installs fa fa-windows"></i><span data-localize="signageWindows">StudioPro for Windows</span></a>
                            </h4>
                        </div>
                        <div id="collapseThree" class="panel-collapse collapse">
                            <div class="panel-body">
                                <ul class="installopts">
                                    <li style="padding-top: 10px">
                                        <a href="http://galaxy.signage.me/code/install/exe/CloudSignageStudioSetup.exe" class="helpLinks btn btn-primary btn-xl">download now </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            <h4 class="panel-title">
                                <a data-toggle="collapse" data-parent="#accordion" href="#collapseFour">
                                    <i class="installs fa fa-apple"></i><span data-localize="signageMac">StudioPro for Mac</span></a>
                            </h4>
                        </div>
                        <div id="collapseFour" class="panel-collapse collapse">
                            <div class="panel-body">
                                <ul class="installopts">
                                    <li>
                                        <b data-localize="step1">Step 1:</b><span data-localize="downloadAIR"> download Adobe AIR runtime</span>
                                        <a href="http://get.adobe.com/air/" target="_blank" class="helpLinks btn btn-primary btn-xs">download</a>
                                    </li>
                                    <li>
                                        <b data-localize="step2">Step 2:</b><span data-localize="downloadSignagePlayer"> download StudioPro for Mac</span>
                                        <a target="_blank" href="http://galaxy.signage.me/Code/Install/air/CloudSignageStudio.air" type="button" class="helpLinks btn btn-primary btn-xs">
                                            download
                                        </a>
                                    </li>
                                    <li>
                                        <b data-localize="step3">Step 3:</b>
                                        Install the runtime and proceed with installing StudioPro for Mac
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})

export class LimitedAccess {


}
