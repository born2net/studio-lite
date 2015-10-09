/**
 Widget to display live editor of label / input
 @class LiveInput
 @constructor
 @return {object} instantiated LiveInput
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    /**
     Custom event fired when input changed event
     @event INPUT_CHANGED
     @param {This} caller
     @param {Self} context caller
     @param {Event}
     @static
     @final
     **/
    BB.EVENTS.LIVE_INPUT_CHANGED = 'LIVE_INPUT_CHANGED';

    var LiveInput = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function (options) {
            var self = this;
            self.LIVE_INPUT_CHANGED = 'LIVE_INPUT_CHANGED';
            self.m_options = options;
            self.m_prevValue = self.m_options.value;

            var snippet = '<div>';
            snippet += '        <h4 class="liveInput">' + self.m_options.value + '</h4>';
            snippet += '        <a class="liveInputLink"><i style="color: gray" class="fa fa-pencil"></i></a>';
            snippet += '        <input class="liveInputRename" type="text" data-localize="' + self.m_options.dataLocalize + '" placeholder="' + self.m_options.placeHolder + '" value="">';
            snippet += '   </div>';

            self.$el.append(snippet);
            self.m_value = 0;
            self.m_liveRename = self.$('.liveInput');
            self.m_liveRenameInput = self.$('.liveInputRename')
            self._listenRename();
        },

        /**
         Listen to up button increasing meters
         @method _listenUp
         **/
        _listenRename: function () {
            var self = this;
            self.m_faIcon = self.$el.find('i');
            self.$el.on('mousedown mouseup', function (e) {
                // if mouse up, just give focus to control
                if (e.type == "mouseup") {
                    self.m_liveRenameInput.focus();
                    return;
                }
                // already in edit mode, return since blur will kick next
                if (!self.m_faIcon.hasClass('fa-pencil'))
                    return;

                // on entering edit mode
                self.m_liveRenameInput.show();
                self.m_liveRename.hide();
                self.m_faIcon.removeClass('fa-pencil').addClass('fa-check');
                var value = self.m_liveRename.text();
                self.m_liveRenameInput.prop('value', value);

                // on entering view mode
                self.m_liveRenameInput.one('blur', function (e) {
                    var value = self.m_liveRenameInput.prop('value');
                    self.m_faIcon.removeClass('fa-check').addClass('fa-pencil');
                    self.m_liveRename.text(value);
                    self.m_liveRenameInput.toggle();
                    self.m_liveRename.toggle();
                    self.setValue(value, true);
                });
            });
        },
        /**
         Get current input value
         @method getValue
         @return {String} value
         **/
        getValue: function () {
            return self.m_prevValue;
        },

        /**
         Set value and announce the change
         only announce if set to true
         @method _listenUp
         @params {String} i_value
         @params {String} i_announce
         **/
        setValue: function (i_value, i_announce) {
            var self = this;
            if (i_value == self.m_prevValue)
                return;
            var edata = {
                value: i_value,
                preValue: self.m_prevValue,
                el: self.m_options.el
            };
            self.m_prevValue = i_value;
            self.m_liveRename.text(i_value);
            if (!i_announce)
                return;
            BB.comBroker.fire(BB.EVENTS.LIVE_INPUT_CHANGED, self, self, edata);
            self.trigger(self.LIVE_INPUT_CHANGED, edata)
        }

    });

    return LiveInput;
});

