
/*/////////////////////////////////////////////
 Navigator
 /////////////////////////////////////////////*/

function Navigator(i_Element, i_imageURL) {

    this.self = this;
    this.m_Element = i_Element;
    this.m_imageURL = i_imageURL;
    this.m_indexMap = {};
    this.m_navigationID = '';
    this.m_lastID = -1;

    this.viewStack = commBroker.getService('viewStack');
    this.init();
};

Navigator.prototype = {
    constructor: Navigator,

    init: function () {
        var self = this;
        commBroker.listen(self.viewStack.VIEW_CHANGED, function (e) {
            self.updateNavigator(e);
        });
        var html = '<div id="navigationClassID"></div>';
        self.m_navigationID = $(html).insertBefore(this.m_Element);
    },

    addNavigation: function (i_name) {
        var self = this;
        var image = this.m_imageURL + '/' + i_name + '.png';
        $('<img id="' + i_name + '" src="' + image + '" class="navigationButtons"/>').appendTo(self.m_navigationID);
    },

    updateNavigator: function (e) {
        var self = this;
        self.m_lastID = e == undefined ? self.m_lastID : e.edata;
        var name = self.m_indexMap[self.m_lastID];
        if (name == undefined)
            return;
        $('.navigationButtons').animate({opacity: 0.2}, 300);
        $('.navigationButtons').each(function () {
            elemName = $(this).attr('id')
            if (elemName == name) {
                $(this).animate({opacity: 0.7}, 500);
            }
        });
    },

    setIndexMap: function (i_indexMap) {
        var self = this;
        self.m_indexMap = i_indexMap;
        self.updateNavigator();
    }
}
