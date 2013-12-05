/**
 Constants used to query the DOM via identifiers and classes
 @class Elements
 @constructor
 @return none
 **/

// Identifiers

Elements.STUDIO_LITE = '#studioLite';
Elements.LOGIN_PAGE = '#loginPage';
Elements.LOGIN_BUTTON = '#loginButton';
Elements.USER_NAME = '#userName';
Elements.USER_PASS = '#userPass';
Elements.REMEMBER_ME = '#rememberMe';

Elements.MAIN_CONTENT = '#mainContent';
Elements.PLAYLIST = '#playlist'
Elements.FILES = '#files';
Elements.STATIONS = '#stations';
Elements.SETTINGS = '#settings';
Elements.HELP = '#help';
Elements.LOGOUT = '#logout';
Elements.ADVANDED = '#advanded';

Elements.PROPERTIES_PANEL = '#propertiesPanel';
Elements.PROPERTIES_PANEL_VIEW = '#propertiesPanelView';
Elements.SETTING_SCONTAINER = '#settingsContainer';
Elements.PLAYLIST_MAIN = '#playListMain';
Elements.RESOURCE_LIB_LIST = '#resourceLibList';
Elements.CAMPAIGN_SELECTOR_LIST = '#campaignSelectorList';
Elements.STATIONS = '#stations';
Elements.DIALOG_TEXT_ID = '#dialogTextID';
Elements.DIALOG_MESSAGE_ID = '#dialogMessageID';
Elements.TOGGLE_NAVIGATION = '#toggleNavigation';
Elements.CLOSE_PROPERTIES = '#closeProperties';
Elements.CAMPAIN_MANAGER = '#campainManager';
Elements.CAMPAIN_SAVE = '#campainSave';

Elements.NAV_PANEL = '#navPanel';
Elements.NAV_PLAY_LIST = '#navPlaylist';
Elements.NAV_FILES = '#navFiles';
Elements.NAV_PLAYLERS = '#navPlaylers';
Elements.NAV_SETTINGS = '#navSettings';
Elements.NAV_HELP = '#navHelp';
Elements.NAV_LOGOUT = '#navLogout';
Elements.NAV_ADVANCE = '#navAdvance';
Elements.NAV_BUTTONS = '#navButtons';

Elements.BLOCK_PROPERTIES = '#blockProperties';
Elements.BLOCK_SUBPROPERTIES = '#blockSubProperties';
Elements.BLOCK_LENGTH_HOURS = '#blockLengthHours';
Elements.BLOCK_LENGTH_MINUTES = '#blockLengthMinutes';
Elements.BLOCK_LENGTH_SECONDS = '#blockLengthSeconds';
Elements.BLOCK_IMAGE_COMMON_PROPERTIES = '#blockImageCommonProperties';

Elements.IMAGE_ASPECT_RATIO = '#imageAspectRatio';
Elements.SELECTED_CHANNEL_RESOURCE_NAME = '#selectedChannelResourceName';
Elements.TIMELIME_CHANNEL_BLOCK_LENGTH = '#timelimeChannelBlockLength';

Elements.BLOCK_QR_COMMON_PROPERTIES = '#blockQRCommonProperties';
Elements.QR_TEXT = '#qrText';
Elements.BLOCK_RSS_COMMON_PROPERTIES = '#blockRSSCommonProperties';
Elements.RSS_LINK = '#rssLink';

Elements.VIDEO_ASPECT_RATIO = '#videoAspectRatio';
Elements.BLOCK_VIDEO_COMMON_PROPERTIES = '#blockVideoCommonProperties';

Elements.ADD_COMPONENT_LIST = '#addComponentList';
Elements.ADD_RESOURCE_LIST = '#addResourceList';
Elements.GO_BACK_FROM_ADD_RESOURCE_VIEW = '#goBackFromAddResourceView';
Elements.ADD_RESOURCE_VIEW = '#addResourceView';

Elements.CAMPAIGN_PROPERTIES = '#campaignProperties';
Elements.SELECTED_CAMPAIGN_PROPERTIES = '#selectedCampaignProperties';
Elements.START_NEW_CAMPAIGN = '#startNewCampaign';






// Classes

Elements.CLASS_KNOB = '.knob';
Elements.CLASS_ADD_RESOURE_TO_CHANNEL = '.addResoureToChannel';
Elements.CLASS_SELECTED_LIB_RESOURCE = '.selectedLibResource';
Elements.CLASS_RESOURCE_LIB_OPEN_PROPS = '.resourceLibOpenProps';



function Elements() {
};

Elements.prototype = {
    constructor: Elements
}