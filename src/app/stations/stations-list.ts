import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {ResourcesModel} from "../../store/imsdb.interfaces_auto";
import {List} from "immutable";
import {BlockService} from "../blocks/block-service";
import {IUiState} from "../../store/store.data";
import {SideProps} from "../../store/actions/appdb.actions";
import {StationModel} from "../../models/StationModel";

@Component({
    selector: 'stations-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
        .green {
            color: green;
        }

        .red {
            color: red;
        }

        .yellow {
            color: yellow;
        }

        span {
            background-color: transparent;
            -webkit-text-stroke: 1px black;
            text-shadow: 1px 1px 0 #000,
            -1px -1px 0 #000,
            1px -1px 0 #000,
            -1px 1px 0 #000,
            1px 1px 0 #000;
        }
    `],
    template: `
        <small class="debug">{{me}}</small>
        <ul style="padding: 10px" (click)="$event.preventDefault()" class="appList list-group">
            <a *ngFor="let station of m_stations; let i = index" (click)="_onSelected($event, station, i)"
               [class.hidden]="station | FilterModelPipe:filter:station:'getStationName'"
               [ngClass]="{'selectedItem': selectedIdx == i}" href="#" class="list-group-item resourcesListItems">
                <span [ngClass]="{'green': station.connection == '1', 'red': station.connection == '0', 'yellow': station.connection == '2'}" class="pull-left fa fa-4x fa-circle"></span>
                <div style="position: relative; left: 20px">
                    <h4>{{station.name}}</h4>
                    <h5>os: {{station.os}}</h5>
                </div>
                <!--<i class="pull-left fa {{station.airVersion}}"></i>-->
                <!--<p class="pull-left list-group-item-text">file type: {{station.os}} </p>-->
                <!--<span class="clearfix"></span>-->
                <!--<div class="openProps">-->
                    <!--<button type="button" class="props btn btn-default btn-sm"><i style="font-size: 1.5em" class="props fa fa-gear"></i></button>-->
                <!--</div>-->
            </a>
        </ul>
    `,
})
export class StationsList extends Compbaser {
    selectedIdx = -1;
    m_stations: List<StationModel>;
    m_selected;

    constructor(private bs: BlockService, private el: ElementRef) {
        super();
    }

    @Input()
    set stations(i_stations: List<StationModel>) {
        this.m_stations = i_stations;
    }

    @Input() filter;

    @Output()
    onSelected: EventEmitter<StationModel> = new EventEmitter<StationModel>();

    _onSelected(event: MouseEvent, i_station: StationModel, index) {
        this.selectedIdx = index;
        this.onSelected.emit(i_station)
        // this.m_selected = i_resource;
    }

    resetSelection() {
        this.selectedIdx = -1;
    }

    ngOnInit() {
    }

    destroy() {
    }
}