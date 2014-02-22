/**
 Manage global application settings such as theme and station polling value.
 @class CompSettings
 @constructor
 @return {Object} instantiated CompSettings
 **/
function CompSettings(i_container) {

    this.m_container = i_container;

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

    getValue: function (i_key) {
        var self = this;
        return self.m_defaultValues[i_key];
    }
}