/**
 Add block view is a UI component which allows selection and insertion of a GPS location view coords
 @class AddBlockLocationView
 @constructor
 @return {object} instantiated AddBlockLocationView
 **/
define(['jquery', 'backbone', 'StackView', 'ScreenTemplateFactory', 'bootbox', 'async'], function ($, Backbone, StackView, ScreenTemplateFactory, Bootbox, async) {

    /** SERVICES **/
    BB.SERVICES.ADD_BLOCK_LOCATION_VIEW = 'googleMapsLocationView';
    BB.SERVICES.ADD_BLOCK_LOCATION_SCENE_VIEW = 'googleMapsLocationSceneView';

    var AddBlockLocationView = BB.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function (options) {
            var self = this;
            self.m_map;
            self.m_mapPoints = [];
            self.m_placement = options.placement;
            self.m_loadedMaps = false;
            self.m_markerOnClick = false;
            self.m_mapData = {points: []};
            self._setSimulationMode(false);

            // Clone the AddBlockTemplate
            var e = $(Elements.ADD_BLOCK_LOCATION_TEMPLATE).clone();
            $(self.options.el).append(e).fadeIn();

            var id = _.uniqueId('slideLocSim');
            $(Elements.CLASS_LOCATION_SIMULATION_MODE, self.el).attr('id', id);
            $('label', self.el).attr('for', BB.lib.unhash(id));
            self._listenModeChange('#' + id);

            $(e).show();
            self.el = self.$el[0];

            $(self.el).find('#prev').on('click', function () {
                self._goBack();
                return false;
            });

            self.listenTo(self.options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == self)
                    self._render();
            });

            self._listenStationRefresh();
        },

        /**
         Listen to mode change between simulation mode and real mode
         @method _listenModeChange
         **/
        _listenModeChange: function (i_id) {
            var self = this;
            self.sliderInput = function () {
                var mode = $(i_id).prop('checked');
                self._setSimulationMode(mode);
                if (mode) {
                    $(Elements.CLASS_LOCATION_SIMULATION_PROPS, self.el).slideDown();
                } else {
                    $(Elements.CLASS_LOCATION_SIMULATION_PROPS, self.el).slideUp();
                }
            };
            $(i_id, self.el).on('change', self.sliderInput);
        },

        _setSimulationMode: function (i_mode) {
            var self = this;
            self.m_simulationMode = i_mode;
        },

        _getSimulationMode: function () {
            var self = this;
            return self.m_simulationMode;
        },

        /**
         Listen stations refresh so we rebuild list of available station in the drop down selection
         @method _listenStationRefresh
         **/
        _listenStationRefresh: function () {
            var self = this;
            $(Elements.CLASS_LOCATION_SIMULATION_PROPS, self.el).find('button').on('click', function () {
                self._loadStationList();
            });
        },

        /**
         Init the google map module. We also create a class for _mapPoint which when it gets instantiated
         internally holds a reference to it's own coordinates as well as Marker and Circle.
         Once we do a new on _mapPoint we insert it into an array of m_mapPoints so we can hold
         a reference to all points in a map (used for example when we want to clear the map so
         we can cycle through the points and remove them).
         @method _initMap
         **/
        _initMap: function () {
            var self = this;
            Number.prototype.toRad = function () {
                return this * Math.PI / 180;
            };
            Number.prototype.toDeg = function () {
                return this * 180 / Math.PI;
            };
            self._mapPoint = function (latLng, radius, mapPoints, map, that) {
                var self = this;
                self.$el;
                self.circle;
                self.marker;
                self.latLng = latLng;

                self.remove = function () {
                    // remove circle
                    self.circle.setMap(null);
                    // remove marker
                    self.marker.setMap(null);
                    // remove UI
                    // self.$el.remove();
                };

                // Draw the circle
                self.circle = new google.maps.Circle({
                    center: latLng,
                    radius: radius * 1000,       // Convert to meters
                    fillColor: '#FF0000',
                    fillOpacity: 0.2,
                    map: map,
                    clickable: true,
                    editable: false
                });

                google.maps.event.addListener(self.circle, 'click', function (event) {
                    var lat = event.latLng.lat();
                    var lng = event.latLng.lng();
                    var inst;
                    console.log('location map is in ' + that.options.placement);
                    if (that.options.placement == BB.CONSTS.PLACEMENT_SCENE) {
                        inst = BB.comBroker.getService(BB.SERVICES.ADD_BLOCK_LOCATION_SCENE_VIEW);
                    } else {
                        inst = BB.comBroker.getService(BB.SERVICES.ADD_BLOCK_LOCATION_VIEW);
                    }
                    if (inst._getSimulationMode()) {
                        console.log('within range ' + lat + ' ' + lng);
                        inst._simulateEvent(lat, lng, true);
                    }

                });

                // Show marker at circle center
                self.marker = new google.maps.Marker({
                    position: latLng,
                    map: map
                });

                // UI
                /*
                 var tmpl = document.getElementById('map-point');
                 document.getElementById("map-points").appendChild(tmpl.content.cloneNode(true));
                 self.$el = $('#map-points li:last');

                 self.$el.find('.p-center').html(this.circle.getCenter().toUrlValue());

                 self.$el.find('.remove').click(function () {
                 self.remove();
                 mapPoints.splice(mapPoints.indexOf(self), 1);
                 });

                 // radius slider
                 $('#map-points li:last .radius-slider').slider({
                 formatter: function (value) {
                 return 'Current value: ' + value;
                 }
                 }).on('change', function (event) {
                 self.circle.setRadius(event.value.newValue);
                 });

                 self.$el.find('.radius-slider').on('change', function (e) {
                 var a = $(e.target).val();
                 self.circle.setRadius(Number(a));
                 });

                 // pan to point
                 self.$el.click(function () {
                 map.panTo(self.circle.getCenter());

                 $('#map-points li').css('background-color', '#FFF');
                 $(this).css('background-color', '#ACF19A');
                 });
                 */
            };
            self._createMap();
        },

        /**
         Get all pointData (deprecated)
         @method _pointData
         **/
        _pointData: function () {
            var self = this;
            var data = {
                points: []
            };
            for (var i = 0; i < self.m_mapPoints.length; ++i) {
                var point = self.m_mapPoints[i];
                var center = point.circle.getCenter();
                data.points.push({
                    center: {lat: center.lat(), lng: center.lng()},
                    radius: parseInt(point.circle.getRadius().toString()) / 1000
                });
            }
            return data;
        },

        /**
         Create the google map and listen to corresponding events such map clicks (not within a circle or marker)
         as well as the Search box find input etc
         @method _createMap
         **/
        _createMap: function () {
            var self = this;
            google.maps.LatLng.prototype.destinationPoint = function (brng, dist) {
                dist = dist / 6371;
                brng = brng.toRad();

                var lat1 = this.lat().toRad(), lon1 = this.lng().toRad();

                var lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist) +
                    Math.cos(lat1) * Math.sin(dist) * Math.cos(brng));

                var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) *
                        Math.cos(lat1),
                        Math.cos(dist) - Math.sin(lat1) *
                        Math.sin(lat2));

                if (isNaN(lat2) || isNaN(lon2)) return null;

                return new google.maps.LatLng(lat2.toDeg(), lon2.toDeg());
            };

            var pointA = new google.maps.LatLng(34.155260, -118.787163);   // Circle center
            var radius = 1; // 10km

            var mapOpt = {
                mapTypeId: google.maps.MapTypeId.TERRAIN,
                center: pointA,
                zoom: 10
            };
            var map = $('.map', self.el);
            self.m_map = new google.maps.Map(map[0], mapOpt);

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
        },

        /**
         Build lists of components, resources and scenes (respectively showing what's needed per placement mode)
         Once an LI is selected proper event fired to announce block is added.
         @method _render
         @return undefined
         **/
        _render: function () {
            var self = this;
            if (self.m_loadedMaps) {
                self.loadJson();
                return;
            }
            require(['async!https://maps.googleapis.com/maps/api/js?libraries=places'], function (e) {
                self._initMap();
                self._loadStationList();
                google.maps.LatLng.prototype.destinationPoint = function (brng, dist) {
                    dist = dist / 6371;
                    brng = brng.toRad();

                    var lat1 = this.lat().toRad(), lon1 = this.lng().toRad();

                    var lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist) +
                        Math.cos(lat1) * Math.sin(dist) * Math.cos(brng));

                    var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) *
                            Math.cos(lat1),
                            Math.cos(dist) - Math.sin(lat1) *
                            Math.sin(lat2));

                    if (isNaN(lat2) || isNaN(lon2)) return null;

                    return new google.maps.LatLng(lat2.toDeg(), lon2.toDeg());
                };
                self.m_loadedMaps = true;
                self.loadJson();
                return;
            });

            /*
             $('.log-data').click(function () {
             console.log(JSON.stringify(self._pointData()));
             });
             $('.clear-map').click(function () {
             self._clearMap();
             });
             */
        },

        /**
         Clear the entire map of markers and circles by iterating over the m_mapPoints array
         @method _clearMap
         **/
        _clearMap: function () {
            var self = this;
            for (var i = 0; i < self.m_mapPoints.length; ++i) {
                var point = self.m_mapPoints[i];
                point.remove();
            }
            self.m_mapPoints = [];
        },

        /**
         Simulate a trigger event of GPS coordinates by user clicks within the google map
         @method _simulateEvent
         @param {Number} lat
         @param {Number} lng
         @param {Boolean} inRange true if clicked within a marked circle radius
         **/
        _simulateEvent: function (lat, lng, inRange) {
            var self = this;
            var selected = $(Elements.CLASS_LOCATION_SIMULATION_PROPS, self.el).find('select').eq(0).find('option:selected');
            var postMode = $(Elements.CLASS_LOCATION_SIMULATION_PROPS, self.el).find('select').eq(1).find('option:selected').attr('value');
            var msg = (postMode == 'local') ? 'click link to send post...' : 'sending post...';
            var id = $(selected).attr('data-stationid');
            var ip = $(selected).attr('data-ip');
            var stationRecord = BB.Pepper.getStationRecord(id);
            var port = stationRecord.lan_server_port;
            var $messages = $(Elements.CLASS_LOCATION_SIMULATION_PROPS, self.el).find('h5');
            if (inRange) {
                $messages.css({color: 'green'});
            } else {
                $messages.css({color: 'red'});
            }
            var url = BB.Pepper.sendLocalEventGPS(postMode, lat, lng, id, ip, port, function (e) {
                console.log(e);
            });
            $messages.eq(0).text(msg);
            $messages.eq(1).text(lng);
            $messages.eq(2).text(lat);
            $messages.eq(3).text(url);
            $messages.eq(3).off('click');
            if (postMode=="local"){
                $messages.eq(3).on('click', function(){
                    window.open(url, '_blank');
                });
            }
        },

        /**
         Load and refresh the station list so we can pull station id for simulation
         @method _loadStationList
         **/
        _loadStationList: function () {
            var self = this;
            var userData = pepper.getUserData();
            var url = window.g_protocol + userData.domain + '/WebService/getStatus.ashx?user=' + userData.userName + '&password=' + userData.userPass + '&callback=?';
            var select = $(Elements.CLASS_LOCATION_SIMULATION_PROPS, self.el).find('select').eq(0);
            $(select).children().remove();
            $.getJSON(url, function (data) {
                var s64 = data['ret'];
                var str = $.base64.decode(s64);
                var xml = $.parseXML(str);
                $(xml).find('Station').each(function (key, value) {
                    var stationID = $(value).attr('id');
                    var stationName = $(value).attr('name');
                    var stationPort = $(value).attr('localPort') || 9999;
                    var stationIp = $(value).attr('localAddress');
                    var buff = '<option data-ip="' + stationIp + '" data-stationid="' + stationID + '">' + stationName + '</option>'
                    $(select).append(buff);
                });
            });
        },

        /**
         Go back after selection
         @method _goBack
         **/
        _goBack: function () {
            var self = this;
            switch (self.options.placement) {
                case BB.CONSTS.PLACEMENT_CHANNEL:
                {
                    self.options.stackView.slideToPage(self.options.from, 'left');
                    break;
                }
                case BB.CONSTS.PLACEMENT_SCENE:
                {
                    self.m_sceneSliderView = BB.comBroker.getService(BB.SERVICES['SCENE_SLIDER_VIEW']);
                    self.m_sceneSliderView.slideToPage(Elements.SCENE_SLIDER_VIEW, 'left');
                    break;
                }
                case BB.CONSTS.PLACEMENT_LISTS:
                {
                    self.options.stackView.slideToPage(self.options.from, 'left');
                    break;
                }
            }
            self.m_markerOnClick = false;
            BB.comBroker.fire(BB.EVENTS.ADD_LOCATION_POINT, self);
        },

        /**
         Load and populate the map fro json data, keep in mind data needs to be available from previous method call fills up m_mapData
         @method loadJson
         **/
        loadJson: function () {
            var self = this;
            if (!self.m_loadedMaps)
                return;
            self._clearMap();
            //var data = JSON.parse(str);
            var points = self.m_mapData.points;
            for (var i = 0; i < points.length; ++i) {
                var point = points[i];
                var center = new google.maps.LatLng(point.center.lat, point.center.lng);
                var radius = point.radius;
                self.addPoint(center, radius);
            }
        },

        /**
         Select current view which will animate page loading
         @method selectView
         @params {Object} i_mapData load map data
         @params {Boolean} i_markerOnClick if true, we allow a single click to add a new marker in map
         **/
        selectView: function (i_markerOnClick) {
            var self = this;
            self.m_markerOnClick = i_markerOnClick;
            self.options.stackView.slideToPage(self, 'right');
        },

        /**
         Set current map data (we dont actaully render it yet, just get it ready)
         @method selectView
         @params {Object} i_mapData load map data
         **/
        setData: function (i_mapData) {
            var self = this;
            self.m_mapData = i_mapData;
        },

        /**
         Deselect current view which will animate page unloading
         @method selectView
         **/
        deSelectView: function () {
            var self = this;
            self._goBack();
        },

        /**
         Allow us to control the current placement of the module so the behaviour can be according
         to where the instance resides (i.e.: current launch is from Block collection list of from Channel list
         for example)
         @method setPlayerData
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         setPlacement: function (i_placement) {
            var self = this;
            self.m_placement = self.options.placement = i_placement;
        },
         **/

        /**
         Add a new point to the map (a point is constructed of marker and circle radius and inserted into m_mapPoints)
         @method addPoint
         @param {Number} latLng
         @param {Number} radius
         @param {Boolean} notCenter
         **/
        addPoint: function (latLng, radius, notCenter) {
            var self = this;
            if (notCenter)
                latLng = new google.maps.LatLng(latLng.H, latLng.L);
            radius = radius || 0.10;
            var newPoint = new self._mapPoint(latLng, radius, self.m_mapPoints, self.m_map, self);
            self.m_mapPoints.push(newPoint);
        },

        /**
         Animate google maps to give position
         @method panToPoint
         @param {Number} lat
         @param {Number} lng
         **/
        panToPoint: function (lat, lng) {
            var self = this;
            if (!self.m_map)
                return;
            var center = new google.maps.LatLng(lat, lng);
            self.m_map.panTo(center);
        }
    });

    return AddBlockLocationView;
});

