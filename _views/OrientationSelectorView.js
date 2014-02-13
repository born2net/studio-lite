/**
 Orientation selector used to select new campaign orientation
 @class OrientationSelectorView
 @constructor
 @return {Object} instantiated OrientationSelectorView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    BB.SERVICES.ORIENTATION_SELECTOR_VIEW = 'OrientationSelectorView';
    BB.CONSTS.VERTICAL = 'VERTICAL';
    BB.CONSTS.HORIZONTAL = 'HORIZONTAL';
    BB.CONSTS.ORIENTATION = 'ORIENTATION';

    var OrientationSelectorView = BB.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;

            $(this.el).find(Elements.PREVIOUS).on('click',function(e){
                self.options.stackView.slideToPage(self.options.from, 'left');
                return false;
            });

            $(Elements.IMG_HORIZONTAL).on('click', function () {
                self._selectOrientation(BB.CONSTS.HORIZONTAL);
            });

            $(Elements.IMG_VERTICAL).on('click', function () {
                self._selectOrientation(BB.CONSTS.VERTICAL);
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
                case BB.CONSTS.HORIZONTAL:
                {
                    $(Elements.IMG_HORIZONTAL).css('opacity', '1');
                    $(Elements.IMG_VERTICAL).css('opacity', '0.6');
                    break;
                }

                case BB.CONSTS.VERTICAL:
                {
                    $(Elements.IMG_HORIZONTAL).css('opacity', '0.6');
                    $(Elements.IMG_VERTICAL).css('opacity', '1');
                    break;
                }
            }

            self.model.set(BB.CONSTS.ORIENTATION, i_orientation);
            self.resolutionSelector = BB.comBroker.getService(BB.SERVICES.RESOLUTION_SELECTOR_VIEW);
            self.resolutionSelector.render();
            setTimeout(function () {
                self.options.stackView.slideToPage(self.options.to, 'right');
            }, 500);
        },

        setOrientation: function(i_orientation){
            this.model.set(BB.CONSTS.ORIENTATION, i_orientation);
        },

        getOrientation: function(){
            return this.model.get(BB.CONSTS.ORIENTATION);
        }
    });

    return OrientationSelectorView;

});

