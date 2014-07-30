/**
 The class generates the UI for a template (a.k.a Screen Division) that is
 a selectable widget including the drawing of each viewer (division) within
 the screen, as well as firing related click events on action.
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

    /**
     This is a key event in the framework as many different instances subscribe to ON_VIEWER_SELECTED to reconfigure
     themselves. The event is fired when a viewer (i.e.: a screen division) is selected inside a Template (i.e. Screen).
     The key to remember is that the Factory instance (this) is always created with respect to it's owner (i_owner),
     so when ON_VIEWER_SELECTED is fired, the owner is carried with the event so listeners can act accordingly, and only if the owner
     is of interest to a subscribed listener.
     @event ON_VIEWER_SELECTED
     @param {this} caller
     @param {object} screenData event params
     @static
     @final
     @param {screenData} json encapsulated data of entire configuration of instance
     **/
    BB.EVENTS.ON_VIEWER_SELECTED = 'ON_VIEWER_SELECTED';

    var ScreenTemplateFactory = BB.Controller.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            this.m_owner = self.options.i_owner;
            this.m_myElementID = 'svgScreenLayout' + '_' + _.uniqueId();
            this.m_screenTemplateData = self.options.i_screenTemplateData;
            this.m_selfDestruct = self.options.i_selfDestruct;
            this.m_orientation = self.options.i_screenTemplateData['orientation'];
            this.m_resolution = self.options.i_screenTemplateData['resolution'];
            this.m_screenProps = self.options.i_screenTemplateData['screenProps'];
            this.m_scale = self.options.i_screenTemplateData['scale'];
            this.m_svgWidth = (this.m_resolution.split('x')[0]) / this.m_scale;
            this.m_svgHeight = (this.m_resolution.split('x')[1]) / this.m_scale;
            this.m_useLabels = false;
        },

        /**
         Get current selection color depnding on theme of light / daek
         @method _getColor
         @params {String} color
         **/
        _getColor: function(){
            if (BB.CONSTS['THEME']=='light')
                return '#428ac9 ';
            return '#eb7c66';
        },

        /**
         Method is called when an entire screen frame of the UI is clicked, in contrast to when a single viewer is selected.
         The difference in dispatch of the event depends on how the factory created this instance.
         @method _onViewSelected
         @param {Event} e
         @param {Object} i_caller
         @return {Boolean} false
         **/
        _onViewSelected: function (e, i_caller) {
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
            BB.comBroker.fire(BB.EVENTS.ON_VIEWER_SELECTED, this, screenData);
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
                $(this).on('mouseover', function () {
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
         Create all the screen divisions (aka viewers) as svg snippets and push them into an array
         @method getDivisions
         @return {array} f array of all svg divisions
         **/
        getDivisions: function () {
            var self = this;
            var svg = self.create();
            return $(svg).find('rect');

            var f = $(svg).find('rect').map(function (k, v) {
                return '<svg style="padding: 0px; margin: 15px" width="20px" height="20px" xmlns="http://www.w3.org/2000/svg">  ' +
                    '<g>' +
                    v.outerHTML +
                    '</g> ' +
                    '</svg>';
            });
            return f;
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

            return ($('<svg style="padding: 0px; margin: 15px" id="' + self.m_myElementID + '" width="' + self.m_svgWidth + '" height="' + self.m_svgHeight + '" xmlns="http://www.w3.org/2000/svg">  ' +
                '<g>' +
                screensDivisons +
                screenLabels +
                '</g> ' +
                '</svg>'));
        },

        /**
         When enabled, selectableFrame will allow for UI mouse / click of the outer frame of the template (screen) and not
         individual viewers.
         @method selectableFrame
         @return none
         **/
        selectableFrame: function () {
            var self = this;
            var applyToSelected = function (e) {
                $('#' + self.m_myElementID).parent().parent().parent().find('rect').css({'stroke-width': '2', 'stroke': 'rgb(72,72,72)'});
                $('#' + self.m_myElementID).find('rect').css({'stroke-width': '2', 'stroke': self._getColor()});
                self._onViewSelected(e, self);
            }
            // listen one
            if (self.m_selfDestruct) {
                $(Elements.CLASS_SCREEN_DIVISION, '#' + self.m_myElementID).one('click contextmenu', function (e) {
                    applyToSelected(e);
                });

            } else {
                // listen on
                $(Elements.CLASS_SCREEN_DIVISION, '#' + self.m_myElementID).on('click contextmenu', function (e) {
                    applyToSelected(e);
                });
            }
        },

        /**
         The public method version of _deselectViewers, which de-selects all viewers
         @method deselectDivisons
         **/
        deselectDivisons: function () {
            var self = this;
            self._deselectViewers();
        },

        /**
         Select a division (aka viewer) using it's viewer_id, only applicable when class represents an actual timelime > board > viewer_id
         @method selectDivison
         @param {Number} i_campaign_timeline_board_viewer_id
         **/
        selectDivison: function (i_campaign_timeline_board_viewer_id) {
            var self = this;
            self._deselectViewers();
            var selectedElement = $('#' + self.m_myElementID).find('[data-campaign_timeline_board_viewer_id="' + i_campaign_timeline_board_viewer_id + '"]');
            $(selectedElement).css({'fill': self._getColor()});
        },

        /**
         Release all members to allow for garbage collection.
         @method destroy
         @return none
         **/
        destroy: function () {
            var self = this;
            $(Elements.CLASS_SCREEN_DIVISION).off('click contextmenu', function (e) {
                self._onViewSelected(e, self);
            });
            $(this).off('mouseover', function () {
                $(this).css({'fill': 'rgb(190,190,190)'});
            }).mouseout(function () {
                $(this).css({'fill': 'rgb(230,230,230)'});
            });
            $.each(self, function (k) {
                self[k] = undefined;
            });
        }
    });

    return ScreenTemplateFactory;

});