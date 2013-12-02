/**
 SignageLite is an open source framework for Digital Signage

 @module SignageLite
 @example
 <pre>
 // boards (aka screen)
 // board_templates (aka screen template)
 // board_template_viewers (aka screen divisions)
 //
 // ---------------------------------------------------
 // Campaign table relationship
 // ---------------------------------------------------
 // |- campaigns
 // |--- campaign_boards (aka output)
 // |- campaign_timelines
 // |--- campaign_timeline_board_templates (aka screen template on the output)
 // |- campaign_timeline_board_viewer_chanels (aka colors of screen divisions)
 // |- campaign_timeline_chanels
 // |--- campaign_timeline_chanel_players
 </pre>

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


$(document).bind('pageinit', function () {

    $('#navLogout').on('tap', function (e) {
        $.removeCookie('digitalsignage', {path: '/'});
        $.cookie('digitalsignage', '', { expires: -300 });
        $('body').empty();
        $('body').append('<div style="font-family: arial; text-align:center;"><h2>Thank you for using SignageStudio Web Lite</h2></div>');
        e.preventDefault();
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


/*/////////////////////////////////////////////
 loginUIState
 /////////////////////////////////////////////*/

function loginUIState(i_state) {

    if (i_state) {
        $('#loginButton').button('enable');
    } else {
        $('#loginButton').button('disable');
    }
}


/*/////////////////////////////////////////////
 wireNavigation
 /////////////////////////////////////////////*/

function wireNavigation() {

    viewStackMain = commBroker.getService('mainViewStack');

    $('#navPlaylist').on('tap', function () {
        deselectNav();
        viewStackMain.selectIndex(0);
        $(this).addClass('ui-btn-active');
        return false;
    });
    $('#navFiles').on('tap', function () {
        deselectNav();
        $('#navButtons').children().removeClass('ui-btn-active');
        viewStackMain.selectIndex(1);
        $(this).addClass('ui-btn-active');
        return false;
    });
    $('#navPlaylers').on('tap', function () {
        deselectNav();
        $('#navButtons').children().removeClass('ui-btn-active');
        viewStackMain.selectIndex(2);
        $(this).addClass('ui-btn-active');
        return false;
    });
    $('#navSettings').on('tap', function () {
        deselectNav();
        $('#navSettings').children().removeClass('ui-btn-active');
        viewStackMain.selectIndex(3);
        $(this).addClass('ui-btn-active');
        return false;
    });
    $('#navHelp').on('tap', function () {
        deselectNav();
        $('#navHelp').children().removeClass('ui-btn-active');
        viewStackMain.selectIndex(4);
        $(this).addClass('ui-btn-active');
        return false;
    });
    $('#navLogout').on('tap', function () {
        deselectNav();
        $('#navLogout').children().removeClass('ui-btn-active');
        viewStackMain.selectIndex(5);
        $(this).addClass('ui-btn-active');
        return false;
    });
    $('#navAdvance').on('tap', function () {
        deselectNav();
        viewStackMain.selectIndex(6);
        return false;
    });
}


/*/////////////////////////////////////////////
 wireStudioUI
 /////////////////////////////////////////////*/

function wireStudioUI() {

    $('#toggleNavigation').tap(function () {

        switch ($('#navPanel').css('visibility')) {
            case 'visible':
            {
                $("#toggleNavigation .ui-icon").addClass("ui-icon-arrow-r").removeClass("ui-icon-arrow-l")
                $("#navPanel").panel("close");
                break;
            }
            case 'hidden':
            {
                $("#toggleNavigation .ui-icon").addClass("ui-icon-arrow-l").removeClass("ui-icon-arrow-r")
                $("#navPanel").panel("open");
            }
        }
    });

    $('#closeProperties').tap(function () {
        $("#propertiesPanel").panel("close");
    });

    $('#campainManager').tap(function () {
        if (confirm('Changes will be lost, would you like to save your changes first before exiting to campaign manager?')) {
            window.location.reload();
        }
        return false;
    });

    $('#campainSave').tap(function () {
        commBroker.getService('CompMSDB').save();
        return false;
    });

    setTimeout(function () {
        $("#navPanel").panel("open");
    }, 300);

}


/*/////////////////////////////////////////////
 wireLogin
 /////////////////////////////////////////////*/

function wireLogin(i_loginComponent) {

    commBroker.listen(i_loginComponent.AUTHENTICATED, function (e) {
        var crumb = e.edata.responce.data;

        if ($("option:selected", '#rememberMe').val() == 'on')
            $.cookie('digitalsignage', crumb, { expires: 300 });

        var key = initKey();
        commBroker.getService('CompMSDB').dbConnect();

    });

    commBroker.fire(i_loginComponent.USERID, $('#userName'));
    commBroker.fire(i_loginComponent.USERPASSID, $('#userPass'));
    commBroker.fire(i_loginComponent.LOGINBUTTON, $('#loginButton'));

}


/*/////////////////////////////////////////////
 initKey
 /////////////////////////////////////////////*/

function initKey() {

    var accountKey1 = $.cookie('digitalsignage') == undefined ? undefined : $.cookie('digitalsignage').split(' ')[0];
    var accountKey2 = getComment('ACCOUNT_KEY');

    if (accountKey1 !== undefined) {
        commBroker.setValue('key', accountKey1);
    } else if (accountKey2 !== undefined) {
        commBroker.setValue('key', accountKey2.split(':')[1]);
    } else {
        commBroker.setValue('key', undefined);
    }
    return commBroker.getValue('key');

}
