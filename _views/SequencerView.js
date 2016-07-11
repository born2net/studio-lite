/**
 The sequencer module is responsible for management and order of playback of each timeline within each campaign
 @class SequencerView
 @constructor
 @param {String} i_container element that CompCampaignNavigator inserts itself into
 @return {Object} instantiated CompCampaignNavigator
 **/
define(['jquery', 'backbone', 'ScreenTemplateFactory', 'contextmenu'], function ($, Backbone, ScreenTemplateFactory, contextmenu) {

    BB.SERVICES.SEQUENCER_VIEW = 'SequencerView';

    var SequencerView = BB.View.extend({

        /**
         Constructor
         Init the instance and enable drag and drop operation.
         We also wire the open properties UI so we can populate a selected timeline through the properties panel.
         @method initialize
         **/
        initialize: function () {
            var self = this;
            this.m_thumbsContainer = this.$el;
            this.m_timelines = {};
            this.m_screenTemplates = {};

            self._listenContextMenu();
            self._listenReset();
            pepper.listen(Pepper.TIMELINE_DELETED, $.proxy(self._deleteSequencedTimeline, self));
        },

        /**
         Listen to any canvas right click
         @method _listenContextMenu
         **/
        _listenContextMenu: function () {
            var self = this;
            $(Elements.SCREEN_SELECTOR_CONTAINER).contextmenu({
                target: Elements.SEQUENCER_CONTEXT_MENU,
                before: function (e, element, target) {
                    e.preventDefault();
                    //self.m_mouseX = e.offsetX;
                    //self.m_mouseY = e.offsetY;
                    return true;
                },
                onItem: function (context, e) {
                    self._onContentMenuSelection($(e.target).attr('name'))
                }
            });
        },

        /**
         On Scene right click context menu selection command
         @method _onContentMenuSelection
         @param {String} i_command
         **/
        _onContentMenuSelection: function (i_command) {
            var self = this;
            var campaign_timeline_id = BB.comBroker.getService(BB.SERVICES.CAMPAIGN_VIEW).getSelectedTimeline();
            if (campaign_timeline_id == -1 || _.isUndefined(campaign_timeline_id))
                return;

            switch (i_command) {
                case 'firstChannel':
                {
                    $(Elements.SELECT_NEXT_CHANNEL).trigger('click');
                    break;
                }
                case 'editLayout':
                {
                    $(Elements.EDIT_SCREEN_LAYOUT).trigger('click');
                    break;
                }
                case 'duplicate':
                {
                    BB.comBroker.getService(BB.SERVICES.CAMPAIGN_VIEW).duplicateTimeline(campaign_timeline_id, {});
                    break;
                }
                case 'remove':
                {
                    $(Elements.REMOVE_TIMELINE_BUTTON).trigger('click');
                    break;
                }
                case 'first':
                {
                    var elem = $(self.m_thumbsContainer).find('[data-campaign_timeline_id="' + campaign_timeline_id + '"]').eq(0).closest('svg');
                    $(self.m_thumbsContainer).prepend(elem);
                    self.reSequenceTimelines();
                    break;
                }
                case 'last':
                {
                    var elem = $(self.m_thumbsContainer).find('[data-campaign_timeline_id="' + campaign_timeline_id + '"]').eq(0).closest('svg');
                    $(self.m_thumbsContainer).append(elem);
                    self.reSequenceTimelines();
                    break;
                }
            }
            return true;
        },

        /**
         Delete a timeline from the Sequencer UI, as well as from the local member m_timelines.
         @method _deleteSequencedTimeline
         @param {Number} i_campaign_timeline_id
         @return none
         **/
        _deleteSequencedTimeline: function (e) {
            var self = this;
            var campaign_timeline_id = e.edata;
            self._deleteTimelineThumbUI(campaign_timeline_id);
            delete self.m_timelines[campaign_timeline_id];
            pepper.removeTimelineFromSequences(campaign_timeline_id);
            self.reSequenceTimelines();
        },

        /**
         Remove the element's UI thumb of a template layout
         @method _deleteTimelineThumbUI
         @param {Number} i_campaign_timeline_id
         **/
        _deleteTimelineThumbUI: function (i_campaign_timeline_id) {
            var self = this;
            var elementID = self.m_timelines[i_campaign_timeline_id];
            $('#' + elementID).remove();
            if (self.m_screenTemplates[i_campaign_timeline_id])
                self.m_screenTemplates[i_campaign_timeline_id].destroy();
        },

        /**
         Listen to reset of when switching to different campaign so we forget current state
         @method _listenReset
         **/
        _listenReset: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.CAMPAIGN_RESET, function () {
                self.m_timelines = {};
                self.m_screenTemplates = {};
                $(self.m_thumbsContainer).empty();
            });
        },

        /**
         Create a sortable channel list
         @method _createSortable
         @param {Element} i_selector
         **/
        _createSortable: function (i_selector) {
            var self = this;
            if ($(i_selector).children().length == 0) return;
            var sortable = document.querySelector(i_selector);
            self.m_draggables = Draggable.create(sortable.children, {
                type: "x",
                bounds: sortable,
                edgeResistance: 1,
                dragResistance: 0,
                onPress: self._sortablePress,
                onDragStart: self._sortableDragStart,
                onDrag: self._sortableDrag,
                liveSnap: self._sortableSnap,
                zIndexBoost: true,
                onDragEnd: function () {
                    var t = this.target,
                        max = t.kids.length - 1,
                    //newIndex = Math.round(this.x / t.currentWidth);
                        newIndex = Math.ceil(this.x / t.currentWidth);
                    newIndex += (newIndex < 0 ? -1 : 0) + t.originalIndex;
                    if (newIndex === max) {
                        t.parentNode.appendChild(t);
                    } else {
                        t.parentNode.insertBefore(t, t.kids[newIndex + 1]);
                    }
                    TweenLite.set(t.kids, { xPercent: 0, overwrite: "all" });
                    TweenLite.set(t, { y: 0, color: "" });
                    var orderedTimelines = self.reSequenceTimelines();
                    $(self.m_thumbsContainer).empty();
                    BB.comBroker.getService(BB.SERVICES.CAMPAIGN_VIEW).populateTimelines(orderedTimelines);
                    var campaign_timeline_id = BB.comBroker.getService(BB.SERVICES.CAMPAIGN_VIEW).getSelectedTimeline();
                    self.selectTimeline(campaign_timeline_id);

                }
            });
        },

        /**
         Sortable channel list on press
         @method _sortablePress
         **/
        _sortablePress: function () {
            var t = this.target,
                i = 0,
                child = t;
            while (child = child.previousSibling)
                if (child.nodeType === 1) i++;
            t.originalIndex = i;
            t.currentWidth = $(t).outerWidth();
            t.kids = [].slice.call(t.parentNode.children); // convert to array
        },

        /**
         Sortable drag channel list on press
         @method _sortableDragStart
         **/
        _sortableDragStart: function () {
            TweenLite.set(this.target, { color: "#88CE02" });
        },

        /**
         Sortable drag channel list
         @method _sortableDrag
         **/
        _sortableDrag: function () {
            var t = this.target,
                elements = t.kids.slice(), // clone
                // indexChange = Math.round(this.x / t.currentWidth), // round flawed on large values
                indexChange = Math.ceil(this.x / t.currentWidth),
                srcIndex = t.originalIndex,
                dstIndex = srcIndex + indexChange;

            // console.log('k ' + t.kids.length + ' s:' + srcIndex + ' d:' + indexChange + ' t:' + (dstIndex - srcIndex));

            if (srcIndex < dstIndex) { // moved right
                TweenLite.to(elements.splice(srcIndex + 1, dstIndex - srcIndex), 0.15, { xPercent: -140 });  // 140 = width of screen layout widget
                TweenLite.to(elements, 0.15, { xPercent: 0 });
            } else if (srcIndex === dstIndex) {
                elements.splice(srcIndex, 1);
                TweenLite.to(elements, 0.15, { xPercent: 0 });
            } else { // moved left
                // ignore if destination > source index
                if ( (indexChange < 0 ? indexChange * -1 : indexChange) > srcIndex)
                    return;
                TweenLite.to(elements.splice(dstIndex, srcIndex - dstIndex), 0.15, { xPercent: 140 }); // 140 = width of screen layout widget
                TweenLite.to(elements, 0.15, { xPercent: -10 });
            }
        },

        /**
         snap channels to set rounder values
         @method _sortableSnap
         **/
        _sortableSnap: function (y) {
            return y;
            /* enable code below to use live drag snapping */
            // var h = this.target.currentHeight;
            // return Math.round(y / h) * h;
        },

        /**
         Select the first timeline in the Sequencer
         @method selectFirstTimeline
         **/
        selectFirstTimeline: function () {
            var self = this;
            var timeline;
            for (timeline in self.m_timelines) {
                self.selectTimeline(timeline);
                break;
            }
        },

        /**
         Select a viewer
         @method selectViewer
         @param {Number} i_timeline_id
         @param {Number} i_viewer_id
         **/
        selectViewer: function (i_timeline_id, i_viewer_id) {
            var self = this;
            self.m_screenTemplates[i_timeline_id].selectDivison(i_viewer_id);
        },

        /**
         Create the timeline template (a.k.a timeline thumbnail) via the ScreenTemplateFactory
         and insert it into the sequencer UI. We proceed by activating the newly created timeline thumbnail
         via the ScreenTemplateFactory public methods.
         @method createTimelineThumbnailUI
         @param {Object} i_screenProps
         **/
        createTimelineThumbnailUI: function (i_screenProps) {
            var self = this;
            var index = -1;
            var elem = undefined;

            // Get the timeline id for current timeline creating
            for (var screenProp in i_screenProps) {
                var campaign_timeline_id = i_screenProps[screenProp]['campaign_timeline_id']
                break;
            }

            // if timeline_id already exists, it means this is an update from ScreenLayoutEditorView so we
            // must first delete previous UI as well as it's matching instance
            if (self.m_timelines[campaign_timeline_id] != undefined) {
                var elementID = '#' + self.m_timelines[campaign_timeline_id];
                index = $(elementID).index();
                self._deleteTimelineThumbUI(campaign_timeline_id);
            }

            var screenTemplateData = {
                orientation: BB.comBroker.getService(BB.SERVICES.ORIENTATION_SELECTOR_VIEW).getOrientation(),
                resolution: BB.comBroker.getService(BB.SERVICES.RESOLUTION_SELECTOR_VIEW).getResolution(),
                screenProps: i_screenProps,
                scale: '14'
            };

            var screenTemplate = new ScreenTemplateFactory({
                i_screenTemplateData: screenTemplateData,
                i_selfDestruct: false,
                i_owner: this
            });

            var snippet = screenTemplate.create();
            var elementID = $(snippet).attr('id');

            self.m_timelines[campaign_timeline_id] = elementID;
            self.m_screenTemplates[campaign_timeline_id] = screenTemplate;

            //screenTemplate.selectablelDivision();
            //screenTemplate.activate();

            switch (index) {
                case -1:
                {
                    // position thumbnail in beginning (first creation)
                    self.m_thumbsContainer.append(snippet);
                    screenTemplate.selectableFrame();
                    break;
                }

                case 0:
                {
                    // position thumbnail index in beginning (append if no other thumbnails)
                    elem = self.m_thumbsContainer.children().eq(0);
                    if (elem.length > 0) {
                        $(snippet).insertBefore(elem)
                    } else {
                        self.m_thumbsContainer.append(snippet);
                    }
                    screenTemplate.selectableFrame();
                    break;
                }

                default:
                {
                    // position thumbnail as previous index position
                    elem = self.m_thumbsContainer.children().eq(index - 1);
                    $(snippet).insertAfter(elem)
                    screenTemplate.selectableFrame();
                    break;
                }
            }

            self._createSortable(Elements.SCREEN_LAYOUTS_UL);
        },

        /**
         Reorder the timeline in the local msdb to match the UI order of the timeline thumbnails in the Sequencer
         @method reSequenceTimelines
         @return {Array} order of timelines ids
         **/
        reSequenceTimelines: function () {
            var self = this;
            var order = [];
            var timelines = $(self.m_thumbsContainer).children().each(function (sequenceIndex) {
                var element = $(this).find('[data-campaign_timeline_id]').eq(0);
                var campaign_timeline_id = $(element).data('campaign_timeline_id');
                order.push(campaign_timeline_id);
                var selectedCampaign = BB.comBroker.getService(BB.SERVICES.CAMPAIGN_VIEW).getSelectedCampaign();
                pepper.setCampaignTimelineSequencerIndex(selectedCampaign, campaign_timeline_id, sequenceIndex);
            });
            return order;
        },

        /**
         Return this instance.
         @method getOwner
         @return {Object} this
         **/
        getOwner: function () {
            return this;
        },

        /**
         Find the campaign_timeline_id within the Sequencer and trigger a click event on it so it gets selected.
         @method selectTimeline
         @param {Number} i_campaign_timeline_id
         @return {Number} i_campaign_timeline_id or -1
         **/
        selectTimeline: function (i_campaign_timeline_id) {
            var self = this;
            BB.comBroker.fire(BB.EVENTS.CAMPAIGN_TIMELINE_SELECTED, this, null, i_campaign_timeline_id);
            var total = $(self.m_thumbsContainer).find('[data-campaign_timeline_id="' + i_campaign_timeline_id + '"]').eq(0).mouseup();;
            if (total.length == 0)
                return -1;
            return i_campaign_timeline_id;
        }
    });

    return SequencerView;

});