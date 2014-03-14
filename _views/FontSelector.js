/**
 This independent class manages a set of elements all designed to provide user with UI for font settings
 @class FontSelector
 @constructor
 @return {Object} instantiated FontSelector
 **/
define(['jquery', 'backbone', 'minicolors', 'spinner'], function ($, Backbone, minicolors, spinner) {

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

            self.m_config = {
                bold: false,
                italic: false,
                underline: false,
                alignment: 'left',
                font: 'Arial',
                color: '#428bca',
                size: 12
            }

            self.m_colorSettings = {
                animationSpeed: 50,
                animationEasing: 'swing',
                change: $.proxy(self._onColorSelected, self),
                changeDelay: 100,
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
            self.$el.find(Elements.CLASS_SPINNER_INPUT).closest('div').spinner({value: self.m_config.size, min: 1, max: 30, step: 1});
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

        _onColorSelected: function (i_color) {
            var self = this;
            self.m_config.color = i_color;
        },

        _onFontSelected: function (i_target) {
            self.m_config.font = $(i_target).val();
        },

        _deSelectFontAlignments: function () {
            var self = this;
            self.m_config.alignment = 'left';
            self.$el.find(Elements.CLASS_FONT_ALIGNMENT).removeClass('active');
        },

        _onClick: function (e) {
            var self = this;

            if ($(e.target).is("select")) {
                self._onFontSelected(e.target)
                return;
            }

            var $button = $(e.target).closest('button');
            var buttonName = $button.attr('name');

            if (_.isUndefined(buttonName))
                return;

            log(buttonName);

            switch (buttonName) {
                case 'bold':
                {
                    $button.hasClass('active') == true ? self.m_config.bold = false : self.m_config.bold = true;
                    $button.toggleClass('active');
                    break;
                }
                case 'underline':
                {
                    $button.hasClass('active') == true ? self.m_config.underline = false : self.m_config.underline = true;
                    $button.toggleClass('active');
                    break;
                }
                case 'italic':
                {
                    $button.hasClass('active') == true ? self.m_config.italic = false : self.m_config.italic = true;
                    $button.toggleClass('active');
                    break;
                }
                case 'alignLeft':
                {
                    self._deSelectFontAlignments();
                    self.m_config.alignment = 'left';
                    $button.toggleClass('active');
                    break;
                }
                case 'alignRight':
                {
                    self._deSelectFontAlignments();
                    self.m_config.alignment = 'right';
                    $button.toggleClass('active');
                    break;
                }
                case 'alignCenter':
                {
                    self._deSelectFontAlignments();
                    self.m_config.alignment = 'center';
                    $button.toggleClass('active');
                    break;
                }
                case 'fontSizeUp':
                {
                    self.m_config.size = self.$el.find(Elements.CLASS_SPINNER_INPUT).val();
                    break;
                }
                case 'fontSizeDown':
                {
                    self.m_config.size = self.$el.find(Elements.CLASS_SPINNER_INPUT).val();
                    break;
                }
            }

            BB.comBroker.fire(BB.EVENTS.FONT_SELECTION_CHANGED, self, self, self.m_config);
            return false;
        }

    });

    return FontSelector;

});