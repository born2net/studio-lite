import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Output} from "@angular/core";
import {Observable} from "rxjs";
import {List} from "immutable";
import {Compbaser} from "ng-mslib";
import {Router} from "@angular/router";
import {UserModel} from "../../models/UserModel";
import {RedPepperService} from "../../services/redpepper.service";
import {CampaignsModelExt} from "../../store/model/msdb-models-extended";
import {ACTION_UISTATE_UPDATE, SideProps} from "../../store/actions/appdb.actions";
import {IUiState} from "../../store/store.data";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {MainAppShowStateEnum} from "../app-component";
import {WizardService} from "../../services/wizard-service";

@Component({
    // changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'campaign-manager',
    styles: [`
        button {
            width: 160px;
        }
        /*.selectedItem {*/
        /*background-color: green !important*/
        /*}*/
        /*a.list-group-item:focus,  button.list-group-item:focus  {*/
        /*background-color: pink !important;*/
        /*}*/

    `],
    templateUrl: './campaign-manager.html'
})
export class CampaignManager extends Compbaser {

    // public userModel$: Observable<UserModel>;

    public campaigns$: Observable<List<CampaignsModelExt>>;
    public timelineSelected$: Observable<number>;
    cars;

    constructor(private el: ElementRef, private yp: YellowPepperService, private redPepperService: RedPepperService, private router: Router, private wizardService:WizardService) {
        super();
        this.preventRedirect(true);
        this.timelineSelected$ = this.yp.ngrxStore.select(store => store.appDb.uiState.campaign.timelineSelected).map(v => v);

        // this.userModel$ = this.yp.ngrxStore.select(store => store.appDb.userModel);

        this.campaigns$ = this.yp.ngrxStore.select(store => store.msDatabase.sdk.table_campaigns).map((list: List<CampaignsModelExt>) => {
            this.cars = list;//.toArray();
            return list.filter((campaignModel: CampaignsModelExt) => {
                if (campaignModel.getCampaignName().indexOf('bla_bla') > -1)
                    return false
                return true;
            })
        });
        // this.yp.ngrxStore.select(store => store.msDatabase.sdk.table_resources).subscribe((resourceModels: List<ResourcesModel>) => {
        //     // console.log(resourceModels.first().getResourceName());
        //     // console.log(resourceModels.first().getResourceBytesTotal());
        // })
    }

    // @once(6000)
    // private testListen() {
    //     return this.yp.ngrxStore.select(store => store.appDb.uiState.uiSideProps).map((v) => {
    //         console.log(v);
    //     }).subscribe((e) => {
    //         console.log(e);
    //     });
    // }

    @Output()
    slideToCampaignEditor: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    slideToCampaignName: EventEmitter<any> = new EventEmitter<any>();

    // m_selectedCampaign: CampaignsModelExt;

    // _onCampaignSelected(event: MouseEvent, campaign: CampaignsModelExt) {
    //     let uiState: IUiState;
    //     if (jQuery(event.target).hasClass('props')) {
    //         uiState = {
    //             uiSideProps: SideProps.campaignProps,
    //             campaign: {
    //                 campaignSelected: campaign.getCampaignId()
    //             }
    //         }
    //         this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    //     } else {
    //         uiState = {
    //             uiSideProps: SideProps.campaignEditor,
    //             campaign: {
    //                 campaignSelected: campaign.getCampaignId()
    //             }
    //         }
    //         this.slideToCampaignEditor.emit();
    //         this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    //     }
    //     this.m_selectedCampaign = campaign;
    // }

    onRoute1() {
        this.router.navigate(['/App1/Campaigns'])
    }

    onRoute2() {
        this.router.navigate(['/App1/Fasterq'])
    }

    onRoute3() {
        this.router.navigate(['/App1/Resources'])
    }

    onRoute4() {
        this.router.navigate(['/App1/Settings'])
    }

    onRoute5() {
        this.router.navigate(['/App1/Stations'])
    }

    onRoute6() {
        this.router.navigate(['/App1/StudioPro'])
    }

    // save() {
    //     let uiState: IUiState = {mainAppState: MainAppShowStateEnum.SAVE}
    //     this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    // }

    _onCampaignSelected(i_uiState: IUiState) {
        this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: i_uiState}))
    }

    _createCampaign() {
        var uiState: IUiState = {uiSideProps: SideProps.miniDashboard}
        this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
        this.slideToCampaignName.emit();
    }

    _onWizard(){
        this.wizardService.start();
    }

    destroy() {
        // var uiState: IUiState = {uiSideProps: SideProps.none}
        // this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    }
}


// let uiState: IUiState = {
//     campaign: {
//         campaignSelected: 123
//     }
// };
// uiState.campaign.campaignSelected = _.random(1,1999);
// this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))

// var b: IUiState = {
//     uiSideProps: _.random(1,1222)
// }
// this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: b}))

