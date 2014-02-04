/**
 Add block wizard is a UI component which allows selection and insertion of a new component (i.e. QR / RSS ...)
 or a resource to be added to the currently selected timeline_channel
 @class AddBlockWizardView
 @constructor
 @return {object} instantiated AddBlockWizardView
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

    BB.SERVICES.ADD_BLOCK_WIZARD_VIEW = 'AddBlockWizardView';

    var AddBlockWizardView = BB.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self._wireUI()
        },

        /**
         Wire going back from AddBlockWizard via element back button
         @method _wireUI
         @return none
         **/
        _wireUI: function () {
            var self = this;
            $(Elements.GO_BACK_FROM_ADD_RESOURCE_VIEW).tap(function (e) {
                self.close();
                self.destroy();
                e.stopImmediatePropagation();
                e.preventDefault();
            });
        },

        /**
         Build two lists, components and resources allowing for item selection.
         Once an LI is selected AddBlockWizard.ADD_NEW_BLOCK is fired to announce block is added.
         @method newChannelBlockPage
         @return none
         **/
        newChannelBlockPage: function () {
            var self = this;

            $.mobile.changePage(Elements.ADD_RESOURCE_VIEW, {transition: "pop"});

            /////////////////////////////////////////////////////////
            // show component selection list
            /////////////////////////////////////////////////////////

            var components = model.getComponents();
            for (var componentID in components) {
                // don't show image or video component in component list
                if (componentID == 3130 || componentID == 3100)
                    continue;
                var snippet = '<li data-component_id="' + componentID + '" data-component_name="' + components[componentID].name + '" data-icon="plus"><a class="addResoureToChannel">' +
                    '<img src="' + components[componentID].icon + '">' +
                    '<h1>' + components[componentID].name + '</h1>' +
                    '<p>' + components[componentID].description + '</p></a>' +
                    '</li>';
                $(Elements.ADD_COMPONENT_LIST).append(snippet);
            }

            /////////////////////////////////////////////////////////
            // show resource selection list
            /////////////////////////////////////////////////////////

            var recResources = jalapeno.getResources();
            $(recResources).each(function (i) {

                // dont process deleted resources
                if (recResources[i]['change_type'] == 3)
                    return;

                var size = (parseInt(recResources[i]['resource_bytes_total']) / 1000).toFixed(2);
                var resourceDescription = 'size: ' + size + 'K dimenstion: ' + recResources[i]['resource_pixel_width'] + 'x' + recResources[i]['resource_pixel_height'];

                var snippet = '<li data-resource_id="' + recResources[i]['resource_id'] + '" data-resource_name="' + recResources[i]['resource_name'] + '" data-icon="plus"><a class="addResoureToChannel">' +
                    '<img src="' + model.getIcon(recResources[i]['resource_type']) + '">' +
                    '<h1>' + recResources[i]['resource_name'] + '</h1>' +
                    '<p>' + resourceDescription + '</p></a>' +
                    '</li>';
                $(Elements.ADD_RESOURCE_LIST).append(snippet);
            });

            $(Elements.ADD_COMPONENT_LIST).listview('refresh');
            $(Elements.ADD_RESOURCE_LIST).listview('refresh');

            $(Elements.CLASS_ADD_RESOURE_TO_CHANNEL).on('tap', function (e) {
                var component_id = $(e.target).closest('li').data('component_id');
                var resource_id = $(e.target).closest('li').data('resource_id');
                var blockCode = -1;

                if (component_id) {
                    blockCode = component_id;
                } else {
                    blockCode = model.getBlockCodeFromFileExt(jalapeno.getResourceType(resource_id));
                }
                commBroker.fire(AddBlockWizard.ADD_NEW_BLOCK, this, self, {
                    blockCode: blockCode,
                    resourceID: resource_id
                });
            });

        },

        /**
         Return back to calling page.
         @method close
         @return {boolean} false;
         **/
        close: function () {
            var self = this;
            // self._emptyNewChannelPage();
            // var back = $.mobile.activePage.prev('[data-role=page]');
            // $.mobile.changePage(back, {transition: 'pop', reverse: true });
            // $.mobile.changePage(Elements.STUDIO_LITE,{transition: "pop"});
            // TODO: fix back so we dont use history to prevent false popups
            history.back();
            return false;
        },

        /**
         Empty selection lists
         @method destroy
         @return none
         **/
        destroy: function () {
            $('.ui-mobile-viewport').css({overflow: 'hidden'});
            $(Elements.ADD_RESOURCE_LIST).empty();
            $(Elements.ADD_COMPONENT_LIST).empty();
        }
    });

    return AddBlockWizardView;

});

