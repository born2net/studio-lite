/**
 Orientation selector used to select new campaign orientation
 @class OrientationSelectorView
 @constructor
 @return {Object} instantiated OrientationSelectorView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    Backbone.SERVICES.ORIENTATION_SELECTOR_VIEW = 'OrientationSelectorView';
    Backbone.CONSTS.VERTICAL = 'VERTICAL';
    Backbone.CONSTS.HORIZONTAL = 'HORIZONTAL';
    Backbone.CONSTS.ORIENTATION = 'ORIENTATION';

    var OrientationSelectorView = Backbone.View.extend({

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

            $(Elements.IMG_HORIZONTAL).on('click', function () {
                self._selectOrientation(Backbone.CONSTS.HORIZONTAL);
            });

            $(Elements.IMG_VERTICAL).on('click', function () {
                self._selectOrientation(Backbone.CONSTS.VERTICAL);
            });
        },

        /**
         Select a particular orientation and optionally move to the next selection views through
         the ScreenArrowSelector instance.
         @method _selectOrientation
         @param {String} i_orientation
         **/
        _selectOrientation: function (i_orientation) {
            var self = this;

            switch (i_orientation) {
                case Backbone.CONSTS.HORIZONTAL:
                {
                    $(Elements.IMG_HORIZONTAL).css('opacity', '1');
                    $(Elements.IMG_VERTICAL).css('opacity', '0.6');
                    break;
                }

                case Backbone.CONSTS.VERTICAL:
                {
                    $(Elements.IMG_HORIZONTAL).css('opacity', '0.6');
                    $(Elements.IMG_VERTICAL).css('opacity', '1');
                    break;
                }
            }

            self.model.set(Backbone.CONSTS.ORIENTATION, i_orientation);
            self.resolutionSelector = Backbone.comBroker.getService(Backbone.SERVICES.RESOLUTION_SELECTOR_VIEW);
            self.resolutionSelector.render();
            setTimeout(function () {
                self.options.stackView.slideToPage(self.options.to, 'right');
            }, 500);
        },

        setOrientation: function(i_orientation){
            this.model.set(Backbone.CONSTS.ORIENTATION, i_orientation);
        },

        getOrientation: function(){
            return this.model.get(Backbone.CONSTS.ORIENTATION);
        }
    });

    return OrientationSelectorView;

});

