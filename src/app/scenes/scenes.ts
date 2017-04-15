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
    selector: 'scenes',
    template: `
        <small class="debug" style="padding-right: 25px">{{me}}</small>
        <Sliderpanel>
            <Slideritem [templateRef]="a" #sliderItemSceneManager class="page center sceneList selected" [showToButton]="false" [toDirection]="'right'" [to]="'sceneEditor'">
                <ng-template #a>
                    <scene-manager (sceneCreate)="sliderItemSceneManager.slideTo('sceneCreator','right')" (slideToSceneEditor)="sliderItemSceneManager.onNext()"></scene-manager>
                </ng-template>
            </Slideritem>
            <Slideritem [templateRef]="b" #sliderItemCampaignEditor (onChange)="_onSlideChange($event)" [showFromButton]="false" class="page left sceneEditor" [fromDirection]="'left'" [from]="'sceneList'">
                <ng-template #b>
                    <scene-editor #sceneEditor (onGoBack)="sliderItemCampaignEditor.slideTo('sceneList','left')">
                    </scene-editor>
                </ng-template>
            </Slideritem>
            <Slideritem [templateRef]="c" #sliderSceneCreator [showFromButton]="false" class="page left sceneCreator" [fromDirection]="'left'" [from]="'sceneList'">
                <ng-template #c>
                    <scene-creator (onGoBack)="sliderSceneCreator.slideTo('sceneList','left')"></scene-creator>
                </ng-template>
            </Slideritem>
            <Slideritem [templateRef]="d" #sliderLocation [showFromButton]="false" class="page left locationMap" [fromDirection]="'right'" [from]="'sceneEditor'">
                <ng-template #d>
                    <location-map (onClose)="_onLocationMapClosed()"></location-map>
                </ng-template>
            </Slideritem>
        </Sliderpanel>
    `
})
export class Scenes extends Compbaser {

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
        this.sliderSceneCreator.slideTo('sceneEditor','left')

    }

    _onSlideChange(event: ISliderItemData) {
        if (event.direction == 'left' && event.to == 'sceneList') {
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

