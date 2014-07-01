/**
 Config the UI of dimension props which include x, y, width, height and angle using spinner widgets
 @class DimensionProps
 @constructor
 @return {Object} instantiated DimensionProps
 **/
define(['jquery', 'backbone', 'spinner'], function ($, Backbone, spinner) {

    // Service name when lives inside Scene
    BB.SERVICES['DIMENSION_PROPS_SCENE'] = 'DimensionPropsScene';

    // Service name when lives inside Screen layout editor
    BB.SERVICES['DIMENSION_PROPS_LAYOUT'] = 'DimensionPropsLayout';

    var DimensionProps = BB.View.extend({

        /**
         Init the ChannelList component and enable sortable channels UI via drag and drop operations.
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_cachedValues = {};
            self.m_showAngle = self.options.showAngle || false;
            self.m_showLock = self.options.showLock || false;

            self.$el = $(Elements.DIMENSION_PROPS_TEMPLATE).clone();
            self.el = self.$el[0];
            $(self.options.appendTo).append(self.el).fadeIn();
            self.$el.show();

            self._listenLockChange();

            if (self.m_showAngle == false)
                $('.DimAngle', self.el).hide();

            if (self.m_showLock == false)
                $('.lockPosition', self.el).hide();

            var currID = self.$el.attr('id');
            self.$el.attr('id', _.uniqueId(currID));

            $('.spinnerDimWidth', self.$el).spinner({value: 0, min: 50, max: 9999, step: 1});
            $('.spinnerDimHeight', self.$el).spinner({value: 0, min: 50, max: 9999, step: 1});
            $('.spinner', self.$el).spinner({value: 0, min: -9999, max: 9999, step: 1});

            var updateValues = _.debounce(function () {
                var values = self.getValues();
                if (_.isEqual(values, self.m_cachedValues))
                    return;

                if (values.w < 50) {
                    values.w = 50;
                    self.setValues(values);
                }
                if (values.h < 50) {
                    values.h = 50;
                    self.setValues(values);
                }
                $(self).trigger('changed');
            }, 50);

            // update changes on icons up/down clicks
            $('.spinner', self.$el).on('mouseup', function (e) {
                if ($(e.target).prop("tagName") == 'INPUT')
                    return;
                updateValues();
            });


            // update on mouse leaving input focus
            $('.spinner-input', self.$el).on('focusin', function () {
                self.m_cachedValues = self.getValues();
                $('.spinner-input', self.$el).one('mouseout', function () {
                    $('.spinner-input', self.$el).blur();
                    updateValues();
                });
            });
        },

        /**
         Listen to changes in lock status
         @method _listenLockChange
         **/
        _listenLockChange: function () {
            var self = this;
            $(Elements.CLASS_LOCK_INPUT, self.$el).on('change', function (e) {
                BB.comBroker.fire(BB.EVENTS.LOCK_CHANGED, self, null, $(e.target).prop('checked'));
            });
        },

        /**
         Listen to backbone events (maintain this)
         @method events
         events: {
            'click .pushToTopButton': '_onPushToTopLayer',
            'mouseout input': 'm_inputMouseOut'
        },
         **/

        /**
         Send the selected division (viewer) to be top most
         @method _onPushToTopLayer
         _onPushToTopLayer: function (e) {
            log('push to top layer')
        },
         **/

        /**
         Set the status of UI for lock status
         @method setLock
         @param {Boolean} i_status
         **/
        setLock: function(i_status){
            var self = this;
            $(Elements.CLASS_LOCK_INPUT, self.$el).prop('checked', i_status);
        },

        /**
         Update the spinners UI with object literal values
         @method setValues
         @param {Object} i_values
         **/
        setValues: function (i_values, i_notifyChange) {
            var self = this;
            $('.spinnerDimWidth', self.$el).spinner('value', Math.round(i_values.w));
            $('.spinnerDimHeight', self.$el).spinner('value', Math.round(i_values.h));
            $('.spinnerDimLeft', self.$el).spinner('value', Math.round(i_values.x));
            $('.spinnerDimTop', self.$el).spinner('value', Math.round(i_values.y));
            if (self.m_showAngle)
                $('.spinnerDimAngle', self.$el).spinner('value', Math.round(i_values.a));
            if (i_notifyChange)
                $(self).trigger('changed');
        },

        /**
         Update the spinners UI with object literal values
         @method getValues
         @return {Object} values
         **/
        getValues: function () {
            var self = this;
            var a = 0;
            var w = BB.lib.parseToFloatDouble($('.spinnerDimWidth', self.$el).spinner('value'));
            var h = BB.lib.parseToFloatDouble($('.spinnerDimHeight', self.$el).spinner('value'));
            var x = BB.lib.parseToFloatDouble($('.spinnerDimLeft', self.$el).spinner('value'));
            var y = BB.lib.parseToFloatDouble($('.spinnerDimTop', self.$el).spinner('value'));

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