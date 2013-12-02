/*/////////////////////////////////////////////

 ScreenOrientation

 /////////////////////////////////////////////*/

ScreenOrientation.VERTICAL = 'VERTICAL';
ScreenOrientation.HORIZONTAL = 'HORIZONTAL';

function ScreenOrientation() {
    this.self = this;
    this.m_orientation = ScreenOrientation.HORIZONTAL;
};

ScreenOrientation.prototype = {
    constructor: ScreenOrientation,

    init: function () {

        var self = this;
        self._selectOrientation(self.m_orientation, false);


        $('#imgHorizontal').tap(function (e) {
            commBroker.getService('ScreenOrientation').setOrientation(ScreenOrientation.HORIZONTAL)
            self._selectOrientation(ScreenOrientation.HORIZONTAL, true)
            commBroker.getService('ScreenResolution').setResolution(undefined)
        });

        $('#imgVertical').tap(function (e) {
            commBroker.getService('ScreenOrientation').setOrientation(ScreenOrientation.VERTICAL)
            self._selectOrientation(ScreenOrientation.VERTICAL, true);
            commBroker.getService('ScreenResolution').setResolution(undefined)
        });

    },

    _selectOrientation: function (i_orientation, i_selectNext) {
        var self = this;

        var screenArrowSelector = commBroker.getService('ScreenArrowSelector');

        switch (i_orientation) {
            case ScreenOrientation.HORIZONTAL:
            {
                $('#imgHorizontal').css('opacity', '1');
                $('#imgVertical').css('opacity', '0.6');

                if (i_selectNext) {
                    setTimeout(function () {
                        screenArrowSelector.selectNext();
                    }, 400);
                }
                break;
            }

            case ScreenOrientation.VERTICAL:
            {
                $('#imgHorizontal').css('opacity', '0.6');
                $('#imgVertical').css('opacity', '1');
                if (i_selectNext) {
                    setTimeout(function () {
                        screenArrowSelector.selectNext();
                    }, 400);
                }
                break;
            }
        }
    },

    setOrientation: function (i_value) {
        if (i_value != ScreenOrientation.HORIZONTAL && i_value != ScreenOrientation.VERTICAL && i_value != undefined)
            throw 'not valid entry used for setOrientation';
        this.m_orientation = i_value;
    },

    getOrientation: function () {
        return this.m_orientation;
    }
}

