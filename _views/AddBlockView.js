/**
 Add block view is a UI component which allows selection and insertion of a new component (i.e. QR / RSS ...)
 or a resource to be added to the currently selected timeline_channel.
 We also skip displaying certain components / scenes dependon


 @class AddBlockView
 @constructor
 @return {object} instantiated AddBlockView
 **/
define(['jquery', 'backbone', 'StackView', 'ScreenTemplateFactory', 'bootbox'], function ($, Backbone, StackView, ScreenTemplateFactory, Bootbox) {

    /**
     Custom event fired when a new block is added to timeline_channel
     @event ADD_NEW_BLOCK_CHANNEL
     @param {this} caller
     @param {self} context caller
     @param {event} player_code which represents a specific code assigned for each block type
     @static
     @final
     **/
    BB.EVENTS.ADD_NEW_BLOCK_CHANNEL = 'ADD_NEW_BLOCK_CHANNEL';

    /**
     Custom event fired when a new block is added to scene
     @event ADD_NEW_BLOCK_SCENE
     @param {this} caller
     @param {self} context caller
     @param {event} player_code which represents a specific code assigned for each block type
     @static
     @final
     **/
    BB.EVENTS.ADD_NEW_BLOCK_SCENE = 'ADD_NEW_BLOCK_SCENE';

    /**
     Custom event fired when a new block is added to scene
     @event ADD_NEW_BLOCK_SCENE
     @param {this} caller
     @param {self} context caller
     @param {event} player_code which represents a specific code assigned for each block type
     @static
     @final
     **/
    BB.EVENTS.ADD_NEW_BLOCK_LIST = 'ADD_NEW_BLOCK_LIST';


    /** SERVICES **/
    BB.SERVICES.ADD_BLOCK_VIEW = 'AddBlockView';
    BB.SERVICES.ADD_SCENE_BLOCK_VIEW = 'AddSceneBlockView';

    var AddBlockView = BB.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function (options) {
            var self = this;

            self.m_sceneMime = undefined;
            self.m_placement = options.placement;

            // Clone the AddBlockTemplate
            var e = $(Elements.ADD_BLOCK_TEMPLATE).clone();
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

        /**
         Build lists of components, resources and scenes (respectively showing what's needed per placement mode)
         Once an LI is selected proper event fired to announce block is added.
         @method _render
         @return none
         **/
        _render: function () {
            var self = this;

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
            var specialJsonItemName = '';
            var specialJsonItemColor = '';
            //var sceneHasMimeType = '';
            for (var componentID in components) {
                var primeSnippet = '';
                var faOpacity = 1;
                var bufferSwitch = 0;

                if (componentID == BB.CONSTS.BLOCKCODE_IMAGE ||
                    componentID == BB.CONSTS.BLOCKCODE_SVG ||
                    componentID == BB.CONSTS.BLOCKCODE_TWITTER ||
                    componentID == BB.CONSTS.BLOCKCODE_TWITTER_ITEM ||
                    componentID == BB.CONSTS.BLOCKCODE_VIDEO ||
                    componentID == BB.CONSTS.BLOCKCODE_SCENE ||
                    (self.m_placement == BB.CONSTS.PLACEMENT_CHANNEL && componentID == BB.CONSTS.BLOCKCODE_JSON_ITEM) ||
                    (self.m_placement == BB.CONSTS.PLACEMENT_CHANNEL && componentID == BB.CONSTS.BLOCKCODE_TWITTER_ITEM) ||
                    (self.m_placement == BB.CONSTS.PLACEMENT_SCENE && componentID == BB.CONSTS.BLOCKCODE_JSON) ||
                    (self.m_placement == BB.CONSTS.PLACEMENT_SCENE && componentID == BB.CONSTS.BLOCKCODE_WORLD_WEATHER) ||
                    (self.m_placement == BB.CONSTS.PLACEMENT_SCENE && componentID == BB.CONSTS.BLOCKCODE_GOOGLE_SHEETS) ||
                    (self.m_placement == BB.CONSTS.PLACEMENT_SCENE && componentID == BB.CONSTS.BLOCKCODE_TWITTER)) {
                    continue;
                }

                // if PLACEMENT_SCENE and mimetype is set to specific, don't show any JSON based players
                if (self.m_sceneMime && self.m_placement == BB.CONSTS.PLACEMENT_SCENE) {
                    var jsonBasedPlayerXML = BB.PepperHelper.getBlockBoilerplate(componentID).getDefaultPlayerData(BB.CONSTS.PLACEMENT_SCENE);
                    jsonBasedPlayerXML = $.parseXML(jsonBasedPlayerXML);
                    if ($(jsonBasedPlayerXML).find('Json').length > 0)
                        continue;
                }

                // if PLACEMENT_SCENE and mimetype is set on scene, give special attention to JSON_ITEM component since it will often be the one user needs
                if (self.m_sceneMime && self.m_placement == BB.CONSTS.PLACEMENT_SCENE && componentID == BB.CONSTS.BLOCKCODE_JSON_ITEM) {
                    specialJsonItemName = BB.lib.capitaliseFirst(self.m_sceneMime.split('.')[1]);
                    specialJsonItemColor = BB.CONSTS['THEME'] === 'light' ? '#A9CFFA' : '#262627';
                } else {
                    specialJsonItemName = '';
                    specialJsonItemColor = '';
                }

                // check if and how to render components depending on user account type
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

                var snippet = ' <li style="background-color: ' + specialJsonItemColor + '" class="list-group-item ' + BB.lib.unclass(Elements.CLASS_ADD_BLOCK_LIST_ITEMS, self.el) + '" data-component_id="' + componentID + '" data-component_name="' + (specialJsonItemName != '' ? specialJsonItemName : components[componentID].name) + '">';
                snippet += '        <i style="opacity: ' + faOpacity + '" class="fa ' + components[componentID].fontAwesome + '"></i>';
                snippet += '        <span style="opacity: ' + faOpacity + '"> ' + (specialJsonItemName != '' ? specialJsonItemName : components[componentID].name) + '</span>';
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

                    // don't allow adding mimetype scenes to channels directly as needs to be added via Player block
                    if (self.m_placement == BB.CONSTS.PLACEMENT_CHANNEL) {
                        var mimeType = BB.Pepper.getSceneMime(sceneID);
                        if (!_.isUndefined(mimeType))
                            return;
                    }

                    sceneID = pepper.sterilizePseudoId(sceneID);
                    var snippet = '<li class="list-group-item ' + BB.lib.unclass(Elements.CLASS_ADD_BLOCK_LIST_ITEMS, self.el) + '" data-scene_id="' + sceneID + '">' +
                        '<i class="fa ' + BB.PepperHelper.getFontAwesome('scene') + '"></i>' +
                        '<span>' + label + '</span>' +
                        '<br/><small></small>' +
                        '</li>';
                    $(Elements.ADD_SCENE_BLOCK_LIST, self.el).append(snippet);
                });
            }

            if (self.m_placement == BB.CONSTS.PLACEMENT_SCENE) {
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


            self._listenSelection();

            //reset mimetype
            self.m_sceneMime = undefined;
        },

        /**
         Listen to list selection of components / resources / scenes
         @method _listenSelection
         **/
        _listenSelection: function () {
            var self = this;
            $(Elements.CLASS_ADD_BLOCK_LIST_ITEMS, self.el).on('click', function (e) {
                var component_id = $(e.target).closest('li').data('component_id');
                var resource_id = $(e.target).closest('li').data('resource_id');
                var scene_id = $(e.target).closest('li').data('scene_id');
                var primeComp = $(e.target).closest('li').find(Elements.CLASS_PRIME_COMPONENT);
                var blockCode = -1;

                if (primeComp.length > 0) {
                    $(Elements.UPGRADE_MODAL).modal('show');
                    return;
                    //Bootbox.dialog({
                    //    message: $(Elements.MSG_BOOTBOX_ENTERPRISE_UPGRADE_TEXT).text(),
                    //    title: $(Elements.MSG_BOOTBOX_ENTERPRISE_UPGRADE).text(),
                    //    buttons: {
                    //        success: {
                    //            label: $(Elements.MSG_BOOTBOX_ENTERPRISE_UPGRADE).text(),
                    //            className: "btn-success",
                    //            callback: function () {
                    //                BB.comBroker.getService(BB.SERVICES.NAVIGATION_VIEW).selectNavigation(Elements.CLASSS_PRO_STUDIO_PANEL);
                    //            }
                    //        },
                    //        main: {
                    //            label: $(Elements.MSG_BOOTBOX_OK).text(),
                    //            className: "btn-primary"
                    //        }
                    //    }
                    //});
                }

                if (!_.isUndefined(component_id)) {
                    blockCode = component_id;
                } else if (!_.isUndefined(resource_id)) {
                    blockCode = BB.PepperHelper.getBlockCodeFromFileExt(pepper.getResourceType(resource_id));
                } else if (!_.isUndefined(scene_id)) {
                    blockCode = 3510;
                }

                var eventName;
                switch (self.options.placement) {
                    case BB.CONSTS.PLACEMENT_CHANNEL:
                    {
                        eventName = BB.EVENTS.ADD_NEW_BLOCK_CHANNEL;
                        break;
                    }
                    case BB.CONSTS.PLACEMENT_SCENE:
                    {
                        eventName = BB.EVENTS.ADD_NEW_BLOCK_SCENE;
                        break;
                    }
                    case BB.CONSTS.PLACEMENT_LISTS:
                    {
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
         Note that if running under Hybrid or Private server default is to always allow
         all components
         @method _checkAllowedComponent
         @param {Number} i_componentID
         @return {Number} 0 = hide, 1 = show, 2 = upgradable
         **/
        _checkAllowedComponent: function (i_componentID) {
            if (window.g_private_hybrid)
                return 1;
            // free component so show it

            // FasterQ, open to all
            if (i_componentID == 6100) {
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
                    self.m_sceneSliderView.slideToPage(Elements.SCENE_SLIDER_ELEMENT_VIEW, 'left');
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
         @method deSelectView
         **/
        deSelectView: function () {
            var self = this;
            self._goBack();
        },

        /**
         Allow us to control the current placement of the module so the behaviour can be according
         to where the instance resides (i.e.: current launch is from Block collection list of from Channel list
         for example)
         @method setPlacement
         @param {Number} i_playerData
         **/
        setPlacement: function (i_placement) {
            var self = this;
            self.m_placement = self.options.placement = i_placement;
        },

        /**
         Allow us to control the view depending upon the current mimetype of the scene that launched this
         instance. Keep in mind that m_sceneMime is only set for one duration of _render.
         Once rendered the list, we reset the m_sceneMime back to undefined so
         @method setSceneMime
         @param {String} i_mimeType
         **/
        setSceneMime: function (i_mimeType) {
            var self = this;
            self.m_sceneMime = i_mimeType;
        }
    });

    return AddBlockView;
});

