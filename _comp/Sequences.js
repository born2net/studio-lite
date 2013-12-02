/*/////////////////////////////////////////////

 Sequencer

 /////////////////////////////////////////////*/

function Sequencer(i_element) {

    this.self = this;
    this.m_thumbsContainer = $(i_element);
    this.m_timelines = {};
    this._init();
};

Sequencer.prototype = {
    constructor: Sequencer,

    _init: function () {

        var self = this;

        commBroker.listen(Viewstacks.VIEW_CHANGED, function (e) {
            if ( $(e.context).data('viewstackname') == 'tab4' && e.caller === commBroker.getService('PlayListViewStack')) {

                var orientation = commBroker.getService('ScreenOrientation').getOrientation();
                var resolution = commBroker.getService('ScreenResolution').getResolution();

                self._initLayoutSelectorDragDrop();

                setTimeout(function () {
                    $('#attachDragDropMainScreenSelection').trigger('tap');
                }, 3000);

                $('.openPropertiesClass').on('tap', function (e) {
                    commBroker.getService('CompProperty').openPanel(e);
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return false;
                });
            }
        });
    },

    createTimelineThumbnailUI: function (i_screenProps) {
        var self = this;

        // Get the timelineid for current the timeline creating
        for (var screenProp in i_screenProps) {
            var campaign_timeline_id = i_screenProps[screenProp]['campaign_timeline_id']
            break;
        }

        var screenTemplateData = {
            orientation: commBroker.getService('ScreenOrientation').getOrientation(),
            resolution: commBroker.getService('ScreenResolution').getResolution(),
            screenProps: i_screenProps,
            scale: '14'
        }

        var screenTemplate = new ScreenTemplateFactory(screenTemplateData, ScreenTemplateFactory.ENTIRE_SELECTABLE, this);
        var snippet = screenTemplate.create();
        var elementID = $(snippet).attr('id');

        self.m_timelines[campaign_timeline_id] = elementID;

        screenTemplate.selectablelDivision();
        screenTemplate.activate();
        self.m_thumbsContainer.append(snippet);
        screenTemplate.selectableFrame();


    },

    _initLayoutSelectorDragDrop: function () {
        var self = this;

        // Regular popup
        // $("#popupUndismissible").popup( "open", {x: 90, y: 90, width: '400', height: '400'});

        $('#attachDragDropMainScreenSelection').on('tap', function () {

            var h = $('#screenLayoutsUL').height();
            var t = h * 10 / 100;
            $('.draggableScreenPlaceHolder').css({height: h, top: '-' + h + 'px'});

            self.m_thumbsContainer.sortable({
                revert: 200,
                axis: 'x',
                opacity: 1.0,
                placeholder: 'draggableScreenPlaceHolder',
                start: function (e, ui) {
                    // $(ui.placeholder).slideUp();
                    $(ui.placeholder).hide();
                },

                stop: function () {
                    $('#dettachDragDropMainScreenSelection').trigger('tap');
                    $('#attachDragDropMainScreenSelection').trigger('tap');
                    self.reSequenceTimelines();
                },

                change: function (e, ui) {
                    $(ui.placeholder).stop(true).animate({width: '0px'}, 100).css({width: '0px'}).slideDown({duration: 0.5}).animate({width: '100px'});
                    // $(ui.placeholder).stop(true).animate({width: '0px'},100).css({width: '0px'}).slideDown({duration: 0.2}).animate({width: '8px'},0.300);
                },
                scrollSpeed: 120,
                containment: self.m_thumbsContainer,
                delay: 200,
                scroll: true
            }).disableSelection();

        });

        $('#dettachDragDropMainScreenSelection').on('tap', function () {
            $(self.m_thumbsContainer).disableSelection();
            self.m_thumbsContainer.sortable('destroy');
        });
    },

    /////////////////////////////////////////////////////////
    //
    // reSequenceTimelines
    //
    //      re-order the timeline sequence in database per
    //      repsective order of Sequencer UI
    //
    /////////////////////////////////////////////////////////

    reSequenceTimelines: function () {
        var self = this;
        var helperSDK = commBroker.getService('HelperSDK');

        var timelines = $(self.m_thumbsContainer).children().each(function (sequenceIndex) {
            var element = $(this).find('[data-campaign_timeline_id]').eq(0);
            var campaign_timeline_id = $(element).data('campaign_timeline_id');
            var selectedCampaign = commBroker.getService('Campaign').getSelectedCampaign();
            helperSDK.setCampaignTimelineSequencerIndex(selectedCampaign, campaign_timeline_id, sequenceIndex);
        });
    },

    getOwner: function () {
        return this;
    },

    deleteTimeline: function (i_campaign_timeline_id) {
        var self = this;
        var elementID = self.m_timelines[i_campaign_timeline_id];
        $('#' + elementID).remove();
        delete self.m_timelines[i_campaign_timeline_id];
        // todo implement delete in db, remember I need to change the order in sequencer as well after deleting timeline that's part of sequncer
        //m_db.table_campaign_timeline_chanel_players().openForDelete(h);
        // reorder timelines Sequencer after db delete timeline
    },

    selectTimeline: function (i_campaign_timeline_id) {
        var self = this;
        var total = $(self.m_thumbsContainer).find('[data-campaign_timeline_id="' + i_campaign_timeline_id + '"]').eq(0).trigger('tap');
        if (total.length == 0)
            return -1;
        return i_campaign_timeline_id;
    }
}