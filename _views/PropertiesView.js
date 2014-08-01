/**
 Property manager is a singleton class that manages all of the StackView element properties.
 If you select a block such as the QR component, the property manager is responsible
 for loading the proper view stack for the selected element. Note that it is the job of the caller
 to populate the view stack with the appropriate data.
 The property manager is also capable of managing common properties which are used for blocks.
 For example, all blocks (QR, RSS etc) have a border color, the property value for the border will appear
 in the sub-panel via the BlockProperties (m_subViewStack) which co-resides inside the PropertiesView module.
 @class PropertiesView
 @constructor
 @param {string} i_elementID is the the main property HTML ID (div element).
 @return {object} CompProperty instance.
 **/
define(['jquery', 'backbone', 'StackView'], function ($, Backbone, StackView) {

    /**
     Even is fired when Side properties panel changed in size
     @event SIDE_PANEL_SIZED
     @param {This} caller
     @param {Self} context caller
     @param {Event}
     @static
     @final
     **/
    BB.EVENTS.SIDE_PANEL_SIZED = 'SIDE_PANEL_SIZED';

    BB.SERVICES.PROPERTIES_VIEW = 'PropertiesView';

    var PropertiesView = BB.StackView.Fader.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;

            BB.StackView.ViewPort.prototype.initialize.call(this);
            BB.comBroker.listen(BB.EVENTS.APP_SIZED, self._reconfigPropPanelLocation);
            BB.comBroker.listen(BB.EVENTS.APP_SIZED, self._reConfigPropPanelIcon);

            this.m_subViewStack = new StackView.Fader({el: Elements.BLOCK_SUBPROPERTIES});
            this.m_selectedPanelID = undefined;
            this.m_selectedSubPanelID = undefined;

            this._listenClickSlidingPanel();
            this._listenGlobalOpenProps();
        },

        /**
         Change the icon of the open properties panel button so it reflects full screen vs
         right side panel properties inspection
         @method _reConfigPropPanelIcon
         **/
        _reConfigPropPanelIcon: function () {
            var self = this;
            var layoutRouter = BB.comBroker.getService(BB.SERVICES.LAYOUT_ROUTER);

            if (layoutRouter.getAppWidth() < 768) {
                $(Elements.TOGGLE_PANEL + ' > span').removeClass('glyphicon-resize-horizontal');
                $(Elements.TOGGLE_PANEL + ' > span').addClass('glyphicon-cog');
            } else {
                $(Elements.TOGGLE_PANEL + ' > span').removeClass('glyphicon-cog');
                $(Elements.TOGGLE_PANEL + ' > span').addClass('glyphicon-resize-horizontal');
            }
        },

        /**
         Listen for open/close actions on properties panel that can slide in and out
         @method _listenClickSlidingPanel
         **/
        _listenClickSlidingPanel: function () {
            var self = this;
            $(Elements.TOGGLE_PANEL).on('click', function () {
                self._announcePanelSized();
                self._reConfigPropPanelIcon();
                if ($(Elements.TOGGLE_PANEL).hasClass('propPanelIsOpen')) {
                    $(Elements.TOGGLE_PANEL).toggleClass('propPanelIsOpen');
                    // $(Elements.PROP_PANEL_WRAP).fadeOut(function () {
                    $(Elements.PROP_PANEL_WRAP).addClass('hidden-sm hidden-md');
                    $(Elements.MAIN_PANEL_WRAP).removeClass('col-sm-9 col-md-9');
                    $(Elements.MAIN_PANEL_WRAP).addClass('col-md-12');
                    // });
                } else {
                    $(Elements.TOGGLE_PANEL).toggleClass('propPanelIsOpen');
                    $(Elements.MAIN_PANEL_WRAP).addClass('col-sm-9 col-md-9');
                    setTimeout(function () {
                        $(Elements.PROP_PANEL_WRAP).hide();
                        $(Elements.MAIN_PANEL_WRAP).removeClass('col-md-12');
                        $(Elements.PROP_PANEL_WRAP).removeClass('hidden-sm hidden-md');
                        $(Elements.PROP_PANEL_WRAP).fadeIn('fast');
                        // $(Elements.PROP_PANEL_WRAP).children().fadeIn();
                    }, 500)
                }
            });
        },

        /**
         Announce that the side properties panel has changed in size
         @method _announcePanelSized
         **/
        _announcePanelSized: function(){
            var self = this;
            setTimeout(function(){
                BB.comBroker.fire(BB.EVENTS.SIDE_PANEL_SIZED,self,self);
            },400);

        },

        /**
         Move properties panel between side panel or full screen popup panel depending on screen size
         @method _reconfigPropPanelLocation
         **/
        _reconfigPropPanelLocation: function () {
            var self = this;
            var layoutRouter = BB.comBroker.getService(BB.SERVICES.LAYOUT_ROUTER);
            if (layoutRouter.getAppWidth() > 768) {
                $(Elements.PROP_PANEL_WRAP).append($(Elements.PROP_PANEL));
            } else {
                $(Elements.POPUP_PROPERTIES).append($(Elements.PROP_PANEL));
            }
        },

        /**
         Open global properties button hook via popup
         @method _listenGlobalOpenProps
         **/
        _listenGlobalOpenProps: function () {
            var self = this;
            $(Elements.TOGGLE_PANEL).on('click', function () {
                var layoutRouter = BB.comBroker.getService(BB.SERVICES.LAYOUT_ROUTER);
                if (layoutRouter.getAppWidth() < 768) {
                    self.openPropertiesPanel();
                }
            });
        },

        /**
         Init the properties sub-panel and add it to the view stack.
         @method initSubPanel
         @param {String} i_panelID  the html element id to be inserted into sub properties panel
         @return {Boolean} returns true if panel created, or false if it already existed so nothing was done
         **/
        initSubPanel: function (i_panelID) {
            var self = this;
            if (self.m_subViewStack.getViewByID(i_panelID) != undefined)
                return false;
            var view = new BB.View({el: i_panelID});
            self.m_subViewStack.addView(view);
            return true;
        },

        /**
         Load the requested panel into the current viewstack (i.e.: hide all other panels).
         @method viewPanel
         @param {String} i_panelID html element id of panel to load into current viewstack.
         **/
        viewPanel: function (i_panelID) {
            var self = this;
            self.m_selectedPanelID = i_panelID;
            self.selectView(i_panelID);
        },

        /**
         Load the requested sub panel into the current viewstack (i.e.: hide all other panels).
         @method viewSubPanel
         @param {String} i_panelID html element id of sub panel to load into current view stack.
         **/
        viewSubPanel: function (i_panelID) {
            var self = this;
            // var index = self.m_subPanels[i_panelID];
            self.m_subViewStack.selectView(i_panelID);
            self.m_selectedSubPanelID = i_panelID;
        },

        /**
         Init the properties panel and add it to the viewstack.
         @method initPanel
         @param {String} i_panelID the html element id to be inserted into properties panel
         @return {Boolean} returns true if panel created, or false if it already existed so nothing was done.
         **/
        initPanel: function (i_panelID) {
            var self = this;
            if (self.getViewByID(i_panelID) != undefined)
                return false;
            var view = new BB.View({el: i_panelID});
            self.addView(view);
            return true;
        },

        /**
         Open the properties panel (side or popup per screen size)
         @method openPropertiesPanel
         **/
        openPropertiesPanel: function () {
            var self = this;
            self._reconfigPropPanelLocation();
            self._reConfigPropPanelIcon();
            var layoutRouter = BB.comBroker.getService(BB.SERVICES.LAYOUT_ROUTER);
            if (layoutRouter.getAppWidth() > 768) {
                if ($(Elements.TOGGLE_PANEL).hasClass('propPanelIsOpen') == false) {
                    $(Elements.TOGGLE_PANEL).trigger('click');
                }
            } else {
                var popModalView = BB.comBroker.getService(BB.SERVICES.POP_MODAL_VIEW);
                popModalView.selectView(Elements.POPUP_PROPERTIES);
            }
        },

        /**
         Select the default properties view which is the Dashboard
         @method resetPropertiesView
         **/
        resetPropertiesView: function(){
            var self = this;
            this.selectView(Elements.DASHBOARD_PROPERTIES);
            return self;
        },

        /**
         Get the property div total width which may vary, especially when in full popup mode vs left slide mode
         @method getPropWidth
         @return {Number} current width
         **/
        getPropWidth: function(){
            var layoutRouter = BB.comBroker.getService(BB.SERVICES.LAYOUT_ROUTER);
            if (layoutRouter.getAppWidth() > 768) {
                return $(Elements.PROP_PANEL_WRAP).outerWidth();
            } else {
                return layoutRouter.getAppWidth();
            }
        }
    });

    return PropertiesView;

});



