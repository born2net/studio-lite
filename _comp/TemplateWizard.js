/**
 Add block wizard is a UI component which allows selection and insertion of a new component (i.e. QR / RSS ...)
 or a resource, to be added to the currently selected timeline_channel
 @class TemplateWizard
 @constructor
 @return {Object} instantiated AddBlockWizard
 **/
function TemplateWizard(i_element) {

    this.self = this;
    this.m_screens = [];
    this.m_element = i_element;
    this._init();
};

TemplateWizard.prototype = {
    constructor: TemplateWizard,

    /**
     Wire the "go back" from wizard without creating any new templates.
     @method _init
     @return none
     **/
    _init: function () {

        var self = this;

        $(Elements.GO_BACK_FROM_SCREEN_LIST).tap(function () {
            // $.mobile.changePage('#studioLite',{transition: "pop"});
            history.back();
            self.destroy();
        });

        self.buildScreensLayoutList();
    },

    /**
     Build the list of templates a user can select from.
     @method buildScreensLayoutList
     @return none
     **/
    buildScreensLayoutList: function () {

        var self = this;
        var resolution = commBroker.getService('ScreenResolution').getResolution();
        var orientation = commBroker.getService('ScreenOrientation').getOrientation();

        commBroker.listenOnce(ScreenTemplateFactory.ON_VIEWER_SELECTED, function () {
            self.destroy();
            setTimeout(function () {
                $.mobile.changePage(Elements.STUDIO_LITE);
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

    /**
     Destroy the instance and release members.
     @method destroy
     @return none
     **/
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

