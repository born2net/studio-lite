/**
 Config the UI of dimensions properties which include x, y, width, height and potentially angle using spinner widgets
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
            self.m_showAngle = self.options.showAngle || false;
            $('.spinner', self.$el).spinner({value: 0, min: -9999, max: 9999, step: 1});
            if (self.m_showAngle == false)
                $('.DimAngle').hide();

            self.$el = $(Elements.DIMENSION_PROPS_TEMPLATE).clone();
            self.el = self.$el[0];
            $(self.options.appendTo).append(self.el).fadeIn();
            self.$el.show();
        },

        /**
         Listen to backbone events (maintain this)
         @method events
         **/
        events: {
            'click': '_onChangedValue',
            'click .pushToTopButton': '_onPushToTopLayer',
            'focusout input': function (e) {
                var name = $(e.target).siblings('div').attr('name');
                var value = +$(e.target).val();
                this._updateDimensions(name, value);
            }
        },

        /**
         Listen to changes in value of steppers for x y w h and angle
         @method _onChangedValue
         @param {event} e
         **/
        _onChangedValue: function (e) {
            var self = this;
            var name = $(e.target).closest('div').attr('name');
            var value = $(e.target).closest('div').siblings('input').val();
            self._updateDimensions(name, value);
            e.preventDefault();
            return false;
        },

        /**
         Update the dimensions for x y w h and angle in jalapeno
         @method _updateDimensions
         @param {String} i_name
         @param {Number} i_value
         **/
        _updateDimensions: function (i_name, i_value) {
            var self = this;
            if (i_name !== undefined && i_value !== undefined) {
                log(i_name + ' ' + i_value);
                $(self).trigger('changed');
            }
        },

        /**
         Send the selected division (viewer) to be top most
         @method _onPushToTopLayer
         **/
        _onPushToTopLayer: function (e) {
            log('push to top layer')
        },

        /**
         Update the spinners UI with object literal values
         @method setValues
         @param {Object} i_values
         **/
        setValues: function (i_values) {
            var self = this;
            $('.spinnerDimWidth', self.$el).spinner('value', Math.round(i_values.w));
            $('.spinnerDimHeight', self.$el).spinner('value', Math.round(i_values.h));
            $('.spinnerDimLeft', self.$el).spinner('value', Math.round(i_values.x));
            $('.spinnerDimTop', self.$el).spinner('value', Math.round(i_values.y));
            if (self.m_showAngle)
                $('.spinnerDimAngle', self.$el).spinner('value', Math.round(i_values.a));

            $(self).trigger('changed');
        }
    });

    return DimensionProps;

});