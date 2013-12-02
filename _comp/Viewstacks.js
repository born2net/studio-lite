/**
 generic class that allows for management of views (divs) bringing the selected div into view while hiding the other divs
 @class Viewstacks
 @constructor
 @param {string} i_contentID: container id which will hold content
 @return none
 **/

Viewstacks.VIEW_CHANGED = 'VIEW_CHANGED';

function Viewstacks(i_contentID) {

    this.WAITSCREENON = globs['WAITSCREENON']
    this.WAITSCREENOFF = globs['WAITSCREENOFF']
    this.VIEW_CHANGED = 'VIEW_CHANGED';

    var self = this.self = this;

    this.m_contentID = i_contentID;
    this.m_counter = 0;
    this.m_waitPanelID = '';
    this.m_waiting = false;
    this.init();
};

Viewstacks.prototype = {
    constructor: Viewstacks,

    init: function () {
        var self = this;

        commBroker.listen(this.WAITSCREENON, function (e) {
            self.waitScreen(true);
        });

        commBroker.listen(this.WAITSCREENOFF, function (e) {
            self.waitScreen(false);
        });
    },

    addChild: function (childID) {
        var elem = $(childID).appendTo(this.m_contentID);
        $(childID).siblings().hide();
        this.m_counter++;
        $(childID).attr('data-viewstackname', 'tab' + this.m_counter);


        var t = -1;
        $(this.m_contentID + '> *').each(function () {
            t++;
            if (this === elem[0]) {
                return false;
            }
        });
        return t;
    },

    selectIndex: function (index) {

        var self = this.self;

        $(this.m_contentID + '> *').each(function (i) {
            if (index == i) {
                commBroker.fire(self.VIEW_CHANGED, this, self, index);
                $(this).siblings().hide().end().fadeIn();
            }
        });
    },

    setWaitScreenPanel: function (i_panelID) {
        this.m_waitPanelID = i_panelID;
    },


    getWaitScreenPanel: function () {
        return this.m_waitPanelID;
    },

    waitScreen: function (state) {
        if (!this.m_waitPanelID)
            return;

        if (state) {
            this.m_waiting = true;
            var w = $(this.m_contentID).width();
            var h = $(this.m_contentID).height();
            $(this.m_waitPanelID).css({width: w + 'px', height: h + 'px'}).fadeIn('slow');
            $(this.m_waitPanelID).appendTo(this.m_contentID);
        } else {
            this.m_waiting = false;
            $(this.m_waitPanelID).fadeOut();
        }
    }
}
