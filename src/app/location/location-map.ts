import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Inject, NgZone, Output, ViewChild} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {SebmGoogleMap} from "angular2-google-maps/esm/core";
import {IUiState} from "../../store/store.data";
import {ACTION_UISTATE_UPDATE} from "../../store/actions/appdb.actions";
import {MapsAPILoader} from "angular2-google-maps/core";
import {BlockService, IBlockData, ISceneData} from "../blocks/block-service";
import {RedPepperService} from "../../services/redpepper.service";
import {PLACEMENT_CHANNEL, PLACEMENT_SCENE} from "../../interfaces/Consts";
import {CampaignTimelineChanelPlayersModel} from "../../store/imsdb.interfaces_auto";
import {LocationMarkModel} from "../../models/LocationMarkModel";
import {FormBuilder, FormGroup} from "@angular/forms";
import * as _ from 'lodash';

export declare var google: any;

/**
 *  examples:
 *  http://embed.plnkr.co/YX7W20/
 *  http://plnkr.co/edit/NtfCPol50mlwGoiB8UZu?p=preview
 *
 * **/

@Component({
    selector: 'location-map',
    styles: [`
        .sebm-google-map-container {
            height: 700px;
            width: 1700px;
        }

        .green {
            background-color: green;
            color: white;
        }

        .locationSimulationProps {
            width: 420px;
            height: 160px;
            border: 1px dotted gray;
            padding: 6px;
        }

        #simModeContainer {
            padding: 0 20px 20px 0;
            position: relative;
            top: -20px;
        }

        #addressLookup {
            z-index: 1;
            position: relative;
            top: 50px;
            width: 300px;
        }

        #refresh {
            position: relative;
            top: -1px;
            height: 31px;
        }

    `],
    templateUrl: './location-map.html'
})
export class LocationMap extends Compbaser implements AfterViewInit {

    zoom: any = 8;
    lat: any = 51.673858;
    lng: any = 7.815982;
    markers: LocationMarkModel[] = [];
    m_stations = [];
    inSimMode = false;
    m_inRange = false;
    m_simStatus = 'status: waiting...'
    m_simulatedLat = 0;
    m_simulatedLng = 0;
    m_simUrl = '';
    m_blockData: IBlockData;
    contGroup: FormGroup;


    constructor(private yp: YellowPepperService, private cd: ChangeDetectorRef, private m_mapsAPILoader: MapsAPILoader, private fb: FormBuilder,
                private zone: NgZone, private bs: BlockService, @Inject('BLOCK_PLACEMENT') private blockPlacement: string, private rp: RedPepperService) {
        super();
        this.contGroup = fb.group({
            'stations': [],
            'postMode': []
        });
    }

    @ViewChild('address')
    address;

    @ViewChild('googleMaps')
    googleMaps: SebmGoogleMap;

    @Output()
    onClose: EventEmitter<any> = new EventEmitter<any>();

    ngAfterViewInit() {

        // Google Place Autocomplete
        var autocomplete: any;
        // var inputAddress = document.getElementById("address");

        this.m_mapsAPILoader.load().then(() => {
            console.log('google script loaded');

            autocomplete = new google.maps.places.Autocomplete(this.address.nativeElement, {});
            google.maps.event.addListener(autocomplete, 'place_changed', () => {

                this.zone.run(() => {
                    /*
                     "Zone.run" allows the map to be immediately updated.
                     Without it, you would have to click the map to observe
                     the new lat and lng
                     */
                    var place = autocomplete.getPlace();
                    if (!place || !place.geometry) return;
                    var lat = place.geometry.location.lat();
                    var lng = place.geometry.location.lng();
                    this.setCenter(lat, lng)
                });

            });

            // var geocoder = new google.maps.Geocoder();
        });

        this.cancelOnDestroy(
            //
            this.yp.listenLocationMarkerSelected()
                .subscribe((i_marker: LocationMarkModel) => {
                    this.setCenter(i_marker.lat, i_marker.lng)
                }, (e) => console.error(e))
        )

        if (this.blockPlacement == PLACEMENT_CHANNEL)
            this._listenOnChannels();
        if (this.blockPlacement == PLACEMENT_SCENE)
            this._listenOnScenes();
    }

    _toggleSimMode() {
        this.inSimMode = !this.inSimMode;
        if (!this.inSimMode) {
            this.m_simulatedLat = 0;
            this.m_simulatedLng = 0;
            this.m_inRange = false;
        } else {
            this._loadStationList();
            this.contGroup.controls.postMode.setValue('local');
        }
        this.cd.markForCheck();
    }

    /**
     Load and refresh the station list so we can pull station id for simulation
     @method _loadStationList
     **/
    _loadStationList() {
        var self = this;
        this.m_stations = [];
        this.contGroup.controls.stations.setValue('');
        var userData = this.rp.getUserData();
        var url = window.g_protocol + userData.domain + '/WebService/getStatus.ashx?user=' + userData.userName + '&password=' + userData.userPass + '&callback=?';
        $.getJSON(url, (data) => {
            var s64 = data['ret'];
            var str = jQuery.base64.decode(s64);
            var xml = jXML.parseXML(str);
            $(xml).find('Station').each((key, value) => {
                var stationId = $(value).attr('id');
                var stationName = $(value).attr('name');
                var stationPort = $(value).attr('localPort') || 9999;
                var stationIp = $(value).attr('localAddress');
                self.m_stations.push({stationIp, stationId, stationName, stationPort});
            });
            self.cd.markForCheck();
        });
    }

    _onStationSelected(event) {
        console.log(this.contGroup.value);
    }

    /**
     Simulate a trigger event of GPS coordinates by user clicks within the google map
     @method _simulateEvent
     @param {Number} lat
     @param {Number} lng
     @param {Boolean} inRange true if clicked within a marked circle radius
     **/
    private _simulateEvent(i_marker: LocationMarkModel, i_inRange) {
        this.m_inRange = i_inRange;
        this.m_simulatedLat = i_marker.lat;
        this.m_simulatedLng = i_marker.lng;

        var selected = this.contGroup.value.stations;
        if (_.isNull(selected) || _.isEmpty(selected))
            return bootbox.alert('no station selected...');
        var postMode = this.contGroup.value.postMode;
        var msg = (postMode == 'local') ? 'click link below to send post...' : 'sending post...';

        var id = this.contGroup.value.stations.stationId;
        var ip = this.contGroup.value.stations.stationIp;
        var stationRecord = this.rp.getStationRecord(id);
        var port = stationRecord.lan_server_port;
        var url = this.rp.sendLocalEventGPS(postMode, this.m_simulatedLat, this.m_simulatedLng, id, ip, port, function (e) {
            console.log(e);
        });
        this.m_simStatus = msg;
        this.m_simUrl = url;
    }

    _openSimUrl() {
        if (this.contGroup.value.postMode != 'local') return;
        var id = this.contGroup.value.stations.stationId;
        var ip = this.contGroup.value.stations.stationIp;
        var stationRecord = this.rp.getStationRecord(id);
        var port = stationRecord.lan_server_port;
        var url = this.rp.sendLocalEventGPS('local', this.m_simulatedLat, this.m_simulatedLng, id, ip, port, function (e) {
            console.log(e);
        });
        window.open(url, '_blank');
    }

    private _listenOnChannels() {
        this.cancelOnDestroy(
            //
            this.yp.listenBlockChannelSelectedOrChanged()
                .mergeMap((i_campaignTimelineChanelPlayersModel: CampaignTimelineChanelPlayersModel) => {
                    return this.bs.getBlockData(i_campaignTimelineChanelPlayersModel.getCampaignTimelineChanelPlayerId())
                })
                .subscribe((blockData: IBlockData) => {
                    this.m_blockData = blockData;
                    this.render();

                }, (e) => console.error(e))
        )
    }

    private _listenOnScenes() {
        this.cancelOnDestroy(
            //
            this.yp.listenSceneOrBlockSelectedChanged()
                .mergeMap((i_sceneData: ISceneData) => {
                    return this.bs.getBlockDataInScene(i_sceneData)
                })
                .subscribe((blockData: IBlockData) => {
                    this.m_blockData = blockData;
                    this.render();
                }, (e) => console.error(e))
        )
    }

    render() {
        this.markers = [];
        var domPlayerData = this.bs.getBlockPlayerData(this.m_blockData)
        $(domPlayerData).find('GPS').children().each((k, v) => {
            var marker: LocationMarkModel = new LocationMarkModel({
                draggable: false,
                label: '',
                lat: parseFloat(jXML(v).attr('lat')),
                lng: parseFloat(jXML(v).attr('lng')),
                radius: parseFloat(jXML(v).attr('radios')) * 1000, // convert to meters
            });
            this.markers.push(marker);
            //map.points.push(point);

        });
        if (this.markers.length > 0)
            this.setCenter(this.markers[0].lat, this.markers[0].lng);
        this.forceUpdateUi()
    }

    clickedMarker(i_marker: LocationMarkModel, index: number) {
        if (this.inSimMode)
            return this._simulateEvent(i_marker, true);
        // con(`clicked the marker: ${i_marker.label || index}`)
        var uiState: IUiState = {locationMap: {locationMarkerSelected: i_marker}}
        this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    }

    mapClicked($event: MouseEvent) {
        let marker: LocationMarkModel = new LocationMarkModel({
            id: Math.random(),
            radius: 10000,
            lat: $event['coords'].lat,
            lng: $event['coords'].lng,
            draggable: true,
            new: true
        });

        if (this.inSimMode)
            return this._simulateEvent(marker, false);

        // enable code below if you wish to add new marker and not through reactive
        // this.markers.push(marker);
        // this.forceUpdateUi();
        var uiState: IUiState = {locationMap: {locationMarkerSelected: marker}}
        this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    }

    markerDragEnd(m: LocationMarkModel, $event: MouseEvent) {
        console.log('dragEnd', m, $event);
    }

    _close() {
        var uiState: IUiState = {
            locationMap: {
                loadLocationMap: false
            }
        }
        this.yp.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
        this.onClose.emit()
    }

    public forceUpdateUi() {
        this.cd.detach();
        setTimeout(() => {
            this.cd.reattach();
            this.googleMaps.triggerResize();
            this.cd.markForCheck();
        }, 300)
    }

    public setCenter(lat, lng) {
        // for private access to all APIs do:
        this.googleMaps['_mapsWrapper'].setCenter({
            lat: lat,
            lng: lng,
        });
        this.forceUpdateUi();
    }

    destroy() {
    }
}


/**
 Create the google map and listen to corresponding events such map clicks (not within a circle or marker)
 as well as the Search box find input etc
 @method _createMap
 **/
// _createMap() {
//     var self = this;
//     google.maps.LatLng.prototype.destinationPoint = function (brng, dist) {
//         dist = dist / 6371;
//         brng = brng.toRad();
//
//         var lat1 = this.lat().toRad(), lon1 = this.lng().toRad();
//
//         var lat2:any = Math.asin(Math.sin(lat1) * Math.cos(dist) +
//             Math.cos(lat1) * Math.sin(dist) * Math.cos(brng));
//
//         var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) *
//                 Math.cos(lat1),
//                 Math.cos(dist) - Math.sin(lat1) *
//                 Math.sin(lat2));
//
//         if (isNaN(lat2) || isNaN(lon2)) return null;
//
//         return new google.maps.LatLng(lat2.toDeg(), lon2.toDeg());
//     };
//
//     var pointA = new google.maps.LatLng(34.155260, -118.787163);   // Circle center
//     var radius = 1; // 10km
//
//     var mapOpt = {
//         mapTypeId: google.maps.MapTypeId.TERRAIN,
//         center: pointA,
//         zoom: 10
//     };
//     var map = $('.map', self.el.nativeElement);
//     // self.m_map = new google.maps.Map(map[0], mapOpt);
//     console.log(this.googleMaps);

/*

 // Create the search box and link it to the UI element.
 //var input = $('#pac-input', self.el)[0];
 var c = $('.inputPlacement', self.el);
 $(c).append('<input class="pac-input" class="controls" type="text" placeholder="Search Box">');
 var input = $(c).find('input')[0];


 var searchBox = new google.maps.places.SearchBox(input);
 self.m_map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

 // Bias the SearchBox results towards current map's viewport.
 self.m_map.addListener('bounds_changed', function () {
 searchBox.setBounds(self.m_map.getBounds());
 });

 var markers = [];
 // Listen for the event fired when the user selects a prediction and retrieve details for location
 searchBox.addListener('places_changed', function () {
 var places = searchBox.getPlaces();

 if (places.length == 0) {
 return;
 }

 // Clear out the old markers.
 markers.forEach(function (marker) {
 marker.setMap(null);
 });
 markers = [];

 // For each place, get the icon, name and location.
 var bounds = new google.maps.LatLngBounds();
 places.forEach(function (place) {
 var icon = {
 url: place.icon,
 size: new google.maps.Size(71, 71),
 origin: new google.maps.Point(0, 0),
 anchor: new google.maps.Point(17, 34),
 scaledSize: new google.maps.Size(25, 25)
 };

 // Create a marker for each place.
 markers.push(new google.maps.Marker({
 map: self.m_map,
 icon: icon,
 title: place.name,
 position: place.geometry.location
 }));

 if (place.geometry.viewport) {
 // Only geocodes have viewport.
 bounds.union(place.geometry.viewport);
 } else {
 bounds.extend(place.geometry.location);
 }
 });
 self.m_map.fitBounds(bounds);
 });

 google.maps.event.addListener(self.m_map, 'click', function (event) {
 var lat = event.latLng.lat();
 var lng = event.latLng.lng();
 if (self._getSimulationMode()) {
 console.log('out of range ' + lat + ' ' + lng);
 self._simulateEvent(lat, lng, false);
 return;
 }
 if (self.m_markerOnClick) {
 self.addPoint(event.latLng, 0.10);
 self.m_markerOnClick = false;
 BB.comBroker.fire(BB.EVENTS.ADD_LOCATION_POINT, self, null, {lat: lat, lng: lng});
 }
 });
 */
//}


// export interface IMarker {
//     lat: number;
//     lng: number;
//     radius: number;
//     draggable: boolean;
//     new:boolean;
// }

