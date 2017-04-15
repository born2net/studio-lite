import {ChangeDetectorRef, Component} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Compbaser, NgmslibService} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {RedPepperService} from "../../services/redpepper.service";
import {timeout} from "../../decorators/timeout-decorator";
import * as _ from "lodash";
import {CampaignTimelinesModel} from "../../store/imsdb.interfaces_auto";
import {Observable} from "rxjs";
import {CampaignsModelExt} from "../../store/model/msdb-models-extended";
import {simpleRegExp} from "../../Lib";

@Component({
    selector: 'timeline-props',
    host: {
        '(input-blur)': 'onFormChange($event)'
    },
    template: `
        <div>
            <form novalidate autocomplete="off" [formGroup]="m_contGroup">
                <div class="row">
                    <div class="inner userGeneral">
                        <div class="panel panel-default tallPanel">
                            <div class="panel-heading">
                                <small class="release">timeline properties
                                    <i style="font-size: 1.4em" class="fa fa-cog pull-right"></i>
                                </small>
                                <small class="debug">{{me}}</small>
                            </div>
                            <ul class="list-group">
                                <li class="list-group-item">
                                    <div *ngIf="(m_campaignModel$ | async)?.getCampaignPlaylistMode() == '1'">
                                        <h4><i class="fa fa-calendar"></i>playback mode: scheduler</h4>
                                    </div>
                                    <div *ngIf="(m_campaignModel$ | async)?.getCampaignPlaylistMode() == '0'">
                                        <h4><i class="fa fa fa-repeat"></i>playback mode: sequencer</h4>
                                    </div>
                                </li>
                                <li *ngIf="(m_campaignModel$ | async)?.getCampaignPlaylistMode() == '0'" class="list-group-item">
                                    <h4>timeline length: {{m_duration}}</h4>
                                </li>
                                <li class="list-group-item">
                                    <div class="input-group">
                                        <span class="input-group-addon"><i class="fa fa-paper-plane"></i></span>
                                        <input [formControl]="m_contGroup.controls['timeline_name']" required
                                               type="text" class="form-control" maxlength="50"
                                               placeholder="timeline name">
                                    </div>
                                    <br/>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div *ngIf="(m_campaignModel$ | async)?.getCampaignPlaylistMode() == '1'">
            <campaign-sched-props></campaign-sched-props>
        </div>
    `,
    styles: [`
        input.ng-invalid {
            border-right: 10px solid red;
        }

        .material-switch {
            position: relative;
            padding-top: 10px;
        }

        .input-group {
            padding-top: 10px;
        }

        i {
            width: 20px;
        }
    `]
})
export class TimelineProps extends Compbaser {

    private timelineModel: CampaignTimelinesModel;
    private formInputs = {};
    m_duration: string = '00:00:00'
    m_contGroup: FormGroup;
    m_campaignModel$: Observable<CampaignsModelExt>;

    constructor(private fb: FormBuilder, private ngmslibService: NgmslibService, private yp: YellowPepperService, private rp: RedPepperService, private cd: ChangeDetectorRef) {
        super();
        this.m_contGroup = fb.group({
            'timeline_name': ['', [Validators.required, Validators.pattern(simpleRegExp)]],
        });
        _.forEach(this.m_contGroup.controls, (value, key: string) => {
            this.formInputs[key] = this.m_contGroup.controls[key] as FormControl;
        })
        this.m_campaignModel$ = this.yp.listenCampaignValueChanged()

        this.cancelOnDestroy(
            this.yp.listenTimelineSelected()
                .subscribe((i_timelineModel: CampaignTimelinesModel) => {
                    this.timelineModel = i_timelineModel;
                    var totalDuration = parseInt(i_timelineModel.getTimelineDuration())
                    var xdate = new XDate();
                    this.m_duration = xdate.clearTime().addSeconds(totalDuration).toString('HH:mm:ss');
                    this.renderFormInputs();
                    this.cd.markForCheck();
                }, (e) => console.error(e))
        );

    }

    private onFormChange(event) {
        this.updateSore();
    }

    @timeout()
    private updateSore() {
        // con(this.m_contGroup.status + ' ' + JSON.stringify(this.ngmslibService.cleanCharForXml(this.m_contGroup.value)));
        this.rp.setCampaignTimelineRecord(this.timelineModel.getCampaignTimelineId(), 'timeline_name', this.m_contGroup.value.timeline_name);
        this.rp.reduxCommit()
    }

    private renderFormInputs() {
        if (!this.timelineModel)
            return;
        _.forEach(this.formInputs, (value, key: string) => {
            let data = this.timelineModel.getKey(key);
            data = StringJS(data).booleanToNumber();
            this.formInputs[key].setValue(data)
        });
    };

    destroy() {
    }
}
