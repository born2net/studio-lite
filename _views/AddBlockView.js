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
     @event ADD_NEW_BLOCK
     @param {this} caller
     @param {self} context caller
     @param {event} player_code which represents a specific code assigned for each block type
     @static
     @final
     **/
    BB.EVENTS.ADD_NEW_BLOCK = 'ADD_NEW_BLOCK';

    BB.SERVICES.ADD_BLOCK_VIEW = 'AddBlockView';

    var AddBlockView = BB.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;

            $(this.el).find('#prev').on('click',function(e){
                self.options.stackView.slideToPage(self.options.from, 'left');
                return false;
            });

            self.listenTo(self.options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == self)
                    self._render();
            });
        },

        /**
         Build two lists, components and resources allowing for item selection.
         Once an LI is selected AddBlockWizard.ADD_NEW_BLOCK is fired to announce block is added.
         @method _render
         @return none
         **/
        _render: function () {
            var self = this;

            BB.comBroker.getService(BB.SERVICES.PROPERTIES_VIEW).resetPropertiesView();

            $(Elements.ADD_COMPONENT_BLOCK_LIST).empty();
            $(Elements.ADD_RESOURCE_BLOCK_LIST).empty();

            /////////////////////////////////////////////////////////
            // show component selection list
            /////////////////////////////////////////////////////////
            var components = BB.PepperHelper.getBlocks();
            for (var componentID in components) {
                // don't show image or video component in component list
                if (componentID == 3130 || componentID == 3100)
                    continue;
                var snippet = '<li class="list-group-item ' + BB.lib.unclass(Elements.CLASS_ADD_BLOCK_LIST_ITEMS) + '" data-component_id="' + componentID + '" data-component_name="' + components[componentID].name + '">' +
                    '<img class="img-responsive" src="' + components[componentID].icon + '">' +
                    '<span>' + components[componentID].name + '</span>' +
                    '<h6>' + components[componentID].description + '</h6>' +
                    '</li>';
                $(Elements.ADD_COMPONENT_BLOCK_LIST).append(snippet);
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
                var resourceDescription = 'size: ' + size + 'K dimenstion: ' + recResources[i]['resource_pixel_width'] + 'x' + recResources[i]['resource_pixel_height'];

                var snippet = '<li class="list-group-item ' + BB.lib.unclass(Elements.CLASS_ADD_BLOCK_LIST_ITEMS) + '" data-resource_id="' + recResources[i]['resource_id'] + '" data-resource_name="' + recResources[i]['resource_name'] + '">'+
                    '<img src="' + BB.PepperHelper.getIcon(recResources[i]['resource_type']) + '">' +
                    '<span>' + recResources[i]['resource_name'] + '</span>' +
                    '<br/><small>' + resourceDescription + '</small>' +
                    '</li>';
                $(Elements.ADD_RESOURCE_BLOCK_LIST).append(snippet);
            });

            $(Elements.CLASS_ADD_BLOCK_LIST_ITEMS).on('click', function (e) {
                var component_id = $(e.target).closest('li').data('component_id');
                var resource_id = $(e.target).closest('li').data('resource_id');
                var blockCode = -1;

                if (component_id) {
                    blockCode = component_id;
                } else {
                    blockCode = BB.PepperHelper.getBlockCodeFromFileExt(pepper.getResourceType(resource_id));
                }
                BB.comBroker.fire(BB.EVENTS.ADD_NEW_BLOCK, this, self, {
                    blockCode: blockCode,
                    resourceID: resource_id
                });
                self.deSelectView();
            });

        },

        selectView: function(){
            var self = this;
            self.options.stackView.slideToPage(self, 'right');
        },
        deSelectView: function(){
            var self = this;
            self.options.stackView.slideToPage(self.options.from, 'left');
        }
    });

    return AddBlockView;
});

