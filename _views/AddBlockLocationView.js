/**
 Add block view is a UI component which allows selection and insertion of a GPS location view
 @class AddBlockLocationView
 @constructor
 @return {object} instantiated AddBlockLocationView
 **/
define(['jquery', 'backbone', 'StackView', 'ScreenTemplateFactory', 'bootbox', 'async'], function ($, Backbone, StackView, ScreenTemplateFactory, Bootbox, async) {

    /**
     Custom event fired when a new block is added to timeline_channel
     @event ADD_NEW_BLOCK_CHANNEL
     @param {this} caller
     @param {self} context caller
     @param {event} player_code which represents a specific code assigned for each block type
     @static
     @final
     **/
    //BB.EVENTS.ADD_NEW_BLOCK_CHANNEL = 'ADD_NEW_BLOCK_CHANNEL';

    /**
     Custom event fired when a new block is added to scene
     @event ADD_NEW_BLOCK_SCENE
     @param {this} caller
     @param {self} context caller
     @param {event} player_code which represents a specific code assigned for each block type
     @static
     @final
     **/
    //BB.EVENTS.ADD_NEW_BLOCK_SCENE = 'ADD_NEW_BLOCK_SCENE';

    /**
     Custom event fired when a new block is added to scene
     @event ADD_NEW_BLOCK_SCENE
     @param {this} caller
     @param {self} context caller
     @param {event} player_code which represents a specific code assigned for each block type
     @static
     @final
     **/
    //BB.EVENTS.ADD_NEW_BLOCK_LIST = 'ADD_NEW_BLOCK_LIST';


    /** SERVICES **/
    BB.SERVICES.ADD_BLOCK_LOCATION_VIEW = 'AddBlockLocationView';
    BB.SERVICES.ADD_SCENE_BLOCK_LOCATION_VIEW = 'AddSceneBlockLocationView';

    var AddBlockLocationView = BB.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function (options) {
            var self = this;

            self.m_placement = options.placement;
            self.m_loadedMaps = false;
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
            self._buildBSAccordion();
        },

        _initMap: function(){
            var self = this;



            Number.prototype.toRad = function () {
                return this * Math.PI / 180;
            }

            Number.prototype.toDeg = function () {
                return this * 180 / Math.PI;
            }


            var map;
            var circles = [];
            var mapPoints = [];

            window.mapPoint = function(latLng, radius) {
                var self = this;

                this.$el;
                this.circle;
                this.marker;

                this.remove = function () {
                    // remove circle
                    self.circle.setMap(null);
                    // remove marker
                    self.marker.setMap(null);
                    // remove UI
                    self.$el.remove();
                }

                // Draw the circle
                this.circle = new google.maps.Circle({
                    center: latLng,
                    radius: radius * 1000,       // Convert to meters
                    fillColor: '#FF0000',
                    fillOpacity: 0.2,
                    map: map
                });

                // Show marker at circle center
                this.marker = new google.maps.Marker({
                    position: latLng,
                    map: map
                });

                // UI
                var tmpl = document.getElementById('map-point');
                document.getElementById("map-points").appendChild(tmpl.content.cloneNode(true));
                this.$el = $('#map-points li:last');

                this.$el.find('.p-center').html(this.circle.getCenter().toUrlValue());

                this.$el.find('.remove').click(function() {
                    self.remove();
                    mapPoints.splice(mapPoints.indexOf(self), 1);
                });

                // radius slider
                $('#map-points li:last .radius-slider').slider({
                    formatter: function(value) {
                        return 'Current value: ' + value;
                    }
                }).on('change', function (event) {
                    self.circle.setRadius(event.value.newValue);
                });

                // pan to point
                this.$el.click(function() {
                    map.panTo(self.circle.getCenter());

                    $('#map-points li').css('background-color', '#FFF');
                    $(this).css('background-color', '#ACF19A');
                });
            }


            window.pointData = function () {
                var data = {
                    points: []
                };
                for (var i = 0; i < mapPoints.length;++i) {
                    var point = mapPoints[i];
                    var center = point.circle.getCenter();
                    data.points.push({
                        center: {lat: center.lat(), lng: center.lng()},
                        radius: parseInt(point.circle.getRadius().toString()) / 1000
                    });
                }
                return data;
            }

            window.loadJson = function (str) {
                var data = JSON.parse(str);
                var points = data.points;
                for (var i = 0;i < points.length;++i) {
                    var point = points[i];
                    var center = new google.maps.LatLng(point.center.lat, point.center.lng);
                    var radius = point.radius;

                    addPoint(center, radius);
                }
            }

            window.addPoint = function (latLng, radius) {
                radius = radius || 1;

                var newPoint = new mapPoint(latLng, radius);

                mapPoints.push(newPoint);
            }

            window.initAutocomplete = function () {
                google.maps.LatLng.prototype.destinationPoint = function(brng, dist) {
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
                }

                var pointA = new google.maps.LatLng(34.155260, -118.787163);   // Circle center
                var radius = 1;                                      // 10km

                var mapOpt = {
                    mapTypeId: google.maps.MapTypeId.TERRAIN,
                    center: pointA,
                    zoom: 10
                };



                map = new google.maps.Map(document.getElementById("map"), mapOpt);


                // Create the search box and link it to the UI element.
                var input = document.getElementById('pac-input');
                var searchBox = new google.maps.places.SearchBox(input);
                map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

                // Bias the SearchBox results towards current map's viewport.
                map.addListener('bounds_changed', function() {
                    searchBox.setBounds(map.getBounds());
                });

                var markers = [];
                // Listen for the event fired when the user selects a prediction and retrieve
                // more details for that place.
                searchBox.addListener('places_changed', function() {
                    var places = searchBox.getPlaces();

                    if (places.length == 0) {
                        return;
                    }

                    // Clear out the old markers.
                    markers.forEach(function(marker) {
                        marker.setMap(null);
                    });
                    markers = [];

                    // For each place, get the icon, name and location.
                    var bounds = new google.maps.LatLngBounds();
                    places.forEach(function(place) {
                        var icon = {
                            url: place.icon,
                            size: new google.maps.Size(71, 71),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(17, 34),
                            scaledSize: new google.maps.Size(25, 25)
                        };

                        // Create a marker for each place.
                        markers.push(new google.maps.Marker({
                            map: map,
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
                    map.fitBounds(bounds);
                });

                google.maps.event.addListener(map, 'click', function(event) {
                    addPoint(event.latLng);
                });
            }

            /*
            $(function() {
                $('.log-data').click(function() {
                    console.log(JSON.stringify(pointData()));
                });

                $('.clear-map').click(function() {
                    for (var i = 0;i < mapPoints.length;++i) {
                        var point = mapPoints[i];

                        point.remove();
                    }

                    mapPoints = [];
                });
            });
            */
            initAutocomplete();
        },

        /**
         Build lists of components, resources and scenes (respectively showing what's needed per placement mode)
         Once an LI is selected proper event fired to announce block is added.
         @method _render
         @return none
         **/
        _render: function () {
            var self = this;
            if (self.m_loadedMaps)
                return;
            self.m_loadedMaps = true;
            require(['async!https://maps.googleapis.com/maps/api/js?libraries=places&callback=initAutocomplete'], function(e) {
                self._initMap();
                google.maps.LatLng.prototype.destinationPoint = function(brng, dist) {
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
            });


            return;
            BB.comBroker.getService(BB.SERVICES.PROPERTIES_VIEW).resetPropertiesView();

            $(Elements.ADD_COMPONENT_BLOCK_LIST, self.el).empty();
            $(Elements.ADD_RESOURCE_BLOCK_LIST, self.el).empty();
            $(Elements.ADD_SCENE_BLOCK_LIST, self.el).empty();

            /////////////////////////////////////////////////////////
            // show component selection list
            /////////////////////////////////////////////////////////
            var components = BB.PepperHelper.getBlocks();
            var primeUpgradeText = $(Elements.MSG_BOOTBOX_ENTERPRISE_UPGRADE).text();
            var bufferFreeComp = '';
            var bufferPrimeComp = '';
            for (var componentID in components) {
                var primeSnippet = '';
                var faOpacity = 1;
                var bufferSwitch = 0;
                // don't show image, svg or video component in component list
                if (componentID == '3130' ||
                    componentID == '3140' ||
                    componentID == '3100' ||
                    componentID == '3510' ||
                    (self.m_placement == BB.CONSTS.PLACEMENT_CHANNEL && componentID == '4505') ||
                    (self.m_placement == BB.CONSTS.PLACEMENT_SCENE && componentID == '4500')) {
                    continue;
                }

                switch (self._checkAllowedComponent(componentID)) {
                    case 0:
                    {
                        continue;
                        break;
                    }

                    case 1:
                    {
                        bufferSwitch = 1;
                        primeSnippet = '';
                        faOpacity = 1;
                        break;
                    }

                    case 2:
                    {
                        bufferSwitch = 2;
                        primeSnippet = '<button type="button" class="primeComponent btn btn-primary btn-xs">' + primeUpgradeText + '</button>'
                        faOpacity = 0.7;
                        break;
                    }
                }

                var snippet = ' <li class="list-group-item ' + BB.lib.unclass(Elements.CLASS_ADD_BLOCK_LIST_ITEMS, self.el) + '" data-component_id="' + componentID + '" data-component_name="' + components[componentID].name + '">';
                snippet += '        <i style="opacity: ' + faOpacity + '" class="fa ' + components[componentID].fontAwesome + '"></i>';
                snippet += '        <span style="opacity: ' + faOpacity + '"> ' + components[componentID].name + '</span>';
                snippet += '        <h6 style="opacity: ' + faOpacity + '"> ' + components[componentID].description + '</h6>' + primeSnippet;
                snippet += '    </li>';

                bufferSwitch == 1 ? bufferFreeComp += snippet : bufferPrimeComp += snippet;
            }

            $(Elements.ADD_COMPONENT_BLOCK_LIST, self.el).append(bufferFreeComp);
            $(Elements.ADD_COMPONENT_BLOCK_LIST, self.el).append(bufferPrimeComp);

            /////////////////////////////////////////////////////////
            // show resource selection list
            /////////////////////////////////////////////////////////

            var recResources = pepper.getResources();
            $(recResources).each(function (i) {

                // dont process deleted resources
                if (recResources[i]['change_type'] == 3)
                    return;

                var size = (parseInt(recResources[i]['resource_bytes_total']) / 1000).toFixed(2);
                var resourceDescription = 'size: ' + size + 'K dimension: ' + recResources[i]['resource_pixel_width'] + 'x' + recResources[i]['resource_pixel_height'];
                var snippet = '<li class="list-group-item ' + BB.lib.unclass(Elements.CLASS_ADD_BLOCK_LIST_ITEMS, self.el) + '" data-resource_id="' + recResources[i]['resource_id'] + '" data-resource_name="' + recResources[i]['resource_name'] + '">' +
                    '<i class="fa ' + BB.PepperHelper.getFontAwesome(recResources[i]['resource_type']) + '"></i>' +
                    '<span>' + recResources[i]['resource_name'] + '</span>' +
                    '<br/><small>' + resourceDescription + '</small>' +
                    '</li>';
                $(Elements.ADD_RESOURCE_BLOCK_LIST, self.el).append(snippet);
            });

            /////////////////////////////////////////////////////////
            // show scene selection list in Scene or block list modes
            /////////////////////////////////////////////////////////

            if (self.m_placement == BB.CONSTS.PLACEMENT_CHANNEL || self.m_placement == BB.CONSTS.PLACEMENT_LISTS) {
                var scenes = pepper.getScenes();
                _.each(scenes, function (scene, i) {
                    var label = $(scene).find('Player').eq(0).attr('label');
                    var sceneID = $(scene).find('Player').eq(0).attr('id');
                    sceneID = pepper.sterilizePseudoId(sceneID);
                    var snippet = '<li class="list-group-item ' + BB.lib.unclass(Elements.CLASS_ADD_BLOCK_LIST_ITEMS, self.el) + '" data-scene_id="' + sceneID + '">' +
                        '<i class="fa ' + BB.PepperHelper.getFontAwesome('scene') + '"></i>' +
                        '<span>' + label + '</span>' +
                        '<br/><small></small>' +
                        '</li>';
                    $(Elements.ADD_SCENE_BLOCK_LIST, self.el).append(snippet);
                });
            }

            if (self.m_placement == BB.CONSTS.PLACEMENT_SCENE){
                $(Elements.ADD_COMPONENTS_BLOCK_LIST_CONTAINER, self.el).show();
                $(Elements.ADD_SCENE_BLOCK_LIST_CONTAINER, self.el).hide();
            }


            if (self.m_placement == BB.CONSTS.PLACEMENT_LISTS) {
                $(Elements.ADD_COMPONENTS_BLOCK_LIST_CONTAINER, self.el).hide();
                $(Elements.ADD_SCENE_BLOCK_LIST_CONTAINER, self.el).show();
            }


            if (self.m_placement == BB.CONSTS.PLACEMENT_CHANNEL) {
                $(Elements.ADD_COMPONENTS_BLOCK_LIST_CONTAINER, self.el).show();
                $(Elements.ADD_SCENE_BLOCK_LIST_CONTAINER, self.el).show();
            }



            $(Elements.CLASS_ADD_BLOCK_LIST_ITEMS, self.el).on('click', function (e) {
                var component_id = $(e.target).closest('li').data('component_id');
                var resource_id = $(e.target).closest('li').data('resource_id');
                var scene_id = $(e.target).closest('li').data('scene_id');
                var primeComp = $(e.target).closest('li').find(Elements.CLASS_PRIME_COMPONENT);
                var blockCode = -1;

                if (primeComp.length > 0) {
                    Bootbox.dialog({
                        message: $(Elements.MSG_BOOTBOX_ENTERPRISE_UPGRADE_TEXT).text(),
                        title: $(Elements.MSG_BOOTBOX_ENTERPRISE_UPGRADE).text(),
                        buttons: {
                            success: {
                                label: $(Elements.MSG_BOOTBOX_ENTERPRISE_UPGRADE).text(),
                                className: "btn-success",
                                callback: function () {
                                    BB.comBroker.getService(BB.SERVICES.NAVIGATION_VIEW).selectNavigation(Elements.CLASSS_PRO_STUDIO_PANEL);
                                }
                            },
                            main: {
                                label: $(Elements.MSG_BOOTBOX_OK).text(),
                                className: "btn-primary"
                            }
                        }
                    });
                    return;
                }

                if (!_.isUndefined(component_id)) {
                    blockCode = component_id;
                } else if (!_.isUndefined(resource_id)) {
                    blockCode = BB.PepperHelper.getBlockCodeFromFileExt(pepper.getResourceType(resource_id));
                } else if (!_.isUndefined(scene_id)) {
                    blockCode = 3510;
                }

                var eventName;
                switch(self.options.placement){
                    case BB.CONSTS.PLACEMENT_CHANNEL: {
                        eventName = BB.EVENTS.ADD_NEW_BLOCK_CHANNEL;
                        break;
                    }
                    case BB.CONSTS.PLACEMENT_SCENE: {
                        eventName = BB.EVENTS.ADD_NEW_BLOCK_SCENE;
                        break;
                    }
                    case BB.CONSTS.PLACEMENT_LISTS: {
                        eventName = BB.EVENTS.ADD_NEW_BLOCK_LIST;
                        break;
                    }
                }

                BB.comBroker.fire(eventName, this, self.options.placement, {
                    blockCode: blockCode,
                    resourceID: resource_id,
                    sceneID: scene_id
                });
                self.deSelectView();
            });
        },

        /**
         Check if component is allowed under enterprise / prime membership
         @method _checkAllowedComponent
         @param {Number} i_componentID
         @return {Number} 0 = hide, 1 = show, 2 = upgradable
         **/
        _checkAllowedComponent: function (i_componentID) {
            // free component so show it

            // FasterQ, open to all
            if (i_componentID==6100){
                return 1;
            }
            var appID = BB.PepperHelper.getBlockBoilerplate(i_componentID).app_id;
            if (_.isUndefined(appID))
                return 1;

            // component is prime, account is free type, upgradable
            if (pepper.getUserData().resellerID == 1)
                return 2;

            // account is under a reseller and component not available, hide it
            if (pepper.getUserData().resellerID != 1 && _.isUndefined(pepper.getUserData().components[appID]))
                return 0;

            // account is under a reseller and component is available, show it
            return 1;
        },

        /**
         Hook onto bootstrap accordion so user can select new block to add
         @method _buildBSAccordion
         **/
        _buildBSAccordion: function () {
            var self = this;
            var uniqueID = _.uniqueId('addBlockAccord');
            self.$el.find('#addNewBlockListPanel').attr('id', uniqueID);
            self.$el.find('a').attr('data-parent', '#' + uniqueID).eq(0);
            for (var i = 0; i < 3; i++) {
                var unique = _.uniqueId('addBlockAccord')
                self.$el.find('a').eq(i).attr('href', '#' + unique);
                self.$el.find('.panel-collapse').eq(i).attr('id', unique);
            }
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
        },

        /**
         Select current view which will animate page loading
         @method selectView
         **/
        selectView: function () {
            var self = this;
            self.options.stackView.slideToPage(self, 'right');
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
        setPlacement: function(i_placement){
            var self = this;
            self.m_placement = self.options.placement = i_placement;
        }
    });

    return AddBlockLocationView;
});

