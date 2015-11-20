/**
 This generic class manages a set of elements all designed to provide user with UI for font selection
 @class FontSelector
 @constructor
 @return {Object} instantiated FontSelector
 **/
define(['jquery', 'backbone', 'minicolors', 'spinner', 'Fonts'], function ($, Backbone, minicolors, spinner, Fonts) {

    BB.SERVICES.FONT_SELECTOR = 'FontSelector';

    var FontSelector = BB.View.extend({

        /**
         Init the ChannelList component and enable sortable channels UI via drag and drop operations.
         @method initialize
         **/
        initialize: function () {
            var self = this;

            self.fontList = new Fonts().getFonts();

            self.m_config = {
                bold: false,
                italic: false,
                underline: false,
                alignment: 'left',
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
            self.$el = $(Elements.TEMPLATE_FONT_SELECTOR).clone()
            self.el = self.$el[0];
            $(self.options.appendTo).append(self.el).fadeIn('fast');
            self.$el.show();

            self._initColorSelector();
            self._initFontSelector();
            self._initFontSizeSelector();
            self._initFontList();
            self._delegateAnnounceChange();
            var currID = self.$el.attr('id');
            self.$el.attr('id', _.uniqueId(currID));
        },

        /**
         Global event catcher for UI buttons / selection
         @method events
         **/
        events: {
            'click': '_onClick', 'focusout': function (e) {
                var self = this;
                if ($(e.target).is("input")) {
                    self.m_config.size = self.m_fontSizeInput.val();
                    self._fontModified();
                    return false;
                }
            }
        },

        /**
         Announce changes to font props
         @method _delegateAnnounceChange
         **/
        _delegateAnnounceChange: function () {
            var self = this;
            self._fontModified = _.debounce(function (e) {
                BB.comBroker.fire(BB.EVENTS.FONT_SELECTION_CHANGED, self, self, self.m_config);
            }, 50);
        },

        /**
         Redraw UI with updated config data provided in json format
         @method render
         @param {Object} i_config
         **/
        _render: function () {
            var self = this;

            self._deSelectFontAlignments();
            // self.m_colorSelector.minicolors('value', self.m_config.color);
            $('.minicolors-swatch-color', self.$el).css({'backgroundColor': self.m_config.color});

            var buttonBold = self.m_colorSelector = self.$el.find('[name="bold"]');
            self.m_config.bold == true ? buttonBold.addClass('active') : buttonBold.removeClass('active');

            var buttonUnderline = self.m_colorSelector = self.$el.find('[name="underline"]');
            self.m_config.underline == true ? buttonUnderline.addClass('active') : buttonUnderline.removeClass('active');

            var buttonItalic = self.m_colorSelector = self.$el.find('[name="italic"]');
            self.m_config.italic == true ? buttonItalic.addClass('active') : buttonItalic.removeClass('active');

            self.m_fontSizeSelector.spinner('value', parseInt(self.m_config.size));

            var buttonName = 'align' + BB.lib.capitaliseFirst(self.m_config.alignment);
            var buttonAlignment = self.m_colorSelector = self.$el.find('[name="' + buttonName + '"]');
            $(buttonAlignment).addClass('active');

            $('option:contains("' + self.m_config.font + '")', self.$el).prop('selected', 'selected');
            // $('#selDiv option:contains("Selection 1")')
        },

        /**
         Initialize the font size spinner UI selector
         @method i_config
         **/
        _initFontSizeSelector: function () {
            var self = this;
            self.m_fontSizeInput = self.$el.find(Elements.CLASS_SPINNER_INPUT);
            self.m_fontSizeSelector = self.m_fontSizeInput.closest('div');
            self.m_fontSizeSelector.spinner({value: self.m_config.size, min: 1, max: 127, step: 1});
        },

        /**
         Initialize the minicolors UI widget under this created instance
         @method _initColorSelector
         **/
        _initColorSelector: function () {
            var self = this;
            self.m_colorSelector = self.$el.find(Elements.CLASS_FONT_SELECTOR_MINICOLOR);
            self.m_colorSelector.minicolors(self.m_colorSettings);
        },

        /**
         Font selection
         @method _initFontSelector
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         **/
        _initFontSelector: function () {
            var self = this;

            $('.spinner-input', self.$el).on('focusin', function(){
                $('.spinner-input', self.$el).one('mouseout', function() {
                    $('.spinner-input', self.$el).blur();
                    self._fontModified();
                });
            });

            $(Elements.CLASS_FONT_SELECTION, self.$el).on('change', function (e) {
                var font = $(e.target).val();
                if (font != self.m_config.font) {
                    self.m_config.font = font;
                    console.log(self.m_config.font);
                    BB.comBroker.fire(BB.EVENTS.FONT_SELECTION_CHANGED, self, self, self.m_config);
                }
            });
        },

        /**
         Build list of available fonts to chose from
         @method fontList
         **/
        _initFontList: function () {
            var self = this;
            var snippet = '';
            $.each(self.fontList, function (k, v) {
                snippet = snippet + '\n<option>' + v + '</option>';
            });
            $(Elements.CLASS_FONT_SELECTION, self.$el).append(snippet);
        },

        /**
         On new color selected by minicolors
         @method _onColorSelected
         @param {String} i_color
         **/
        _onColorSelected: function (i_color) {
            var self = this;
            self.m_config.color = i_color;
            BB.comBroker.fire(BB.EVENTS.FONT_SELECTION_CHANGED, self, self, self.m_config);
        },

        /**
         On new font selected by drop down
         @method _onFontSelected
         @param {Element} i_target
         **/
        _onFontSelected: function (i_target) {
            var self = this;
            return false;
        },

        /**
         Deselect all font alignments buttons so all are unpressed
         @method i_target
         **/
        _deSelectFontAlignments: function () {
            var self = this;
            self.$el.find(Elements.CLASS_FONT_ALIGNMENT).removeClass('active');
        },

        /**
         Catch all event for any UI that is clicked within this view so we can deal with each action as per the target firing the event
         @method _onClick
         @param {Event} e
         **/
        _onClick: function (e) {
            var self = this;

            if ($(e.target).is("select")) {
                e.preventDefault();
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
                    self.m_config.size = self.m_fontSizeInput.val();
                    break;
                }
                case 'fontSizeDown':
                {
                    self.m_config.size = self.m_fontSizeInput.val();
                    break;
                }
            }

            self._fontModified();
            return false;
        },

        /**
         Set the configuration data for this font selector component
         @method setConfig
         @param {Object} i_config
         **/
        setConfig: function (i_config) {
            var self = this;
            self.m_config = i_config;
            self._render()
        }
    });

    return FontSelector;

});