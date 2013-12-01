/*/////////////////////////////////////////////

 msController

 /////////////////////////////////////////////*/

function MsController (i_Element, i_insertOffset){

    this.MYEVENT            = 'ABC';
    this.m_myElemID         = null;
    this.m_myValue			= null;
    this.self               = this;
    this._registerEvents();
};

MsController.prototype = {
    constructor: MsController,

    _registerEvents: function(){

        var self = this;

        commBroker.listen(self.MYEVENT,function(e){
            self.m_myElemID = e.context;
        });
    },

    getStationStatus: function(){

        log('getting stattions...');
        var data = {
            '@functionName':'f_getStationList'
        }

        var ajaxWrapper = new AjaxJsonGetter(globs['debug'] ? 'https://secure.dynawebs.net/_php/msWSsec-debug.php' : 'https://secure.dynawebs.net/_php/msWSsec.php');
        ajaxWrapper.getData(data,onServerReply);

        function onServerReply(data){
            var counter = 0;
            var stationsArray = data.responce['Stations']['Station'];
            for (var i = 0 ; i < stationsArray.length ; i++ ) {
                o = stationsArray[i];
                switch (o['@attributes'].connection) {
                    case    '2': { color = 'yellow'; break;}
                    case    '1': { color = 'green'; break;}
                    default:     { color = 'red'; break;}
                }

                var id = o['@attributes'].id;
                var name = o['@attributes'].name;
                var status = o['@attributes'].status;
                var lastUpdate = o['@attributes'].lastUpdate;
                var os = o['@attributes'].os;
                var totalMemory = o['@attributes'].totalMemory;
                var peakMemory = o['@attributes'].peakMemory;
                var appVersion = o['@attributes'].appVersion;
                var runningTime = o['@attributes'].runningTime;
                var airVersion = o['@attributes'].airVersion;
                var watchDogConnection = o['@attributes'].watchDogConnection;

            }
        }
    }
}