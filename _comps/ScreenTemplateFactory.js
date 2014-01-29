/**
 The class generates the UI for a template (a.k.a Screen Division) that is
 a selectable widget including the drawing of each viewer (division) within
 the screen, as well as firing related tap events on action.
 @class ScreenTemplateFactory
 @constructor
 @param {object} i_screenTemplateData hold data as instructions for factory creation component
 @param {String} i_type the type of widget that we will create. This includes
 VIEWER_SELECTABLE as well as ENTIRE_SELECTABLE with respect to the ability to select the components viewers individually
 or the entire screen division
 @param {object} i_owner the owner of this class (parent) that we can query at the listening end, to examine if the event is
 of any interest to the listener.
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var ScreenTemplateFactory = Backbone.Controller.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {

            // i_screenTemplateData, i_type, i_owner

            var self = this;

            this.m_owner = self.options.i_owner;
            this.m_myElementID = 'svgScreenLayout' + '_' + _.uniqueId();
            this.m_screenTemplateData = self.options.i_screenTemplateData;
            this.m_orientation = self.options.i_screenTemplateData['orientation'];
            this.m_resolution = self.options.i_screenTemplateData['resolution'];
            this.m_screenProps = self.options.i_screenTemplateData['screenProps'];
            this.m_scale = self.options.i_screenTemplateData['scale'];
            this.m_svgWidth = (this.m_resolution.split('x')[0]) / this.m_scale;
            this.m_svgHeight = (this.m_resolution.split('x')[1]) / this.m_scale;

            switch (self.options.i_type) {

                case 'VIEWER_SELECTABLE' :
                {
                    this.m_useLabels = true;
                    this.m_mouseOverEffect = false;
                    this.m_selectableFrame = false;
                    this.m_selectablDivision = true;
                    break;
                }

                case 'ENTIRE_SELECTABLE' :
                {
                    this.m_useLabels = false;
                    this.m_mouseOverEffect = true;
                    this.m_selectableFrame = true;
                    this.m_selectablDivision = false;
                    break;
                }
            }
        },

        /**
         Method is called when an entire screen frame of the UI is tapped, in contrast to when a single viewer is selected.
         The difference in dispatch of the event depends on how the factory created this instance.
         @method _onScreenFrameSelected
         @param {Event} e
         @param {Object} i_caller
         @return {Boolean} false
         **/
        _onScreenFrameSelected: function (e, i_caller) {
            var self = i_caller;
            var element = e.target;

            var campaign_timeline_board_viewer_id = $(element).data('campaign_timeline_board_viewer_id');
            var campaign_timeline_id = $(element).data('campaign_timeline_id');


            var screenData = {
                sd: $(element).data('sd'),
                elementID: i_caller.m_myElementID,
                owner: i_caller.getOwner(),
                campaign_timeline_board_viewer_id: campaign_timeline_board_viewer_id,
                campaign_timeline_id: campaign_timeline_id,
                screenTemplateData: self.m_screenTemplateData
            };

            self._deselectViewers();

            commBroker.fire(ScreenTemplateFactory.ON_VIEWER_SELECTED, this, screenData);
            e.stopImmediatePropagation();
            return false;
        },

        /**
         Method is called when a single viewer (screen division) of the UI is tapped, in contrast to when the entire frame of the screen is selected.
         The difference in dispatch of the event depends on how the factory created this instance.
         @method _onScreenViewerSelected
         @param {Event} e
         @param {Object} i_caller
         @return {Boolean} false
         **/
        _onScreenViewerSelected: function (e, i_caller) {
            var element = e.target;

            // Label was pressed
            if ($(element).data('for') != undefined) {
                var forDivison = $(element).data('for');
                element = $('#' + forDivison);
            }

            i_caller._deselectViewers();

            var campaign_timeline_board_viewer_id = $(element).data('campaign_timeline_board_viewer_id');
            var campaign_timeline_id = $(element).data('campaign_timeline_id');

            $(element).css({'fill': 'rgb(200,200,200)'});

            var screenData = {
                sd: $(element).data('sd'),
                campaign_timeline_board_viewer_id: campaign_timeline_board_viewer_id,
                campaign_timeline_id: campaign_timeline_id,
                elementID: i_caller.m_myElementID,
                owner: i_caller.getOwner(),
                screenTemplateData: self.m_screenTemplateData
            }

            commBroker.fire(ScreenTemplateFactory.ON_VIEWER_SELECTED, this, screenData);
            e.stopImmediatePropagation();
            return false;
        },

        /**
         Deselect all viewers, thus change their colors back to default.
         @method _deselectViewers
         @return none
         **/
        _deselectViewers: function () {
            var self = this;
            $(Elements.CLASS_SCREEN_DIVISION).each(function () {
                if ($(this).is('rect')) {
                    $(this).css({'fill': 'rgb(230,230,230)'});
                }
            });
        },

        /**
         When enabled, _mouseOverEffect will highlight viewers when mouse is hovered over them.
         @method _mouseOverEffect
         @return none
         **/
        _mouseOverEffect: function () {
            var self = this;
            var a = $('#' + self.m_myElementID);
            var b = $('#' + self.m_myElementID).find('rect');
            $('#' + self.m_myElementID).find('rect').each(function () {
                $(this).on('mouseover',function () {
                    $(this).css({'fill': 'rgb(190,190,190)'});
                }).mouseout(function () {
                        $(this).css({'fill': 'rgb(230,230,230)'});
                    });
            });
        },

        /**
         Get the owner (parent) of this instance, i.e., the one who created this.
         We use the owner attribute as a way to distinguish what type of instance this was created as.
         @method getOwner
         @return {Object} m_owner
         **/
        getOwner: function () {
            var self = this;
            return self.m_owner;
        },

        /**
         Create will produce the actual SVG based Template (screen) with inner viewers and return HTML snippet to the caller.
         @method create
         @return {Object} html element produced by this factory
         **/
        create: function () {

            var self = this;
            var screensDivisons = '';
            var screenLabels = '';
            var i = 0;

            for (var screenValues in self.m_screenProps) {
                i++;
                var screenValue = self.m_screenProps[screenValues];
                var x = screenValue['x'] == 0 ? 0 : screenValue['x'] / self.m_scale;
                var y = screenValue['y'] == 0 ? 0 : screenValue['y'] / self.m_scale;
                var w = screenValue['w'] == 0 ? 0 : screenValue['w'] / self.m_scale;
                var h = screenValue['h'] == 0 ? 0 : screenValue['h'] / self.m_scale;
                var campaign_timeline_board_viewer_id = screenValue['campaign_timeline_board_viewer_id'];
                var campaign_timeline_id = screenValue['campaign_timeline_id'];
                var sd = screenValues;

                var uniqueID = 'rectSD' + '_' + _.uniqueId();

                if (self.m_useLabels == true)
                    screenLabels += '<text class="screenDivisionClass"' + '" data-for="' + uniqueID + '" x="' + (x + (w / 2)) + '" y="' + (y + (h / 2)) + '" font-family="sans-serif" font-size="12px" text-anchor="middle" alignment-baseline="middle" fill="#666">' + i + '</text>';


                screensDivisons += '<rect id="' + uniqueID +
                    '" data-campaign_timeline_board_viewer_id="' + campaign_timeline_board_viewer_id +
                    '" data-campaign_timeline_id="' + campaign_timeline_id +
                    '" x="' + x +
                    '" y="' + y +
                    '" width="' + w +
                    '" height="' + h +
                    '" data-sd="' + sd +
                    '" class="screenDivisionClass"' +
                    '  style="fill:rgb(230,230,230);stroke-width:2;stroke:rgb(72,72,72)"/>';
            }
            // '" data-sourcetrigger="' + self.m_sourcetrigger +

            return ($('<svg style="padding: 20px" id="' + self.m_myElementID + '" width="' + self.m_svgWidth + '" height="' + self.m_svgHeight + '" xmlns="http://www.w3.org/2000/svg">  ' +
                '<g>' +
                screensDivisons +
                screenLabels +
                '</g> ' +
                '</svg>'));

        },

        /**
         Begin listening to events and in turn set the behavior of the instance.
         @method activate
         @return none
         **/
        activate: function () {
            var self = this;

            if (self.m_mouseOverEffect)
                this._mouseOverEffect();

            if (self.m_selectableFrame)
                this.selectableFrame();

            if (self.m_selectablDivision)
                this.selectablelDivision();
        },

        /**
         When enabled, selectablelDivision will allow for UI mouse / tap of individual viewers (screen divisions) and not entire frame.
         @method selectablelDivision
         @return none
         **/
        selectablelDivision: function () {
            var self = this;
            $(Elements.CLASS_SCREEN_DIVISION).on('tap', function (e) {
                self._onScreenViewerSelected(e, self);
            });
        },

        /**
         When enabled, selectableFrame will allow for UI mouse / tap of the outer frame of the template (screen) and not
         individual viewers.
         @method selectableFrame
         @return none
         **/
        selectableFrame: function () {
            var self = this;

            Backbone.comBroker.listen(ScreenTemplateFactory.ON_VIEWER_SELECTED, function (e) {
                if (e.caller.elementID === self.m_myElementID) {
                    $('#' + self.m_myElementID).find('rect').css({'stroke-width': '4', 'stroke': 'rgb(73,123,174)'});
                } else {
                    $('#' + self.m_myElementID).find('rect').css({'stroke-width': '2', 'stroke': 'rgb(72,72,72)'});
                }
            });


            $(Elements.CLASS_SCREEN_DIVISION).on('tap', function (e) {
                self._onScreenFrameSelected(e, self);
            });
        },


        /**
         Release all members to allow for garbage collection.
         @method destroy
         @return none
         **/
        destroy: function () {
            this.self = this;
            self.m_owner = null;
            self.m_myElementID = null;
            self.m_orientation = null;
            self.m_resolution = null;
            self.m_screenProps = null;
            self.m_scale = null;
            self.m_svgWidth = null;
            self.m_svgHeight = null;
            self.m_useLabels = null;
            self.m_mouseOverEffect = null;
            self.m_selectableFrame = null;
            self.m_selectablDivision = null;
            self.m_screenTemplateData = null;
        }

    })


    /**
     This is a key event in the framework as many different instances subscribe to ON_VIEWER_SELECTED to reconfigure
     themselves. The event is fired when a viewer (i.e.: a screen division) is selected inside a Template (i.e. Screen).
     The key to remember is that the Factory instance (this) is always created with respect to it's owner (i_owner),
     so when ON_VIEWER_SELECTED is fired, the owner is carried with the event so listeners can act accordingly, and only if the owner
     is of interest to a subscribed listener.
     @event ScreenTemplateFactory.ON_VIEWER_SELECTED
     @param {this} caller
     @param {object} screenData event params
     @static
     @final
     @param {screenData} json encapsulated data of entire configuration of instance
     **/
    ScreenTemplateFactory.ON_VIEWER_SELECTED = 'ON_VIEWER_SELECTED';

    /**
     Instruct the factory to produce a Template (screen) that each viewer (screen division) can be selected individually
     as well as the creation of corresponding viewer numbered labels inside each viewer.
     @property ScreenTemplateFactory.VIEWER_SELECTABLE
     @static
     @final
     @type String
     */
    ScreenTemplateFactory.VIEWER_SELECTABLE = 'VIEWER_SELECTABLE';

    /**
     Instruct the factory to produce a Template (screen) that can only be selected as a whole (no viewers selectable) and no numbered labels.
     @property ScreenTemplateFactory.ENTIRE_SELECTABLE
     @static
     @final
     @type String
     */
    ScreenTemplateFactory.ENTIRE_SELECTABLE = 'ENTIRE_SELECTABLE';

    return ScreenTemplateFactory;

});