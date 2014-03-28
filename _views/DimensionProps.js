/**
 Config the UI of dimensions properties which include x, y, width, height and angle using spinners
 @class DimensionProps
 @constructor
 @return {Object} instantiated DimensionProps
 **/
define(['jquery', 'backbone', 'spinner'], function ($, Backbone, spinner) {

    BB.SERVICES.DIMENSION_PROPS = 'DimensionProps';

    var DimensionProps = BB.View.extend({

        /**
         Init the ChannelList component and enable sortable channels UI via drag and drop operations.
         @method initialize
         **/
        initialize: function () {
            var self = this;
            $('input', self.$el).closest('.spinner').spinner({value: 12, min: 10, max: 127, step: 1});
        },

        events: {
            'click': '_onChangedValue',
            'click .pushToTopButton': '_onPushToTopLayer',
            'focusout input': function (e) {
                var name = $(e.target).siblings('div').attr('name');
                var value = +$(e.target).val();
                this._updateDimenstion(name, value);
            }
        },

        _onChangedValue: function (e) {
            var self = this;
            var name = $(e.target).closest('div').attr('name');
            var value = $(e.target).closest('div').siblings('input').val();
            self._updateDimenstion(name, value);
            e.preventDefault();
            return false;
        },

        _updateDimenstion: function (i_name, i_value) {
            if (i_name !== undefined && i_value !== undefined)
              log(i_name + ' ' + i_value);
        },

        _onPushToTopLayer: function (e) {
            log('top')
        }

    });

    return DimensionProps;

});