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

var globs = {}, commBroker, model, jalapeno;

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

    var compX2JS = new X2JS({escapeMode: true, attributePrefix: "_", arrayAccessForm: "none", emptyNodeForm: "text", enableToStringFunc: true, arrayAccessFormPaths: [], skipEmptyTextNodesForObj: true});
    commBroker.setService('compX2JS', compX2JS);

    $(Elements.STUDIO_LITE).on("pageinit", function (event) {
        bindScreenSizeQueries();
        wireStudioUI();
        wireNavigation();
        wireLogout();
        // commBroker.getService('CompSettings').initAppColorPicker();
    });

    var loginComponent = new LoginComponent();
    loginComponent.typeAccountEnforce('USER');

    commBroker.listen(loginComponent.ALERT_MSG, function (event) {
        $(Elements.DIALOG_TEXT_ID).text(event.edata);
        $.mobile.changePage(Elements.DIALOG_MESSAGE_ID);
    });

    commBroker.listen(globs.WAITSCREENON, function (e) {
        loginUIState(false);
        $.mobile.showPageLoadingMsg("a", "Authenticating");
    });

    commBroker.listen(globs.WAITSCREENOFF, function (e) {
        loginUIState(true);
        $.mobile.hidePageLoadingMsg();
    });

    commBroker.listen(LoginComponent.AUTHENTICATION_STATUS, function (e) {
        var status = e.edata.status;
        if (status == 'pass') {
            if ($("option:selected", Elements.REMEMBER_ME).val() == 'on') {
                var rc4 = new RC4('226a3a42f34ddd778ed2c3ba56644315');
                var crumb = e.edata.user + ' ' + e.edata.pass;
                crumb = rc4.doEncrypt(crumb);
                $.cookie('signagestudioweblite', crumb, { expires: 300 });
                $.mobile.changePage('#studioLite');
                commBroker.getService('CompCampaignNavigator').loadCampaigns();
            }
        } else {
            // todo add fail on login
        }
    });

    var cookie = $.cookie('signagestudioweblite') == undefined ? undefined : $.cookie('signagestudioweblite').split(' ')[0];

    if (cookie === undefined) {
        setTimeout(function () {
            $.mobile.changePage(Elements.LOGIN_PAGE);
        }, 3000);
    } else {
        var rc4 = new RC4('226a3a42f34ddd778ed2c3ba56644315');
        var crumb = rc4.doDecrypt(cookie);
        loginComponent.onDBAuthenticate(crumb.split([' '])[0], crumb.split([' '])[1]);
    }
});

function initServices() {
    globs['WAITSCREENON'] = 'WAITSCREENON';
    globs['WAITSCREENOFF'] = 'WAITSCREENOFF';
    globs['UNIQUE_COUNTER'] = 0;
    globs['SCREEN_WIDTH'] = 0;

    jalapeno = new Jalapeno();
    commBroker = new ComBroker();
    var ajax = new AjaxRPC(15000);
    commBroker.setService(AjaxRPC.serviceName, ajax);
    model = new StudioLiteModel();
    commBroker.setService(StudioLiteModel.servicename, model);
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
        $(this).addClass('ui-btn-active');
        return false;
    });
    $(Elements.NAV_FILES).on('tap', function () {
        deselectNav();
        $(Elements.NAV_BUTTONS).children().removeClass('ui-btn-active');
        viewStackMain.selectIndex(1);
        $(this).addClass('ui-btn-active');
        return false;
    });
    $(Elements.NAV_PLAYLERS).on('tap', function () {
        deselectNav();
        $(Elements.NAV_BUTTONS).children().removeClass('ui-btn-active');
        viewStackMain.selectIndex(2);
        $(this).addClass('ui-btn-active');
        return false;
    });
    $(Elements.NAV_SETTINGS).on('tap', function () {
        deselectNav();
        $(Elements.NAV_SETTINGS).children().removeClass('ui-btn-active');
        viewStackMain.selectIndex(3);
        $(this).addClass('ui-btn-active');
        return false;
    });
    $(Elements.NAV_HELP).on('tap', function () {
        deselectNav();
        $(Elements.NAV_HELP).children().removeClass('ui-btn-active');
        viewStackMain.selectIndex(4);
        $(this).addClass('ui-btn-active');
        return false;
    });
    $(Elements.NAV_LOGOUT).on('tap', function () {
        deselectNav();
        $(Elements.NAV_LOGOUT).children().removeClass('ui-btn-active');
        viewStackMain.selectIndex(5);
        $(this).addClass('ui-btn-active');
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
        if (confirm('Changes will be lost, would you like to save your changes first before exiting to campaign manager?')) {
            window.location.reload();
        }
        return false;
    });

    $(Elements.CAMPAIN_SAVE).tap(function () {
        commBroker.getService('CompMSDB').save();
        return false;
    });

    setTimeout(function () {
        $(Elements.NAV_PANEL).panel("open");
    }, 300);

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
