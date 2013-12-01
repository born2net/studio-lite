/////////////////////////////////////////////////////////
//
// ScreenOrientation
//
/////////////////////////////////////////////////////////

CompMSDB.databaseReady          = 'DATABASE_READY';
CompMSDB.msdb                   = 'MS_DB';

function CompMSDB (){

    this.self             = this;
    this.m_db             = undefined;
    this.loaderManager    = undefined;
    this._init();
};

CompMSDB.prototype = {
    constructor: CompMSDB,

    _init: function(){
        var self = this;
    },

    dbConnect: function() {

        var self            = this;
        var data            = {'@functionName':'f_accountCredentials'}
        var ajaxWrapper     = new AjaxJsonGetter(globs['debug'] ? 'https://secure.dynawebs.net/_php/msWSsec-debug.php' : 'https://secure.dynawebs.net/_php/msWSsec.php');

        function onAccountCredentials(onAccountCredentials){
            commBroker.setValue('user',onAccountCredentials.responce['accountUser']);
            commBroker.setValue('pass',onAccountCredentials.responce['accountPass']);
            self.loaderManager = new LoaderManager();
            self.m_db = self.loaderManager['m_dataBaseManager'];
            commBroker.setValue(CompMSDB.msdb,self.m_db)
            var user = commBroker.getValue('user');
            var pass = commBroker.getValue('pass');

            self.loaderManager.create(user, pass, function(){
                var helperSDK = commBroker.getService('HelperSDK');
                helperSDK.init(self.loaderManager, self.m_db);
                commBroker.fire(CompMSDB.databaseReady);
            });
            // self.loaderManager.create(user, pass, self._onDBready);
            // self.loaderManager.create('ap@ms.com', 'aaa', self._onDBready);
        }

        ajaxWrapper.getData(data,onAccountCredentials);
        $.mobile.changePage('#studioLite');
    },

    save: function(){
        var self = this;
        self.loaderManager.save();
    }

}