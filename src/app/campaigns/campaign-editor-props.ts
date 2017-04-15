import {Component} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {CampaignsModelExt} from "../../store/model/msdb-models-extended";
import {Observable} from "rxjs";


@Component({
    selector: 'campaign-editor-props',
    host: {
        '(input-blur)': 'onFormChange($event)'
    },
    template: `
        <div>
            <div class="row">
                <div class="inner userGeneral">
                    <div class="panel panel-default tallPanel">
                        <div class="panel-heading">
                            <small class="release">editor properties
                                <i style="font-size: 1.4em" class="fa fa-cog pull-right"></i>
                            </small>
                            <small class="debug">{{me}}</small>
                        </div>
                        <ul class="list-group">
                            <li class="list-group-item">
                                <h4>{{(m_campaignModel$ | async)?.getCampaignName() }}</h4>
                            </li>
                            <li class="list-group-item">
                                <div *ngIf="(m_campaignModel$ | async)?.getCampaignPlaylistMode() == '1'">
                                    <h4><i class="fa fa-calendar"></i>playback mode: scheduler</h4>
                                </div>
                                <div *ngIf="(m_campaignModel$ | async)?.getCampaignPlaylistMode() == '0'">
                                    <h4><i class="fa fa fa-repeat"></i>playback mode: sequencer</h4>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        i {
            width: 20px;
        }
    `]

})
export class CampaignEditorProps extends Compbaser {
    m_campaignModel$: Observable<CampaignsModelExt>;

    constructor(private yp: YellowPepperService) {
        super();
        this.m_campaignModel$ = this.yp.listenCampaignValueChanged()
    }

    destroy() {
    }
}



