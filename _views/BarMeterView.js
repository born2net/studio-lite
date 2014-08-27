/**
 Widget to display ber meter with up and down selection arrows
 @class BarMeterView
 @constructor
 @return {object} instantiated BarMeterView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    /**
     Custom event fired when bar meter changed event
     @event BAR_METER_CHANGED
     @param {This} caller
     @param {Self} context caller
     @param {Event}
     @static
     @final
     **/
    BB.EVENTS.BAR_METER_CHANGED = 'BAR_METER_CHANGED';

    var BarMeterView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;

            self.CHANGED_METER_BAR = 'CHANGED_METER_BAR';

            var snippet = '<div>';
            snippet += '        <div class="barMeter"></div>';
            snippet += '        <div class="barMeter"></div>';
            snippet += '        <div class="barMeter"></div>';
            snippet += '        <div class="barMeter"></div>';
            snippet += '        <div class="barMeter"></div>';
            snippet += '        <i class="barMeterUp fa fa-caret-up"/>';
            snippet += '        <i class="barMeterDown fa fa-caret-down"/>';
            snippet += '   </div>'

            self.$el.append(snippet);
            self.m_value = 0;
            self.m_buttonUp = self.$el.find('.barMeterUp');
            self.m_buttonDown = self.$el.find('.barMeterDown');
            $(self.m_buttonUp).disableSelection();
            $(self.m_buttonDown).disableSelection();
            self._listenUp();
            self._listenDown();
        },

        /**
         Listen to up button increasing meters
         @method _listenUp
         **/
        _listenUp: function () {
            var self = this;
            $(self.m_buttonUp).on('click', function (e) {
                self.setMeter(self.m_value == 5 ? 5 : (self.m_value + 1));
                BB.comBroker.fire(BB.EVENTS.BAR_METER_CHANGED, self, self, self.m_value);
                return false;
            })
        },

        /**
         Listen to down button decreasing meters
         @method _listenDown
         **/
        _listenDown: function () {
            var self = this;
            $(self.m_buttonDown).on('click', function (e) {
                self.setMeter(self.m_value == 1 ? 1 : (self.m_value - 1));
                BB.comBroker.fire(BB.EVENTS.BAR_METER_CHANGED, self, self, self.m_value);
            })
        },

        /**
         Set the meter to specified value
         @method setMeter
         **/
        setMeter: function (i_value) {
            var self = this;
            self.m_value = i_value;

            if (self.m_value == 0) {
                $('.barMeter').css({'background-color': '#d8d8d8'});
                return;
            }
            if (self.m_value == 5) {
                $('.barMeter').css({'background-color': 'green'});
                return;
            }
            var c = 0;
            $('.barMeter').css({'background-color': '#d8d8d8'});
            self.$el.find('.barMeter').each(function () {
                c++;
                if (c <= self.m_value)
                    $(this).css({'background-color': 'green'});
            });
        },

        /**
         Get the meter specified value
         @method getMeter
         **/
        getMeter: function (i_value) {
            var self = this;
            return self.m_value;
        }
    });

    return BarMeterView;
});