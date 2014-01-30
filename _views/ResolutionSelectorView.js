/**
 Resolution selector used to select new campaign width x height
 @class ResolutionSelectorView
 @constructor
 @return {Object} instantiated ResolutionSelectorView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    Backbone.SERVICES.RESOLUTION_SELECTOR_VIEW = 'ResolutionSelectorView';
    Backbone.CONSTS.RESOLUTION = 'RESOLUTION';

    var ResolutionSelectorView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;

            $(this.el).find('#prev').on('click', function (e) {
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

            $('.selectedResolution', self.el).off('click');
            require(['ScreenTemplate'], function () {
                self.orientationSelector = Backbone.comBroker.getService(Backbone.SERVICES.ORIENTATION_SELECTOR_VIEW);
                var orientation = self.orientationSelector.model.get(Backbone.CONSTS.ORIENTATION);
                $(Elements.RESOLUTION_LIST).empty();
                for (var screenResolution in JalapenoTemplate[orientation]) {
                    screens += '<a href="#" data-resolution="' + screenResolution + '" class="selectedResolution list-group-item">' +
                        '<input name="resolutionOption" id="resSelector' + i + '" type="radio"/>' +
                        '<label class="screenResolutionLabel"> ' + screenResolution + ' </label></a>'
                    i++;
                }
                $(Elements.RESOLUTION_LIST).append(screens);
                $('.selectedResolution', self.el).on('click', function (e) {
                    var a = ($(e.target).is('a')) ? $(e.target) : $(e.target).closest('a');
                    $(a).find(':input').prop('checked', true);
                    // log($(a).data('resolution'))
                    self.model.set(Backbone.CONSTS.RESOLUTION, $(a).data('resolution'))
                    setTimeout(function(){
                        self.options.stackView.slideToPage(self.options.to, 'right');
                    },500);
                });
            });
        },

        setResolution: function(i_resolution){
            //todo fix this missing implementation
        },

        getResolution: function(){
            return this.model.get(Backbone.CONSTS.ORIENTATION)
        }
    });

    return ResolutionSelectorView;

});

