/**
 SignageStudio Web Lite (a.k.a SignageLite) is a free, open source Web application and
 framework for Digital Signage that's available under GNU GENERAL PUBLIC LICENSE Version 3 (see LICENSE).

 The App and SDK connect to the free Digital Signage web service available from http://www.DigitalSignage.com
 To fork and to view the online docs visit: http://git.DigitalSignage.com

 MediaSignage Inc (c)

 @module SignageLite
 @example
 <pre>
 boards (aka screen)
 board_templates (aka screen template)
 board_template_viewers (aka screen divisions)
 ---------------------------------------------------
 Campaign table relationship
 ---------------------------------------------------
 |- campaigns
 |--- campaign_boards (aka output)
 |- campaign_timelines
 |--- campaign_timeline_board_templates (aka screen template on the output)
 |- campaign_timeline_board_viewer_chanels (aka colors of screen divisions)
 |- campaign_timeline_chanels
 |--- campaign_timeline_chanel_players
 </pre>
 **/

var globs = {}, commBroker, model, jalapeno, x2js;

$(document).ready(function () {

    initServices();
    initUserAgent();
    setDebugMode();
    // disableBack();

    if ($.browser.msie && $.browser.version < 10) {
        alert('You are using an unsupported browser, please use IE10+, Chrome, Safari or mobile browser!')
        return;
    }

    var viewStackMain = new Viewstacks(Elements.MAIN_CONTENT);
    commBroker.setService('mainViewStack', viewStackMain)

    viewStackMain.addChild(Elements.PLAYLIST);
    viewStackMain.addChild(Elements.FILES);
    viewStackMain.addChild(Elements.STATIONS);
    viewStackMain.addChild(Elements.SETTINGS);
    viewStackMain.addChild(Elements.HELP);
    viewStackMain.addChild(Elements.LOGOUT);
    viewStackMain.addChild(Elements.ADVANDED);
    viewStackMain.selectIndex(0);

    var compProperty = new CompProperty(Elements.PROPERTIES_PANEL_VIEW);
    commBroker.setService('CompProperty', compProperty);

    var compSettings = new CompSettings(Elements.SETTING_SCONTAINER);
    commBroker.setService('CompSettings', compSettings);

    var compPlaylist = new CompCampaignNavigator(Elements.PLAYLIST_MAIN);
    commBroker.setService('CompCampaignNavigator', compPlaylist);

    var compResources = new CompResourcesList(Elements.RESOURCE_LIB_LIST);
    commBroker.setService('CompResourcesList', compResources);

    var compCampaignSelector = new CompCampaignSelector(Elements.CAMPAIGN_SELECTOR_LIST);
    commBroker.setService('CompCampaignNavigator', compCampaignSelector);

    var compStations = new CompStations(Elements.STATIONS);
    commBroker.setService('CompStations', compStations);

    var popupManager = new PopupManager(Elements.POPUP_YES_NO, Elements.POPUP_OK);
    commBroker.setService('PopupManager', popupManager);

    var compX2JS = x2js = new X2JS({escapeMode: true, attributePrefix: "_", arrayAccessForm: "none", emptyNodeForm: "text", enableToStringFunc: true, arrayAccessFormPaths: [], skipEmptyTextNodesForObj: true});
    commBroker.setService('compX2JS', compX2JS);

    $(Elements.STUDIO_LITE).on("pageinit", function (event) {
        bindScreenSizeQueries();
        wireStudioUI();
        wireNavigation();
        wireLogout();
    });

    var loginComponent = new LoginComponent();
    loginComponent.typeAccountEnforce('USER');

    commBroker.listen(loginComponent.ALERT_MSG, function (event) {
        $(Elements.DIALOG_TEXT_ID).text(event.edata);
        $.mobile.changePage(Elements.DIALOG_MESSAGE_ID);
    });

    commBroker.listen(globs.WAITSCREENON, function (e) {
        loginUIState(false);
        $.mobile.showPageLoadingMsg("b", "Authenticating");
    });

    commBroker.listen(globs.WAITSCREENOFF, function (e) {
        loginUIState(true);
        $.mobile.hidePageLoadingMsg();
    });

    commBroker.listen(LoginComponent.AUTHENTICATION_STATUS, function (e) {

        var status = e.edata.status;
        if (status) {

            var rc4 = new RC4(globs['RC4KEY']);
            var crumb = e.edata.user + ':SignageStudioLite:' + e.edata.pass + ':' + ' USER'
            crumb = rc4.doEncrypt(crumb);
            $.mobile.changePage(Elements.STUDIO_LITE);
            commBroker.getService('CompCampaignNavigator').loadCampaigns();
            commBroker.setValue('key', crumb);

            if ($("option:selected", Elements.REMEMBER_ME).val() == 'on')
                $.cookie('signagestudioweblite', crumb, { expires: 300 });

        } else {
            alert('failed login');
        }
    });

    var cookie = $.cookie('signagestudioweblite') == undefined ? undefined : $.cookie('signagestudioweblite').split(' ')[0];

    if (cookie === undefined) {
        setTimeout(function () {
            $.mobile.changePage(Elements.LOGIN_PAGE);
        }, 3000);
    } else {
        var rc4 = new RC4(globs['RC4KEY']);
        var crumb = rc4.doDecrypt(cookie).split(':');
        var user = crumb[0];
        var pass = crumb[2];
        loginComponent.onDBAuthenticate(user, pass);
    }
});

function initServices() {
    globs['WAITSCREENON'] = 'WAITSCREENON';
    globs['WAITSCREENOFF'] = 'WAITSCREENOFF';
    globs['UNIQUE_COUNTER'] = 0;
    globs['SCREEN_WIDTH'] = 0;
    globs['RC4KEY'] = '226a3a42f34ddd778ed2c3ba56644315';

    jalapeno = new Jalapeno();
    commBroker = new ComBroker();
    var ajax = new AjaxRPC(15000);
    commBroker.setService(AjaxRPC.serviceName, ajax);
    model = new JalapenoModel();
    commBroker.setService(JalapenoModel.servicename, model);
}

function loginUIState(i_state) {
    if (i_state) {
        $(Elements.LOGIN_BUTTON).button('enable');
    } else {
        $(Elements.LOGIN_BUTTON).button('disable');
    }
}

function wireNavigation() {

    var viewStackMain = commBroker.getService('mainViewStack');

    $(Elements.NAV_PLAY_LIST).on('tap', function () {
        deselectNav();
        viewStackMain.selectIndex(0);
        // $(this).addClass('ui-btn-active');
        return false;
    });
    $(Elements.NAV_FILES).on('tap', function () {
        deselectNav();
        // $(Elements.NAV_BUTTONS).children().removeClass('ui-btn-active');
        viewStackMain.selectIndex(1);
        // $(this).addClass('ui-btn-active');
        return false;
    });
    $(Elements.NAV_PLAYLERS).on('tap', function () {
        deselectNav();
        // $(Elements.NAV_BUTTONS).children().removeClass('ui-btn-active');
        viewStackMain.selectIndex(2);
        // $(this).addClass('ui-btn-active');
        return false;
    });
    $(Elements.NAV_SETTINGS).on('tap', function () {
        deselectNav();
        // $(Elements.NAV_SETTINGS).children().removeClass('ui-btn-active');
        viewStackMain.selectIndex(3);
        // $(this).addClass('ui-btn-active');
        return false;
    });
    $(Elements.NAV_HELP).on('tap', function () {
        deselectNav();
        // $(Elements.NAV_HELP).children().removeClass('ui-btn-active');
        viewStackMain.selectIndex(4);
        // $(this).addClass('ui-btn-active');
        return false;
    });
    $(Elements.NAV_LOGOUT).on('tap', function () {
        deselectNav();
        // $(Elements.NAV_LOGOUT).children().removeClass('ui-btn-active');
        viewStackMain.selectIndex(5);
        // $(this).addClass('ui-btn-active');
        return false;
    });
    $(Elements.NAV_ADVANCE).on('tap', function () {
        deselectNav();
        viewStackMain.selectIndex(6);
        return false;
    });
}


function wireStudioUI() {

    $(Elements.TOGGLE_NAVIGATION).tap(function () {
        switch ($(Elements.NAV_PANEL).css('visibility')) {
            case 'visible':
            {
                $(Elements.TOGGLE_NAVIGATION + " .ui-icon").addClass("ui-icon-arrow-r").removeClass("ui-icon-arrow-l")
                $(Elements.NAV_PANEL).panel("close");
                break;
            }
            case 'hidden':
            {
                $(Elements.TOGGLE_NAVIGATION + " .ui-icon").addClass("ui-icon-arrow-l").removeClass("ui-icon-arrow-r")
                $(Elements.NAV_PANEL).panel("open");
            }
        }
    });

    $(Elements.CLOSE_PROPERTIES).tap(function () {
        $(Elements.PROPERTIES_PANEL).panel("close");
    });

    $(Elements.CAMPAIN_MANAGER).tap(function () {
        var popupManager = commBroker.getService('PopupManager');
        popupManager.popUpDialogYesNo('Reload', 'Changes will be lost if not saved, are you sure you want to restart?', function(i_selected){
            if (i_selected=='yes'){
                setTimeout(function(){
                    document.location.reload(true);
                },1000);
                return true;
            }
        });
        return false;
    });

    $(Elements.CAMPAIN_SAVE).tap(function () {

        commBroker.getService('PopupManager').showLoading('Saving to server...');

        jalapeno.save(function (i_result) {
            var popupManager = commBroker.getService('PopupManager');
            popupManager.hideLoading();
            if (!i_result.status) {
                var popupManager = commBroker.getService('PopupManager');
                popupManager.popUpDialogOK('Sorry an error occurred :(', i_result.error, function(){});
            } else {
                popupManager.popUpDialogOK('saved', 'Successfully saved your work onto the server...', function(){});
            }
        });
        return false;
    });

    setTimeout(function () {
        $(Elements.NAV_PANEL).panel("open");

        // remove inner scroller
        $('.ui-mobile-viewport').css({overflow: 'hidden'});
    }, 300);

    $( window ).resize(function() {
        updateContainersHeight();
    });
    updateContainersHeight();
}

function updateContainersHeight(){
    var h = $(window).height() - ($(window).height() * 20 / 100);
    $('#playlist').height(h + 'px');
    $('#files').height(h + 'px');
    $('#stations').height(h + 'px');
}

function wireLogout() {
    $(Elements.NAV_LOGOUT).on('tap', function (e) {
        $.removeCookie('signagestudioweblite', {path: '/'});
        $.cookie('signagestudioweblite', '', { expires: -300 });
        $('body').empty();
        $('body').append('<div style="font-family: arial; text-align:center;"><h2>Thank you for using SignageStudio Web Lite</h2></div>');
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
    });
}

function disableBack() {
    $(document).bind('pagebeforechange', function (event, data) {
        if (typeof data.toPage === "string") {
            if (data.options.reverse == true) {
                event.preventDefault();
                return false;
            }
        }
    });
}

$(document).bind('pageinit', function () {
    // wrap additional hooks
});
