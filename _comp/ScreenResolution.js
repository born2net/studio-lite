/*/////////////////////////////////////////////

 ScreenResolution

 /////////////////////////////////////////////*/

function ScreenResolution() {
    this.self = this;
    this.m_resolution = '1920x1080';
};

ScreenResolution.prototype = {
    constructor: ScreenResolution,

    init: function () {
        var self = this;
        commBroker.listen(Viewstacks.VIEW_CHANGED, function (e) {
            if ($(e.context).data('viewstackname') == 'tab3' && commBroker.getService('PlayListViewStack') === e.caller) {
                var orientation = commBroker.getService('ScreenOrientation').getOrientation();
                self._buildResolutionSelector(orientation);
            }
        });
    },

    _buildResolutionSelector: function (i_orientation) {

        var self = this;
        var screens = '';
        var i = 0;

        function _checkToSelectRadio(i_preSetResolution, i_screenResolution, i_counter) {
            if (i_preSetResolution == undefined && i_counter == 0) {
                self.m_resolution = i_screenResolution;
                return 'checked="checked">';
            }

            if (i_preSetResolution == i_screenResolution) {
                self.m_resolution = i_screenResolution;
                return 'checked="checked">';
            }
            return '>';
        }

        var preSetResolution = self.m_resolution;

        $('#stationOrientationTitle').text('select ' + i_orientation + ' settings');
        $('#stationResolution').children().remove();

        var collection = model.getScreenCollection();
        for (var screenResolution in collection[i_orientation]) {
            screens += '<input class="resolutionRadioSelection" data-screen="' + screenResolution + '" type="radio" data-theme="b" data-corners="false" name="stationResolutionOption" id="stationResolutionOption' + i + '" ' +
                _checkToSelectRadio(preSetResolution, screenResolution, i) +
                '<label class="resolutionRadioSelection" data-corners="false" for="stationResolutionOption' + i + '">' + screenResolution + '</label>';
            i++;
        }


        $('#stationResolution').append(screens);
        $("input[type='radio']", '#stationResolution').checkboxradio();
        $("input[type='radio']", '#stationResolution').checkboxradio("refresh");
        $("input[type='radio']", '#stationResolution').on('change', function (e) {

            var resolution = $(e.target).attr('data-screen');
            self.m_resolution = resolution;

            var screenArrowSelector = commBroker.getService('ScreenArrowSelector');
            setTimeout(function () {
                screenArrowSelector.selectNext();
            }, 400);
        });

        $("#stationResolution div:last-child").css({'border-bottom': "1px solid #CCC"})
    },

    setResolution: function (i_value) {
        this.m_resolution = i_value;
    },

    getResolution: function () {
        return this.m_resolution;
    }
}

