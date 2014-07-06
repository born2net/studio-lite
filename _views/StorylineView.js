/**
 StoryLineView module manages the Timeline > channels UI while displaying the visual length in time for each block on the selected channel
 @class StorylineView
 @constructor
 @param {String}
 @return {Object} instantiated StorylineView
 **/
define(['jquery', 'backbone', 'text', 'text!_templates/_storyboard.html'], function ($, Backbone, text, storyBoardTemplate) {

    BB.SERVICES.STORYLINE = 'StoryLine';

    var StorylineView = BB.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_storyWidth = 0;
            BB.comBroker.listen(BB.EVENTS.SIDE_PANEL_SIZED, $.proxy(self._updateWidth, self));
            BB.comBroker.listen(BB.EVENTS.APP_SIZED, $.proxy(self._updateWidth, self));
            self._listenTimelineSelected();
            self._updateWidth();
        },

        /**
         Draw a fresh storyline for current timelime
         @method _render
         **/
        _render: function (i_timelineID) {
            var self = this;
            // $(Elements.STORYLINE).empty();
            var food = {
                pizza: 'cheese is cool',
                burger: 'noSoCoolClass'
            };

            // build the html snippet using underscore template engine
            var storylineScala = $(storyBoardTemplate).find('table').parent();
            var snippet = _.template(_.unescape(storylineScala.html()), food);
            log(snippet);
        },

        _updateWidth: function () {
            var self = this;
            self.m_storyWidth = parseInt($(Elements.STORYLINE_CONTAINER).width()) - 25;
            $(Elements.CLASS_CHANNEL_BODY_CONTAINER).width(self.m_storyWidth);
        },


        _listenTimelineSelected: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.CAMPAIGN_TIMELINE_SELECTED, function (e) {
                log(e.edata);
                self._render(e.edata);
            });
        }
    });

    return StorylineView;

});