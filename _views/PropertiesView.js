/**
 Property manager is a singleton class that manages all of the StackView element properties.
 If you select a block such as the QR component, the property manager is responsible
 for loading the proper view stack for the selected element. Note that it is the job of the caller
 to populate the view stack with the appropriate data.
 The property manager is also capable of managing common properties which are used for blocks.
 For example, all blocks (QR, RSS etc) have a border color, the property value for the border will appear
 in the sub-panel (m_subViewStack)
 @class PropertiesView
 @constructor
 @param {string} i_elementID is the the main property HTML ID (div element).
 @return {object} CompProperty instance.
 **/
define(['jquery', 'backbone', 'StackView'], function ($, Backbone, StackView) {

    Backbone.SERVICES.PROPERTIES_VIEW = 'PropertiesView';

    var PropertiesView = Backbone.StackView.Fader.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;

            Backbone.StackView.ViewPort.prototype.initialize.call(this);
            Backbone.comBroker.listen(Backbone.EVENTS.APP_SIZED, self._reconfigPropPanelLocation);

            this.m_subViewStack = new StackView.Fader({el: Elements.SUB_PROP_PANEL});
            this.m_mainPanels = {};
            this.m_subPanels = {};
            this._listenOnSlidingPanel();
        },

        /**
         Listen for open/close actions on properties panel that can slide in and out
         @method _listenOnSlidingPanel
         **/
        _listenOnSlidingPanel: function () {
            $(Elements.TOGGLE_PANEL).on('click', function () {
                if ($(Elements.TOGGLE_PANEL).hasClass('buttonStateOn')) {
                    $(Elements.TOGGLE_PANEL).toggleClass('buttonStateOn');
                    $(Elements.PROP_PANEL_WRAP).fadeOut(function () {
                        $(Elements.TOGGLE_PANEL).html('<');
                        $(Elements.PROP_PANEL_WRAP).addClass('hidden-sm hidden-md');
                        $(Elements.MAIN_PANEL_WRAP).removeClass('col-sm-9 col-md-9');
                        $(Elements.MAIN_PANEL_WRAP).addClass('col-md-12');
                    });
                } else {
                    $(Elements.TOGGLE_PANEL).toggleClass('buttonStateOn');
                    $(Elements.TOGGLE_PANEL).html('>');
                    $(Elements.MAIN_PANEL_WRAP).addClass('col-sm-9 col-md-9');
                    setTimeout(function () {
                        $(Elements.MAIN_PANEL_WRAP).removeClass('col-md-12');
                        $(Elements.PROP_PANEL_WRAP).children().hide();
                        $(Elements.PROP_PANEL_WRAP).removeClass('hidden-sm hidden-md');
                        $(Elements.PROP_PANEL_WRAP).children().fadeIn();
                    }, 500)
                }
            });
        },

        /**
         Move properties panel between side panel or full screen popup panel depending on screen size
         @method _reconfigPropPanelLocation
         **/
        _reconfigPropPanelLocation: function(){
            var layoutManager = Backbone.comBroker.getService(Backbone.SERVICES.LAYOUT_MANAGER);
            if (layoutManager.getAppWidth() > 768){
                $(Elements.PROP_PANEL_WRAP).append($(Elements.PROP_PANEL));
            } else {
                $(Elements.POPUP_PROPERTIES).append($(Elements.PROP_PANEL));
            }
        },

        /**
         Open the properties panel (side or popup per screen size)
         @method openPropertiesPanel
         **/
        openPropertiesPanel: function(){
            var self = this;
            self._reconfigPropPanelLocation();
            var layoutManager = Backbone.comBroker.getService(Backbone.SERVICES.LAYOUT_MANAGER);
            if (layoutManager.getAppWidth() > 768){
                if ($(Elements.TOGGLE_PANEL).hasClass('buttonStateOn')==false) {
                    $(Elements.TOGGLE_PANEL).trigger('click');
                }
            } else {
                var popModalView = Backbone.comBroker.getService(Backbone.SERVICES.POP_MODAL_VIEW);
                popModalView.selectView(Elements.POPUP_PROPERTIES);
            }
        }
    })

    return PropertiesView;

});



