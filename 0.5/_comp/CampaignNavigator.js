/**
 The Campaign Navigator is a wrapper instance that instantiates all of the major components that belong
 to a campaign (newly created or opened existing) including the "Campaign" instance itself, screen orientation UI selector,
 screen resolution UI selector, the sequencer, channels instance and more.
 In a way its the glue between all of the major instances that relate to campaign, and so they are instantiated here and init to bring
 them to life.
 @class CompCampaignNavigator
 @constructor
 @param {String} i_container element that CompCampaignNavigator inserts itself into
 @return {Object} instantiated CompCampaignNavigator
 **/

function CompCampaignNavigator (i_container){

    this.self                       = this;
    this.m_container                = i_container;
    this.m_playListViewStack        = new Viewstacks(this.m_container);
    this.m_deviceOriention          = '';

    this.m_playListViewStack.addChild(Elements.CAMPAIGN_SELECTOR_VIEW);
    this.m_playListViewStack.addChild(Elements.ORIENTATION_VIEW);
    this.m_playListViewStack.addChild(Elements.RESOLUTION_VIEW);
    this.m_playListViewStack.addChild(Elements.CAMPAIGN_VIEW);
    this.m_playListViewStack.selectIndex(0);

    commBroker.setService('PlayListViewStack',this.m_playListViewStack);
    this.init();

};

CompCampaignNavigator.prototype = {
    constructor: CompCampaignNavigator,

    /**
     Instantiate all related campaign components.
     @method init
     @return none
     **/
    init: function(){

        var self = this;

        setTimeout(function(){
            $(window).trigger('resize');
        },500);

        // var extendjQueryUItoMobile  = new ExtendjQueryUItoMobile();
        var screenArrowSelector     = new ScreenArrowSelector(Elements.PLAYLIST_SELECT_ARROW_LEFT, Elements.PLAYLIST_SELECT_ARROW_RIGHT, Elements.PLAYLIST_SELECT_TITLE, self.m_playListViewStack);
        var screenResolution        = new ScreenResolution();
        var screenOrientation       = new ScreenOrientation();
        var campaign                = new Campaign();
        var sequencer               = new Sequencer(Elements.SCREEN_LAYOUTS_UL);
        var channelList             = new ChannelList();


        commBroker.setService('ScreenArrowSelector',screenArrowSelector);
        commBroker.setService('ScreenOrientation',screenOrientation);
        commBroker.setService('ScreenResolution',screenResolution);
        commBroker.setService('Campaign',campaign);
        commBroker.setService('Sequences',sequencer);
     // commBroker.setService('ExtendjQueryUItoMobile',extendjQueryUItoMobile);

        screenArrowSelector.init();
        screenResolution.init();
        screenOrientation.init();
        campaign.init();

        self.progressiveLayout();
    },

    /**
     Support different devices such as tablets and desktops through resize event.
     @method progressiveLayout
     @return none
     **/
    progressiveLayout: function(){

        $(window).bind('resize', function(event){

            if (  $(window).width() > $(window).height() ) {
                if (self.m_deviceOriention == 'h')
                    return;
                self.m_deviceOriention = 'h';
                $(Elements.IMG_VERTICAL).removeClass('sizeByWidth').addClass('sizeByHeight');
                $(Elements.IMG_HORIZONTAL).removeClass('sizeByWidth').addClass('sizeByHeight');
            } else {
                if (self.m_deviceOriention == 'v')
                    return;
                self.m_deviceOriention = 'v';
                $(Elements.IMG_VERTICAL).removeClass('sizeByHeight').addClass('sizeByWidth');
                $(Elements.IMG_HORIZONTAL).removeClass('sizeByHeight').addClass('sizeByWidth');
            }
            //  if ($.event.special.orientationchange.orientation() == "portrait") {
        });

        $( window ).on("orientationchange", function( event ) {
            switch (event.orientation) {
                case 'landscape': {
                    $(Elements.IMG_VERTICAL).removeClass('sizeByWidth').addClass('sizeByHeight');
                    $(Elements.IMG_HORIZONTAL).removeClass('sizeByWidth').addClass('sizeByHeight');
                    break;
                }
                case 'portrait': {
                    $(Elements.IMG_VERTICAL).removeClass('sizeByHeight').addClass('sizeByWidth');
                    $(Elements.IMG_HORIZONTAL).removeClass('sizeByHeight').addClass('sizeByWidth');
                    break;
                }
            }
        });
    }
}

