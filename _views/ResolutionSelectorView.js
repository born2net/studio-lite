/**
 Resolution selector used to select new campaign width x height
 @class ResolutionSelectorView
 @constructor
 @return {Object} instantiated ResolutionSelectorView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    BB.SERVICES.RESOLUTION_SELECTOR_VIEW = 'ResolutionSelectorView';
    BB.CONSTS.RESOLUTION = 'RESOLUTION';

    var ResolutionSelectorView = BB.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            $(this.el).find(Elements.PREVIOUS).on('click', function (e) {
                if (self.options.from == null)
                    return;
                self.options.stackView.slideToPage(self.options.from, 'left');
                return false;
            });
        },

        /**
         Draw the UI for resolution selection
         @method render
         **/
        render: function () {
            var self = this;
            var screens = '';
            var i = 0;

            $(Elements.CLASS_SELECTED_RESOLUTION, self.el).off('click');
            require(['ScreenTemplate'], function () {
                self.orientationSelector = BB.comBroker.getService(BB.SERVICES.ORIENTATION_SELECTOR_VIEW);
                var orientation = self.orientationSelector.model.get(BB.CONSTS.ORIENTATION);
                $(Elements.RESOLUTION_LIST).empty();
                for (var screenResolution in ScreenTemplate[orientation]) {
                    screens += '<a href="#" data-resolution="' + screenResolution + '" class="' + BB.lib.unclass(Elements.CLASS_SELECTED_RESOLUTION) + ' list-group-item">' +
                        '<input name="resolutionOption" id="resSelector' + i + '" type="radio"/>' +
                        '<label class="screenResolutionLabel"> ' + screenResolution + ' </label></a>'
                    i++;
                }
                $(Elements.RESOLUTION_LIST).append(screens);
                $('.selectedResolution', self.el).on('click', function (e) {
                    var a = ($(e.target).is('a')) ? $(e.target) : $(e.target).closest('a');
                    $(a).find(':input').prop('checked', true);
                    self.model.set(BB.CONSTS.RESOLUTION, $(a).data('resolution'))
                    setTimeout(function () {
                        self.options.stackView.slideToPage(self.options.to, 'right');
                    }, 500);
                });
            });
        },

        /**
         Set the campaign's screen resolution
         @method setResolution
         @param {Number} i_resolution
         @return {Number} i_resolution
         **/
        setResolution: function (i_resolution) {
            return this.model.set(BB.CONSTS.RESOLUTION, i_resolution)
        },

        /**
         Get the campaign's screen resolution
         @method getResolution
         @return {Number} i_resolution
         **/
        getResolution: function () {
            return this.model.get(BB.CONSTS.RESOLUTION)
        }
    });

    return ResolutionSelectorView;

});

