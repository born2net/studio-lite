import {Component, ChangeDetectionStrategy} from "@angular/core";
import {Compbaser} from "../../app/compbaser/compbaser";

@Component({
    selector: 'AutoLogin',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<h5 style="padding-left: 10px"><span class="fa fa-key"></span>
                <span i18n>verifying access...</span>
                </h5>`
})
export class AutoLogin extends Compbaser {
}