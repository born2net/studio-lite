import {Component, Input, ChangeDetectionStrategy} from "@angular/core";
import {FormControl, FormGroup, FormBuilder} from "@angular/forms";
import {Compbaser, NgmslibService} from "ng-mslib";
import {CampaignsModelExt} from "../../store/model/msdb-models-extended";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {RedPepperService} from "../../services/redpepper.service";
import {timeout} from "../../decorators/timeout-decorator";
import * as _ from "lodash";
import {Observable} from "rxjs";
import {UserModel} from "../../models/UserModel";

@Component({
    selector: 'dashboard-props',
    host: {
        '(input-blur)': 'onFormChange($event)'
    },
    template: `
        <div>
            <h3>Mini Dashboard</h3>
            <div>
                <chart style="position: relative; left: -150px" [options]="options"></chart>
                <h4>user name: {{(userModel$ | async)?.getUser() }}</h4>
                <h4>account type: {{(userModel$ | async)?.getAccountType()}}</h4>
            </div>
        </div>
    `

})
export class DashboardProps extends Compbaser {

    options: Object;
    public userModel$: Observable<UserModel>;

    constructor(private yp: YellowPepperService) {
        super();
        this.userModel$ = this.yp.ngrxStore.select(store => store.appDb.userModel);
        this.options = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie',
                height: '250'
            },
            title : { text : 'simple chart' },
            series: [{
                data: [29.9, 71.5, 106.4, 129.2],
            }]
        };
    }

    destroy() {
    }
}
