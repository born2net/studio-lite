import {AfterViewInit, ChangeDetectorRef, Component, ElementRef} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {FasterqQueueModel} from "../../models/fasterq-queue-model";
import {FasterqLineModel} from "../../models/fasterq-line-model";
import {FasterqAnalyticsModel} from "../../models/fasterq-analytics";
import {RedPepperService} from "../../services/redpepper.service";
import {EFFECT_LOAD_FASTERQ_ANALYTICS, EFFECT_LOAD_FASTERQ_QUEUES, EFFECT_QUEUE_CALL_SAVE, EFFECT_QUEUE_POLL_SERVICE, EFFECT_QUEUE_SERVICE_SAVE} from "../../store/effects/appdb.effects";
import {CommBroker} from "../../services/CommBroker";
import {FASTERQ_QUEUE_CALL_CANCLED} from "../../interfaces/Consts";
import {IUiState} from "../../store/store.data";
import {ACTION_UISTATE_UPDATE, SideProps} from "../../store/actions/appdb.actions";
import {List} from "immutable";
import {Lib} from "../../Lib";
import * as _ from "lodash";
import {timeout} from "../../decorators/timeout-decorator";

export interface IQueueSave {
    queue_id: number;
    queue: FasterqQueueModel;
    serviced?: string;
    called?: string;
    called_by?: string;
    called_by_override?: boolean;
}

@Component({
    selector: 'fasterq-editor',
    styles: [`
        .personInLine {
            margin: 10px;
            padding: 0;
            float: left;
            width: 40px;
            height: 100px;
            cursor: pointer;
            color: #D0D0D0;
        }

        .called {
            color: #BE6734;
        }

        .serviced {
            color: #ACFD89;
        }
    `],
    templateUrl: './fasterq-editor.html'
})
export class FasterqEditor extends Compbaser {

    QUEUE_OFFSET = 8;
    m_gotoModel = 0;
    m_stopWatchHandle: any = new Stopwatch();
    m_stopTimer = '00:00:00';
    m_fasterqLineModel: FasterqLineModel;
    m_selectedServiceId = -1;
    m_queues: List<FasterqQueueModel> = List([]);
    m_analytics: List<FasterqAnalyticsModel> = List([]);
    m_offsetPosition = 0;
    m_avgServiceTimeCalc: any = '00:00:00';
    m_avgCalledTimeCalc: any = '00:00:00';
    m_lastCalled: any = 0;
    m_nowServicing: any = 0;
    m_totalToBeServiced = 0;
    m_fqLastServiced = '';
    m_liveUpdateHandler;
    appBaseUrlServices;

    constructor(private yp: YellowPepperService, private rp: RedPepperService, private commBroker: CommBroker, private el: ElementRef, private cd: ChangeDetectorRef) {
        super();
        this._pollServices();

        this.cancelOnDestroy(
            this.yp.ngrxStore.select(store => store.appDb.appBaseUrlServices)
                .subscribe((i_appBaseUrlServices) => {
                    this.appBaseUrlServices = i_appBaseUrlServices;
                })
        )

        this.cancelOnDestroy(
            this.commBroker.onEvent(FASTERQ_QUEUE_CALL_CANCLED)
                .subscribe((data: any) => {
                    bootbox.confirm('Customer already called by user' + data.message.called_by + ' <br/><br/>Would you like to call the customer again?', (result) => {
                        if (result) {
                            data.message['called_by_override'] = true;
                            this.yp.ngrxStore.dispatch({type: EFFECT_QUEUE_CALL_SAVE, payload: data.message})
                        }
                    });
                }, (e) => console.error(e))
        )

        this.cancelOnDestroy(
            this.yp.listenFasterqQueueLastServicedPolled()
                .subscribe((i_fasterqNowServicing) => {
                    this.m_nowServicing = i_fasterqNowServicing;
                    this.cd.markForCheck();
                }, (e) => console.error(e))
        )

        this.cancelOnDestroy(
            this.yp.listenFasterqQueueSelected()
                .subscribe((i_serviceId) => {
                    this.m_selectedServiceId = i_serviceId
                    this.cd.markForCheck();
                }, (e) => console.error(e))
        )

        this.cancelOnDestroy(
            this.yp.listenFasterqLineSelected()
                .subscribe((i_fasterqLineModel) => {
                    this.m_fasterqLineModel = i_fasterqLineModel;
                    this.cd.markForCheck();
                }, (e) => console.error(e))
        )

        this.cancelOnDestroy(
            this.yp.listenFasterqQueues()
                .subscribe((i_queues: List<FasterqQueueModel>) => {
                    this.m_queues = List([]);
                    for (var i = (0 - this.QUEUE_OFFSET); i < 0; i++) {
                        i_queues = i_queues.unshift(new FasterqQueueModel({line_id: -1}))
                    }
                    this.m_queues = i_queues;
                    this._selectFirst();
                    this.cd.markForCheck();
                }, (e) => console.error(e))
        )

        this.cancelOnDestroy(
            this.yp.listenFasterqAnalytics()
                .subscribe((i_analytics: List<FasterqAnalyticsModel>) => {
                    this.m_analytics = i_analytics;
                    this._calcAverages();
                    this.cd.markForCheck();
                }, (e) => console.error(e))
        )

        this._selectFirst();
    }

    _openRemoteStatus() {
        window.open(this._buildURL(), "_blank", "toolbar=yes, scrollbars=yes, resizable=yes, top=10, left=10, width=400, height=400");
    }

    /**
     Create URL string to load customer terminal UI for FasterQ queue generation
     @method _buildURL
     @return {String} URL
     **/
    _buildURL() {
        var data = {
            line_id: this.m_fasterqLineModel.lineId,
            business_id: this.m_fasterqLineModel.businessId,
            call_type: 'QR'
        };
        data = $.base64.encode(JSON.stringify(data));
        return `${this.appBaseUrlServices}/studioweb/index.html?mode=remoteStatus&param=${data}`;
    }

    @timeout(1000)
    _selectFirst() {
        if (this.m_queues.size != this.QUEUE_OFFSET + 1)
            return;
        this.m_selectedServiceId = this.m_queues.get(this.QUEUE_OFFSET).serviceId;
        this._onQueueSelected(this.m_queues.get(this.QUEUE_OFFSET));
    }

    _pollServices() {
        this.m_liveUpdateHandler = setInterval(() => {
            this.yp.ngrxStore.dispatch({type: EFFECT_QUEUE_POLL_SERVICE, payload: {business_id: this.rp.getUserData().businessID, line_id: this.m_fasterqLineModel.lineId}})
            this.yp.ngrxStore.dispatch(({type: EFFECT_LOAD_FASTERQ_QUEUES, payload: {line_id: this.m_fasterqLineModel.lineId}}))
            this.yp.ngrxStore.dispatch(({type: EFFECT_LOAD_FASTERQ_ANALYTICS, payload: {line_id: this.m_fasterqLineModel.lineId}}))
            this._updateTotalToBeServiced();
        }, 5000);
    }

    /**
     Update the total number of queues left to be serviced
     @method _updateTotalToBeServiced
     **/
    _updateTotalToBeServiced() {
        var total = 0;
        this.m_queues.forEach((i_asterqQueueModel: FasterqQueueModel) => {
            if (_.isNull(i_asterqQueueModel.serviced))
                total++;
            this.m_totalToBeServiced = total;
        });
    }

    _onQueueSelected(i_queue: FasterqQueueModel) {
        this.m_selectedServiceId = i_queue.serviceId;
        var index = this._getQueueIndexByServiceId();
        var uiState: IUiState = {
            uiSideProps: SideProps.fasterqQueueProps,
            fasterq: {
                fasterqQueueSelected: this.m_selectedServiceId
            }
        }
        this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
        this._scrollTo(index);
    }

    _getQueueIndexByServiceId(): number {
        if (this.m_selectedServiceId == -1)
            return this.m_selectedServiceId;
        return this.m_queues.findIndex((i_fasterqQueueModel) => {
            return i_fasterqQueueModel.serviceId == this.m_selectedServiceId;
        })
    }

    /**
     Scroll to position of selected queue / UI person
     @method _scrollTo
     @param {Element} i_element
     **/
    _scrollTo(i_index) {
        this._watchStop();
        var el = $('#fqLineQueueComponent', this.el.nativeElement).children().eq(i_index);
        var scrollXPos = $(el).position().left;
        // console.log('current offset ' + scrollXPos + ' ' + 'going to index ' + $(i_element).index() + ' service_id ' + i_serviceId);
        this.m_offsetPosition = $('#fqLineQueueComponentContainer', this.el.nativeElement).scrollLeft();
        scrollXPos += this.m_offsetPosition;
        var final = scrollXPos - 480;
        TweenLite.to('#fqLineQueueComponentContainer', 2, {
            scrollTo: {x: final, y: 0},
            ease: Power4['easeOut']
        });
    }

    _getQueueFromSelectedIndex(): FasterqQueueModel {
        return this.m_queues.find(i_fasterqQueueModel => {
            return i_fasterqQueueModel.serviceId == this.m_selectedServiceId;
        })
    }

    _selectIfDefault() {
        if (this.m_queues.size >= this.QUEUE_OFFSET + 1 && this.m_selectedServiceId == -1)
            this.m_selectedServiceId = this.m_queues.get(this.QUEUE_OFFSET).serviceId;
    }

    /**
     Listen to queue being called, mark on UI and post to server
     @method _listenCalled
     **/
    _onCall() {
        this._selectIfDefault();
        if (this.m_queues.size == this.QUEUE_OFFSET) return;
        if (!_.isNull(this._getQueueFromSelectedIndex().serviced))
            return bootbox.alert('customer has already been serviced');
        this._watchStart();
        this.m_lastCalled = this._getQueueFromSelectedIndex().serviceId;
        var d = new XDate();
        var payload: IQueueSave = {
            queue_id: this._getQueueFromSelectedIndex().queueId,
            called: d.toString('M/d/yyyy hh:mm:ss TT'),
            called_by: this.rp.getUserData().userName,
            called_by_override: false,
            queue: this._getQueueFromSelectedIndex()
        }
        this.yp.ngrxStore.dispatch({type: EFFECT_QUEUE_CALL_SAVE, payload: payload})
    }

    /**
     Listen to queue being serviced, mark on UI and post to server
     @method _listenServiced
     **/
    _onService() {
        this._selectIfDefault();
        if (this.m_queues.size == this.QUEUE_OFFSET) return;
        this._watchStop();
        if (_.isNull(this._getQueueFromSelectedIndex().called)) {
            bootbox.alert('customer has not been called yet');
            return;
        }
        if (!_.isNull(this._getQueueFromSelectedIndex().serviced)) {
            bootbox.alert('customer has already been serviced');
            return;
        }
        this.m_fqLastServiced = this._getQueueFromSelectedIndex().serviceId;
        var d = new XDate();
        var payload: IQueueSave = {
            queue_id: this._getQueueFromSelectedIndex().queueId,
            serviced: d.toString('M/d/yyyy hh:mm:ss TT'),
            queue: this._getQueueFromSelectedIndex()
        }
        this.yp.ngrxStore.dispatch({type: EFFECT_QUEUE_SERVICE_SAVE, payload: payload})
    }

    /**
     Calculate average respond and service line times
     @method _calcAverages
     **/
    _calcAverages() {
        var avgServiceTime = [];
        var avgCalledTime = [];
        this.m_analytics.forEach((i_model: FasterqAnalyticsModel) => {
            var entered = i_model.entered;
            var serviced = i_model.serviced;
            var called = i_model.called;
            if (_.isNull(called)) {
                // customer not called, do nothing
            } else if (!_.isNull(serviced)) {
                // customer called & serviced
                var xEntered = new XDate(entered);
                var minFromEnteredToCalled = xEntered.diffMinutes(called);
                if (minFromEnteredToCalled < 0)
                    minFromEnteredToCalled = 1;
                avgCalledTime.push(minFromEnteredToCalled);

                var xCalled = new XDate(called);
                var minFromCalledToServiced = xCalled.diffMinutes(serviced);
                avgServiceTime.push(minFromCalledToServiced);

            } else {

                // customer called not serviced
                var xEntered = new XDate(entered);
                var minFromEnteredToCalled = xEntered.diffMinutes(called);
                if (minFromEnteredToCalled < 0)
                    minFromEnteredToCalled = 1;
                avgCalledTime.push(minFromEnteredToCalled);
            }
        });

        this.m_avgServiceTimeCalc = _.reduce(avgServiceTime, function (memo, num) {
                return memo + num;
            }, 0) / (avgServiceTime.length === 0 ? 1 : avgServiceTime.length);
        this.m_avgServiceTimeCalc = Lib.ParseToFloatDouble(this.m_avgServiceTimeCalc);

        this.m_avgCalledTimeCalc = _.reduce(avgCalledTime, function (memo, num) {
                return memo + num;
            }, 0) / (avgCalledTime.length === 0 ? 1 : avgCalledTime.length);
        this.m_avgCalledTimeCalc = Lib.ParseToFloatDouble(this.m_avgCalledTimeCalc)
    }

    _onPrev() {
        if (this._getQueueIndexByServiceId() == this.QUEUE_OFFSET)
            return;
        this._onQueueSelected(this.m_queues.get(this._getQueueIndexByServiceId() - 1));
    }

    _onNext() {
        if (this._getQueueIndexByServiceId() + 1 == this.m_queues.size || this.m_queues.size <= this.QUEUE_OFFSET + 1)
            return;
        if (this._getQueueIndexByServiceId() == -1)
            return this._onQueueSelected(this.m_queues.get(this.QUEUE_OFFSET));
        this._onQueueSelected(this.m_queues.get(this._getQueueIndexByServiceId() + 1));
    }

    _onGoTo() {
        var queue = this.m_queues.find((i_fasterqQueueModel: FasterqQueueModel) => {
            var serviceId = i_fasterqQueueModel.serviceId;
            var selectedId = Lib.PadZeros(this.m_gotoModel, 3, 0);
            return serviceId == selectedId;
        })
        if (queue)
            this._onQueueSelected(queue);
    }

    /**
     Start the stop watch UI
     @method _watchStart
     **/
    _watchStart() {
        this.m_stopWatchHandle.setListener((e) => {
            this.m_stopTimer = this.m_stopWatchHandle.toString();
            this.cd.markForCheck();
        });
        this.m_stopWatchHandle.start();
    }

    /**
     Stop the stop watch UI
     @method _watchStop
     **/
    _watchStop() {
        this.m_stopWatchHandle.stop();
        this.m_stopWatchHandle.reset();
        this.m_stopTimer = '00:00:00';
    }

    destroy() {
        clearInterval(this.m_liveUpdateHandler);
        var uiState: IUiState = {
            uiSideProps: SideProps.miniDashboard,
            fasterq: {
                fasterqQueueSelected: -1
            }
        }
        this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    }
}
