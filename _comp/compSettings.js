/*/////////////////////////////////////////////

 CompSettings

 /////////////////////////////////////////////*/


CompSettings.stationRefresh = 'STATION_REFRESH';
CompSettings.resourceDefaultLength = 'RESOURCE_DEFAULT_LENGTH';

function CompSettings(i_container) {

    this.m_container = i_container;
    this.m_stationsRefreshRatet = '#stationsRefreshRate';
    this.m_resourceDefLengthInput = '#defResourceLength';

    this.m_defaultValues = {
        stationsRefreshRatet: 60,
        resourceDefLengthInput: 120
    };
    this._init();
};


CompSettings.prototype = {
    constructor: CompSettings,

    _init: function () {
        var self = this;


        /*
         $('#stationsRefreshRate').val(globs['STATION_UPDATE_TIME']/1000);
         $('#stationsRefreshRate').slider('refresh');
         $('#stationsRefreshRate').on('slidestop',function(){
         localStorage.setItem("refreshRate", ($(this).val()*1000));
         setStationsTimer();
         });
         */

    },

    initAppColorPicker: function () {
        return;
        //todo enable color picker
        $('#hue-demo').minicolors({
            control: $(this).attr('data-control') || 'hue',
            defaultValue: $(this).attr('data-defaultValue') || '',
            inline: $(this).attr('data-inline') === 'true',
            letterCase: $(this).attr('data-letterCase') || 'lowercase',
            opacity: $(this).attr('data-opacity'),
            position: $(this).attr('data-position') || 'bottom left',
            change: function (hex, opacity) {
                var log;
                try {
                    log = hex ? hex : 'transparent';
                    if (opacity) log += ', ' + opacity;
                    console.log(log);
                } catch (e) {
                }
            },
            theme: 'default'
        });
    },

    getValue: function (i_key) {
        var self = this;
        return self.m_defaultValues[i_key];
    }
}