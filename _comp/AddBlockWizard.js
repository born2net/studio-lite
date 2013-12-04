/**
 Custom event fired when a new block is selected and added to timeline_channel
 @event AddBlockWizard
 @param {this} caller
 @param {self} context caller
 @param {event} player_code which represents a specific code assigned for each block type
 @static
 @final
 **/
AddBlockWizard.ADD_NEW_BLOCK = 'ADD_NEW_BLOCK';

/**
 Add block wizard is a UI component which allows selection and insertion of a new component (i.e. QR / RSS ...)
 or a resource to be added to the currently selected timeline_channel
 @class AddBlockWizard
 @constructor
 @return {object} instantiated AddBlockWizard
 **/
function AddBlockWizard() {
    this.self = this;
    this._init();
};

AddBlockWizard.prototype = {
    constructor: AddBlockWizard,

    /**
     init and wire UI
     @method _init
     @return none
     **/
    _init: function () {
        var self = this;
        self._wireUI();
    },

    /**
     Wire going back from AddBlockWizard via element back button
     @method _wireUI
     @return none
     **/
    _wireUI: function () {
        var self = this;
        $('#goBackFromAddResourceView').tap(function (e) {
            self.close();
            self.destroy();
            e.stopImmediatePropagation();
            e.preventDefault();
        });
    },

    /**
     Build two lists, components and resources that can be selected from.
     Once an LI is selected AddBlockWizard.ADD_NEW_BLOCK is fired to announce a new block is being added.
     @method newChannelBlockPage
     @return none
     **/
    newChannelBlockPage: function () {
        var self = this;

        $.mobile.changePage('#addResourceView', {transition: "pop"});
        var helperSDK = commBroker.getService('HelperSDK');

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
            $('#addComponentList').append(snippet);
        }

        /////////////////////////////////////////////////////////
        // show resource selection list
        /////////////////////////////////////////////////////////

        var recResources = helperSDK.getResources();
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
            $('#addResourceList').append(snippet);
        });

        $('#addComponentList').listview('refresh');
        $('#addResourceList').listview('refresh');

        $('.addResoureToChannel').on('tap', function (e) {
            var helperSDK = commBroker.getService('HelperSDK');
            var component_id = $(e.target).closest('li').data('component_id');
            var resource_id = $(e.target).closest('li').data('resource_id');
            var player_code = component_id == undefined ? helperSDK.getNativeByResoueceID(resource_id) : component_id;

            commBroker.fire(AddBlockWizard.ADD_NEW_BLOCK, this, self, player_code);
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
        // $.mobile.changePage('#studioLite',{transition: "pop"});
        // todo: fix back so we dont use history to prevent false popups
        history.back();
        return false;
    },

    /**
     Empty selection lists
     @method destroy
     @return none
     **/
    destroy: function () {
        $('#addResourceList').empty();
        $('#addComponentList').empty();
    }
}