/*/////////////////////////////////////////////

 CompCampaignNavigator

 /////////////////////////////////////////////*/

function CompCampaignNavigator (i_container){

    this.self                       = this;
    this.m_container                = i_container;
    this.m_playListViewStack        = new Viewstacks(this.m_container);
    this.m_deviceOriention          = '';

    this.m_playListViewStack.addChild('#campaignSelectorView');
    this.m_playListViewStack.addChild('#orientationView');
    this.m_playListViewStack.addChild('#resolutionView');
    this.m_playListViewStack.addChild('#campaignView');
    this.m_playListViewStack.selectIndex(0);

    commBroker.setService('PlayListViewStack',this.m_playListViewStack);
    this.init();

};

CompCampaignNavigator.prototype = {
    constructor: CompCampaignNavigator,

    init: function(){

        var self = this;

        setTimeout(function(){
            $(window).trigger('resize');
        },500);

        // var extendjQueryUItoMobile  = new ExtendjQueryUItoMobile();
        var screenArrowSelector     = new ScreenArrowSelector('#playListSelectArrowLeft', '#playListSelectArrowRight', '#playListSelectTitle', self.m_playListViewStack);
        var screenResolution        = new ScreenResolution();
        var screenOrientation       = new ScreenOrientation();
        var campaign                = new Campaign();
        var sequencer               = new Sequencer('#screenLayoutsUL');
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

    progressiveLayout: function(){

        $(window).bind('resize', function(event){

            if (  $(window).width() > $(window).height() ) {
                if (self.m_deviceOriention == 'h')
                    return;
                self.m_deviceOriention = 'h';
                $('#imgVertical').removeClass('sizeByWidth').addClass('sizeByHeight');
                $('#imgHorizontal').removeClass('sizeByWidth').addClass('sizeByHeight');
            } else {
                if (self.m_deviceOriention == 'v')
                    return;
                self.m_deviceOriention = 'v';
                $('#imgVertical').removeClass('sizeByHeight').addClass('sizeByWidth');
                $('#imgHorizontal').removeClass('sizeByHeight').addClass('sizeByWidth');
            }

            //  if ($.event.special.orientationchange.orientation() == "portrait") {

        });

        $( window ).on("orientationchange", function( event ) {

            switch (event.orientation) {
                case 'landscape': {
                    $('#imgVertical').removeClass('sizeByWidth').addClass('sizeByHeight');
                    $('#imgHorizontal').removeClass('sizeByWidth').addClass('sizeByHeight');
                    break;
                }
                case 'portrait': {
                    $('#imgVertical').removeClass('sizeByHeight').addClass('sizeByWidth');
                    $('#imgHorizontal').removeClass('sizeByHeight').addClass('sizeByWidth');
                    break;
                }
            }
        });
    }
}

