/**
 Select new screen layout (template) for a campaign > timeline
 @class ScreenLayoutSelectorView
 @constructor
 @return {Object} instantiated ScreenLayoutSelectorView
 **/
define(['jquery', 'backbone', 'StackView', 'ScreenTemplateFactory'], function ($, Backbone, StackView, ScreenTemplateFactory) {

    BB.SERVICES.SCREEN_LAYOUT_SELECTOR_VIEW = 'ScreenLayoutSelectorView';

    var ScreenLayoutSelectorView = BB.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_screens = [];
            self.m_direction = 'left';

            self.listenTo(self.options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == self) {
                    self._render();
                }
            });

            $(this.el).find(Elements.PREVIOUS).on('click', function (e) {
                if (self.options.from == null)
                    return;
                if (self.m_direction == 'left'){
                    self.options.stackView.slideToPage(self.options.from, 'left');
                } else {
                    self.options.stackView.slideToPage(self.options.to, 'right');
                }

                return false;
            });
        },

        /**
         Build the list of templates a user can select from.
         @method render
         @return none
         **/
        _render: function () {
            var self = this;

            BB.comBroker.getService(BB.SERVICES.PROPERTIES_VIEW).resetPropertiesView();

            $(Elements.SCREEN_LAYOUT_LIST).empty();
            var resolution = BB.comBroker.getService(BB.SERVICES.RESOLUTION_SELECTOR_VIEW).model.get(BB.CONSTS.RESOLUTION);
            var orientation = BB.comBroker.getService(BB.SERVICES.ORIENTATION_SELECTOR_VIEW).model.get(BB.CONSTS.ORIENTATION);

            BB.comBroker.listenOnce(BB.EVENTS.ON_VIEWER_SELECTED, function () {
                setTimeout(function () {
                    self.options.stackView.slideToPage(self.options.to, 'right');
                }, 700)
            });

            $(Elements.SCREEN_LAYOUT_LIST).empty();

            require(['ScreenTemplate'], function (ScreenTemplate) {
                for (var screenType in ScreenTemplate[orientation][resolution]) {

                    var screenTemplateData = {
                        orientation: orientation,
                        resolution: resolution,
                        screenType: screenType,
                        screenProps: ScreenTemplate[orientation][resolution][screenType],
                        scale: 14
                    };

                    var screenTemplate = new ScreenTemplateFactory({
                        i_screenTemplateData: screenTemplateData,
                        i_selfDestruct: true,
                        i_owner: self
                    });
                    var snippet = screenTemplate.create();
                    $(Elements.SCREEN_LAYOUT_LIST).append($(snippet));
                    screenTemplate.selectableFrame();
                    self.m_screens.push(screenTemplate);
                }
            });
        },

        /**
         Slide back to specified direction to / from
         @method slideBackDirection
         @param {String} i_direction
         **/
        slideBackDirection: function(i_direction){
            var self = this;
            self.m_direction = i_direction;
        }
    });

    return ScreenLayoutSelectorView;

});

