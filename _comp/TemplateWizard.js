/*/////////////////////////////////////////////

 ScreenListSelecor

 /////////////////////////////////////////////*/

function TemplateWizard(i_element) {

    this.self = this;
    this.m_screens = [];
    this.m_element = i_element;
    this._init();
};

TemplateWizard.prototype = {
    constructor: TemplateWizard,

    _init: function () {

        var self = this;

        $('#goBackFromScreenList').tap(function () {
            // $.mobile.changePage('#studioLite',{transition: "pop"});
            history.back();
            self.destroy();
        });

        self.buildScreensLayoutList();
    },

    buildScreensLayoutList: function () {

        var self = this;
        var resolution = commBroker.getService('ScreenResolution').getResolution();
        var orientation = commBroker.getService('ScreenOrientation').getOrientation();

        commBroker.listenOnce(ScreenTemplateFactory.ON_VIEWER_SELECTED, function(){
            self.destroy();
            setTimeout(function () {
                $.mobile.changePage('#studioLite');
            }, 700)
        });

        $(self.m_element).empty();

        var collection = model.getScreenCollection();
        for (var screenType in collection[orientation][resolution]) {

            var screenTemplateData = {
                orientation: orientation,
                resolution: resolution,
                screenType: screenType,
                screenProps: collection[orientation][resolution][screenType],
                scale: 14
            }

            var screenProps = collection[orientation][resolution][screenType];
            var screenTemplate = new ScreenTemplateFactory(screenTemplateData, ScreenTemplateFactory.ENTIRE_SELECTABLE, this);
            var snippet = screenTemplate.create();

            $(self.m_element).append($(snippet));
            screenTemplate.activate();
            self.m_screens.push(screenTemplate);
        }
    },

    destroy: function () {
        var self = this;
        $(self.m_element).empty();
        if (!self.m_screens)
            return;
        for (var i = 0; i < self.m_screens.length; i++) {
            self.m_screens[i].destroy();
        }
        this.self = null;
        this.m_screens = null;
        this.m_element = null;

    }
}

