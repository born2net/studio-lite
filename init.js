/**
 Require js init module definitions file for StudioLite app
 @class Require init js
 **/
require.config({
    waitSeconds: 45,
    // baseUrl: './', // for node-webkit change to ./ local dir
    baseUrl: '/_studiolite-dev/',
    paths: {
        'Elements': 'Elements',
        'Events': 'Events',
        'jquery': '_common/_jquery/std/jq1.9.1/jquery-1.9.1',
        'jqueryui': '_common/_jquery/std/jq1.10.1/jquery-ui-1.10.1',
        'backbone': '_common/_js/backbone/backbone',
        'backbone.controller': '_common/_js/backbone-controller/backbone.controller',
        'underscore': '_common/_js/underscore/underscore',
        'text': '_common/_js/requirejs/text',
        'backbone.stickit': '_common/_js/backbone-stickit/backbone.stickit',
        'video': '_common/_js/video/video.dev',
        'bootstrapfileinput': '_common/_js/bootstrapfileinput/bootstrapfileinput',
        'bootstrap': '_common/_js/bootstrap/js/bootstrap',
        'platform': '_common/_js/platform/platform',
        'qrcode': '_common/_js/qrcode/qrcode',
        'fabric': '_common/_js/fabric/fabric.require',
        'bootbox': '_common/_js/bootbox/bootbox',
        'Cookie': '_common/_js/cookie/jquery.cookie',
        'gradient': '_common/_js/gradient/jquery.gradientPicker',
        'minicolors': '_common/_js/minicolors/jquery.minicolors',
        'datatables': '_common/_js/dt/datatable/media/js/jquery.dataTables',
        'datatablestools': '_common/_js/dt/datatable/extensions/TableTools/js/dataTables.tableTools',
        'bootstrap-table': '_common/_js/bootstrap-table/dist/bootstrap-table',
        'bootstrap-table-editable': '_common/_js/bootstrap-table/dist/extensions/editable/bootstrap-table-editable',
        'bootstrap-table-editable-plugin': '_common/_js/bootstrap-table/dist/extensions/editable/xedit-editable',
        'bootstrap-table-sort-rows': '_common/_js/bootstrap-table/dist/extensions/reorder-rows/bootstrap-table-reorder-rows',
        'table-dnd': '_common/_js/bootstrap-table/dist/extensions/reorder-rows/jquery.tablednd',
        'colorpicker': '_common/_js/gradient/colorpicker',
        'timepicker': '_common/_js/timepicker/bootstrap-timepicker',
        'datepicker': '_common/_js/datepicker/bootstrap-datepicker',
        'highcharts': '_common/_js/highcharts/highcharts',
        'flashdetect': '_common/_js/flashdetect/flashdetect',
        'TimelineMax': '_common/_js/gsap/TimelineMax',
        'TweenMax': '_common/_js/gsap/TweenMax',
        'TweenLite': '_common/_js/gsap/TweenLite',
        'ScrollToPlugin': '_common/_js/gsap/plugins/ScrollToPlugin',
        'Draggable': '_common/_js/gsap/utils/Draggable',
        'imagesloaded': '_common/_js/imagesloaded/imagesloaded.pkgd',
        'RC4': '_common/_js/rc4/RC4',
        'RC4V2': '_common/_js/rc4/RC4V2',
        'localizer': '_common/_js/localizer/dist/jquery.localize',
        'spinner': '_common/_js/fuelux/src/spinner',
        'stopwatch': '_common/_js/stopwatch/stopwatch',
        'jsencrypt': '_common/_js/jsencrypt/jsencrypt',
        'contextmenu': '_common/_js/contextmenu/bootstrap-contextmenu',
        'simplestorage': '_common/_js/simplestorage/simpleStorage',
        'moment': '_common/_js/moment/moment',
        'nouislider': '_common/_js/nouislider/jquery.nouislider',
        'XDate': '_common/_js/xdate/xdate',
        'Base64': '_common/_js/base64/jquery.base64',
        'Knob': '_common/_js/knob/jquery.knob',
        'enjoy': '_common/_js/enjoy/enjoyhint',
        'TouchPunch': '_common/_js/touchpunch/TouchPunch',
        'X2JS': '_common/_js/x2js/xml2json',
        'LayoutRouter': '_controllers/LayoutRouter',
        'FQTerminalController': '_controllers/FQTerminalController',
        'ComBroker': '_controllers/ComBroker',
        'ScreenTemplateFactory': '_controllers/ScreenTemplateFactory',
        'BlockFactory': '_controllers/BlockFactory',
        'AppAuth': '_controllers/AppAuth',
        'Timeline': '_controllers/Timeline',
        'Channel': '_controllers/Channel',
        'Block': '_controllers/_blocks/Block',
        'BlockScene': '_controllers/_blocks/BlockScene',
        'BlockRSS': '_controllers/_blocks/BlockRSS',
        'BlockQR': '_controllers/_blocks/BlockQR',
        'BlockYouTube': '_controllers/_blocks/BlockYouTube',
        'BlockCollection': '_controllers/_blocks/BlockCollection',
        'BlockFasterQ': '_controllers/_blocks/BlockFasterQ',
        'BlockTwitter': '_controllers/_blocks/BlockTwitter',
        'BlockTwitterItem': '_controllers/_blocks/BlockTwitterItem',
        'BlockVideo': '_controllers/_blocks/BlockVideo',
        'BlockImage': '_controllers/_blocks/BlockImage',
        'BlockSVG': '_controllers/_blocks/BlockSVG',
        'BlockExtImage': '_controllers/_blocks/BlockExtImage',
        'BlockExtVideo': '_controllers/_blocks/BlockExtVideo',
        'BlockClock': '_controllers/_blocks/BlockClock',
        'BlockHTML': '_controllers/_blocks/BlockHTML',
        'BlockLabel': '_controllers/_blocks/BlockLabel',
        'BlockMRSS': '_controllers/_blocks/BlockMRSS',
        'StackView': '_views/StackView',
        'DashboardView': '_views/DashboardView',
        'NavigationView': '_views/NavigationView',
        'WaitView': '_views/WaitView',
        'TutorialView': '_views/TutorialView',
        'BarMeterView': '_views/BarMeterView',
        'SceneSliderView': '_views/_scenes/SceneSliderView',
        'SceneLoaderView': '_views/_scenes/SceneLoaderView',
        'SceneSelectionView': '_views/_scenes/SceneSelectionView',
        'SceneEditorView': '_views/_scenes/SceneEditorView',
        'ScenesToolbarView': '_views/_scenes/ScenesToolbarView',
        'ResourceListView': '_views/ResourceListView',
        'ResourcesLoaderView': '_views/ResourcesLoaderView',
        'AddBlockView': '_views/AddBlockView',
        'BlockProperties': '_views/BlockProperties',
        'FontSelector': '_views/FontSelector',
        'DimensionProps': '_views/DimensionProps',
        'AppContentFaderView': '_views/AppContentFaderView',
        'AppEntryFaderView': '_views/AppEntryFaderView',
        'LoginView': '_views/LoginView',
        'FQCustomerTerminal': '_views/_fasterQ/FQCustomerTerminal',
        'LivePreView': '_views/LivePreView',
        'StorylineView': '_views/StorylineView',
        'StationsViewLoader': '_views/StationsViewLoader',
        'StationsListView': '_views/StationsListView',
        'SettingsView': '_views/SettingsView',
        'ProStudioView': '_views/ProStudioView',
        'HelpView': '_views/HelpView',
        'AdStatsView': '_views/AdStatsView',
        'AdStatsLoaderView': '_views/AdStatsLoaderView',
        'InstallView': '_views/InstallView',
        'LogoutView': '_views/LogoutView',
        'PropertiesView': '_views/PropertiesView',
        'CampaignManagerView': '_views/CampaignManagerView',
        'CampaignSliderStackView': '_views/CampaignSliderStackView',
        'CampaignSelectorView': '_views/CampaignSelectorView',
        'CampaignNameSelectorView': '_views/CampaignNameSelectorView',
        'ResolutionSelectorView': '_views/ResolutionSelectorView',
        'OrientationSelectorView': '_views/OrientationSelectorView',
        'ScreenLayoutSelectorView': '_views/ScreenLayoutSelectorView',
        'ScreenLayoutEditorView': '_views/ScreenLayoutEditorView',
        'LanguageSelectorView': '_views/LanguageSelectorView',
        'CampaignView': '_views/CampaignView',
        'SequencerView': '_views/SequencerView',
        'ChannelListView': '_views/ChannelListView',
        'PopModalView': '_views/PopModalView',
        'RSSLinks': '_views/RSSLinks',
        'MRSSLinks': '_views/MRSSLinks',
        'StationsCollection': '_collections/StationsCollection',
        'LinesCollection': '_collections/_fasterQ/LinesCollection',
        'QueuesCollection': '_collections/_fasterQ/QueuesCollection',
        'AnalyticsCollection': '_collections/_fasterQ/AnalyticsCollection',
        'StationModel': '_models/StationModel',
        'LineModel': '_models/_fasterQ/LineModel',
        'QueueModel': '_models/_fasterQ/QueueModel',
        'Lib': '_libs/Lib',
        'ScreenTemplate': '_libs/ScreenTemplate',
        'Pepper': '_libs/Pepper',
        'PepperHelper': '_libs/PepperHelper',
        'FQLoaderView': '_views/_fasterQ/FQLoaderView',
        'FQNavigationView': '_views/_fasterQ/FQNavigationView',
        'FQManagerView': '_views/_fasterQ/FQManagerView',
        'FQCreatorView': '_views/_fasterQ/FQCreatorView',
        'FQLinePropView': '_views/_fasterQ/FQLinePropView',
        'FQQueuePropView': '_views/_fasterQ/FQQueuePropView',
        'FQRemoteStatus': '_views/_fasterQ/FQRemoteStatus',
        'Fonts': '_libs/Fonts'
        //'AjaxRPC': '_controllers/AjaxRPC',
        //'AjaxJsonGetter': '_controllers/AjaxJsonGetter',
    },

    shim: {
        'Elements': {
            exports: 'Elements'
        },
        'Events': {
            exports: 'Events'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'backbone.controller': {
            deps: ['underscore', 'jquery']
        },
        'LayoutRouter': {
            deps: ['backbone.controller']
        },
        'Lib': {
            deps: ['backbone', 'jquery']
        },
        'sdk': {
            exports: 'sdk'
        },
        'highcharts': {
            deps: ['jquery'],
            exports: 'highcharts'
        },
        'qrcode': {
            exports: 'qrcode'
        },
        'datatables': {
            exports: 'datatables'
        },
        'datatablestools': {
            dep: ['datatables'],
            exports: 'datatablestools'
        },
        'underscore': {
            exports: '_'
        },
        'TweenMax': {
            exports: 'TweenMax'
        },
        'TweenLite': {
            exports: 'TweenLite'
        },
        'TimelineMax': {
            dep: ['TweenLite'],
            exports: 'TimelineMax'
        },
        'Draggable': {
            exports: 'Draggable'
        },
        'ScrollToPlugin': {
            exports: 'ScrollToPlugin'
        },
        'bootstrap': {
            deps: ['jquery']
        },
        'bootbox': {
            deps: ['jquery'],
            exports: 'bootbox'
        },
        'bootstrap-table-editable': {
            deps: ['bootstrap-table', 'bootstrap-table-editable-plugin']
        },
        'bootstrap-table-editable-plugin': {
            deps: ['bootstrap-table'],
            export: 'bootstrap-table-editable-plugin'
        },
        'bootstrap-table-sort-rows': {
            deps: ['bootstrap-table', 'table-dnd'],
            export: 'bootstrap-table-sort-rows'
        },
        'table-dnd': {
            export: 'table-dnd'
        },
        'timepicker': {
            exports: 'timepicker'
        },
        'jsencrypt': {
            exports: 'jsencrypt'
        },
        'datepicker': {
            exports: 'datepicker'
        },
        'AppAuth': {
            deps: ['RC4', 'Cookie']
        },
        'X2JS': {
            exports: 'X2JS'
        },
        'RC4': {
            exports: 'RC4'
        },
        'RC4V2': {
            exports: 'RC4V2'
        },
        'nouislider': {
            exports: 'nouislider'
        },
        'stopwatch': {
            exports: 'stopwatch'
        },
        'Knob': {
            exports: 'knob'
        },
        'TouchPunch': {
            exports: 'TouchPunch',
            deps: ['jqueryui']
        },
        'ComBroker': {
            deps: ['backbone', 'jquery']
        },
        'Pepper': {
            deps: ['jquery', 'Base64', 'RC4V2'],
            exports: 'Pepper'
        },
        'PepperHelper': {
            exports: 'PepperHelper'
        },
        'Base64': {
            deps: ['jquery'],
            exports: 'base64'
        },
        'ScreenTemplate': {
            exports: 'ScreenTemplate'
        },
        'colorpicker': {
            deps: ['jquery', 'jqueryui'],
            exports: 'colorpicker'
        },
        'minicolors': {
            deps: ['jquery'],
            exports: 'minicolors'
        },
        'gradient': {
            deps: ['jquery', 'colorpicker', 'jqueryui']
        }
    }
});

if (window.location.href.indexOf('dist') > -1) {
    requirejs.onError = function (err) {
        console.log('require js error ' + err);
    }
}

require(['StudioLite'], function (StudioLite) {
    new StudioLite();
});