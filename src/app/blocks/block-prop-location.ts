import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, ViewChild} from "@angular/core";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {BlockService, IBlockData} from "./block-service";
import {Compbaser} from "ng-mslib";
import * as _ from "lodash";
import {List} from "immutable";
import {ISimpleGridEdit} from "../../comps/simple-grid-module/SimpleGrid";
import {StoreModel} from "../../store/model/StoreModel";
import {SimpleGridRecord} from "../../comps/simple-grid-module/SimpleGridRecord";
import {SimpleGridTable} from "../../comps/simple-grid-module/SimpleGridTable";
import {ISimpleGridDraggedData} from "../../comps/simple-grid-module/SimpleGridDraggable";
import {Lib} from "../../Lib";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {IAddContents} from "../../interfaces/IAddContent";
import {BlockLabels, PLACEMENT_LISTS, PLACEMENT_SCENE} from "../../interfaces/Consts";
import {RedPepperService} from "../../services/redpepper.service";
import {IUiState} from "../../store/store.data";
import {ACTION_UISTATE_UPDATE} from "../../store/actions/appdb.actions";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {LocationMarkModel} from "../../models/LocationMarkModel";

@Component({
    selector: 'block-prop-location',
    host: {
        '(input-blur)': 'saveToStore($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>

        <form novalidate autocomplete="off" class="inner5" [formGroup]="m_contGroup">
            <div class="row">
                <li class="list-group-item">
                    <button (click)="_onAddNewBlock('Fixed')" type="button" title="add event" class="btn btn-default btn-sm">
                        <span class="fa fa-plus"></span>
                    </button>
                    <button (click)="_onRemoveCollectionItem()" type="button" title="remove event" class="btn btn-default btn-sm">
                        <span class="fa fa-minus"></span>
                    </button>
                </li>
                <li class="list-group-item">
                    <label i18n>Default sequential playlist</label>
                    <div style="overflow-x: auto">
                        <div style="width: 250px">
                            <simpleGridTable #simpleGrid>
                                <thead>
                                <tr>
                                    <th>name</th>
                                    <th>seconds</th>
                                    <th>order</th>
                                </tr>
                                </thead>
                                <tbody simpleGridDraggable (dragCompleted)="_onDragComplete($event)">
                                <tr class="simpleGridRecord" simpleGridRecord *ngFor="let item of m_collectionList; let index=index" [item]="item" [index]="index">
                                    <td style="width: 45%" [editable]="true" (labelEdited)="_onPageNameEdited($event,index)" field="name" simpleGridData [item]="item"></td>
                                    <td style="width: 45%" [editable]="true" (labelEdited)="_onDurationEdited($event,index)" field="duration" simpleGridData [item]="item"></td>
                                    <td style="width: 10%" simpleGridDataImage [item]="item" [color]="'blue'" [field]="'fa-arrows-v'"></td>
                                </tr>
                                </tbody>
                            </simpleGridTable>
                        </div>
                    </div>
                </li>
            </div>
            <hr/>
            <h4 id="locationControls" class="panel-title">
                <button (click)="_onAddNewBlock('GPS')" type="button" name="addLocation" title="add a new item" class="addResourceToLocation btn btn-default btn-sm">
                    <span class="glyphicon glyphicon-plus"></span>
                </button>
                <button (click)="_removeLocation()" type="button" name="removeLocation" title="remove item" class="btn btn-default btn-sm">
                    <span class="glyphicon glyphicon-minus"></span>
                </button>
                <button (click)="_jumpToLocation('prev')" type="button" name="previous" title="remove item" class="btn btn-default btn-sm">
                    <span class="glyphicon glyphicon-chevron-left"></span>
                </button>
                <button (click)="_jumpToLocation('next')" type="button" name="next" title="remove item" class="btn btn-default btn-sm">
                    <span class="glyphicon glyphicon-chevron-right"></span>
                </button>
                <button (click)="_openMap()" type="button" name="openLocation" title="openLocation item" class="btn btn-default btn-sm">
                    <span class="glyphicon glyphicon glyphicon-map-marker"></span>
                </button>
            </h4>
            <br/>
            <label>
                <span i18n>Total location based: {{m_totalLocations}}</span>
            </label>

            <div class="row">
                <ul class="list-group">
                    <li class="list-group-item">
                        <span i18n class="inliner">name</span>
                        <input type="text" class="numStepper inliner" formControlName="label">
                    </li>
                    <li class="list-group-item">
                        <span i18n class="inliner">latitude</span>
                        <input type="number" step="0.1" class="numStepper inliner" formControlName="lat">
                    </li>
                    <li class="list-group-item">
                        <span i18n class="inliner">longitude</span>
                        <input type="number" step="0.1" class="numStepper inliner" formControlName="lng">
                    </li>
                    <li class="list-group-item">
                        <span i18n class="inliner">duration</span>
                        <input type="number" min="5" max="86400" class="numStepper inliner" formControlName="duration">
                    </li>
                    <li class="list-group-item">
                        <span i18n>radius range {{m_radius}} kilometers</span><br/>
                        <input #radiusControl (change)="m_radius = radiusControl.value" class="default-prop-width" type="range" max="0.10" step="0.1" max="4" formControlName="radius"/>
                    </li>
                    <li class="list-group-item">
                        <span i18n>conflict priority</span><br/>
                        <input class="default-prop-width" type="range" step="1" max="1" max="5" formControlName="priority"/>
                    </li>
                </ul>
            </div>


        </form>
        <modal #modalAddContent>
            <modal-header [show-close]="true">
                <h4 i18n class="modal-title">add content to collection</h4>
            </modal-header>
            <modal-body>
                <add-content [placement]="m_PLACEMENT_LISTS" #addContent (onClosed)="_onClosed()" (onAddContentSelected)="_onAddedContent($event)"></add-content>
            </modal-body>
            <modal-footer [show-default-buttons]="true"></modal-footer>
        </modal>

        <!--<modal [cssClass]="modal-xl" (onClose)="_onModelMapClosed()" #modalMap [size]="'lg'">-->
        <!--<modal-header [show-close]="false">-->
        <!--<h4 i18n class="modal-title">add content to collection</h4>-->
        <!--</modal-header>-->
        <!--<modal-body>-->
        <!--<location-map *ngIf="m_showMap"></location-map>-->
        <!--</modal-body>-->
        <!--<modal-footer [show-default-buttons]="true"></modal-footer>-->
        <!--</modal>-->
    `
})
export class BlockPropLocation extends Compbaser implements AfterViewInit {

     m_formInputs = {};
     m_currentIndex = 0;
     m_radius = 0;
     m_totalLocations = 0;
     m_contGroup: FormGroup;
     m_blockData: IBlockData;
     m_pendingBlocAddition: { type: string, content: IAddContents, xmlSnippet: string };

    m_showMap = false;
    m_PLACEMENT_LISTS = PLACEMENT_LISTS;
    m_collectionList: List<StoreModel>;

    constructor(private fb: FormBuilder, private yp: YellowPepperService, private cd: ChangeDetectorRef, private bs: BlockService, @Inject('BLOCK_PLACEMENT') private blockPlacement: string, private rp: RedPepperService) {
        super();
        this.m_contGroup = fb.group({
            'mode': [0],
            'label': [0],
            'lng': [0],
            'lat': [0],
            'duration': [0],
            'priority': [0],
            'radius': [0]
        });
        _.forEach(this.m_contGroup.controls, (value, key: string) => {
            this.m_formInputs[key] = this.m_contGroup.controls[key] as FormControl;
        })

        this.cancelOnDestroy(
            //
            this.yp.listenLocationMarkerSelected()
                .filter((i_LocationMarkModel: LocationMarkModel) => !_.isEmpty(this.m_pendingBlocAddition))
                .subscribe((i_LocationMarkModel: LocationMarkModel) => {
                    var domPlayerData = this.m_blockData.playerDataDom;
                    var reLat = new RegExp(":LAT:", "ig");
                    var reLng = new RegExp(":LNG:", "ig");
                    this.m_pendingBlocAddition.xmlSnippet = this.m_pendingBlocAddition.xmlSnippet.replace(reLat, i_LocationMarkModel.lat);
                    this.m_pendingBlocAddition.xmlSnippet = this.m_pendingBlocAddition.xmlSnippet.replace(reLng, i_LocationMarkModel.lng);
                    var xSnippetLocation = jXML(domPlayerData).find('GPS');
                    jXML(xSnippetLocation).append(jXML(this.m_pendingBlocAddition.xmlSnippet));
                    this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
                    this.m_pendingBlocAddition = null;
                    this._jumpToLocation('last')
                }, (e) => console.error(e))
        )

        this.cancelOnDestroy(
            //
            this.yp.listenLocationMapLoad()
                .pairwise()
                .filter(v => v[0] == true && v[1] == false && this.m_pendingBlocAddition && this.m_pendingBlocAddition.xmlSnippet != '')
                .combineLatest(this.yp.ngrxStore.select(store => store.appDb.uiState.locationMap.locationMarkerSelected))
                .subscribe((v) => {
                    console.log(v);
                }, (e) => console.error(e))
        )
    }

    @ViewChild('simpleGrid')
    simpleGrid: SimpleGridTable;

    @ViewChild('modalAddContent')
    modalAddContent: ModalComponent;

    // @ViewChild('modalMap')
    // modalMap: ModalComponent;

    @Input()
    set setBlockData(i_blockData) {
        this.m_blockData = i_blockData;
        this._render();
    }

    ngAfterViewInit() {
        this._render();
        this._jumpToLocation('first');
    }

    _onModelMapClosed() {
        this.m_showMap = false;
    }

    _onDragComplete(dragData: ISimpleGridDraggedData) {
        // dragData.items.forEach((item: StoreModel, i) => con(i + ' ' + item.getKey('name')) );
        var currentIndex = dragData.currentIndex;
        var newIndex = dragData.newIndex;
        var domPlayerData = this.m_blockData.playerDataDom;
        var target = jXML(domPlayerData).find('Fixed').children().get(newIndex);
        var source = jXML(domPlayerData).find('Fixed').children().get(currentIndex);
        newIndex > currentIndex ? jXML(target).after(source) : jXML(target).before(source);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    _onRemoveCollectionItem() {
        var record: SimpleGridRecord = this.simpleGrid.getSelected();
        if (_.isUndefined(record)) return;
        var rowIndex = this.simpleGrid.getSelected().index;
        var domPlayerData = this.m_blockData.playerDataDom;
        jXML(domPlayerData).find('Fixed').children().eq(rowIndex).remove();
        // self._populateTableCollection(domPlayerData);
        // this._populateTableEvents();
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData)
    }


    _onClosed() {
        this.modalAddContent.close()
    }

    _onAddNewBlock(type: string) {
        this.m_pendingBlocAddition = {type: type, content: null, xmlSnippet: ''}
        this.modalAddContent.open()
    }

    /**
     Add a new collection item which can include a Scene or a resource (not a component)
     @method _onAddedContent
     @param {Event} e
     **/
    _onAddedContent(i_addContents: IAddContents) {

        var domPlayerData = this.m_blockData.playerDataDom;
        var buff = '';
        var locationBuff;
        var xSnippetLocation;

        switch (this.m_pendingBlocAddition.type) {
            case 'Fixed': {
                xSnippetLocation = jXML(domPlayerData).find('Fixed');
                locationBuff = '>';
                break;
            }
            case 'GPS': {
                locationBuff = 'lat=":LAT:" lng=":LNG:" radios="4" duration="5" priority="1">';
                xSnippetLocation = jXML(domPlayerData).find('GPS');
                break;
            }
        }

        if (Number(i_addContents.blockCode) == BlockLabels.BLOCKCODE_SCENE) {
            // add scene to collection, if block resides in scene don't allow cyclic reference to collection scene inside current scene
            if (this.blockPlacement == PLACEMENT_SCENE && this.m_blockData.scene.handle == i_addContents.sceneData.scene_id) {
                return bootbox.alert('You cannot display a scene in a collection that refers to itself, that is just weird');
            }

            var sceneName = i_addContents.sceneData.domPlayerDataJson.Player._label;
            var nativeId = i_addContents.sceneData.scene_native_id;

            buff = `<Page page="${sceneName}" type="scene" duration="5" ${locationBuff}
                        <Player src="${nativeId}" hDataSrc="${i_addContents.sceneData.scene_id}"/>
                    </page>
                    `;
        } else {

            var resourceName = this.rp.getResourceRecord(i_addContents.resourceId).resource_name;
            buff = `<Page page="${resourceName}" type="resource" duration="5" ${locationBuff}
                        <Player player="${i_addContents.blockCode}">
                            <Data>
                                <Resource hResource="${i_addContents.resourceId}"/>
                            </Data>
                        </Player>
                    </page>`
        }

        // if default item, just add it. if location item, remember it and only add it once user select
        // a location for it in google the map as we need to wait for the coordinates.

        switch (this.m_pendingBlocAddition.type) {

            case 'Fixed': {
                jXML(xSnippetLocation).append(jXML(buff));
                this.bs.setBlockPlayerData(this.m_blockData, domPlayerData)
                break;
            }
            case 'GPS': {
                this.m_pendingBlocAddition.content = i_addContents;
                this.m_pendingBlocAddition.xmlSnippet = buff;
                this._openMap();
                break;
            }
        }

    }

    _removeLocation() {
        var domPlayerData = this.m_blockData.playerDataDom;
        jXML(domPlayerData).find('GPS').children().eq(this.m_currentIndex).remove();
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
        this._jumpToLocation('first');
    }

    /**
     Populate the total map locations set
     @method _populateTotalMapLocations
     @param {Object} domPlayerData
     **/
    _populateTotalMapLocations() {
        var domPlayerData = this.m_blockData.playerDataDom
        this.m_totalLocations = jXML(domPlayerData).find('GPS').children().length;
        if (this.m_totalLocations == 0) {
            this.m_currentIndex = 0;
        } else {
            // jXML(Elements.LOCATION_SELECTED).show();
        }
        // jXML(Elements.TOTAL_MAP_LOCATIONS).text(total);
    }

    _openMap() {
        var uiState: IUiState = {locationMap: {loadLocationMap: true}}
        this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    }

    /**
     Select specific location and populate both the UI as well scroll map to coordinates
     **/
    _jumpToLocation(i_item?) {
        var domPlayerData = this.m_blockData.playerDataDom;
        var total = jXML(domPlayerData).find('GPS').children().length;
        var item;

        if (total == 0) {
            this._populateTotalMapLocations();
            var uiState: IUiState = {locationMap: {locationMarkerSelected: null}}
            this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
            return;
        }
        if (this.m_currentIndex > total - 1)
            i_item = 'first';

        switch (i_item) {
            case 'first': {
                this.m_currentIndex = 0;
                item = jXML(domPlayerData).find('GPS').children().first();
                break;
            }
            case 'last': {
                this.m_currentIndex = total - 1;
                item = jXML(domPlayerData).find('GPS').children().last();
                break;
            }
            case 'next': {
                if (this.m_currentIndex == (total - 1)) {
                    item = jXML(domPlayerData).find('GPS').children().last();
                } else {
                    this.m_currentIndex++;
                    item = jXML(domPlayerData).find('GPS').children().get(this.m_currentIndex);
                }
                break;
            }
            case 'prev': {
                if (this.m_currentIndex == 0) {
                    item = jXML(domPlayerData).find('GPS').children().first();
                } else {
                    this.m_currentIndex--;
                    item = jXML(domPlayerData).find('GPS').children().get(this.m_currentIndex);
                }
                break;
            }
            default: {
                item = jXML(domPlayerData).find('GPS').children().get(this.m_currentIndex);
            }
        }

        this.m_radius = parseFloat(jXML(item).attr('radios'));
        var lat = parseFloat(jXML(item).attr('lat'));
        var lng = parseFloat(jXML(item).attr('lng'));
        var duration = parseFloat(jXML(item).attr('duration'));

        var marker: LocationMarkModel = new LocationMarkModel({
            id: Math.random(),
            lat: lat,
            lng: lng,
            radius: this.m_radius,
            new: false,
            label: '',
            draggable: true
        })

        this.m_formInputs['label'].setValue(jXML(item).attr('page'));
        this.m_formInputs['priority'].setValue(jXML(item).attr('priority'));
        this.m_formInputs['lat'].setValue(lat);
        this.m_formInputs['lng'].setValue(lng);
        this.m_formInputs['duration'].setValue(duration);
        this.m_formInputs['radius'].setValue(this.m_radius);

        var uiState: IUiState = {locationMap: {locationMarkerSelected: marker}}
        this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))

        // this.m_addBlockLocationView.panToPoint(jXML(item).attr('lat'), jXML(item).attr('lng'));
    }

    _onDurationEdited(event: ISimpleGridEdit, index) {
        var value = event.value;
        if (!Lib.IsNumber(value)) return;
        var domPlayerData = this.m_blockData.playerDataDom;
        var item = jXML(domPlayerData).find('Fixed').children().get(index);
        jXML(item).attr('duration', value);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData)
    }

    _onPageNameEdited(event: ISimpleGridEdit, index) {
        var value = event.value;
        var domPlayerData = this.m_blockData.playerDataDom;
        var item = jXML(domPlayerData).find('Fixed').children().get(index);
        jXML(item).attr('page', value);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData)
    }


    _populateTableCollection() {
        this.m_collectionList = List([]);
        var domPlayerData = this.m_blockData.playerDataDom as any
        var rowIndex = 0;

        jXML(domPlayerData).find('Fixed').children().each((k, page) => {
            var resource_hResource, scene_hDataSrc;
            var type = jXML(page).attr('type');
            if (type == 'resource') {
                resource_hResource = jXML(page).find('Resource').attr('hResource');
            } else {
                scene_hDataSrc = jXML(page).find('Player').attr('hDataSrc');
            }
            //con('populating ' + resource_hResource);

            var storeModel = new StoreModel({
                rowIndex: rowIndex,
                checkbox: true,
                name: jXML(page).attr('page'),
                duration: jXML(page).attr('duration'),
                type: type,
                resource_hResource: resource_hResource,
                scene_hDataSrc: scene_hDataSrc
            });
            this.m_collectionList = this.m_collectionList.push(storeModel);
            rowIndex++;
        });
        this.m_collectionList = this._sortCollection(this.m_collectionList);
    }

    // /**
    //  Load event list to block props UI
    //  @method _populateTableEvents
    //  **/
    // _populateTableEvents() {
    //     var data: Array<JsonEventResourceModel> = [], rowIndex = 0;
    //     var domPlayerData = this.m_blockData.playerDataDom;
    //     // self.m_collectionEventTable.bootstrapTable('removeAll');
    //     jXML(domPlayerData).find('EventCommands').children().each(function (k, eventCommand) {
    //         var pageName = '';
    //         if (jXML(eventCommand).attr('command') == 'selectPage')
    //             pageName = jXML(eventCommand).find('Page').attr('name');
    //         var storeModel = new JsonEventResourceModel({
    //                 rowIndex: rowIndex,
    //                 checkbox: true,
    //                 event: jXML(eventCommand).attr('from'),
    //                 pageName: pageName,
    //                 action: jXML(eventCommand).attr('command')
    //             }
    //         )
    //         data.push(storeModel)
    //         rowIndex++;
    //     });
    //     this.m_jsonEventResources = data;
    // }

    _sortCollection(i_collection: List<StoreModel>): List<StoreModel> {
        var sorted = i_collection.sort((a, b) => {
            if (a.getKey('rowIndex') > b.getKey('rowIndex'))
                return 1;
            if (a.getKey('rowIndex') < b.getKey('rowIndex'))
                return -1;
            return 0;
        })
        return sorted as List<StoreModel>;
    }

    _render() {
        this.m_contGroup.reset();
        this._populateTableCollection();
        this._populateTotalMapLocations();
        this._jumpToLocation();
        this.cd.markForCheck();
    }

    private saveToStore() {
        // console.log(this.m_contGroup.status + ' ' + JSON.stringify(this.ngmslibService.cleanCharForXml(this.m_contGroup.value)));
        if (this.m_contGroup.status != 'VALID')
            return;

        var domPlayerData = this.m_blockData.playerDataDom;
        var total = jXML(domPlayerData).find('GPS').children().length;
        if (total == 0)
            return;
        var item = jXML(domPlayerData).find('GPS').children().get(this.m_currentIndex);
        jXML(item).attr('radios', this.m_contGroup.value.radius);
        jXML(item).attr('page', this.m_contGroup.value.label);
        jXML(item).attr('lat', this.m_contGroup.value.lat);
        jXML(item).attr('lng', this.m_contGroup.value.lng);
        jXML(item).attr('duration', this.m_contGroup.value.duration);
        jXML(item).attr('priority', this.m_contGroup.value.priority);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData)

        // var xSnippet = jXML(domPlayerData).find('HTML');
        // xSnippet.attr('src', this.m_contGroup.value.url);
        // this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    destroy() {
    }
}

