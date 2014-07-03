/**
 Block property is a singleton Backbone view that represents a shared UI view for all Blocks (Channels and Scenes blocks).
 It lives inside PropertiesViews
 @class BlockProperties
 @constructor
 @return {object} instantiated BlockProperties
 **/
define(['jquery', 'backbone', 'Knob', 'nouislider', 'gradient', 'spinner', 'FontSelector', 'RSSLinks', 'MRSSLinks'], function ($, Backbone, Knob, nouislider, gradient, spinner, FontSelector, RSSLinks, MRSSLinks) {

    /**
     Custom event fired when a gradient color picked
     @event COLOR_SELECTED
     @param {this} caller
     @param {self} context caller
     @param {Event} event
     @static
     @final
     **/
    BB.EVENTS.GRADIENT_COLOR_CHANGED = 'GRADIENT_COLOR_CHANGED';

    /**
     Custom event fired when gradient color selection picker closed
     @event GRADIENT_COLOR_CLOSED
     @param {this} caller
     @param {self} context caller
     @param {Event} event
     @static
     @final
     **/
    BB.EVENTS.GRADIENT_COLOR_CLOSED = 'GRADIENT_COLOR_CLOSED';

    /**
     event fires when block length is changing (requesting a change), normally by a knob property widget
     @event BLOCK_LENGTH_CHANGING
     @param {Object} this
     @param {Object} caller the firing knob element
     @param {Number} value the knob's position value (hours / minutes / seconds)
     **/
    BB.EVENTS.BLOCK_LENGTH_CHANGING = 'BLOCK_LENGTH_CHANGING';

    /**
     event fires when background alpha changed
     @event ALPHA_CHANGED
     @param {Object} this
     @param {Object} caller the firing element
     @param {Number} alpha value
     **/
    BB.EVENTS.ALPHA_CHANGED = 'ALPHA_CHANGED';

    /**
     event fires when video volume changed
     @event VIDEO_VOLUME_CHANGED
     @param {Object} this
     @param {Object} caller the firing element
     @param {Number} alpha value
     **/
    BB.EVENTS.VIDEO_VOLUME_CHANGED = 'VIDEO_VOLUME_CHANGED';

    BB.SERVICES.BLOCK_PROPERTIES = 'BlockProperties';

    var BlockProperties = BB.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;

            BB.comBroker.setService(BB.SERVICES.BLOCK_PROPERTIES, self);

            this.m_property = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']);
            self.m_property.initPanel(Elements.BLOCK_PROPERTIES);
            self.m_rssFontSelector = undefined;

            self._alphaSliderInit();
            self._bgGradientInit();
            self._bgSceneInit();
            self._borderSceneColorInit();
            self._propLengthKnobsInit();
            self._videoVolumeSliderInit()
            self._rssFontSelectorInit();
            self._rssSourceSelectorInit();
            self._mrssSourceSelectorInit();
            self._rssPollTimeInit();
            self._labelFontSelectorInit();
            self._labelClockFontSelectorInit();
        },

        /**
         Init alpha slider UI in the common properties
         @method _alphaSliderInit
         **/
        _alphaSliderInit: function () {
            var self = this;

            $(Elements.BLOCK_ALPHA_SLIDER).noUiSlider({
                handles: 1,
                start: 100,
                step: 1,
                range: [0, 100],
                serialization: {
                    to: [ $(Elements.BLOCK_ALPHA_LABEL), 'text' ]
                }
            });

            self.m_blockAlphaHandler = $(Elements.BLOCK_ALPHA_SLIDER).on('change', function (e) {
                var alpha = parseFloat($(Elements.BLOCK_ALPHA_SLIDER).val()) / 100;
                BB.comBroker.fire(BB.EVENTS.ALPHA_CHANGED, this, self, alpha)
                return false;
            });
        },

        /**
         Load jquery gradient component once
         @method _bgGradientInit
         **/
        _bgGradientInit: function () {
            var self = this;

            var lazyUpdateBgColor = _.debounce(function (points, styles) {
                if (points.length == 0)
                    return;
                BB.comBroker.fire(BB.EVENTS.GRADIENT_COLOR_CHANGED, self, null, {points: points, styles: styles});
            }, 50);

            var gradientColorPickerClosed = function () {
                log('render gradient');
                BB.comBroker.fire(BB.EVENTS.GRADIENT_COLOR_CLOSED, self, null);
            };

            $(Elements.BG_COLOR_GRADIENT_SELECTOR).gradientPicker({
                change: lazyUpdateBgColor,
                closed: gradientColorPickerClosed,
                fillDirection: "90deg"
            });

            // always close gradient color picker on mouseout
            $('.colorpicker').on('mouseleave', function (e) {
                $(document).trigger('mousedown');
                BB.comBroker.fire(BB.EVENTS.GRADIENT_COLOR_CLOSED, self, self);
            });

            // to destroy the plugin instance
            // gradient = {}; $(Elements.BG_COLOR_GRADIENT_SELECTOR).remove();
        },

        /**
         Init the scene backgroud selector
         @method _bgSceneInit
         **/
        _bgSceneInit: function () {
            var self = this;
            var colorSettings = {
                animationSpeed: 50,
                animationEasing: 'swing',
                change: $.proxy(self._onSceneBgColorSelected, self),
                changeDelay: 100,
                control: 'hue',
                value: '#ffffff',
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
            $(Elements.SCENE_BACKGROUND_SELECTOR).minicolors(colorSettings);
        },

        /**
         Init the scene backgroud selector
         @method _bgSceneInit
         **/
        _borderSceneColorInit: function () {
            var self = this;
            var colorSettings = {
                animationSpeed: 50,
                animationEasing: 'swing',
                change: $.proxy(self._onSceneBorderColorSelected, self),
                changeDelay: 100,
                control: 'hue',
                value: '#ffffff',
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
            $(Elements.SCENE_BORDER_COLOR_SELECTOR).minicolors(colorSettings);
        },

        /**
         On scene block border color selected by minicolors
         @method _onSceneBorderColorSelected
         @param {String} i_color
         **/
        _onSceneBorderColorSelected: function (i_color) {
            var self = this;
            BB.comBroker.fire(BB.EVENTS.BLOCK_BORDER_CHANGE, self, self, i_color);
        },

        /**
         On scene background color selected by minicolors
         @method _onSceneBgColorSelected
         @param {String} i_color
         **/
        _onSceneBgColorSelected: function (i_color) {
            var self = this;
            BB.comBroker.fire(BB.EVENTS.SCENE_BG_COLOR_CHANGED, self, self, i_color);
        },

        /**
         Create the block length knobs so a user can set the length of the block with respect to timeline_channel
         @method _propLengthKnobsInit
         @return none
         **/
        _propLengthKnobsInit: function () {
            var snippet = '<input id="blockLengthHours" data-displayPrevious="false" data-min="0" data-max="23" data-skin="tron" data-width="60" data-height="60"  data-thickness=".2" type="text" class="knob" data-fgColor="gray">' +
                '<input id="blockLengthMinutes" data-displayPrevious="false" data-min="0" data-max="59" data-skin="tron" data-width="60" data-height="60" data-thickness=".2" type="text" class="knob" data-fgColor="gray">' +
                '<input id="blockLengthSeconds" data-displayPrevious="false" data-min="0" data-max="59" data-skin="tron" data-width="60" data-height="60"  data-thickness=".2" type="text" class="knob" data-fgColor="gray">';

            $(Elements.CHANNEL_BLOCK_PROPS).append(snippet);

            $(Elements.CLASS_KNOB).knob({
                /*change: function (value) {
                 console.log("change : " + value);
                 var caller = this['i'][0].id;
                 },*/
                release: function (value) {
                    // console.log(this.$.attr('value'));
                    // console.log("release : " + value + ' ' + this['i'][0].id);
                    var caller = this['i'][0].id;
                    BB.comBroker.fire(BB.EVENTS.BLOCK_LENGTH_CHANGING, this, caller, value);
                },
                /*cancel: function () {
                 console.log("cancel : ", this);
                 },*/
                draw: function () {
                    if (this.$.data('skin') == 'tron') {

                        var a = this.angle(this.cv)  // Angle
                            , sa = this.startAngle          // Previous start angle
                            , sat = this.startAngle         // Start angle
                            , ea                            // Previous end angle
                            , eat = sat + a                 // End angle
                            , r = 1;

                        this.g.lineWidth = this.lineWidth;

                        this.o.cursor
                        && (sat = eat - 0.3)
                        && (eat = eat + 0.3);

                        if (this.o.displayPrevious) {
                            ea = this.startAngle + this.angle(this.v);
                            this.o.cursor
                            && (sa = ea - 0.3)
                            && (ea = ea + 0.3);
                            this.g.beginPath();
                            this.g.strokeStyle = this.pColor;
                            this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sa, ea, false);
                            this.g.stroke();
                        }

                        this.g.beginPath();
                        this.g.strokeStyle = r ? this.o.fgColor : this.fgColor;
                        this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sat, eat, false);
                        this.g.stroke();

                        this.g.lineWidth = 2;
                        this.g.beginPath();
                        this.g.strokeStyle = this.o.fgColor;
                        this.g.arc(this.xy, this.xy, this.radius - this.lineWidth + 1 + this.lineWidth * 2 / 3, 0, 2 * Math.PI, false);
                        this.g.stroke();

                        return false;
                    }
                }
            });
        },

        /**
         Init video volume slider in properties
         @method _videoVolumeSliderInit
         **/
        _videoVolumeSliderInit: function () {
            var self = this;
            $(Elements.VIDEO_VOLUME_WRAP_SLIDER).noUiSlider({
                handles: 1,
                start: 100,
                step: 1,
                range: [0, 100],
                serialization: {
                    to: [ $(Elements.VIDEO_VOLUME_LABEL), 'text' ]
                }
            });
            self.m_videoVolumeHandler = $(Elements.VIDEO_VOLUME_WRAP_SLIDER).on('change', function (e) {
                var volume = parseFloat($(Elements.VIDEO_VOLUME_WRAP_SLIDER).val()) / 100;
                BB.comBroker.fire(BB.EVENTS.VIDEO_VOLUME_CHANGED, this, self, volume);
                return false;
            });
        },

        /**
         Create instance of RSSLink used in select property settings
         @method _rssSourceSelectorInit
         **/
        _rssSourceSelectorInit: function () {
            var self = this;
            self.m_rssLinkSelector = new RSSLinks({
                el: Elements.RSS_SOURCE
            });
        },

        /**
         Create instance of RSSLink used in select property settings
         @method _rssSourceSelectorInit
         **/
        _mrssSourceSelectorInit: function () {
            var self = this;
            self.m_mrssLinkSelector = new MRSSLinks({
                el: Elements.MRSS_SOURCE
            });
        },

        /**
         Create instance of FontSelector used in font property settings
         @method _rssFontSelectorInit
         **/
        _rssFontSelectorInit: function () {
            var self = this;
            self.m_rssFontSelector = new FontSelector({
                appendTo: Elements.RSS_FONT_SETTINGS,
                colorSettings: {animationSpeed: 100}
            });
        },

        /**
         Init the poll timer spinner widget
         @method _rssPollTimeInit
         @param {Number} _rssPollTimeInit
         **/
        _rssPollTimeInit: function () {
            var self = this;
            $(Elements.RSS_POLL_SPINNER).spinner({
                value: 30,
                min: 1,
                max: 30,
                step: 1
            });
        },

        /**
         Create instance of FontSelector used in font property settings
         @method _labelFontSelectorInit
         **/
        _labelFontSelectorInit: function () {
            var self = this;
            self.m_labelFontSelector = new FontSelector({
                appendTo: Elements.LABEL_FONT_SETTINGS,
                colorSettings: {animationSpeed: 100}
            });
        },

        /**
         Create instance of FontSelector used in font property settings
         @method _labelFontSelectorInit
         **/
        _labelClockFontSelectorInit: function () {
            var self = this;
            self.m_clockFontSelector = new FontSelector({
                appendTo: Elements.CLOCK_FONT_SETTINGS,
                colorSettings: {animationSpeed: 100}
            });
        },

        /**
         Bring into view the Block property StackView panel
         @method viewPanel
         **/
        viewPanel: function (i_panel) {
            var self = this;
            self.m_property.viewPanel(i_panel);
        },

        /**
         Bring into view the Block property StackView SubPanel
         @method showBlockProperty
         **/
        initSubPanel: function (i_panel) {
            var self = this;
            self.m_property.initSubPanel(i_panel);
        },

        /**
         Bring into view the Block property StackView SubPanel
         @method showBlockProperty
         **/
        viewSubPanel: function (i_panel) {
            var self = this;
            self.m_property.viewSubPanel(i_panel);
        },

        /**
         Set the color picker color of scene background
         @method setBgScenePropColorPicker
         @param {Number} i_color
         **/
        setBgScenePropColorPicker: function (i_color) {
            $(Elements.SCENE_BACKGROUND_SELECTOR).minicolors('value', i_color);
        },

        /**
         Set the color picker color of scene border
         @method setBorderBlockPropColorPicker
         @param {String} i_color
         **/
        setBorderBlockPropColorPicker: function (i_color) {
            $(Elements.SCENE_BORDER_COLOR_SELECTOR).minicolors('value', i_color);
        },

        /**
         Returns the instance of rss font selector
         @method getRssFontSelector
         @return {Object} m_rssFontSelector instance
         **/
        getRssFontSelector: function () {
            var self = this;
            return self.m_rssFontSelector;
        },

        /**
         Returns the instance of clock font selector
         @method getClockFontSelector
         @return {Object} m_clockFontSelector instance
         **/
        getClockFontSelector: function () {
            var self = this;
            return self.m_clockFontSelector;
        },

        /**
         Returns the instance of label font selector
         @method getLabelFontSelector
         @return {Object} m_rssFontSelector instance
         **/
        getLabelFontSelector: function () {
            var self = this;
            return self.m_labelFontSelector;
        },

        /**
         Returns the instance pf rss link selector
         @method getRssLinkSelector
         @return {Object} m_rssLinks instance
         **/
        getRssLinkSelector: function () {
            var self = this;
            return self.m_rssLinkSelector;
        },

        /**
         Returns the instance pf mrss link selector
         @method getMRssLinkSelector
         @return {Object} m_mrssLinkSelector instance
         **/
        getMRssLinkSelector: function () {
            var self = this;
            return self.m_mrssLinkSelector;
        }
    });

    return BlockProperties;
});


