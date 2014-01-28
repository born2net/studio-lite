/**
 Orientation selector Backbone > View
 @class OrientationSelectorView
 @constructor
 @return {Object} instantiated OrientationSelectorView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var OrientationSelectorView = Backbone.View.extend({

        initialize: function () {
            var self = this;
            self.HORIZONTAL = 0;
            self.VERTICAL = 1;

            $(this.el).find('#prev').on('click',function(e){
                self.options.appCoreStackView.slideToPage(self.options.from, 'left');
                return false;
            });

            $(Elements.IMG_HORIZONTAL).on('click', function () {
                self._selectOrientation(self.HORIZONTAL);
            });

            $(Elements.IMG_VERTICAL).on('click', function () {
                self._selectOrientation(self.VERTICAL);
            });
        },

        /**
         Select a particular orientation and optionally move to the next selection views through
         the ScreenArrowSelector instance.
         @method _selectOrientation
         @param {Number} i_orientation
         **/
        _selectOrientation: function (i_orientation) {
            var self = this;

            setTimeout(function () {
                self.options.appCoreStackView.slideToPage(self.options.to, 'right');
            }, 600);

            self.model.set('screenOrientation', i_orientation);

            switch (i_orientation) {
                case self.HORIZONTAL:
                {
                    $(Elements.IMG_HORIZONTAL).css('opacity', '1');
                    $(Elements.IMG_VERTICAL).css('opacity', '0.6');
                    break;
                }

                case self.VERTICAL:
                {
                    $(Elements.IMG_HORIZONTAL).css('opacity', '0.6');
                    $(Elements.IMG_VERTICAL).css('opacity', '1');
                    break;
                }
            }
        }
    });

    return OrientationSelectorView;

});

