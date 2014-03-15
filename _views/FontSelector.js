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
                alignment: 'alignLeft',
                font: 'Arial',
                color: '#428bca',
                size: 12
            };

            self.m_colorSelector = undefined;
            self.m_fontSizeSelector = undefined;
            self.m_fontSizeInput = undefined;

            self.m_colorSettings = {
                animationSpeed: 50,
                animationEasing: 'swing',
                change: $.proxy(self._onColorSelected, self),
                changeDelay: 100,
                control: 'hue',
                value: '#428bca',
                defaultValue: '#428bca',
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
            self._initFontSizeSelector();

            var currID = self.$el.attr('id');
            self.$el.attr('id', _.uniqueId(currID));

            /*setTimeout(function () {
                self.m_config = {
                    bold: true,
                    italic: true,
                    underline: true,
                    alignment: 'alignRight',
                    font: 'Times',
                    color: '#ff0000',
                    size: 32
                };
                self.render(self.m_config);
            }, 4000);*/
        },

        /**
         Global event catcher for UI buttons / selection
         @method events
         **/
        events: {
            'click': '_onClick'
        },

        /**
         Redraw UI with updated config data provided in json format
         @method render
         @param {Object} i_config
         **/
        render: function (i_config) {
            var self = this;

            self._deSelectFontAlignments();

            self.m_config = i_config;
            $(self.m_colorSelector).minicolors('value', self.m_config.color);

            var buttonBold = self.m_colorSelector = self.$el.find('[name="bold"]');
            self.m_config.bold == true ? buttonBold.addClass('active') : buttonBold.removeClass('active');

            var buttonUnderline = self.m_colorSelector = self.$el.find('[name="underline"]');
            self.m_config.underline == true ? buttonUnderline.addClass('active') : buttonUnderline.removeClass('active');

            var buttonItalic = self.m_colorSelector = self.$el.find('[name="italic"]');
            self.m_config.italic == true ? buttonItalic.addClass('active') : buttonItalic.removeClass('active');

            $(self.m_fontSizeInput).val(self.m_config.size);

            var buttonAlignment = self.m_colorSelector = self.$el.find('[name="' + self.m_config.alignment + '"]');
            $(buttonAlignment).addClass('active');

            $('option:contains("' + self.m_config.font + '")',self.$el).prop('selected','selected');
            // $('#selDiv option:contains("Selection 1")')
        },

        _initFontSizeSelector: function(){
            var self = this;
            self.m_fontSizeInput = self.$el.find(Elements.CLASS_SPINNER_INPUT);
            self.m_fontSizeSelector = self.m_fontSizeInput.closest('div');
            self.m_fontSizeSelector.spinner({value: self.m_config.size, min: 1, max: 30, step: 1});
        },

        /**
         Init the minicolors widget under this created instance
         @method _initColorSelector
         **/
        _initColorSelector: function () {
            var self = this;
            self.m_colorSelector = self.$el.find(Elements.CLASS_FONT_SELECTOR_MINICOLOR);
            self.m_colorSelector.minicolors(self.m_colorSettings);
        },

        _onColorSelected: function (i_color) {
            var self = this;
            self.m_config.color = i_color;
        },

        _onFontSelected: function (i_target) {
            var self = this;
            self.m_config.font = $(i_target).val();
        },

        _deSelectFontAlignments: function () {
            var self = this;
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
                    self.m_config.alignment = 'alignLeft';
                    $button.toggleClass('active');
                    break;
                }
                case 'alignRight':
                {
                    self._deSelectFontAlignments();
                    self.m_config.alignment = 'alignRight';
                    $button.toggleClass('active');
                    break;
                }
                case 'alignCenter':
                {
                    self._deSelectFontAlignments();
                    self.m_config.alignment = 'alignCenter';
                    $button.toggleClass('active');
                    break;
                }
                case 'fontSizeUp':
                {
                    self.m_config.size = self.m_fontSizeInput.val();
                    break;
                }
                case 'fontSizeDown':
                {
                    self.m_config.size = self.m_fontSizeInput.val();
                    break;
                }
            }

            BB.comBroker.fire(BB.EVENTS.FONT_SELECTION_CHANGED, self, self, self.m_config);
            return false;
        }
    });

    return FontSelector;

});