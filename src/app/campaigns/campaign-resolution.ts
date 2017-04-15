import {Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef} from "@angular/core";
import {Compbaser} from "ng-mslib";
import * as screenTemplates from "../../libs/screen-templates.json";
import {OrientationEnum} from "./campaign-orientation";
import {timeout} from "../../decorators/timeout-decorator";
import {Observable, Observer} from "rxjs";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {Once} from "../../decorators/once-decorator";
import {IUiState, IUiStateCampaign} from "../../store/store.data";
import {ACTION_UISTATE_UPDATE} from "../../store/actions/appdb.actions";

@Component({
    selector: 'campaign-resolution',
    // changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>
        <h4 i18n>screen resolution</h4>
        <div id="resolutionList" (click)="$event.preventDefault()">
            <a (click)="_nextClick.next(screen)" href="#" class="list-group-item" *ngFor="let screen of m_screens">
                <label class="screenResolutionLabel">{{screen}}</label>
            </a>
        </div>
    `,
})
export class CampaignResolution extends Compbaser {

    m_screens: Array<any> = [];
    private m_resolution: string;
    _nextClick: Observer<any>;

    constructor(private yp: YellowPepperService) {
        super();
        this.getNewCampaignParams();

        this.cancelOnDestroy(
            Observable.create(observer => {
                this._nextClick = observer
            }).map((i_resolution) => {
                this.m_resolution = i_resolution;
                return i_resolution;
            }).debounceTime(100)
                .subscribe(() => {
                    var uiState: IUiState = {
                        campaign: {
                            campaignCreateResolution: this.m_resolution
                        }
                    }
                    this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
                    this.onSelection.emit(this.m_resolution);
                }, (e) => {
                    console.error(e)
                })
        )
    }

    @Once()
    private getNewCampaignParams() {
        return this.yp.getNewCampaignParmas()
            .subscribe((value: IUiStateCampaign) => {
                this.m_screens = [];
                var orientation:OrientationEnum = value.campaignCreateOrientation;
                for (var screenResolution in screenTemplates[orientation]) {
                    this.m_screens.push(screenResolution)
                }
            }, (e) => {
                console.error(e)
            })
    }

    @Output()
    onSelection: EventEmitter<string> = new EventEmitter<string>();

    ngOnInit() {
    }

    destroy() {
    }
}