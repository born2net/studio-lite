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

            if (self.m_showAngle == false)
                $('.DimAngle').hide();

            self.$el = $(Elements.DIMENSION_PROPS_TEMPLATE).clone();
            self.el = self.$el[0];
            $(self.options.appendTo).append(self.el).fadeIn();
            self.$el.show();

            var currID = self.$el.attr('id');
            self.$el.attr('id', _.uniqueId(currID));

            $('.spinner', self.$el).spinner({value: 0, min: -9999, max: 9999, step: 1});
            $('.spinner', self.$el).on('changed',function(){
                $(self).trigger('changed');
            });
        },

        /**
         Listen to backbone events (maintain this)
         @method events
         **/
        events: {
            'click .pushToTopButton': '_onPushToTopLayer'
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
            $('.spinnerDimWidth', self.$el).spinner('value', i_values.w);
            $('.spinnerDimHeight', self.$el).spinner('value', i_values.h);
            $('.spinnerDimLeft', self.$el).spinner('value', i_values.x);
            $('.spinnerDimTop', self.$el).spinner('value', i_values.y);
            if (self.m_showAngle)
                $('.spinnerDimAngle', self.$el).spinner('value', i_values.a);
        },

        /**
         Update the spinners UI with object literal values
         @method getValues
         @return {Object} values
         **/
        getValues: function () {
            var self = this;
            var a = 0;
            var w = $('.spinnerDimWidth', self.$el).spinner('value');
            var h = $('.spinnerDimHeight', self.$el).spinner('value');
            var x = $('.spinnerDimLeft', self.$el).spinner('value');
            var y = $('.spinnerDimTop', self.$el).spinner('value');

            if (self.m_showAngle)
                a = $('.spinnerDimAngle', self.$el).spinner('value');

            return {
                x: x,
                y: y,
                w: w,
                h: h,
                a: a
            }
        }
    });

    return DimensionProps;
});