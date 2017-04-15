import {Component, ChangeDetectionStrategy, Output, EventEmitter} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {IUiState} from "../../store/store.data";
import {ACTION_UISTATE_UPDATE} from "../../store/actions/appdb.actions";

@Component({
    selector: 'campaign-name',
    // changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>
        <h3 i18n>Select your campaign name</h3>
        <input (keydown)="_onKeyDown($event)" id="newCampaignName" style="width: 50%" [(ngModel)]="m_campaignName"
               type="text" class="form-control"
               value="My campaign" i18n-placeholder placeholder="Enter new campaign name">
    `,
})
export class CampaignName extends Compbaser {

    constructor(private yp: YellowPepperService) {
        super();
    }

    @Output()
    onNext:EventEmitter<any> = new EventEmitter<any>();


    m_campaignName: string = '';

    public get getCampaignNameChanged(): string {
        return this.m_campaignName;
    }

    _onKeyDown(event:KeyboardEvent){
        if (event.keyCode==13){
            this.onNext.emit();
        }
    }

    ngOnInit() {
    }

    destroy() {
        var uiState:IUiState = {
            campaign: {
                campaignCreateName: this.m_campaignName
            }
        }
        this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    }


}