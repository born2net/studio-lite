/**
 Add block view is a UI component which allows selection and insertion of a GPS location view coords
 @class AddBlockLocationView
 @constructor
 @return {object} instantiated AddBlockLocationView
 **/
define(['jquery', 'backbone', 'StackView', 'ScreenTemplateFactory', 'bootbox', 'async'], function ($, Backbone, StackView, ScreenTemplateFactory, Bootbox, async) {

    /** SERVICES **/
    BB.SERVICES.GOOGLE_MAPS_LOCATION_VIEW = 'googleMapsLocationView';

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

            // Clone the AddBlockTemplate
            var e = $(Elements.ADD_BLOCK_LOCATION_TEMPLATE).clone();
            $(self.options.el).append(e).fadeIn();
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
        },

        _initMap: function () {
            var self = this;

            Number.prototype.toRad = function () {
                return this * Math.PI / 180;
            };

            Number.prototype.toDeg = function () {
                return this * 180 / Math.PI;
            };

            self._mapPoint = function (latLng, radius, mapPoints, map) {
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
                }

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

                google.maps.event.addListener(self.circle, 'click', function(event) {
                    var lat = event.latLng.lat()
                    var lng = event.latLng.lng()
                    console.log('within range ' + lat + ' ' + lng);
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
         Clear entite map
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


            self.m_map = new google.maps.Map(document.getElementById("map"), mapOpt);


            // Create the search box and link it to the UI element.
            var input = document.getElementById('pac-input');
            var searchBox = new google.maps.places.SearchBox(input);
            self.m_map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

            // Bias the SearchBox results towards current map's viewport.
            self.m_map.addListener('bounds_changed', function () {
                searchBox.setBounds(self.m_map.getBounds());
            });

            var markers = [];
            // Listen for the event fired when the user selects a prediction and retrieve
            // more details for that place.
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
                console.log('out of range ' + lat + ' ' + lng);
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

        _clearMap: function () {
            var self = this;
            for (var i = 0; i < self.m_mapPoints.length; ++i) {
                var point = self.m_mapPoints[i];
                point.remove();
            }
            self.m_mapPoints = [];
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
         **/
        setPlacement: function (i_placement) {
            var self = this;
            self.m_placement = self.options.placement = i_placement;
        },

        addPoint: function (latLng, radius, notCenter) {
            var self = this;
            if (notCenter)
                latLng = new google.maps.LatLng(latLng.H, latLng.L);
            radius = radius || 0.10;
            var newPoint = new self._mapPoint(latLng, radius, self.m_mapPoints, self.m_map);
            self.m_mapPoints.push(newPoint);
        },

        panToPoint: function(lat, lng){
            var self = this;
            if (!self.m_map)
                return;
            var center = new google.maps.LatLng(lat, lng);
            self.m_map.panTo(center);
        }
    });

    return AddBlockLocationView;
});

