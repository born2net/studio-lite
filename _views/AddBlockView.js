/**
 Add block view is a UI component which allows selection and insertion of a new component (i.e. QR / RSS ...)
 or a resource to be added to the currently selected timeline_channel
 @class AddBlockView
 @constructor
 @return {object} instantiated AddBlockView
 **/
define(['jquery', 'backbone', 'StackView', 'ScreenTemplateFactory'], function ($, Backbone, StackView, ScreenTemplateFactory) {

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

    BB.SERVICES.ADD_BLOCK_VIEW = 'AddBlockView';

    var AddBlockView = BB.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function (options) {
            var self = this;

            self.m_placement = options.placement;

            // Clone AddBlockTemplate
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
         Build two lists, components and resources allowing for item selection.
         Once an LI is selected AddBlockWizard.ADD_NEW_BLOCK_CHANNEL is fired to announce block is added.
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
            for (var componentID in components) {
                // don't show image or video component in component list
                if (componentID == 3130 || componentID == 3100 || componentID == 3510)
                    continue;
                var snippet = '<li class="list-group-item ' + BB.lib.unclass(Elements.CLASS_ADD_BLOCK_LIST_ITEMS, self.el) + '" data-component_id="' + componentID + '" data-component_name="' + components[componentID].name + '">' +
                    //'<img class="img-responsive" src="' + components[componentID].icon + '">' +
                    '<i class="fa ' + components[componentID].fontAwesome + '"></i>'+
                    '<span>' + components[componentID].name + '</span>' +
                    '<h6>' + components[componentID].description + '</h6>' +
                    '</li>';
                $(Elements.ADD_COMPONENT_BLOCK_LIST, self.el).append(snippet);
            }

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
                    '<i class="fa ' + BB.PepperHelper.getFontAwesome(recResources[i]['resource_type']) + '"></i>'+
                    '<span>' + recResources[i]['resource_name'] + '</span>' +
                    '<br/><small>' + resourceDescription + '</small>' +
                    '</li>';
                $(Elements.ADD_RESOURCE_BLOCK_LIST, self.el).append(snippet);
            });

            /////////////////////////////////////////////////////////
            // show scene selection list
            /////////////////////////////////////////////////////////

            if (self.m_placement == BB.CONSTS.PLACEMENT_CHANNEL) {
                var scenes = pepper.getScenes();
                _.each(scenes, function (scene, i) {
                    var label = $(scene).find('Player').eq(0).attr('label');
                    var sceneID = $(scene).find('Player').eq(0).attr('id');
                    sceneID = pepper.sterilizePseudoId(sceneID);
                    var snippet = '<li class="list-group-item ' + BB.lib.unclass(Elements.CLASS_ADD_BLOCK_LIST_ITEMS, self.el) + '" data-scene_id="' + sceneID + '">' +
                        '<i class="fa ' + BB.PepperHelper.getFontAwesome('scene') + '"></i>'+
                        '<span>' + label + '</span>' +
                        '<br/><small></small>' +
                        '</li>';
                    $(Elements.ADD_SCENE_BLOCK_LIST, self.el).append(snippet);
                });
            }

            if (self.m_placement == BB.CONSTS.PLACEMENT_SCENE)
                $(Elements.ADD_SCENE_BLOCK_LIST_CONTAINER, self.el).remove();


            $(Elements.CLASS_ADD_BLOCK_LIST_ITEMS, self.el).on('click', function (e) {
                var component_id = $(e.target).closest('li').data('component_id');
                var resource_id = $(e.target).closest('li').data('resource_id');
                var scene_id = $(e.target).closest('li').data('scene_id');
                var blockCode = -1;

                if (!_.isUndefined(component_id)) {
                    blockCode = component_id;
                } else if (!_.isUndefined(resource_id)) {
                    blockCode = BB.PepperHelper.getBlockCodeFromFileExt(pepper.getResourceType(resource_id));
                } else if (!_.isUndefined(scene_id)) {
                    blockCode = 3510;
                }
                var eventName = self.options.placement == BB.CONSTS.PLACEMENT_CHANNEL ? BB.EVENTS.ADD_NEW_BLOCK_CHANNEL : BB.EVENTS.ADD_NEW_BLOCK_SCENE;
                BB.comBroker.fire(eventName, this, self.options.placement, {
                    blockCode: blockCode,
                    resourceID: resource_id,
                    sceneID: scene_id
                });
                self.deSelectView();
            });

        },

        /**
         Hook onto bootstrap accordion so user can select new block to add
         @method _buildBSAccordion
         **/
        _buildBSAccordion: function () {
            var self = this;
            var uniqueID = _.uniqueId('addBlockAccord')
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
                    self.m_sceneFaderView = BB.comBroker.getService(BB.SERVICES['SCENE_FADER_VIEW']);
                    self.m_sceneFaderView.selectView(Elements.SCENE_PANEL_WRAP);
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
        }
    });

    return AddBlockView;
});

