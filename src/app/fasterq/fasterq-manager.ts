import {Component, EventEmitter, Output} from "@angular/core";
import {Observable} from "rxjs";
import {Compbaser} from "ng-mslib";
import {RedPepperService} from "../../services/redpepper.service";
import {ACTION_UISTATE_UPDATE, SideProps} from "../../store/actions/appdb.actions";
import {IUiState} from "../../store/store.data";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {ToastsManager} from "ng2-toastr";
import {EFFECT_ADD_FASTERQ_LINE, EFFECT_LOAD_FASTERQ_ANALYTICS, EFFECT_LOAD_FASTERQ_LINES, EFFECT_LOAD_FASTERQ_QUEUES, EFFECT_REMOVE_FASTERQ_LINE} from "../../store/effects/appdb.effects";
import {FasterqLineModel} from "../../models/fasterq-line-model";
import {List} from "immutable";

@Component({
    selector: 'fasterq-manager',
    template: `
        <small class="debug" style="padding-left: 30px">{{me}}</small>
        <div style="padding-bottom: 10px">
            <span i18n style="font-size: 1.8em;" i18n>scene selection</span>
        </div>
        <div>
            <div class="btn-group">
                <button (click)="_createNew()" type="button" class="btn btn-default">
                    <i style="font-size: 1em" class="fa fa-rocket"></i>
                    <span i18n>new line</span>
                </button>
                <button (click)="_remove()" [disabled]="!m_selectedLine" type="button" class="btn btn-default">
                    <i style="font-size: 1em" class="fa fa-trash-o"></i>
                    <span i18n>remove line</span>
                </button>
            </div>
        </div>
        <!-- move scroller to proper offset -->
        <div class="responsive-pad-right">
            <div matchBodyHeight="350" style="overflow: scroll">
                <ul (click)="$event.preventDefault()" class="appList list-group">
                    <a *ngFor="let line of lines$ | async; let i = index" (click)="_onLineSelected($event, line, i)"
                       [ngClass]="{'selectedItem': selectedIdx == i}" href="#" class="list-group-item">
                        <div class="peopleInGroup">
                            <i class="peopleInLine fa fa-male"></i>
                            <i class="peopleInLine fa fa-male"></i>
                            <i class="peopleInLine fa fa-male"></i>
                            <i class="peopleInLine fa fa-male"></i>
                        </div>
                        <h4 style="display: inline-block; position: relative; left: -85px">{{line.lineName}} (id: {{line.lineId}}) </h4>
                        <p class="list-group-item-text">Reminder ahead of people: {{line.reminder}} </p>
                        <div class="openProps">
                            <button type="button" class="props btn btn-default btn-sm"><i style="font-size: 1.5em" class="props fa fa-gear"></i></button>
                        </div>
                    </a>
                </ul>
            </div>
        </div>
    `
})
export class FasterqManager extends Compbaser {

    selectedIdx = -1;
    m_selectedLine: FasterqLineModel;
    lines$: Observable<List<FasterqLineModel>>

    constructor(private yp: YellowPepperService, private rp: RedPepperService, private toastr: ToastsManager) {
        super();
        this.preventRedirect(true);
        this.yp.ngrxStore.dispatch({type: EFFECT_LOAD_FASTERQ_LINES, payload: {}})
        this.lines$ = this.yp.listenFasterqLines();
        var uiState: IUiState = {fasterq: {fasterqLineSelected: -1}};
        this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    }

    @Output()
    slideToFasterqEditor: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    onLineSelected: EventEmitter<any> = new EventEmitter<any>();

    _onLineSelected(event: MouseEvent, i_fasterqLineModel: FasterqLineModel, index) {
        // event.stopPropagation();
        // event.preventDefault();
        this.selectedIdx = index;
        let uiState: IUiState;
        if (jQuery(event.target).hasClass('props')) {
            uiState = {
                uiSideProps: SideProps.fasterqLineProps,
                fasterq: {
                    fasterqLineSelected: i_fasterqLineModel.lineId
                }
            }
            this.onLineSelected.emit(uiState)
        } else {
            uiState = {
                fasterq: {
                    fasterqLineSelected: i_fasterqLineModel.lineId
                }
            }
            this.slideToFasterqEditor.emit();
            // this.onCampaignSelected.emit(uiState)
        }
        this.m_selectedLine = i_fasterqLineModel;
        this.yp.ngrxStore.dispatch(({type: EFFECT_LOAD_FASTERQ_QUEUES, payload: {line_id: i_fasterqLineModel.lineId}}))
        this.yp.ngrxStore.dispatch(({type: EFFECT_LOAD_FASTERQ_ANALYTICS, payload: {line_id: i_fasterqLineModel.lineId}}))
        this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    }

    _createNew() {
        this.yp.ngrxStore.dispatch({
            type: EFFECT_ADD_FASTERQ_LINE,
            payload: {name: 'new line', business_id: this.rp.getUserData().businessID}
        })
    }

    _remove() {
        bootbox.confirm("Are you sure you want to remove the Line and associated queues?", (result) => {
            if (!result)
                return;
            this.yp.ngrxStore.dispatch({
                type: EFFECT_REMOVE_FASTERQ_LINE,
                payload: {id: this.m_selectedLine.lineId}
            })
            var uiState: IUiState = {uiSideProps: SideProps.miniDashboard}
            this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
            this.m_selectedLine = null;
            this.selectedIdx = -1;
        });
    }

    destroy() {
        var uiState: IUiState = {uiSideProps: SideProps.miniDashboard}
        this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    }
}
