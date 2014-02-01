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

    /**
     Listen to wait screen events so to present a wait screen.
     @method init
     @return none
     **/
    init: function () {
        var self = this;

        commBroker.listen(this.WAITSCREENON, function (e) {
            self.waitScreen(true);
        });

        commBroker.listen(this.WAITSCREENOFF, function (e) {
            self.waitScreen(false);
        });
    },

    /**
     Create a new child (view) in this viewstack instance.
     @method addChild the element id to gran from the DOM and append into the viewstack.
     @param {Number} i_childID
     @return {Number} t the newly created index
     **/
    addChild: function (i_childID) {
        var elem = $(i_childID).appendTo(this.m_contentID);
        $(i_childID).siblings().hide();
        this.m_counter++;
        $(i_childID).attr('data-viewstackname', 'tab' + this.m_counter);

        var t = -1;
        $(this.m_contentID + '> *').each(function () {
            t++;
            if (this === elem[0]) {
                return false;
            }
        });
        return t;
    },

    /**
     Select an index from viewstacks to bring into view and hide all other views.
     @method selectIndex
     @param {index} i_index to load into view
     @return none
     **/
    selectIndex: function (i_index) {

        var self = this.self;

        $(this.m_contentID + '> *').each(function (i) {
            if (i_index == i) {
                commBroker.fire(self.VIEW_CHANGED, this, self, i_index);
                $(this).siblings().hide().end().fadeIn();
            }
        });
    },

    /**
     Set a modal wait screen.
     @method setWaitScreenPanel
     @return none
     **/
    setWaitScreenPanel: function (i_panelID) {
        this.m_waitPanelID = i_panelID;
    },

    /**
     Get the modal wait screen.
     @method getWaitScreenPanel
     @return none
     **/
    getWaitScreenPanel: function () {
        return this.m_waitPanelID;
    },

    /**
     Enable or disable the wait screen.
     @method waitScreen
     @param {Boolean} i_state set wait screen state as on or off
     @return none
     **/
    waitScreen: function (i_state) {
        if (!this.m_waitPanelID)
            return;

        if (i_state) {
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
