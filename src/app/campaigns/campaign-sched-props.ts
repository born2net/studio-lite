import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild} from "@angular/core";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Compbaser, NgmslibService} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {RedPepperService} from "../../services/redpepper.service";
import {timeout} from "../../decorators/timeout-decorator";
import * as _ from "lodash";
import {CampaignTimelineSchedulesModel} from "../../store/imsdb.interfaces_auto";


@Component({
    selector: 'campaign-sched-props',
    //changeDetection: ChangeDetectionStrategy.OnPush,
    // host: {'(input-blur)': '_saveToStore($event)'},
    templateUrl: './campaign-sched-props.html',
    styleUrls: ['./campaign-sched-props.css']
})
export class CampaignSchedProps extends Compbaser implements AfterViewInit {

    private m_campaignTimelineSchedulesModel: CampaignTimelineSchedulesModel;
    m_days: Array<any> = [];
    private formInputs = {};
    contGroup: FormGroup;
    private m_ONCE = '0';
    private m_DAILY = '1';
    private m_WEEKLY = '2';
    private m_PRIORITY_LOW = 2;
    private m_PRIORITY_MEDIUM = 1;
    private m_PRIORITY_HIGH = 0;
    private m_WEEKDAYS = [1, 2, 4, 8, 16, 32, 64];
    private m_WEEKDAYS_NAME = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    constructor(private fb: FormBuilder, private el: ElementRef, private yp: YellowPepperService, private rp: RedPepperService, private cd: ChangeDetectorRef, private ngmslibService: NgmslibService) {
        super();
        this.contGroup = this.fb.group({
            'once': [],
            'weekly_start': ['1/1/2020'],
            'weekly_end': ['1/1/2020'],
            'daily_start': ['1/1/2020'],
            'daily_end': ['1/1/2020'],
            'start_time': [],
            'duration': []
        });
        _.forEach(this.contGroup.controls, (value, key: string) => {
            this.formInputs[key] = this.contGroup.controls[key] as FormControl;
        })
    }

    ngAfterViewInit() {
        this._listenTimepickerChanges();

        this.cancelOnDestroy(
            this.yp.listenSchedulerValueChanged()
                .subscribe(i_campaignTimelineSchedulesModel => {
                    this.m_campaignTimelineSchedulesModel = i_campaignTimelineSchedulesModel;
                    this._renderConflictPriority();
                    this._renderCarouselPosition();
                    this._initTimePicker();
                    this._initDays();
                    this._renderFormInputs();
                }, (e) => {
                    console.error(e)
                })
        )
    }

    _setPriority(i_priority: number) {
        this.rp.setCampaignsSchedule(this.m_campaignTimelineSchedulesModel.getCampaignTimelineId(), 'priorty', i_priority);
        this.rp.reduxCommit();
    }

    _listenTimepickerChanges() {
        jQuery('#timepickerDurationInput', this.el.nativeElement).on("hide.timepicker", (e:any) => {
            var totalSeconds = this.rp.formatObjectToSeconds({
                hours: e.time.hours,
                minutes: e.time.minutes,
                seconds: e.time.seconds
            });
            this.rp.setCampaignsSchedule(this.m_campaignTimelineSchedulesModel.getCampaignTimelineId(), 'duration', totalSeconds);
            this.rp.reduxCommit();
        });
        jQuery('#timepickerTimeInput', this.el.nativeElement).on("hide.timepicker", (e:any) => {
            var totalSeconds = this.rp.formatObjectToSeconds({
                hours: e.time.hours,
                minutes: e.time.minutes,
                seconds: e.time.seconds
            });
            this.rp.setCampaignsSchedule(this.m_campaignTimelineSchedulesModel.getCampaignTimelineId(), 'start_time', totalSeconds);
            this.rp.reduxCommit();
        });
    }

    private _renderCarouselPosition() {
        jQuery('#schedulerRepeatMode', this.el.nativeElement).carousel(Number(this.m_campaignTimelineSchedulesModel.getRepeatType()));
    }

    private _renderConflictPriority() {
        if (this.m_campaignTimelineSchedulesModel.getPriorty() == this.m_PRIORITY_LOW) {
            jQuery('#schedulePriority', this.el.nativeElement).find('img').eq(1).fadeTo('fast', 0.5).end().eq(2).fadeTo('fast', 0.5);
        } else if (this.m_campaignTimelineSchedulesModel.getPriorty() == this.m_PRIORITY_MEDIUM) {
            jQuery('#schedulePriority', this.el.nativeElement).find('img').eq(1).fadeTo('fast', 1).end().eq(2).fadeTo('fast', 0.5);
        } else {
            jQuery('#schedulePriority', this.el.nativeElement).find('img').eq(1).fadeTo('fast', 1).end().eq(2).fadeTo('fast', 1);
        }
    }

    private _renderFormInputs() {
        _.forEach(this.formInputs, (value, key: string) => {
            switch (key) {
                case 'once': {
                    break;
                }
                case 'daily_start': {
                }
                case 'daily_end': {
                }
                case 'weekly_start': {
                }
                case 'weekly_end': {

                    var startDate = this.m_campaignTimelineSchedulesModel.getStartDate().split(' ')[0];
                    var endDate = this.m_campaignTimelineSchedulesModel.getEndDate().split(' ')[0];
                    var xStart = new XDate(startDate).toString('yyyy-MM-dd');
                    var xEnd = new XDate(endDate).toString('yyyy-MM-dd');
                    this.formInputs['weekly_start'].setValue(xStart)
                    this.formInputs['weekly_end'].setValue(xEnd)
                    this.formInputs['daily_start'].setValue(xStart)
                    this.formInputs['daily_end'].setValue(xEnd)
                    this.formInputs['once'].setValue(xStart)
                    return;
                }
                case 'start_time': {
                    var startTime = this.rp.formatSecondsToObject(this.m_campaignTimelineSchedulesModel.getStartTime());
                    var startTimeFormatted = `${startTime.hours}:${startTime.minutes}:${startTime.seconds}`;
                    this.formInputs['start_time'].setValue(startTimeFormatted);
                    jQuery('#timepickerTimeInput', this.el.nativeElement).timepicker('setTime', startTimeFormatted);
                    return;
                }
                case 'duration': {
                    var duration = this.rp.formatSecondsToObject(this.m_campaignTimelineSchedulesModel.getDuration());
                    var durationFormatted = `${duration.hours}:${duration.minutes}:${duration.seconds}`;
                    this.formInputs['duration'].setValue(durationFormatted);
                    jQuery('#timepickerDurationInput', this.el.nativeElement).timepicker('setTime', durationFormatted);
                    return;
                }
                default: {

                }
            }
            let data = this.m_campaignTimelineSchedulesModel.getKey(key);
            data = StringJS(data).booleanToNumber();
            this.formInputs[key].setValue(data)
        });
    };

    private _initDays() {
        this.m_days = [];
        var weekDays = this.m_campaignTimelineSchedulesModel.getWeekDays();
        this.m_WEEKDAYS.forEach((v, i) => {
            var n = weekDays & v;
            this.m_days.push({
                day: this.m_WEEKDAYS_NAME[i],
                checked: n == v ? true : false
            })
        });
        this.cd.detectChanges()
    }

    private _initTimePicker() {
        jQuery('#timepickerDurationInput', this.el.nativeElement).timepicker({
            showSeconds: true,
            showMeridian: false,
            defaultTime: false,
            minuteStep: 1,
            secondStep: 1
        });
        jQuery('#timepickerTimeInput', this.el.nativeElement).timepicker({
            showSeconds: true,
            showMeridian: false,
            defaultTime: false,
            minuteStep: 1,
            secondStep: 1
        });
    }

    _onDaysChanged(checked, day: {}, i: number) {
        var weekBitsTotal = 0;
        this.m_days[i] = {
            day: this.m_WEEKDAYS_NAME[i],
            checked: checked
        }
        this.m_days.forEach((day, i) => {
            if (day.checked)
                weekBitsTotal = weekBitsTotal + this.m_WEEKDAYS[i]
        });
        this.rp.setCampaignsSchedule(this.m_campaignTimelineSchedulesModel.getCampaignTimelineId(), 'week_days', weekBitsTotal);
        this.rp.reduxCommit()
    }

    _saveDates(key, event: MouseEvent) {
        switch (key) {
            case 'daily_start':
            case 'weekly_start':
            case 'once': {
                var value = event.target['value'];
                var date = new XDate(value).toString('MM/dd/yyyy') + ' 12:00:00 AM'
                this.rp.setCampaignsSchedule(this.m_campaignTimelineSchedulesModel.getCampaignTimelineId(), 'start_date', date);
                return;
            }
            case 'weekly_end':
            case 'daily_end': {
                var value = event.target['value'];
                var date = new XDate(value).toString('MM/dd/yyyy') + ' 12:00:00 AM'
                this.rp.setCampaignsSchedule(this.m_campaignTimelineSchedulesModel.getCampaignTimelineId(), 'end_date', date);
                return;
            }
        }
        this.rp.reduxCommit()
    }

    @timeout(1000)
    _saveRepeat() {
        this._saveToStore();
    }

    @timeout()
    private _saveToStore(key?: string, event?: MouseEvent) {
        var carouselIndex = jQueryAny('#schedulerRepeatMode .active', this.el.nativeElement).index('#schedulerRepeatMode .item', this.el.nativeElement);
        this.rp.setCampaignsSchedule(this.m_campaignTimelineSchedulesModel.getCampaignTimelineId(), 'repeat_type', carouselIndex);
        this.rp.reduxCommit()
    }

    destroy() {
        jQuery('#timepickerDurationInput', this.el.nativeElement).off("hide.timepicker");
        jQuery('#timepickerTimeInput', this.el.nativeElement).off("hide.timepicker");
    }
}
