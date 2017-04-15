/**
 The class generates the UI for a template (a.k.a Screen Division) that is
 a selectable widget including the drawing of each viewer (division) within
 the screen, as well as firing related click events on action.
 @param {object} i_screenTemplateData hold data as instructions for factory creation component
 @param {String} i_type the type of widget that we will create. This includes
 VIEWER_SELECTABLE as well as ENTIRE_SELECTABLE with respect to the ability to select the components viewers individually
 or the entire screen division
 @param {object} i_owner the owner of this class (parent) that we can query at the listening end, to examine if the event is
 of any interest to the listener.


 This is a key event in the framework as many different instances subscribe to ON_VIEWER_SELECTED to reconfigure
 themselves. The event is fired when a viewer (i.e.: a screen division) is selected inside a Template (i.e. Screen).
 The key to remember is that the Factory instance (this) is always created with respect to it's owner (i_owner),
 so when ON_VIEWER_SELECTED is fired, the owner is carried with the event so listeners can act accordingly, and only if the owner
 is of interest to a subscribed listener.
 **/

import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output} from "@angular/core";
import {Compbaser} from "ng-mslib";
import * as _ from "lodash";
import {Lib} from "../../Lib";
import {OrientationEnum} from "../../app/campaigns/campaign-orientation";
import {IScreenTemplateData} from "../../interfaces/IScreenTemplate";


@Component({
    selector: 'screen-template',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<!--<small class="debug">{{me}}</small>-->`,
})
export class ScreenTemplate extends Compbaser {

    private created = false;
    private m_mouseHoverEffect = false;
    private m_campaign_timeline_id = -1;

    constructor(private el: ElementRef) {
        super();
    }

    ngAfterViewInit(){
        if (this.m_mouseHoverEffect)
            this._mouseOverEffect()
        this.m_mouseHoverEffect = false;
    }

    @Output()
    onDivisionDoubleClicked: EventEmitter<any> = new EventEmitter<any>();

    @Input()
    set mouseHoverEffect(i_value) {
        this.m_mouseHoverEffect = i_value;
    }

    @Input()
    set setTemplate(i_screenTemplateData: IScreenTemplateData) {
        if (this.created) return
        this.created = true;
        // this.m_selfDestruct = i_screenTemplateData.i_selfDestruct;
        this.m_myElementID = 'svgScreenLayout' + '_' + _.uniqueId();
        this.m_screenTemplateData = i_screenTemplateData;
        this.m_orientation = i_screenTemplateData['orientation'];
        this.m_resolution = i_screenTemplateData['resolution'];
        this.m_screenProps = i_screenTemplateData['screenProps'];
        this.m_scale = i_screenTemplateData['scale'];
        this.m_svgWidth = (this.m_resolution.split('x')[0]) / this.m_scale;
        this.m_svgHeight = (this.m_resolution.split('x')[1]) / this.m_scale;
        this.m_useLabels = false;
        this._create()
        // this.selectableFrame();

        this._mouseDoubleClickDivision();
    }

    m_selfDestruct;
    m_screenTemplateData;
    m_myElementID;
    m_orientation;
    m_resolution;
    m_screenProps;
    m_scale;
    m_svgWidth;
    m_svgHeight;
    m_useLabels;

    /**
     Method is called when an entire screen frame of the UI is clicked, in contrast to when a single viewer is selected.
     The difference in dispatch of the event depends on how the factory created this instance.
     @method _onViewSelected
     @param {Event} e
     @param {Object} i_caller
     @return {Boolean} false
     **/
    private _onViewSelected(e, i_caller) {
        var self = i_caller;
        var element = e.target;

        var campaign_timeline_board_viewer_id = jQuery(element).data('campaign_timeline_board_viewer_id');
        var campaign_timeline_id = jQuery(element).data('campaign_timeline_id');

        var screenData = {
            sd: jQuery(element).data('sd'),
            elementID: i_caller.m_myElementID,
            // owner: i_caller.getOwner(),
            campaign_timeline_board_viewer_id: campaign_timeline_board_viewer_id,
            campaign_timeline_id: campaign_timeline_id,
            screenTemplateData: self.m_screenTemplateData
        };
        self._deselectViewers();
        // BB.comBroker.fire(BB.EVENTS.ON_VIEWER_SELECTED, this, screenData);
    }

    /**
     Deselect all viewers, thus change their colors back to default.
     @method _deselectViewers
     @return none
     **/
    private _deselectViewers() {
        var self = this;
        jQuery('.screenDivisionClass', self.el.nativeElement).each(function () {
            if (jQuery(this).is('rect')) {
                jQuery(this).css({'fill': 'rgb(230,230,230)'});
            }
        });
    }


    /**
     When enabled, _mouseOverEffect will highlight viewers when mouse is hovered over them.
     @method _mouseOverEffect
     @return none
     **/
    private _mouseOverEffect() {
        var self = this;
        // var a = jQuery('#' + self.m_myElementID);
        // var b = jQuery('#' + self.m_myElementID).find('rect');
        jQuery('#' + self.m_myElementID, self.el.nativeElement).find('rect').each(function () {
            jQuery(this).on('mouseover', function () {
                jQuery(this).css({'fill': 'rgb(190,190,190)'});
            }).mouseout(function () {
                jQuery(this).css({'fill': 'rgb(230,230,230)'});
            });
        });
    }

    private _mouseDoubleClickDivision() {
        var self = this;
        // var a = jQuery('#' + self.m_myElementID);
        // var b = jQuery('#' + self.m_myElementID).find('rect');

        jQuery('#' + self.m_myElementID, self.el.nativeElement).find('rect').each(function () {
            jQuery(this).on('dblclick', function () {
                var e = jQuery(this).data('campaign_timeline_board_viewer_id');
                self.onDivisionDoubleClicked.emit(e)
            });
        });
    }


    // Get the owner (parent) of this instance, i.e., the one who created this.
    // We use the owner attribute as a way to distinguish what type of instance this was created as.
    // @method getOwner
    // @return {Object} m_owner
    //
    // getOwner() {
    //     var self = this;
    //     return self.m_owner;
    // }
    //
    /**
     Create all the screen divisions (aka viewers) as svg snippets and push them into an array
     @method getDivisions
     @return {array} f array of all svg divisions
     **/
    getDivisions() {
        var self = this;
        var svg = self._create();
        return $(svg).find('rect');

        // var f = $(svg).find('rect').map(function (k, v) {
        //     return '<svg style="padding: 0px; margin: 15px" width="20px" height="20px" xmlns="http://www.w3.org/2000/svg">  ' +
        //         '<g>' +
        //         v.outerHTML +
        //         '</g> ' +
        //         '</svg>';
        // });
        // return f;
    }

    /**
     Create will produce the actual SVG based Template (screen) with inner viewers and return HTML snippet to the caller.
     @method create
     @return {Object} html element produced by this factory
     **/
    private _create() {
        var self = this;
        var screensDivisons = '';
        var screenLabels = '';

        // sort for proper z-order creating the viewers
        var orderedScreenValues = [], i = 0;
        for (var screenValues in self.m_screenProps) {
            var viewOrder = self.m_screenProps[screenValues]['view_order'];
            viewOrder = _.isUndefined(viewOrder) ? i : viewOrder;
            orderedScreenValues[viewOrder] = self.m_screenProps[screenValues];
            i++;
        }

        // create the viewers
        i = 0;
        for (var ordered in orderedScreenValues) {
            i++;
            var screenValue = orderedScreenValues[ordered];
            var x = screenValue['x'] == 0 ? 0 : screenValue['x'] / self.m_scale;
            var y = screenValue['y'] == 0 ? 0 : screenValue['y'] / self.m_scale;
            var w = screenValue['w'] == 0 ? 0 : screenValue['w'] / self.m_scale;
            var h = screenValue['h'] == 0 ? 0 : screenValue['h'] / self.m_scale;
            var campaign_timeline_board_viewer_id = screenValue['campaign_timeline_board_viewer_id'];
            var campaign_timeline_id = self.m_campaign_timeline_id = screenValue['campaign_timeline_id'];
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
        var snippet = (jQuery('<svg class="svgSD" id="' + self.m_myElementID + '" width="' + self.m_svgWidth + '" height="' + self.m_svgHeight + '" xmlns="http://www.w3.org/2000/svg">  ' +
            '<g>' +
            screensDivisons +
            screenLabels +
            '</g> ' +
            '</svg>'));
        jQuery(self.el.nativeElement).append(snippet);
        return snippet;
    }

    /**
     When enabled, selectableFrame will allow for UI mouse / click of the outer frame of the template (screen) and not
     individual viewers.
     @method selectableFrame
     @return none
     **/
    selectableFrame() {
        var self = this;
        var applyToSelected = function (e) {
            jQuery('#' + self.m_myElementID, self.el.nativeElement).parent().find('rect').css({
                'stroke-width': '2',
                'stroke': 'rgb(72,72,72)'
            });
            jQuery('#' + self.m_myElementID, self.el.nativeElement).find('rect').css({'stroke-width': '2', 'stroke': Lib.GetThemeColor()});
            self._onViewSelected(e, self);
        }
        // listen one
        if (self.m_selfDestruct) {
            jQuery('.screenDivisionClass', '#' + self.m_myElementID).one('mouseup contextmenu', function (e) {
                applyToSelected(e);
            });

        } else {
            // listen on
            jQuery('.screenDivisionClass', '#' + self.m_myElementID).on('mouseup contextmenu', function (e) {
                applyToSelected(e);
            });
        }
    }

    get campaignTimelineId(){
        return this.m_campaign_timeline_id;
    }
    
    /**
     When enabled, selectableFrame will allow for UI mouse / click of the outer frame of the template (screen) and not
     individual viewers.
     @method selectableFrame
     @return none
     **/
    selectFrame() {
        jQuery('#' + this.m_myElementID, this.el.nativeElement).parent().find('rect').css({
            'stroke-width': '2',
            'stroke': 'rgb(72,72,72)'
        });
        jQuery('#' + this.m_myElementID, this.el.nativeElement).find('rect').css({'stroke-width': '2', 'stroke': Lib.GetThemeColor()});
        // this._onViewSelected(e, this);
    }

    deSelectFrame() {
        jQuery('#' + this.m_myElementID, this.el.nativeElement).parent().find('rect').css({
            'stroke-width': '2',
            'stroke': 'rgb(72,72,72)'
        });
    }


    /**
     The public method version of _deselectViewers, which de-selects all viewers
     @method deselectDivisons
     **/
    deselectDivisons() {
        var self = this;
        self._deselectViewers();
    }

    /**
     Select a division (aka viewer) using it's viewer_id, only applicable when class represents an actual timelime > board > viewer_id
     @method selectDivison
     @param {Number} i_campaign_timeline_board_viewer_id
     **/
    selectDivison(i_campaign_timeline_board_viewer_id) {
        var self = this;
        self._deselectViewers();
        var selectedElement = jQuery('#' + self.m_myElementID, self.el.nativeElement).find('[data-campaign_timeline_board_viewer_id="' + i_campaign_timeline_board_viewer_id + '"]');
        // jQuery(selectedElement).css({'fill': Lib.GetThemeColor()});
        jQuery(selectedElement).css({'fill': '#aed0ed'});
    }

    destroy() {
        var self = this;
        jQuery('.screenDivisionClass', '#' + self.m_myElementID).off('mouseup contextmenu');
        jQuery('.screenDivisionClass', self.el.nativeElement).off('click contextmenu', function (e) {
            self._onViewSelected(e, self);
        });
        jQuery(this).off('mouseover', function () {
            jQuery(this).css({'fill': 'rgb(190,190,190)'});
        }).mouseout(function () {
            jQuery(this).css({'fill': 'rgb(230,230,230)'});
        });

        jQuery('#' + this.m_myElementID, self.el.nativeElement).find('rect').each(function () {
            jQuery(this).off();
        });

        // jQuery.each(self, function (k) {
        //     self[k] = undefined;
        // });
    }
}