import {Component, ChangeDetectionStrategy, AfterViewInit} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {FasterqLineModel} from "../../models/fasterq-line-model";
import {FormBuilder, FormGroup} from "@angular/forms";
import {SideProps} from "../../store/actions/appdb.actions";
import {Observable} from "rxjs/Observable";
import {EFFECT_RESET_FASTERQ_LINE, EFFECT_UPDATE_FASTERQ_LINE} from "../../store/effects/appdb.effects";
import * as _ from 'lodash';
import {FasterqQueueModel} from "../../models/fasterq-queue-model";
import {RedPepperService} from "../../services/redpepper.service";
import {Lib} from "../../Lib";

@Component({
    selector: 'fasterq-line-props',
    host: {
        '(input-blur)': 'saveToStore($event)'
    },
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
    `],
    template: `
        <small class="debug">{{me}}</small>
        <div [ngSwitch]="m_sideProps$ | async">
            <div *ngSwitchCase="m_sidePropsEnum.fasterqLineProps">
                <form novalidate autocomplete="off" [formGroup]="m_contGroup">
                    <div class="row">
                        <div class="inner userGeneral">
                            <ul class="list-group">
                                <!--<li class="list-group-item">-->
                                <!--<span i18n>line name: </span>-->
                                <!--{{m_selectedLine?.lineName}}-->
                                <!--</li>-->
                                <li class="list-group-item">
                                    <span i18n>selected line</span>
                                    <div class="input-group">
                                        <span class="input-group-addon"><i class="fa fa-paper-plane"></i></span>
                                        <input formControlName="line_name" required
                                               type="text" class="form-control" maxlength="50"
                                               placeholder="line name">
                                    </div>
                                </li>
                                <li class="list-group-item">
                                    <span i18n>reminder ahead of people</span>
                                    <div class="input-group">
                                        <span class="input-group-addon"><i class="fa fa-lightbulb-o"></i></span>
                                        <input max="100" min="1" formControlName="reminder" required
                                               type="number" class="form-control"
                                               placeholder="send reminder">
                                    </div>
                                </li>
                                <li class="list-group-item">
                                    <button (click)="_onOpenTerminal()" class="btn btn-primary inliner" i18n>open terminal</button>
                                </li>
                                <li class="list-group-item">
                                    <button (click)="_onResetLine()" class="btn btn-primary inliner" i18n>reset line</button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </form>
            </div>
            <div *ngSwitchCase="m_sidePropsEnum.miniDashboard">
                <h4>line dashboard</h4>
            </div>
            <div *ngSwitchCase="m_sidePropsEnum.fasterqQueueProps">
                <div class="inner">
                    <h4 i18n>Queue porperties</h4>
                    <ul class="list-group">
                        <li class="list-group-item">
                            <h5 i18n>selected customer: {{m_customer}}</h5>
                        </li>
                        <li class="list-group-item">
                            <h5 i18n>verification: {{m_verification}}</h5>
                        </li>
                        <li class="list-group-item">
                            <h5 i18n>called by: {{m_calledBy}}</h5>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    `,
})
export class FasterqLineProps extends Compbaser implements AfterViewInit {

    m_selectedLine: FasterqLineModel;
    m_selectedQueue: FasterqQueueModel;
    m_contGroup: FormGroup;
    m_sideProps$: Observable<SideProps>;
    m_sidePropsEnum = SideProps;
    m_customer = '';
    m_verification = '';
    m_calledBy: ''
    appBaseUrlServices

    constructor(private fb: FormBuilder, private yp: YellowPepperService, private rp: RedPepperService) {
        super();
        this.m_sideProps$ = this.yp.ngrxStore.select(store => store.appDb.uiState.uiSideProps);
        this.m_contGroup = fb.group({
            'line_name': [''],
            'reminder': [0]
        });

        this.cancelOnDestroy(
            this.yp.ngrxStore.select(store => store.appDb.appBaseUrlServices)
                .subscribe((i_appBaseUrlServices) => {
                    this.appBaseUrlServices = i_appBaseUrlServices;
                })
        )

        this.cancelOnDestroy(
            this.yp.listenFasterqLineSelected()
                .subscribe((i_lineSelected: FasterqLineModel) => {
                    this.m_selectedLine = i_lineSelected;
                    this.m_contGroup.controls.line_name.setValue(this.m_selectedLine.lineName)
                    this.m_contGroup.controls.reminder.setValue(this.m_selectedLine.reminder)
                }, (e) => console.error(e))
        )

        this.cancelOnDestroy(
            this.yp.listenFasterqQueueModelSelected()
                .subscribe((i_queueSelected: FasterqQueueModel) => {
                    this.m_selectedQueue = i_queueSelected;
                    this.m_customer = this.m_selectedQueue.serviceId;
                    this.m_verification = this.m_selectedQueue.verification == -1 ? 'print out' : this.m_selectedQueue.verification;
                    this.m_calledBy = (_.isNull(this.m_selectedQueue.calledBy) ? 'none' : this.m_selectedQueue.calledBy);
                }, (e) => console.error(e))
        )
    }

    saveToStore() {
        this.yp.ngrxStore.dispatch({
            type: EFFECT_UPDATE_FASTERQ_LINE,
            payload: {
                id: this.m_selectedLine.lineId,
                name: this.m_contGroup.controls.line_name.value,
                reminder: _.isNumber(this.m_contGroup.controls.reminder.value) ? this.m_contGroup.controls.reminder.value : 1
            }
        })
    }

    _onResetLine() {
        bootbox.prompt('are you sure you want to reset the counter? (enter YES)', (i_password) => {
            if (i_password != 'YES') return;
            this.yp.ngrxStore.dispatch({
                type: EFFECT_RESET_FASTERQ_LINE,
                payload: {
                    business_id: this.rp.getUserData().businessID,
                    line_id: this.m_selectedLine.lineId,
                    counter: 1
                }
            });
        });
    }

    /**
     Listen to open customer terminal
     @method _listenOpenCustomerTerminal
     **/
    _onOpenTerminal() {
        var data = {
            call_type: 'CUSTOMER_TERMINAL',
            business_id: this.rp.getUserData().businessID,
            line_id: this.m_selectedLine.lineId,
            line_name: this.m_selectedLine.lineName
        };
        var rc4v2 = new RC4V2();
        var rcData: any = rc4v2.encrypt(JSON.stringify(data), '8547963624824263');
        var url;
        if (Lib.DevMode()) {
            url = `http://localhost:4208/index.html?data=${rcData}`;
        } else {
            url = `${this.appBaseUrlServices}/studioweb/index.html?data=${rcData}`;
        }

        window.open(url, '_blank');
    }

    ngAfterViewInit() {
    }

    ngOnInit() {
    }

    destroy() {
    }
}
