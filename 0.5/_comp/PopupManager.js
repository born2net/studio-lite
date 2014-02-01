/**
 Manage popup dialogs including yes/no, OK and the loading animator.
 @class PopupManager
 @constructor
 @return {Object} instantiated PopupManager
 **/
function PopupManager(i_elementYesNo, i_elementOK) {
    this.m_elementYesNo = i_elementYesNo;
    this.m_elementOK = i_elementOK;
};

PopupManager.prototype = {
    constructor: PopupManager,

    /**
     Popup dialog with yes/no and respond to selection with callback.
     @method popUpDialogYesNo
     @param {String} i_title
     @param {String} i_body
     @param {Function} i_callback
     @return none
     **/
    popUpDialogYesNo: function (i_title, i_body, i_callback) {
        var self = this;

        var elems = $(self.m_elementYesNo + ' p');
        $($(elems)[0]).text(i_title);
        $($(elems)[1]).text(i_body);
        $(self.m_elementYesNo).popup("open", {transition: 'pop', 'position-to': 'window', width: '750', height: '600'});
        $(self.m_elementYesNo + '> a').one('tap', function (e) {
            var selected = $(e.currentTarget).attr('name');
            i_callback(selected);
        });
        // unbind if clicked away and not in button
        $(self.m_elementYesNo).one('popupafterclose', function (e, ui) {
            $(self.m_elementYesNo + '> a').unbind('tap');
        });
    },

    /**
     Popup dialog with OK and respond to selection with callback.
     @method popUpDialogOK
     @param {String} i_title
     @param {String} i_body
     @param {Function} i_callback
     @return none
     **/
    popUpDialogOK: function (i_title, i_body, i_callback) {
        var self = this;

        var elems = $(self.m_elementOK + ' p');
        $($(elems)[0]).text(i_title);
        $($(elems)[1]).text(i_body);
        $(self.m_elementOK).popup("open", {transition: 'pop', 'position-to': 'window', width: '750', height: '600'});
        $(self.m_elementOK + '> a').one('tap', function (e) {
            var selected = $(e.currentTarget).attr('name');
            i_callback(selected);
        });
        // unbind if clicked away and not in button
        $(self.m_elementOK).one('popupafterclose', function (e, ui) {
            $(self.m_elementOK + '> a').unbind('tap');
        });
    },

    /**
     Popup a loading animation with message.
     @method showLoading
     @param {String} i_message
     @return none
     **/
    showLoading: function(i_message){
        $.mobile.loading('show', {
            text: i_message,
            textVisible: true,
            theme: 'a',
            html: ""
        });
    },

    /**
     Hide the a loading animation.
     @method hideLoading
     @return none
     **/
    hideLoading: function(){
        $.mobile.loading('hide');
    }
}