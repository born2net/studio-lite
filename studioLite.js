/**
 SignageLite is an open source framework for Digital Signage

 @module SignageLite
 **/

var globs = {};
globs['WAITSCREENON'] = 'WAITSCREENON';
globs['WAITSCREENOFF'] = 'WAITSCREENOFF';
globs['UNIQUE_COUNTER'] = 0;
globs['SCREEN_WIDTH'] = 0;

var commBroker = new ComBroker();
var ajax = new AjaxRPC(15000);
commBroker.setService(AjaxRPC.serviceName, ajax);
var model = new StudioLiteModel();
commBroker.setService(StudioLiteModel.servicename, model);


// boards * = screen
// board_templates * = screen template
// board_template_viewers * = screen divisions
//
// campaigns *
//     campaign_boards * = output
// campaign_timelines *
//     campaign_timeline_board_templates * = screen template on the output
// campaign_timeline_board_viewer_chanels * = colors to screen divisions
// campaign_timeline_chanels *
//     campaign_timeline_chanel_players *


$(document).bind('pageinit', function () {

    $('#navLogout').on('tap', function (e) {
        $.removeCookie('digitalsignage', {path: '/'});
        var url = 'https://secure.dynawebs.net/_php/msPortal.php?logout=1';
        $(location).attr('href', url);
        e.preventDefault();
        e.stopPropagation()
        e.stopImmediatePropagation();

        return false;
    });



});


$(document).ready(function () {

    initUserAgent();
    setDebugMode();

    // disable back button
    // $(document).bind('pagebeforechange', function (event, data) {
    //    if (typeof data.toPage === "string") {
    //        if (data.options.reverse == true) {
    //            event.preventDefault();
    //            return false;
    //        }
    //    }
    // });/

    if ($.browser.msie && $.browser.version < 10) {
        alert('You are using an unsupported browser, please use IE10+, Chrome, Safari or mobile browser!')
        return;
    }


    var viewStackMain = new Viewstacks('#mainContent');
    commBroker.setService('mainViewStack', viewStackMain)

    viewStackMain.addChild('#playlist');
    viewStackMain.addChild('#files');
    viewStackMain.addChild('#stations');
    viewStackMain.addChild('#settings');
    viewStackMain.addChild('#help');
    viewStackMain.addChild('#logout');
    viewStackMain.addChild('#advanded');
    viewStackMain.selectIndex(0);

    var compProperty = new CompProperty('#propertiesPanelView');
    commBroker.setService('CompProperty', compProperty);

    var compSettings = new CompSettings('#settingsContainer');
    commBroker.setService('CompSettings', compSettings);

    var compPlaylist = new CompCampaignNavigator('#playListMain');
    commBroker.setService('CompCampaignNavigator', compPlaylist);

    var compResources = new CompResourcesList('#resourceLibList');
    commBroker.setService('CompResourcesList', compResources);

    var compCampaignSelector = new CompCampaignSelector('#campaignSelectorList');
    commBroker.setService('CompCampaignNavigator', compCampaignSelector);

    var compStations = new CompStations('#stations');
    commBroker.setService('CompStations', compStations);

    var compMSDB = new CompMSDB();
    commBroker.setService('CompMSDB', compMSDB);

    var compHelperSDK = new HelperSDK();
    commBroker.setService('HelperSDK', compHelperSDK);

    var compX2JS = new X2JS({escapeMode: true, attributePrefix: "_", arrayAccessForm: "none", emptyNodeForm: "text", enableToStringFunc: true, arrayAccessFormPaths: [], skipEmptyTextNodesForObj: true});
    commBroker.setService('compX2JS', compX2JS);

    ///////////////
    // Init App //
    /////////////

    $("#studioLite").on("pageinit", function (event) {
        bindScreenSizeQueries();
        wireStudioUI();
        wireNavigation();

        commBroker.getService('CompSettings').initAppColorPicker();
    });

    var loginComponent = new LoginComponent(globs['debug'] ? 'https://secure.dynawebs.net/_php/msWS-debug.php' : 'https://secure.dynawebs.net/_php/msWS.php');

    // only pass autnetication if credentials are of a standard user
    loginComponent.typeAccountEnforce('USER');

    var key = initKey();
    var data = {'@functionName': 'f_accountType'}

    commBroker.listen(loginComponent.ALERT_MSG, function (event) {
        $('#dialogTextID').text(event.edata);
        $.mobile.changePage('#dialogMessageID');
    });

    commBroker.listen(globs.WAITSCREENON, function (e) {
        loginUIState(false);
        $.mobile.showPageLoadingMsg("a", "Authenticating");
    });

    commBroker.listen(globs.WAITSCREENOFF, function (e) {
        loginUIState(true);
        $.mobile.hidePageLoadingMsg();
    });

    // moved function up due to firefox bug
    function onAccountType(data) {
        var accountType = data == null ? null : data.responce['accountType'];
        commBroker.getService('CompMSDB').dbConnect();
    }

    if (key === undefined) {

        wireLogin(loginComponent);
        setTimeout(function () {
            $.mobile.changePage('#loginPage');
        }, 3000);

    } else {

        // already logged in
        var ajaxWrapper = new AjaxJsonGetter(globs['debug'] ? 'https://secure.dynawebs.net/_php/msWSsec-debug.php' : 'https://secure.dynawebs.net/_php/msWSsec.php');
        ajaxWrapper.getData(data, onAccountType);
        return;
    }
});

