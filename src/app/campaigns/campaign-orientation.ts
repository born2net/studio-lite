import {Component, EventEmitter, forwardRef, Inject, Output} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {Observable, Observer} from "rxjs";
import {IUiState} from "../../store/store.data";
import {ACTION_UISTATE_UPDATE} from "../../store/actions/appdb.actions";
import {YellowPepperService} from "../../services/yellowpepper.service";

export enum OrientationEnum {
    HORIZONTAL,
    VERTICAL
}

// export type OrientationConst = "HORIZONTAL" | "VERTICAL";


@Component({
    selector: 'campaign-orientation',
    // changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
        .defaultOpacity {
            opacity: 0.6;
            cursor: pointer;
        }

        .selectedOrientation {
            opacity: 1 !important;
        }
    `],
    template: `
        <small class="debug">{{me}}</small>
        <h4 i18n>screen orientation</h4>
        <div id="orientationView">
            <table width="100%" border="0" cellspacing="0" cellpadding="50">
                <tr>
                    <td align="center">
                        <img id="firstImage" (click)="_nextClick.next(OrientationEnum.HORIZONTAL)" [ngClass]="{'selectedOrientation': m_orientation==OrientationEnum.HORIZONTAL}" class="defaultOpacity img-responsive" src="assets/orientationH.png"/>
                    </td>
                    <td align="center">
                        <img (click)="_nextClick.next(OrientationEnum.VERTICAL)" [ngClass]="{'selectedOrientation': m_orientation==OrientationEnum.VERTICAL}" class="defaultOpacity img-responsive" src="assets/orientationV.png"/>
                    </td>
                </tr>
            </table>
        </div>
    `
})

export class CampaignOrientation extends Compbaser {

    m_orientation: OrientationEnum;
    OrientationEnum = OrientationEnum;
    _nextClick: Observer<any>;

    constructor(@Inject(forwardRef(() => YellowPepperService)) private yp: YellowPepperService) {
        super();
        this.cancelOnDestroy(
            Observable.create(observer => {
                this._nextClick = observer
            }).map((i_orientation) => {
                this.m_orientation = i_orientation;
                return i_orientation;
            }).debounceTime(100)
                .subscribe(() => {
                    var uiState: IUiState = {
                        campaign: {
                            campaignCreateOrientation: this.m_orientation
                        }
                    }
                    this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
                    this.onSelection.emit(this.m_orientation)
                }, (e) => {
                    console.error(e)
                })
        )
    }

    @Output()
    onSelection: EventEmitter<OrientationEnum> = new EventEmitter<OrientationEnum>();

    ngOnInit() {
    }

    destroy() {
    }
}