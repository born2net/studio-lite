import {AfterViewInit, ChangeDetectionStrategy, Component, Input, ViewChild} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {ISimpleGridEdit} from "../../comps/simple-grid-module/SimpleGrid";
import {StoreModel} from "../../store/model/StoreModel";
import {BlockService, IBlockData} from "./block-service";
import {SimpleGridRecord} from "../../comps/simple-grid-module/SimpleGridRecord";
import {SimpleGridTable} from "../../comps/simple-grid-module/SimpleGridTable";
import {List} from "immutable";
import * as _ from "lodash";


export class JsonEventResourceModel extends StoreModel {
    constructor(data: {
                    rowIndex: number;
                    checkbox: boolean;
                    event: string;
                    pageName: string;
                    action: string;
                }) {
        super(data);
    }
}

@Component({
    selector: 'json-event-grid',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>
        <label i18n>On event take the following action</label>
        <h4 class="panel-title" style="padding-bottom: 15px">
            <button (click)="_onAddNewEvent()" type="button" title="add event" class="btn btn-default btn-sm">
                <span class="fa fa-plus"></span>
            </button>
            <button (click)="_onRemoveEvent()" type="button" title="remove event" class="btn btn-default btn-sm">
                <span class="fa fa-minus"></span>
            </button>
        </h4>
        <div style="overflow-x: scroll">
            <div style="width: 600px">
                <simpleGridTable #simpleGrid>
                    <thead>
                    <tr>
                        <th>event</th>
                        <th>action</th>
                        <th>go to</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr class="simpleGridRecord" simpleGridRecord *ngFor="let item of m_events; let index=index" [item]="item" [index]="index">
                        <td simpleGridData style="width: 30%" [editable]="true" (labelEdited)="_onLabelEdited($event,index)" field="event" [item]="item"></td>
                        <td simpleGridDataDropdown style="width: 35%" [testSelection]="_selectedAction()" (changed)="_setAction($event,index)" field="name" [item]="item" [dropdown]="m_actions"></td>
                        <td simpleGridData *ngIf="m_mode == 'url'" style="width: 35%" [editable]="true" (labelEdited)="_onUrlEdited($event,index)" field="url" [item]="item"></td>
                        <td simpleGridDataDropdown *ngIf="m_mode == 'page'" style="width: 35%" [testSelection]="_selectedResource()" (changed)="_onPageEdited($event,index)" field="name" [item]="item" [dropdown]="m_collectionList"></td>
                    </tr>
                    </tbody>
                </simpleGridTable>
            </div>
        </div>
    `
})
export class JsonEventGrid extends Compbaser implements AfterViewInit {

    m_blockData: IBlockData;
    m_events: List<StoreModel>;
    m_actions: List<StoreModel>;
    m_collectionList: List<StoreModel>;
    m_mode: 'url' | 'page';
    m_jsonEventResources: Array<JsonEventResourceModel>;

    constructor(private yp: YellowPepperService, private bs: BlockService) {
        super();
        this.m_actions = List([
            new StoreModel({name: 'firstPage'}),
            new StoreModel({name: 'nextPage'}),
            new StoreModel({name: 'prevPage'}),
            new StoreModel({name: 'lastPage'}),
            new StoreModel({name: 'loadUrl'}),
            new StoreModel({name: 'selectPage'})
        ]);
    }

    @ViewChild('simpleGrid')
    simpleGrid: SimpleGridTable;

    @Input()
    set setBlockData(i_blockData) {
        this.m_blockData = i_blockData;
        this._render();
    }

    @Input()
    set resources(i_jsonEventResources: Array<JsonEventResourceModel>) {
        this.m_jsonEventResources = i_jsonEventResources;
    }

    @Input()
    set collectionList(i_collectionList) {
        this.m_collectionList = i_collectionList;
    }

    @Input()
    set showOption(i_value: 'url' | 'page') {
        this.m_mode = i_value;
        if (i_value == 'url') {
            this.m_actions = this.m_actions.filter((v: StoreModel) => {
                return v.getKey('name') != 'selectPage';
            }) as List<any>;
            return;
        }
        if (i_value == 'page') {
            this.m_actions = this.m_actions.filter((v: StoreModel) => {
                return v.getKey('name') != 'loadUrl';
            }) as List<any>;
            return;
        }
    }

    _render() {
        this._initEventTable();
    }

    /**
     Load event list to block props UI
     @method _initEventTable
     **/
    _initEventTable() {
        var rowIndex = 0;
        var domPlayerData = this.m_blockData.playerDataDom;
        var events = [];
        jXML(domPlayerData).find('EventCommands').children().each((k, eventCommand) => {
            var url = '';
            if (jXML(eventCommand).attr('command') == 'loadUrl')
                url = jXML(eventCommand).find('Url').attr('name');
            if (jXML(eventCommand).attr('command') == 'selectPage')
                url = jXML(eventCommand).find('Page').attr('name');
            if (_.isUndefined(url) || _.isEmpty(url))
                url = '---';
            var storeModel = new StoreModel({
                id: rowIndex,
                event: jXML(eventCommand).attr('from'),
                url: url,
                action: jXML(eventCommand).attr('command')
            });
            events.push(storeModel)
            rowIndex++;
        });
        this.m_events = List(events)
    }

    _setAction(event: ISimpleGridEdit, index: number) {
        var domPlayerData = this.m_blockData.playerDataDom;
        var target = jXML(domPlayerData).find('EventCommands').children().get(index);
        jXML(target).attr('command', event.value);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    _onRemoveEvent() {
        var record: SimpleGridRecord = this.simpleGrid.getSelected();
        if (_.isUndefined(record)) return;
        var domPlayerData = this.m_blockData.playerDataDom;
        jXML(domPlayerData).find('EventCommands').children().eq(record.index).remove();
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData)
    }

    _onAddNewEvent() {
        var domPlayerData = this.m_blockData.playerDataDom;
        var buff = '<EventCommand from="event" condition="" command="firstPage" />';
        jXML(domPlayerData).find('EventCommands').append(jXML(buff));
        // domPlayerData = this.rp.xmlToStringIEfix(domPlayerData)
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    _selectedAction() {
        return (a: StoreModel, b: StoreModel) => {
            return a.getKey('name') == b.getKey('action') ? 'selected' : '';
        }
    }

    _selectedResource() {
        return (a: StoreModel, b: StoreModel) => {
            return a.getKey('name') == b.getKey('url') ? 'selected' : '';
        }
    }

    _onUrlEdited(event: ISimpleGridEdit, index) {
        var url = event.value;
        var domPlayerData = this.m_blockData.playerDataDom;
        var target = jXML(domPlayerData).find('EventCommands').children().get(parseInt(index));
        jXML(target).find('Params').remove();
        jXML(target).append('<Params> <Url name="' + url + '" /></Params>');
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    _onPageEdited(event: ISimpleGridEdit, index) {
        var page = event.value;
        var domPlayerData = this.m_blockData.playerDataDom;
        var target = jXML(domPlayerData).find('EventCommands').children().get(parseInt(index));
        jXML(target).find('Params').remove();
        jXML(target).append('<Params><Page name="' + page + '"/></Params>');
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    _onLabelEdited(event: ISimpleGridEdit, index) {
        var domPlayerData = this.m_blockData.playerDataDom;
        var target = jXML(domPlayerData).find('EventCommands').children().get(index);
        jXML(target).attr('from', event.value);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    ngAfterViewInit() {
    }

    ngOnInit() {
    }

    destroy() {
    }
}