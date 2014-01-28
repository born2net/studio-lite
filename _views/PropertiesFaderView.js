/**
 Property manager is a singleton class that manages all of the view stacks per selected element.
 If you select a block such as the QR component, the property manager is responsible
 for loading the proper view stack for the selected element. Note that it is the job of the caller
 to populate the view stack with the appropriate data.
 The property manager is also capable of managing common properties which are used for blocks.
 For example, all blocks (QR, RSS etc) have a border color, the property value for the border will appear
 in the sub-panel (m_subViewStack)
 @class PropertiesFaderView
 @constructor
 @param {string} i_elementID is the the main property HTML ID (div element).
 @return {object} CompProperty instance.
 **/

define(['jquery', 'backbone', 'StackView'], function ($, Backbone, StackView) {

    var PropertiesFaderView = Backbone.StackView.Fader.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;

            Backbone.StackView.ViewPort.prototype.initialize.call(this);
            Backbone.comBroker.listen(AppEvents.APP_SIZED, self._reconfigPropPanelPosition);

            this.m_subViewStack = new StackView.Fader({el: Elements.SUB_PROP_PANEL});

            this.m_mainPanels = {};
            this.m_subPanels = {};
            this._listenOnSlidingPanel();
            return;

            this.m_viewStack = new Viewstacks(this.m_myElementID);
            this.m_subViewStack = undefined;
            this.m_selectedPanelID = undefined;
            this.m_selectedSubPanelID = undefined;

            this._init();
        },

        /**
         Create the initial properties panel which is an empty element.
         @method _init
         @return none
         **/
        _init: function () {
            var self = this;
            self.m_emptyProperties = Elements.EMPTY_PROPERTIES;
            self.initPanel(self.m_emptyProperties, false)
        },

        /**
         Init the properties panel and add it to the viewstack.
         @method initPanel
         @param {String} i_panelID the html element id to be inserted into properties panel
         @param {Boolean} i_viewPanel open via animation the property panel, default true.
         @return {Boolean} returns true if panel created, or false if it already existed so nothing was done.
         **/
        initPanel: function (i_panelID, i_viewPanel) {
            var self = this;

            if (self.m_mainPanels[i_panelID] != undefined)
                return false;

            if (i_viewPanel == undefined)
                i_viewPanel = true;

            if (self.m_mainPanels[i_panelID] == undefined) {
                var index = self.m_viewStack.addChild(i_panelID);
                self.m_mainPanels[i_panelID] = index;

                // Init jQuery Mobile UI
                var wrapDiv = $(i_panelID + ' > div');
                wrapDiv.find('a').button();
                wrapDiv.find('[type="text"]').textinput();
            }

            if (i_viewPanel)
                self.viewPanel(i_panelID);

            return true;
        },

        /**
         Init the properties sub-panel and add it to the view stack.
         @method initSubPanel
         @param {String} i_panelID  the html element id to be inserted into sub properties panel
         @return {Boolean} returns true if panel created, or false if it already existed so nothing was done
         **/
        initSubPanel: function (i_panelID) {
            var self = this;

            // already exists
            if (self.m_subPanels[i_panelID] != undefined)
                return false;

            var index = self.m_subViewStack.addChild(i_panelID);
            self.m_subPanels[i_panelID] = index;

            // Init jQuery Mobile UI
            var wrapDiv = $(i_panelID + ' > div');
            wrapDiv.find('a').button();
            wrapDiv.find('[type="text"]').textinput();
            $(i_panelID).find('select').slider();

            return true;
        },

        /**
         Create a new a sub properties panel that will co-exist inside the parent properties panel.
         This is used to manage common properties for blocks that share the same behaviour.
         @method createSubPanel
         @param {String} i_panelID the html element id to be used in the common sub properties panel.
         @return {Boolean} returns true if panel created, or false if it already existed so nothing was done.
         **/
        createSubPanel: function (i_panelID) {
            var self = this;
            this.m_subViewStack = new Viewstacks(i_panelID);
        },

        /**
         Get the selected panel id.
         @method getSelectedPanelID
         @return {String} element id of the currently selected panel
         **/
        getSelectedPanelID: function () {
            var self = this;
            return self.m_selectedPanelID;
        },

        /**
         Get the selected sub panel id.
         @method getSelectedSubPanelID
         @return {String} element id of the currently selected sub panel
         **/
        getSelectedSubPanelID: function () {
            var self = this;
            return self.m_selectedSubPanelID;
        },

        /**
         Load the requested panel into the current viewstack (i.e.: hide all other panels).
         @method viewPanel
         @param {String} i_panelID html element id of panel to load into current viewstack.
         @return {Number} index of the panel in view
         **/
        viewPanel: function (i_panelID) {
            var self = this;
            self.m_selectedPanelID = i_panelID;
            var index = self.m_mainPanels[i_panelID];
            self.m_viewStack.selectIndex(index);
            return index;
        },

        /**
         Load the requested sub panel into the current viewstack (i.e.: hide all other panels).
         @method viewSubPanel
         @param {String} i_panelID html element id of sub panel to load into current view stack.
         @return {Number} index of the sub-panel in view
         **/
        viewSubPanel: function (i_panelID) {
            var self = this;
            self.m_selectedSubPanelID = i_panelID;
            var index = self.m_subPanels[i_panelID];
            self.m_subViewStack.selectIndex(index);
            return index;
        },

        /**
         Hide all panels and display empty properties.
         @method noPanel
         @return none.
         **/
        noPanel: function () {
            var self = this;
            self.viewPanel(self.m_emptyProperties);
        },

        /**
         Animate the opening (sliding) of the properties panel.
         @method openPanel
         @param {event} tap event
         @return {Boolean} false
         **/
        openPanel: function (e) {
            $(Elements.TOGGLE_NAVIGATION + ' ' + Elements.CLASS_UI_ICON).addClass(Elements.CLASS_UI_ICON_ARROW_R).removeClass(Elements.CLASS_UI_ICON_ARROW_L)
            $(Elements.NAV_PANEL).panel("close");
            setTimeout(function () {
                $(Elements.PROPERTIES_PANEL).panel("open");
            }, 650)
            e.stopImmediatePropagation();
            e.preventDefault();
            return false;
        },

        /**
         Unsupported, future interoperability.
         @method closePanel
         @return none
         **/
        closePanel: function () {
            var self = this;
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

        openPropertiesPanel: function(){
            var self = this;
            self._reconfigPropPanelPosition();
            var layoutManager = Backbone.comBroker.getService(Services.LAYOUT_MANAGER);
            if (layoutManager.getAppWidth() > 768){
                if ($(Elements.TOGGLE_PANEL).hasClass('buttonStateOn')==false) {
                    $(Elements.TOGGLE_PANEL).trigger('click');
                }
            } else {
                var popModalView = Backbone.comBroker.getService(Services.POP_MODAL_VIEW);
                var view = popModalView.getViewByID(Elements.POPUP_PROPERTIES)
                popModalView.selectView(view);
            }
        },

        _reconfigPropPanelPosition: function(){
            var layoutManager = Backbone.comBroker.getService(Services.LAYOUT_MANAGER);
            if (layoutManager.getAppWidth() > 768){
                $(Elements.PROP_PANEL_WRAP).append($(Elements.PROP_PANEL));
            } else {
                $(Elements.POPUP_PROPERTIES).append($(Elements.PROP_PANEL));
            }
        }
    })

    return PropertiesFaderView;

});



