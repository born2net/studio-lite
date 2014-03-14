/**
 This independent class manages a set of elements all designed to provide user with UI for font settings
 @class FontSelector
 @constructor
 @return {Object} instantiated FontSelector
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    /**
     Custom event fired when a font settings changed
     @event FONT_SELECTION_CHANGED
     @param {This} caller
     @param {Self} context caller
     @param {Event} edata
     @static
     @final
     **/
    BB.EVENTS.FONT_SELECTION_CHANGED = 'FONT_SELECTION_CHANGED';

    BB.SERVICES.FONT_SELECTOR = 'FontSelector';

    var FontSelector = BB.View.extend({

        /**
         Init the ChannelList component and enable sortable channels UI via drag and drop operations.
         @method initialize
         **/
        initialize: function () {
            var self = this;

            self.m_colorSettings = {
                animationSpeed: 50,
                animationEasing: 'swing',
                change: null,
                changeDelay: 0,
                control: 'hue',
                defaultValue: '',
                hide: null,
                hideSpeed: 100,
                inline: false,
                letterCase: 'lowercase',
                opacity: false,
                position: 'bottom left',
                show: null,
                showSpeed: 100,
                theme: 'bootstrap'
            };

            _.extend(self.m_colorSettings, self.options['colorSettings']);

            self.$el = $(Elements.FONT_SELECTOR_TEMPLATE).clone()
            self.el = self.$el[0];
            $(self.options.appendTo).append(self.el).fadeIn('fast');
            self.$el.show();
            self._initColorSelector();
            var currID = self.$el.attr('id');
            self.$el.attr('id', _.uniqueId(currID));
        },

        events: {
            'click': '_onClick'
        },

        /**
         Init the minicolors widget under this created instance
         @method _initColorSelector
         **/
        _initColorSelector: function () {
            var self = this;
            self.$el.find(Elements.CLASS_FONT_SELECTOR_MINICOLOR).minicolors(self.m_colorSettings);
        },

        _onClick: function (e) {
            var self = this;
            $(e.target).closest('button').toggleClass('active');
            BB.comBroker.fire(BB.EVENTS.FONT_SELECTION_CHANGED,self,self);

            //todo: have rss component grab instance of this FontSelection from blockProp
            // and listen to FONT_SELECTION_CHANGED and if self.selected in rss component do something with this instance
        }

    });

    return FontSelector;

});