/**
 Block property is a singleton Backbone view that represents a shared UI view for all Blocks (Channels and Scenes blocks).
 It lives inside PropertiesViews
 @class BlockProperties
 @constructor
 @return {object} instantiated BlockProperties
 **/
define(['jquery', 'backbone', 'Knob', 'nouislider', 'gradient', 'spinner', 'FontSelector', 'RSSLinks'], function ($, Backbone, Knob, nouislider, gradient, spinner, FontSelector, RSSLinks) {

    /**
     Custom event fired when a new block is added to timeline_channel
     @event COLOR_SELECTED
     @param {this} caller
     @param {self} context caller
     @param {Event} player_code which represents a specific code assigned for each block type
     @static
     @final
     **/
    BB.EVENTS.GRADIENT_COLOR_CHANGED = 'GRADIENT_COLOR_CHANGED';

    /**
     event fires when block length is changing (requesting a change), normally by a knob property widget
     @event Block.BLOCK_LENGTH_CHANGING
     @param {Object} this
     @param {Object} caller the firing knob element
     @param {Number} value the knob's position value (hours / minutes / seconds)
     **/
    BB.EVENTS.BLOCK_LENGTH_CHANGING = 'BLOCK_LENGTH_CHANGING';

    /**
     event fires when background alpha changed
     @event Block.ALPHA_CHANGED
     @param {Object} this
     @param {Object} caller the firing element
     @param {Number} alpha value
     **/
    BB.EVENTS.ALPHA_CHANGED = 'ALPHA_CHANGED';

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
            self._propLengthKnobsInit();
            self._rssFontSelectorInit();
            self._rssSourceSelectorInit();
        },

        /**
         Init the alpha slider UI in the common properties
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
                BB.comBroker.fire(BB.EVENTS.GRADIENT_COLOR_CHANGED, self, null, {points: points, styles: styles})
            }, 333);

            $(Elements.BG_COLOR_GRADIENT_SELECTOR).gradientPicker({
                change: lazyUpdateBgColor,
                fillDirection: "90deg"
                //,controlPoints: ["#428bca 0%", "white 100%"]
            });

            // to destroy the plugin instance
            // gradient = {}; $(Elements.BG_COLOR_GRADIENT_SELECTOR).remove();
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
         Create instance of FontSelector used in RSS font property settings
         @method _rssFontSelectorInit
         **/
        _rssFontSelectorInit: function(){
            var self = this;
            self.m_rssFontSelector = new FontSelector({
                appendTo: Elements.RSS_FONT_SETTINGS,
                colorSettings: {animationSpeed: 100}
            });
            $(Elements.RSS_POLL_SPINNER).spinner({value: 30, min: 1, max: 30, step: 1});

        },

        /**
         Create instance of RSSLink used in RSS select property settings
         @method _rssSourceSelectorInit
         **/
        _rssSourceSelectorInit: function(){
            var self = this;
            self.m_rssLinkSelector = new RSSLinks({
                el: Elements.RSS_SOURCE
            });
        },

        /**
         Bring into view the Block property StackView panel
         @method viewPanel
         **/
        viewPanel: function(i_panel){
            var self = this;
            self.m_property.viewPanel(i_panel);
        },

        /**
         Bring into view the Block property StackView SubPanel
         @method showBlockProperty
         **/
        initSubPanel: function(i_panel){
            var self = this;
            self.m_property.initSubPanel(i_panel);
        },

        /**
         Bring into view the Block property StackView SubPanel
         @method showBlockProperty
         **/
        viewSubPanel: function(i_panel){
            var self = this;
            self.m_property.viewSubPanel(i_panel);
        },

        /**
         Returns the instance pf rss font selector
         @method getRssFontSelector
         @return {Object} m_rssFontSelector instance
         **/
        getRssFontSelector: function(){
            var self = this;
           return self.m_rssFontSelector;
        },

        /**
         Returns the instance pf rss link selector
         @method getRssLinkSelector
         @return {Object} m_rssLinks instance
         **/
        getRssLinkSelector: function(){
            var self = this;
            return self.m_rssLinkSelector;
        }
    });

    return BlockProperties;
});

