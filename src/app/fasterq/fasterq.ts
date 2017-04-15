import {ChangeDetectionStrategy, Component, ViewChild} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {ACTION_UISTATE_UPDATE, SideProps} from "../../store/actions/appdb.actions";
import {IUiState} from "../../store/store.data";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {RedPepperService} from "../../services/redpepper.service";
import {PLACEMENT_SCENE} from "../../interfaces/Consts";
import {ISliderItemData, Slideritem} from "../../comps/sliderpanel/Slideritem";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'fasterq',
    template: `
        <small class="debug" style="padding-right: 25px">{{me}}</small>
        <Sliderpanel>
            <Slideritem [templateRef]="a" #sliderFqLineManager class="page center fqList selected" [showToButton]="false" [toDirection]="'right'" [to]="'fqEditor'">
                <ng-template #a>
                    <fasterq-manager (slideToFasterqEditor)="sliderFqLineManager.slideTo('fqEditor','right')"></fasterq-manager>
                </ng-template>
            </Slideritem>
            <Slideritem [templateRef]="b" #sliderItemCampaignEditor (onChange)="_onSlideChange($event)" [showFromButton]="true" class="page left fqEditor" [fromDirection]="'left'" [from]="'fqList'">
                <ng-template #b>
                    <fasterq-editor (onGoBack)="sliderItemCampaignEditor.slideTo('fqList','left')"></fasterq-editor>
                </ng-template>
            </Slideritem>
        </Sliderpanel>
    `
})
export class Fasterq extends Compbaser {

    private m_placement = PLACEMENT_SCENE;

    constructor(private yp: YellowPepperService, private rp: RedPepperService) {
        super();
        var uiState: IUiState = {uiSideProps: SideProps.miniDashboard}
        this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))

        this.cancelOnDestroy(
            //
            this.yp.listenLocationMapLoad()
                .subscribe((v) => {
                    if (v){
                        this.sliderSceneCreator.slideTo('locationMap','right')
                    }
                }, (e) => console.error(e))

        )

    }

    @ViewChild('sliderSceneCreator')
    sliderSceneCreator:Slideritem;


    _onLocationMapClosed(){
        this.sliderSceneCreator.slideTo('fqEditor','left')

    }

    _onSlideChange(event: ISliderItemData) {
        if (event.direction == 'left' && event.to == 'fqList') {
            var uiState:IUiState = {
                uiSideProps: SideProps.miniDashboard,
                scene: {sceneSelected: -1}
            }
            return this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
        }
        // if (event.direction == 'right' && event.to == 'campaignEditor')
        //     return this._createCampaign();
    }
}

